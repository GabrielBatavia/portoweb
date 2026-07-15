import { createServer } from "node:http";
import { handleChat } from "./src/chat-handler.js";
import { handleHealth } from "./src/health-handler.js";

const port = Number(process.env.PORT || 3001);
const env = {
  ...process.env,
  DEMO_MODE: process.env.DEMO_MODE || "true",
  ALLOWED_ORIGINS:
    process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${port}`}`);

  if (url.pathname === "/health") {
    handleHealth(req, res, { env });
    return;
  }

  if (url.pathname === "/v1/chat") {
    await handleChat(req, res, { env });
    return;
  }

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: { code: "not_found", message: "Route not found." } }));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Gabriel portfolio API listening on http://127.0.0.1:${port} (demo=${env.DEMO_MODE})`);
});
