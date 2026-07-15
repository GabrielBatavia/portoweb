const LOCAL_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173"];

export function getAllowedOrigins(rawOrigins = "") {
  const configured = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set(configured.length ? configured : LOCAL_ORIGINS);
}

export function isOriginAllowed(origin, rawOrigins = "") {
  if (!origin) return true;
  return getAllowedOrigins(rawOrigins).has(origin);
}

export function applyCors(req, res, rawOrigins = "") {
  const origin = req.headers.origin;
  const allowed = isOriginAllowed(origin, rawOrigins);

  if (allowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Access-Control-Max-Age", "86400");
  return allowed;
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function sendError(res, status, code, message) {
  sendJson(res, status, { error: { code, message } });
}

export function setSseHeaders(res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

export function writeSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 32_000) throw new Error("request_too_large");
  }
  return JSON.parse(raw || "{}");
}

export function validateChatBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, code: "invalid_body", message: "Request body must be a JSON object." };
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return { ok: false, code: "invalid_message", message: "Please enter a question for Gabriel." };
  }

  if (body.message.trim().length > 1000) {
    return { ok: false, code: "message_too_long", message: "Please keep the question under 1,000 characters." };
  }

  if (body.history !== undefined && !Array.isArray(body.history)) {
    return { ok: false, code: "invalid_history", message: "Conversation history must be an array." };
  }

  if (Array.isArray(body.history)) {
    for (const item of body.history) {
      const validItem =
        item &&
        typeof item === "object" &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string" &&
        item.content.trim() &&
        item.content.length <= 2000;
      if (!validItem) {
        return { ok: false, code: "invalid_history", message: "Conversation history contains an invalid message." };
      }
    }
  }

  return {
    ok: true,
    value: {
      message: body.message.trim(),
      history: (body.history ?? []).slice(-8),
    },
  };
}
