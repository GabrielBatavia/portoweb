const STATUS_LABELS = {
  idle: "Ready",
  greeting: "Present",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Responding",
  error: "Reconnect",
};

const IMAGE_STATE_FALLBACK = {
  listening: "idle",
};

export class CharacterController {
  constructor({ shell, wrap, statusLabel }) {
    this.shell = shell;
    this.wrap = wrap;
    this.statusLabel = statusLabel;
    this.images = new Map(
      [...wrap.querySelectorAll("[data-state]")].map((image) => [image.dataset.state, image]),
    );
    this.state = "idle";
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.finePointer = window.matchMedia("(pointer: fine)");
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.resetPointer = this.resetPointer.bind(this);
  }

  async init() {
    await Promise.allSettled(
      [...this.images.values()].map((image) => {
        image.addEventListener("error", () => image.classList.add("has-error"), { once: true });
        return image.decode?.() ?? Promise.resolve();
      }),
    );

    if (!this.reduceMotion.matches && this.finePointer.matches) {
      window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", this.resetPointer);
    }

    this.setState("greeting");
    window.setTimeout(() => {
      if (this.state === "greeting") this.setState("idle");
    }, 4200);
  }

  setState(nextState) {
    const visualState = IMAGE_STATE_FALLBACK[nextState] ?? nextState;
    const nextImage = this.images.get(visualState) ?? this.images.get("idle");
    if (!nextImage) return;

    this.state = nextState;
    this.shell.dataset.characterState = nextState;
    this.statusLabel.textContent = STATUS_LABELS[nextState] ?? STATUS_LABELS.idle;

    for (const image of this.images.values()) {
      image.classList.toggle("is-active", image === nextImage && !image.classList.contains("has-error"));
    }

    if (nextImage.classList.contains("has-error")) {
      this.images.get("idle")?.classList.add("is-active");
    }
  }

  handlePointerMove(event) {
    if (this.reduceMotion.matches || !this.finePointer.matches) return;

    const normalizedX = event.clientX / window.innerWidth - 0.5;
    const normalizedY = event.clientY / window.innerHeight - 0.5;
    this.wrap.style.setProperty("--look-x", `${(normalizedX * 9).toFixed(2)}px`);
    this.wrap.style.setProperty("--look-y", `${(normalizedY * 6).toFixed(2)}px`);
  }

  resetPointer() {
    this.wrap.style.setProperty("--look-x", "0px");
    this.wrap.style.setProperty("--look-y", "0px");
  }

  destroy() {
    window.removeEventListener("pointermove", this.handlePointerMove);
    document.documentElement.removeEventListener("pointerleave", this.resetPointer);
  }
}
