import { buildMessages } from "./prompt.js";
import { parseDeepSeekFrames, requestDeepSeekStream } from "./deepseek.js";
import { streamDemoAnswer } from "./demo.js";
import {
  applyCors,
  readJsonBody,
  sendError,
  setSseHeaders,
  validateChatBody,
  writeSse,
} from "./http.js";

export async function handleChat(req, res, options = {}) {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const originAllowed = applyCors(req, res, env.ALLOWED_ORIGINS);

  if (req.method === "OPTIONS") {
    res.statusCode = originAllowed ? 204 : 403;
    res.end();
    return;
  }

  if (!originAllowed) {
    sendError(res, 403, "origin_not_allowed", "This frontend origin is not allowed to use Gabriel's AI service.");
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    sendError(res, 405, "method_not_allowed", "Use POST for this endpoint.");
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const tooLarge = error.message === "request_too_large";
    sendError(
      res,
      tooLarge ? 413 : 400,
      tooLarge ? "request_too_large" : "invalid_json",
      tooLarge ? "The request is too large." : "The request body is not valid JSON.",
    );
    return;
  }

  const validation = validateChatBody(body);
  if (!validation.ok) {
    sendError(res, 400, validation.code, validation.message);
    return;
  }

  const demoMode = String(env.DEMO_MODE).toLowerCase() === "true";
  if (!demoMode && !env.DEEPSEEK_API_KEY) {
    sendError(
      res,
      503,
      "ai_not_configured",
      "Gabriel's AI connection is not configured yet. The verified profile is still available.",
    );
    return;
  }

  setSseHeaders(res);
  writeSse(res, "status", { state: "thinking" });

  if (demoMode) {
    await streamDemoAnswer(res, validation.value.message, writeSse);
    res.end();
    return;
  }

  const controller = new AbortController();
  const handleClose = () => controller.abort();
  res.once?.("close", handleClose);

  try {
    const upstream = await requestDeepSeekStream({
      apiKey: env.DEEPSEEK_API_KEY,
      model: env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages: buildMessages(validation.value),
      signal: controller.signal,
      fetchImpl,
    });

    const reader = upstream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finishReason = "stop";

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      const parsed = parseDeepSeekFrames(buffer);
      buffer = parsed.remainder;

      for (const event of parsed.events) {
        if (event.text) writeSse(res, "delta", { text: event.text });
        if (event.finishReason) finishReason = event.finishReason;
      }

      if (done) break;
    }

    if (buffer.trim()) {
      const parsed = parseDeepSeekFrames(`${buffer}\n\n`);
      for (const event of parsed.events) {
        if (event.text) writeSse(res, "delta", { text: event.text });
        if (event.finishReason) finishReason = event.finishReason;
      }
    }

    writeSse(res, "done", { finishReason });
  } catch (error) {
    if (!controller.signal.aborted) {
      writeSse(res, "error", {
        code: "upstream_unavailable",
        message: "I couldn't complete that answer. Please retry or explore my verified profile.",
      });
    }
  } finally {
    res.off?.("close", handleClose);
    res.end();
  }
}
