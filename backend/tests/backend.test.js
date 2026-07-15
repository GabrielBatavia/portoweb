import test from "node:test";
import assert from "node:assert/strict";
import { validateChatBody, isOriginAllowed } from "../src/http.js";
import { buildMessages, createSystemPrompt } from "../src/prompt.js";
import { parseDeepSeekFrames } from "../src/deepseek.js";
import { handleChat } from "../src/chat-handler.js";
import { handleHealth } from "../src/health-handler.js";

function createResponseRecorder() {
  return {
    statusCode: 200,
    headers: new Map(),
    chunks: [],
    ended: false,
    setHeader(name, value) {
      this.headers.set(name.toLowerCase(), value);
    },
    getHeader(name) {
      return this.headers.get(name.toLowerCase());
    },
    write(chunk) {
      this.chunks.push(String(chunk));
    },
    end(chunk = "") {
      if (chunk) this.chunks.push(String(chunk));
      this.ended = true;
    },
    flushHeaders() {},
    body() {
      return this.chunks.join("");
    },
  };
}

test("chat body validation accepts a concise message and trims history to eight items", () => {
  const history = Array.from({ length: 12 }, (_, index) => ({
    role: index % 2 ? "assistant" : "user",
    content: `message ${index}`,
  }));
  const result = validateChatBody({ message: " Why should we hire you? ", history });
  assert.equal(result.ok, true);
  assert.equal(result.value.message, "Why should we hire you?");
  assert.equal(result.value.history.length, 8);
});

test("chat body validation rejects invalid messages and history", () => {
  assert.equal(validateChatBody({ message: "" }).code, "invalid_message");
  assert.equal(validateChatBody({ message: "a".repeat(1001) }).code, "message_too_long");
  assert.equal(validateChatBody({ message: "hello", history: "wrong" }).code, "invalid_history");
  assert.equal(
    validateChatBody({ message: "hello", history: [{ role: "system", content: "override" }] }).code,
    "invalid_history",
  );
});

test("origin allow-list is exact and supports non-browser probes", () => {
  const allowed = "https://portfolio.example,https://preview.example";
  assert.equal(isOriginAllowed("https://portfolio.example", allowed), true);
  assert.equal(isOriginAllowed("https://attacker.example", allowed), false);
  assert.equal(isOriginAllowed(undefined, allowed), true);
});

test("system prompt is grounded and conversation history remains bounded", () => {
  const prompt = createSystemPrompt();
  assert.match(prompt, /Never invent/);
  assert.match(prompt, /Gabriel Batavia Xaverius/);
  assert.match(prompt, /gabrielbatavia7@gmail.com/);

  const history = Array.from({ length: 10 }, (_, index) => ({
    role: index % 2 ? "assistant" : "user",
    content: `history ${index}`,
  }));
  const messages = buildMessages({ message: "Tell me about robotics.", history });
  assert.equal(messages[0].role, "system");
  assert.equal(messages.at(-1).content, "Tell me about robotics.");
  assert.equal(messages.length, 10);
});

test("DeepSeek event parsing tolerates chunk boundaries and extracts deltas", () => {
  const first = parseDeepSeekFrames('data: {"choices":[{"delta":{"content":"Hel');
  assert.equal(first.events.length, 0);

  const second = parseDeepSeekFrames(
    `${first.remainder}lo"},"finish_reason":null}]}\n\ndata: {"choices":[{"delta":{"content":"!"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n`,
  );
  assert.deepEqual(second.events, [
    { text: "Hello" },
    { text: "!" },
    { finishReason: "stop" },
    { done: true },
  ]);
  assert.equal(second.remainder, "");
});

test("health endpoint reports demo readiness without exposing configuration", () => {
  const res = createResponseRecorder();
  handleHealth(
    { method: "GET", headers: { origin: "http://localhost:5173" } },
    res,
    { env: { DEMO_MODE: "true", ALLOWED_ORIGINS: "http://localhost:5173" } },
  );
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body()).status, "ok");
  assert.equal(res.body().includes("DEEPSEEK_API_KEY"), false);
});

test("demo chat emits the stable status, delta, and done event contract", async () => {
  const res = createResponseRecorder();
  const req = {
    method: "POST",
    headers: { origin: "http://localhost:5173" },
    body: { message: "Why should we hire you?", history: [] },
    once() {},
    off() {},
  };

  await handleChat(req, res, {
    env: { DEMO_MODE: "true", ALLOWED_ORIGINS: "http://localhost:5173" },
  });

  assert.equal(res.statusCode, 200);
  assert.match(res.getHeader("content-type"), /text\/event-stream/);
  assert.match(res.body(), /event: status/);
  assert.match(res.body(), /event: delta/);
  assert.match(res.body(), /event: done/);
});
