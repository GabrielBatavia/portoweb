const SAFE_FALLBACK =
  "I can't reach my AI service right now, but my verified experience is still available in Explore profile.";

export class ConversationController {
  constructor({ client, character, neural, form, input, transcript, promptList, sendButton, cancelButton }) {
    this.client = client;
    this.character = character;
    this.neural = neural;
    this.form = form;
    this.input = input;
    this.transcript = transcript;
    this.promptList = promptList;
    this.sendButton = sendButton;
    this.cancelButton = cancelButton;
    this.history = [];
    this.abortController = null;
    this.busy = false;
  }

  init() {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.submit(this.input.value);
    });

    this.input.addEventListener("input", () => this.resizeInput());
    this.input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.form.requestSubmit();
      }
    });

    this.promptList.querySelectorAll("[data-prompt]").forEach((button) => {
      button.addEventListener("click", () => this.submit(button.dataset.prompt));
    });

    this.cancelButton.addEventListener("click", () => this.abortController?.abort());
    window.addEventListener("portfolio:ask", (event) => this.submit(event.detail?.question));
  }

  resizeInput() {
    this.input.style.height = "auto";
    this.input.style.height = `${Math.min(this.input.scrollHeight, 112)}px`;
  }

  setState(state) {
    this.character.setState(state);
    this.neural.setState(state);
  }

  setBusy(isBusy) {
    this.busy = isBusy;
    this.input.disabled = isBusy;
    this.sendButton.disabled = isBusy;
    this.cancelButton.hidden = !isBusy;
    this.promptList.classList.toggle("is-hidden", isBusy);
    if (!isBusy) this.input.focus({ preventScroll: true });
  }

  addMessage(role, text = "") {
    const article = document.createElement("article");
    const paragraph = document.createElement("p");
    article.className = `message message-${role}`;
    paragraph.textContent = text;
    article.append(paragraph);
    this.transcript.append(article);
    requestAnimationFrame(() => article.classList.add("is-visible"));
    this.transcript.scrollTo({ top: this.transcript.scrollHeight, behavior: "smooth" });
    return paragraph;
  }

  async submit(rawMessage) {
    const message = rawMessage?.trim();
    if (!message || this.busy) return;

    this.addMessage("user", message);
    this.input.value = "";
    this.resizeInput();
    this.setBusy(true);
    this.setState("listening");

    const answerNode = this.addMessage("assistant", "");
    answerNode.classList.add("stream-cursor");
    this.abortController = new AbortController();
    let answer = "";
    let receivedToken = false;

    window.setTimeout(() => {
      if (this.busy && !receivedToken) this.setState("thinking");
    }, 180);

    try {
      for await (const event of this.client.stream({
        message,
        history: this.history.slice(-8),
        signal: this.abortController.signal,
      })) {
        if (event.event === "status") {
          this.setState(event.data.state === "thinking" ? "thinking" : "listening");
        }

        if (event.event === "delta" && event.data.text) {
          if (!receivedToken) {
            receivedToken = true;
            this.setState("speaking");
          }
          answer += event.data.text;
          answerNode.textContent = answer;
          answerNode.classList.add("stream-cursor");
          this.transcript.scrollTop = this.transcript.scrollHeight;
        }

        if (event.event === "error") {
          throw new Error(event.data.message || SAFE_FALLBACK);
        }
      }

      if (!answer.trim()) throw new Error(SAFE_FALLBACK);
      answerNode.classList.remove("stream-cursor");
      this.history.push(
        { role: "user", content: message },
        { role: "assistant", content: answer.trim() },
      );
      this.history = this.history.slice(-8);
      this.setState("idle");
    } catch (error) {
      answerNode.classList.remove("stream-cursor");
      if (error.name === "AbortError") {
        answerNode.textContent = "Response stopped. Ask me something else when you're ready.";
        this.setState("idle");
      } else {
        answerNode.textContent = error.message || SAFE_FALLBACK;
        this.setState("error");
      }
    } finally {
      this.abortController = null;
      this.setBusy(false);
    }
  }
}
