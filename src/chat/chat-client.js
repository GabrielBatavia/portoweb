export class ChatRequestError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ChatRequestError";
    this.status = status;
  }
}

function parseEventFrame(frame) {
  let event = "message";
  const dataLines = [];

  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }

  if (!dataLines.length) return null;
  const rawData = dataLines.join("\n");
  try {
    return { event, data: JSON.parse(rawData) };
  } catch {
    return { event, data: { text: rawData } };
  }
}

export class ChatClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async *stream({ message, history, signal }) {
    if (!this.baseUrl) {
      throw new ChatRequestError("The portfolio API has not been configured yet.", 503);
    }

    const response = await fetch(`${this.baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ message, history }),
      signal,
    });

    if (!response.ok) {
      let detail = "Gabriel is temporarily unavailable. You can still explore the verified profile.";
      try {
        const payload = await response.json();
        if (payload?.error?.message) detail = payload.error.message;
      } catch {
        // Preserve the safe public fallback when the upstream body is not JSON.
      }
      throw new ChatRequestError(detail, response.status);
    }

    if (!response.body) {
      throw new ChatRequestError("The response stream could not be opened.", 502);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        const parsed = parseEventFrame(frame);
        if (parsed) yield parsed;
      }

      if (done) break;
    }

    if (buffer.trim()) {
      const parsed = parseEventFrame(buffer);
      if (parsed) yield parsed;
    }
  }
}
