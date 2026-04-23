/* money.js — hand-drawn 100 Rupiah notes with drag-to-character */

class MoneySystem {
  constructor(onCollect) {
    this.onCollect  = onCollect;
    this.layer      = document.getElementById('money-layer');
    this.dropZone   = document.getElementById('money-drop-zone');
    this.notes      = [];
    this.dragging   = null;
    this.dragOffset = { x: 0, y: 0 };
    this.counter    = 0;
  }

  // Hand-drawn style 100 Rupiah note SVG
  _noteSVG() {
    this.counter++;
    const id = this.counter;
    return `
<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ngb${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3d6b3d"/>
      <stop offset="50%" stop-color="#1f4a1f"/>
      <stop offset="100%" stop-color="#163516"/>
    </linearGradient>
    <pattern id="ngp${id}" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="0.8" fill="#d4a04c" opacity="0.4"/>
      <path d="M0 5 L 10 5 M5 0 L 5 10" stroke="#d4a04c" stroke-width="0.3" opacity="0.2"/>
    </pattern>
  </defs>
  <!-- Body -->
  <rect x="1" y="1" width="118" height="58" rx="3" fill="url(#ngb${id})" stroke="#2a2520" stroke-width="1.5"/>
  <!-- Pattern overlay -->
  <rect x="1" y="1" width="118" height="58" rx="3" fill="url(#ngp${id})" opacity="0.6"/>
  <!-- Inner decorative border -->
  <rect x="4" y="4" width="112" height="52" rx="2" fill="none" stroke="#d4a04c" stroke-width="0.6" opacity="0.6" stroke-dasharray="2 1"/>
  <!-- Left medallion -->
  <circle cx="18" cy="30" r="10" fill="none" stroke="#d4a04c" stroke-width="0.8" opacity="0.7"/>
  <circle cx="18" cy="30" r="7" fill="none" stroke="#d4a04c" stroke-width="0.5" opacity="0.5"/>
  <text x="18" y="33" text-anchor="middle" font-size="6" fill="#d4a04c" font-family="serif" font-weight="bold">100</text>
  <!-- Right medallion -->
  <circle cx="102" cy="30" r="10" fill="none" stroke="#d4a04c" stroke-width="0.8" opacity="0.7"/>
  <circle cx="102" cy="30" r="7" fill="none" stroke="#d4a04c" stroke-width="0.5" opacity="0.5"/>
  <text x="102" y="33" text-anchor="middle" font-size="6" fill="#d4a04c" font-family="serif" font-weight="bold">100</text>
  <!-- Bank name -->
  <text x="60" y="16" text-anchor="middle" font-size="5" fill="#fde8c0" font-family="serif" font-weight="bold" letter-spacing="0.8">BANK INDONESIA</text>
  <!-- 100 main -->
  <text x="60" y="38" text-anchor="middle" font-size="18" fill="#fde8c0" font-family="serif" font-weight="900" letter-spacing="1">100</text>
  <!-- RUPIAH -->
  <text x="60" y="50" text-anchor="middle" font-size="4.5" fill="#fde8c0" font-family="serif" letter-spacing="2">RUPIAH</text>
  <!-- Corner tick marks -->
  <path d="M 3 3 L 9 3 M 3 3 L 3 9" stroke="#d4a04c" stroke-width="0.6" opacity="0.8"/>
  <path d="M 117 3 L 111 3 M 117 3 L 117 9" stroke="#d4a04c" stroke-width="0.6" opacity="0.8"/>
  <path d="M 3 57 L 9 57 M 3 57 L 3 51" stroke="#d4a04c" stroke-width="0.6" opacity="0.8"/>
  <path d="M 117 57 L 111 57 M 117 57 L 117 51" stroke="#d4a04c" stroke-width="0.6" opacity="0.8"/>
</svg>`;
  }

