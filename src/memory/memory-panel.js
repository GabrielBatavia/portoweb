import { MEMORY_CONTENT } from "./memory-content.js";

export class MemoryPanel {
  constructor({ panel, backdrop, title, number, content, closeButton }) {
    this.panel = panel;
    this.backdrop = backdrop;
    this.title = title;
    this.number = number;
    this.content = content;
    this.closeButton = closeButton;
    this.lastFocus = null;
    this.handleKeydown = this.handleKeydown.bind(this);
    this.close = this.close.bind(this);
  }

  init() {
    document.querySelectorAll("[data-memory]").forEach((trigger) => {
      trigger.addEventListener("click", () => this.open(trigger.dataset.memory));
    });
    this.closeButton.addEventListener("click", this.close);
    this.backdrop.addEventListener("click", this.close);
  }

  open(key) {
    const memory = MEMORY_CONTENT[key];
    if (!memory) return;

    this.lastFocus = document.activeElement;
    this.title.textContent = memory.title;
    this.number.textContent = memory.number;
    this.content.innerHTML = memory.html;
    this.panel.setAttribute("aria-hidden", "false");
    this.backdrop.hidden = false;
    document.body.classList.add("memory-open");

    requestAnimationFrame(() => {
      this.panel.classList.add("is-open");
      this.backdrop.classList.add("is-open");
      this.closeButton.focus();
    });

    this.content.querySelectorAll("[data-memory-question]").forEach((button) => {
      button.addEventListener("click", () => {
        const question = button.dataset.memoryQuestion;
        this.close();
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent("portfolio:ask", { detail: { question } }));
        }, 350);
      });
    });

    document.addEventListener("keydown", this.handleKeydown);
  }

  close() {
    if (!this.panel.classList.contains("is-open")) return;
    this.panel.classList.remove("is-open");
    this.backdrop.classList.remove("is-open");
    this.panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("memory-open");
    document.removeEventListener("keydown", this.handleKeydown);

    window.setTimeout(() => {
      this.backdrop.hidden = true;
      this.lastFocus?.focus?.();
    }, 430);
  }

  handleKeydown(event) {
    if (event.key === "Escape") {
      this.close();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = [
      ...this.panel.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ];
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
