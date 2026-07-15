import { applyCors, sendJson } from "./http.js";

export function handleHealth(req, res, options = {}) {
  const env = options.env ?? process.env;
  const originAllowed = applyCors(req, res, env.ALLOWED_ORIGINS);

  if (req.method === "OPTIONS") {
    res.statusCode = originAllowed ? 204 : 403;
    res.end();
    return;
  }

  if (!originAllowed) {
    sendJson(res, 403, { status: "forbidden" });
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    sendJson(res, 405, { status: "method_not_allowed" });
    return;
  }

  const configured = Boolean(env.DEEPSEEK_API_KEY) || String(env.DEMO_MODE).toLowerCase() === "true";
  sendJson(res, configured ? 200 : 503, {
    status: configured ? "ok" : "degraded",
    service: "gabriel-portfolio-api",
    aiConfigured: configured,
  });
}