  spawn(x, y) {
    const el = document.createElement('div');
    el.className = 'money-note';
    el.innerHTML = this._noteSVG();
    const jitter = (Math.random() - 0.5) * 100;
    el.style.left = (x + jitter) + 'px';
    el.style.top  = (y + Math.random() * 30) + 'px';
    el.style.transform = `rotate(${(Math.random()-0.5)*28}deg)`;

    this.layer.appendChild(el);
    this.notes.push(el);
    this._bindDrag(el);

    setTimeout(() => {
      if (el.parentNode && !el.classList.contains('collected')) {
        el.style.transition = 'opacity 0.6s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 600);
      }
    }, 25000);

    return el;
  }

  _bindDrag(el) {
    let isDragging = false;

    const onStart = (e) => {
      isDragging = true;
      const pt = e.touches ? e.touches[0] : e;
      const rect = el.getBoundingClientRect();
      this.dragOffset.x = pt.clientX - rect.left;
      this.dragOffset.y = pt.clientY - rect.top;
      this.dragging = el;
      el.style.transition = 'none';
      el.style.zIndex = '999';
      el.style.transform = 'rotate(6deg) scale(1.12)';
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!isDragging || this.dragging !== el) return;
      const pt = e.touches ? e.touches[0] : e;
      el.style.left = (pt.clientX - this.dragOffset.x) + 'px';
      el.style.top  = (pt.clientY - this.dragOffset.y) + 'px';

      const dr = this.dropZone.getBoundingClientRect();
      const inZone = pt.clientX > dr.left && pt.clientX < dr.right
                  && pt.clientY > dr.top  && pt.clientY < dr.bottom;
      this.dropZone.classList.toggle('active', inZone);
      e.preventDefault();
    };

    const onEnd = (e) => {
      if (!isDragging || this.dragging !== el) return;
      isDragging = false;
      this.dragging = null;
      this.dropZone.classList.remove('active');

      const pt = e.changedTouches ? e.changedTouches[0] : e;
      const dr = this.dropZone.getBoundingClientRect();
      const inZone = pt.clientX > dr.left && pt.clientX < dr.right
                  && pt.clientY > dr.top  && pt.clientY < dr.bottom;

      if (inZone) {
        this._collect(el);
      } else {
        el.style.transition = 'transform 0.3s';
        el.style.transform = `rotate(${(Math.random()-0.5)*20}deg) scale(1)`;
        el.style.zIndex = '510';
      }
    };

    el.addEventListener('mousedown',  onStart);
    el.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove',  onMove);
    document.addEventListener('touchmove',  onMove, { passive: false });
    document.addEventListener('mouseup',    onEnd);
    document.addEventListener('touchend',   onEnd);
  }

  _collect(el) {
    el.classList.add('collected');
    // Animate toward drop zone center
    const dr = this.dropZone.getBoundingClientRect();
    el.style.transition = 'all 0.4s cubic-bezier(0.5, 0, 0.7, 1)';
    el.style.left = (dr.left + dr.width/2 - 45) + 'px';
    el.style.top  = (dr.top + dr.height/2 - 22) + 'px';
    el.style.transform = 'scale(0.2) rotate(30deg)';
    el.style.opacity = '0';
    this.notes = this.notes.filter(n => n !== el);
    setTimeout(() => el.remove(), 400);
    if (this.onCollect) this.onCollect();
  }

  spawnForSection(section) {
    const count = parseInt(section.dataset.spawnMoney || '0', 10);
    if (!count) return;

    const rect = section.getBoundingClientRect();
    const sidebarW = 78;
    const safeLeft  = sidebarW + 30;
    const safeRight = window.innerWidth - 140;
    const safeWidth = safeRight - safeLeft;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = safeLeft + Math.random() * safeWidth;
        const y = Math.max(100, rect.top) + Math.random() * Math.min(rect.height * 0.5, 300) + 60;
        this.spawn(x, y);
      }, i * 400 + Math.random() * 300);
    }
  }
}
