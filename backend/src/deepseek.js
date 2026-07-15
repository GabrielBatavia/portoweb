export class DeepSeekUpstreamError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "DeepSeekUpstreamError";
    this.status = status;
  }
}

export async function requestDeepSeekStream({
  apiKey,
  model = "deepseek-v4-flash",
  messages,
  signal,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model,
      messages,
      thinking: { type: "disabled" },
      stream: true,
      max_tokens: 500,
      temperature: 0.35,
    }),
    signal,
  });

  if (!response.ok) {
    throw new DeepSeekUpstreamError("DeepSeek could not complete the response.", response.status);
  }
  if (!response.body) {
    throw new DeepSeekUpstreamError("DeepSeek returned no response stream.");
  }

  return response.body;
}

export function parseDeepSeekFrames(buffer) {
  const frames = buffer.split(/\r?\n\r?\n/);
  const remainder = frames.pop() ?? "";
  const events = [];

  for (const frame of frames) {
    for (const line of frame.split(/\r?\n/)) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data) continue;
      if (data === "[DONE]") {
        events.push({ done: true });
        continue;
      }

      try {
        const payload = JSON.parse(data);
        const choice = payload.choices?.[0];
        if (!choice) continue;
        if (choice.delta?.content) events.push({ text: choice.delta.content });
        if (choice.finish_reason) events.push({ finishReason: choice.finish_reason });
      } catch {
        // Ignore malformed upstream event frames instead of forwarding unsafe content.
      }
    }
  }

  return { events, remainder };
}
