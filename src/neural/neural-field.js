const STATE_COLORS = {
  idle: [140, 123, 255],
  greeting: [183, 173, 255],
  listening: [205, 198, 255],
  thinking: [152, 135, 255],
  speaking: [183, 173, 255],
  error: [255, 141, 135],
};

export class NeuralField {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d", { alpha: true });
    this.points = [];
    this.state = "idle";
    this.running = false;
    this.frame = 0;
    this.time = 0;
    this.pointer = { x: 0.5, y: 0.5, active: false };
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.resize = this.resize.bind(this);
    this.draw = this.draw.bind(this);
    this.handlePointer = this.handlePointer.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
  }

  init() {
    this.resize();
    window.addEventListener("resize", this.resize, { passive: true });
    window.addEventListener("pointermove", this.handlePointer, { passive: true });
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.running = true;
    this.draw();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.seedPoints();
  }

  seedPoints() {
    const area = this.width * this.height;
    const count = Math.max(26, Math.min(72, Math.round(area / 26000)));
    this.points = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      originX: Math.random() * this.width,
      originY: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.13,
      vy: (Math.random() - 0.5) * 0.13,
      radius: 0.55 + Math.random() * 1.15,
      phase: index * 0.73 + Math.random() * Math.PI,
    }));
  }

  setState(state) {
    this.state = state;
  }

  handlePointer(event) {
    this.pointer.x = event.clientX / window.innerWidth;
    this.pointer.y = event.clientY / window.innerHeight;
    this.pointer.active = true;
  }

  handleVisibility() {
    this.running = !document.hidden;
    if (this.running) this.draw();
  }

  getCharacterTarget() {
    const portrait = document.getElementById("character-wrap")?.getBoundingClientRect();
    if (!portrait) return { x: this.width * 0.72, y: this.height * 0.42 };
    return {
      x: portrait.left + portrait.width * 0.5,
      y: portrait.top + portrait.height * 0.38,
    };
  }

  updatePoint(point, target) {
    if (this.reduceMotion.matches) return;

    const isThinking = this.state === "thinking";
    const pull = isThinking ? 0.0018 : 0.00008;
    const destinationX = isThinking ? target.x : point.originX;
    const destinationY = isThinking ? target.y : point.originY;

    point.vx += (destinationX - point.x) * pull;
    point.vy += (destinationY - point.y) * pull;
    point.vx *= isThinking ? 0.935 : 0.988;
    point.vy *= isThinking ? 0.935 : 0.988;

    if (this.pointer.active && this.state !== "thinking") {
      const px = this.pointer.x * this.width;
      const py = this.pointer.y * this.height;
      const dx = point.x - px;
      const dy = point.y - py;
      const distance = Math.hypot(dx, dy);
      if (distance < 160 && distance > 0) {
        const force = (160 - distance) / 1600;
        point.vx += (dx / distance) * force;
        point.vy += (dy / distance) * force;
      }
    }

    point.x += point.vx;
    point.y += point.vy;

    if (!isThinking) {
      if (point.x < -40) point.x = this.width + 40;
      if (point.x > this.width + 40) point.x = -40;
      if (point.y < -40) point.y = this.height + 40;
      if (point.y > this.height + 40) point.y = -40;
    }
  }

  drawConnections(color) {
    const threshold = Math.min(160, Math.max(100, this.width * 0.1));
    for (let index = 0; index < this.points.length; index += 1) {
      for (let compare = index + 1; compare < this.points.length; compare += 1) {
        const one = this.points[index];
        const two = this.points[compare];
        const distance = Math.hypot(one.x - two.x, one.y - two.y);
        if (distance > threshold) continue;

        const strength = (1 - distance / threshold) * (this.state === "thinking" ? 0.22 : 0.11);
        this.context.beginPath();
        this.context.moveTo(one.x, one.y);
        this.context.lineTo(two.x, two.y);
        this.context.strokeStyle = `rgba(${color.join(",")},${strength})`;
        this.context.lineWidth = 0.55;
        this.context.stroke();
      }
    }
  }

  drawSpeakingWave(target, color) {
    if (this.state !== "speaking") return;
    const progress = (this.time * 0.00028) % 1;
    const radius = 40 + progress * Math.min(this.width, this.height) * 0.46;
    const alpha = (1 - progress) * 0.16;
    this.context.beginPath();
    this.context.arc(target.x, target.y, radius, -0.85, 0.85);
    this.context.strokeStyle = `rgba(${color.join(",")},${alpha})`;
    this.context.lineWidth = 1;
    this.context.stroke();
  }

  draw(timestamp = 0) {
    if (!this.running) return;
    this.time = timestamp;
    const color = STATE_COLORS[this.state] ?? STATE_COLORS.idle;
    const target = this.getCharacterTarget();

    this.context.clearRect(0, 0, this.width, this.height);
    for (const point of this.points) this.updatePoint(point, target);
    this.drawConnections(color);

    for (const point of this.points) {
      const flicker = 0.42 + Math.sin(timestamp * 0.001 + point.phase) * 0.15;
      this.context.beginPath();
      this.context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      this.context.fillStyle = `rgba(${color.join(",")},${flicker})`;
      this.context.fill();
    }

    this.drawSpeakingWave(target, color);

    if (!this.reduceMotion.matches) this.frame = window.requestAnimationFrame(this.draw);
  }

  destroy() {
    this.running = false;
    window.cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.handlePointer);
    document.removeEventListener("visibilitychange", this.handleVisibility);
  }
}
