/* ═══════════════════════════════════════════════════════════════
   main.js — Character state machine, money game, interactive CTA
   ═══════════════════════════════════════════════════════════════ */

// ── DOM refs
const charImg         = document.getElementById('char-img');
const compImg         = document.getElementById('comp-img');
const compFrame       = document.querySelector('.comp-frame');
const compBubble      = document.getElementById('comp-bubble');
const compBadge       = document.getElementById('comp-badge');
const charCompanion   = document.getElementById('char-companion');
const speechBubble    = document.getElementById('char-speech');
const coinCountEl     = document.getElementById('coin-count');
const coinTotalEl     = document.getElementById('coin-total');
const jarEl           = document.getElementById('coin-jar');

const contactCharImg  = document.getElementById('contact-char-img');
const contactChar     = document.getElementById('contact-character');
const contactDrop     = document.getElementById('contact-drop-zone');
const petCountEl      = document.getElementById('pet-count');
const petCounterEl    = document.getElementById('pet-counter');
const petLayer        = document.getElementById('pet-layer');
const interactiveBanner = document.getElementById('interactive-reveal');
const hireMeBtn       = document.getElementById('hire-me-btn');
const thanksModal     = document.getElementById('thanks-modal');
const thanksClose     = document.getElementById('thanks-close');
const confettiLayer   = document.getElementById('confetti-layer');

// ── Character assets
const CHAR = {
  idle1:  'assets/character/idling.png',
  idle2:  'assets/character/idling2.png',
  happy:  'assets/character/happy.png',
  tip1:   'assets/character/get1tip.png',
  tip3:   'assets/character/get3tip.png',
  tip6:   'assets/character/get6tip.png',
  shock:  'assets/character/shock.png',
};

// Preload
Object.values(CHAR).forEach(src => { const i = new Image(); i.src = src; });

// ── Character state
let tipCount = 0;
let petCount = 0;
let isReacting = false;
let idleFrame = 0; // 0 = idle1, 1 = idle2
let charMoodBase = CHAR.idle1; // where to return after reactions

function applyCharImage(src) {
  charImg.src = src;
  contactCharImg.src = src;
  compImg.src = src;
}

/* ── Idle breathing loop — alternates between idle1 / idle2 every ~4s
     (when not reacting and no tips yet, cycles both; with tips, uses happy) */
setInterval(() => {
  if (isReacting) return;
  if (tipCount === 0) {
    idleFrame = 1 - idleFrame;
    charMoodBase = idleFrame ? CHAR.idle2 : CHAR.idle1;
    applyCharImage(charMoodBase);
  }
}, 4000);

/* ── Show a reaction frame briefly, then return to base */
function playReaction(src, duration = 1800, sayText = null) {
  isReacting = true;
  applyCharImage(src);
  [charImg, contactCharImg].forEach(el => {
    el.classList.remove('reacting');
    void el.offsetWidth; // restart animation
    el.classList.add('reacting');
  });
  if (sayText) showSpeech(sayText);

  clearTimeout(playReaction._t);
  playReaction._t = setTimeout(() => {
    isReacting = false;
    // Return to the proper resting state
    applyCharImage(charMoodBase);
  }, duration);
}

/* ── Speech bubble (attached to character) */
function showSpeech(text, persist = false, big = false) {
  speechBubble.textContent = text;
  speechBubble.className = 'speech-bubble' + (big ? ' big' : '');
  speechBubble.style.display = 'block';
  if (!persist) {
    clearTimeout(showSpeech._t);
    showSpeech._t = setTimeout(() => { speechBubble.style.display = 'none'; }, 3200);
  }
}
function hideSpeech() { speechBubble.style.display = 'none'; }

/* ── Companion (floating) bubble */
function showCompBubble(text) {
  compBubble.textContent = text;
  compBubble.classList.add('shown');
  clearTimeout(showCompBubble._t);
  showCompBubble._t = setTimeout(() => compBubble.classList.remove('shown'), 2400);
}

// ══════════════════════════════════════════════════════════════
// TIP PROGRESSION — the heart of the mini-game
// ══════════════════════════════════════════════════════════════

const TIP_LINES = [
  "Oh! Thank you!",
  "So kind of you!",
  "You're amazing!",
  "I love this!",
  "Keep them coming!",
  "You're the best!",
  "I can't believe it!",
  "I'm so lucky!",
  "Please hire me!!",
  "HIRE ME NOW!!!",
];

function rupiah(n) { return 'Rp ' + (n * 100).toLocaleString('id-ID'); }

function onMoneyCollected() {
  tipCount++;
  coinCountEl.textContent = tipCount;
  coinTotalEl.textContent = rupiah(tipCount);

  // Jar shake
  jarEl.style.animation = 'none';
  requestAnimationFrame(() => { jarEl.style.animation = 'jarShake 0.4s ease'; });

  // Milestone reactions — use specific pose frames
  if (tipCount === 1) {
    // FIRST TIP — big excitement
    charMoodBase = CHAR.happy;
    playReaction(CHAR.tip1, 2200, "OH MY GOSH! My first tip! 🥹");
    burstConfetti(30);
  } else if (tipCount === 3) {
    // 3 tips — holds 3 bills
    charMoodBase = CHAR.happy;
    playReaction(CHAR.tip3, 2500, "Three!! You're spoiling me 💚");
    burstConfetti(50);
  } else if (tipCount === 6) {
    // 6 tips — bows in gratitude
    charMoodBase = CHAR.happy;
    playReaction(CHAR.tip6, 3000, "*bows* Thank you so so much! 🙇");
    burstConfetti(80);
  } else if (tipCount === 10) {
    charMoodBase = CHAR.happy;
    playReaction(CHAR.shock, 2000, "TEN?! I'm gonna cry! 😭");
    burstConfetti(100);
  } else if (tipCount === 15) {
    charMoodBase = CHAR.happy;
    playReaction(CHAR.shock, 2000, "Are you serious?! You're a legend!");
    burstConfetti(120);
  } else if (tipCount === 20) {
    charMoodBase = CHAR.happy;
    playReaction(CHAR.tip6, 2500, "I'll name my first AI after you!! 🙏");
    burstConfetti(150);
  } else {
    // Regular tip — quick bounce
    charMoodBase = CHAR.happy;
    applyCharImage(CHAR.happy);
    const line = TIP_LINES[Math.min(tipCount - 1, TIP_LINES.length - 1)];
    showSpeech(line);
    [charImg, contactCharImg].forEach(el => {
      el.classList.remove('reacting');
      void el.offsetWidth;
      el.classList.add('reacting');
    });
  }

  // Update companion badge
  if (compBadge) {
    compBadge.textContent = tipCount;
    compBadge.classList.add('shown');
  }
}

// ══════════════════════════════════════════════════════════════
// MONEY SYSTEM — uses hero drop zone OR companion drop zone OR contact drop zone
// ══════════════════════════════════════════════════════════════

/* Multi-drop-zone wrapper — extends MoneySystem */
class MultiDropMoney extends MoneySystem {
  constructor(onCollect) {
    super(onCollect);
    this.dropZones = [
      document.getElementById('money-drop-zone'),
      document.getElementById('comp-drop-zone'),
      document.getElementById('contact-drop-zone'),
    ].filter(Boolean);
  }

  _getActiveDrop(pt) {
    for (const dz of this.dropZones) {
      const r = dz.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue; // hidden
      if (pt.clientX > r.left && pt.clientX < r.right
       && pt.clientY > r.top  && pt.clientY < r.bottom) {
        return dz;
      }
    }
    return null;
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

      // Highlight active drop zone
      const active = this._getActiveDrop(pt);
      this.dropZones.forEach(dz => dz.classList.toggle('active', dz === active));
      e.preventDefault();
    };

    const onEnd = (e) => {
      if (!isDragging || this.dragging !== el) return;
      isDragging = false;
      this.dragging = null;
      this.dropZones.forEach(dz => dz.classList.remove('active'));

      const pt = e.changedTouches ? e.changedTouches[0] : e;
      const active = this._getActiveDrop(pt);

      if (active) {
        this._collectAt(el, active);
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

  _collectAt(el, dropZone) {
    el.classList.add('collected');
    const r = dropZone.getBoundingClientRect();
    el.style.transition = 'all 0.4s cubic-bezier(0.5, 0, 0.7, 1)';
    el.style.left = (r.left + r.width/2 - 48) + 'px';
    el.style.top  = (r.top + r.height/2 - 24) + 'px';
    el.style.transform = 'scale(0.2) rotate(30deg)';
    el.style.opacity = '0';
    this.notes = this.notes.filter(n => n !== el);
    setTimeout(() => el.remove(), 400);
    if (this.onCollect) this.onCollect();
  }
}

const moneySystem = new MultiDropMoney(onMoneyCollected);

// Spawn money when a section enters view
const spawnedSections = new Set();
const spawnObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !spawnedSections.has(e.target)) {
      spawnedSections.add(e.target);
      moneySystem.spawnForSection(e.target);

      // Attention grab — briefly shock!
      if (!isReacting && tipCount === 0) {
        playReaction(CHAR.shock, 1200, "Ooh! Money appeared! 👀");
      } else if (!isReacting) {
        showCompBubble("Look! More money 👀");
      }
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('[data-spawn-money]').forEach(s => spawnObserver.observe(s));

// ══════════════════════════════════════════════════════════════
// SIDE NAV ACTIVE + COMPANION VISIBILITY
// ══════════════════════════════════════════════════════════════
const sections = document.querySelectorAll('.page[id]');
const sideNavLinks = document.querySelectorAll('.sn-item[data-section]');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      sideNavLinks.forEach(l => l.classList.remove('active'));
      const match = document.querySelector(`.sn-item[data-section="${e.target.id}"]`);
      if (match) match.classList.add('active');

      // Companion visibility: visible only in middle sections (not hero, not contact)
      const id = e.target.id;
      if (id === 'hero' || id === 'contact') {
        charCompanion.classList.add('hidden');
      } else {
        charCompanion.classList.remove('hidden');
      }
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => navObserver.observe(s));

// Show companion bubble once when first revealed
let compFirstShow = true;
const compObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !charCompanion.classList.contains('hidden') && compFirstShow) {
      compFirstShow = false;
      setTimeout(() => showCompBubble("I'm following you! 👋"), 600);
    }
  });
}, { threshold: 0.1 });
compObserver.observe(charCompanion);

// ══════════════════════════════════════════════════════════════
// REVEAL ON SCROLL
// ══════════════════════════════════════════════════════════════
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in-view');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.tle-card, .cert-card, .proj-mini, .cc-card, .scrap, .cm-item, .ct-list li')
  .forEach(el => revealObserver.observe(el));
document.querySelectorAll('.ct-list li').forEach((el, i) => { el.style.transitionDelay = (0.08 * i) + 's'; });
document.querySelectorAll('.scrap').forEach((el, i) => { el.style.transitionDelay = (0.08 * i) + 's'; });

// ══════════════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════════════
const searchToggle  = document.getElementById('search-toggle');
const searchClose   = document.getElementById('search-close');
const searchOverlay = document.getElementById('search-overlay');
const searchInput   = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

const searchData = [
  { section: 'Work',     title: 'CV Engineer Intern — PT. Petrokimia Gresik', href: '#experience' },
  { section: 'Work',     title: 'AI Engineer — CV LetConnect Canada', href: '#experience' },
  { section: 'Work',     title: 'Head of Image Processing — Polinema Robotics', href: '#experience' },
  { section: 'Awards',   title: 'Best Innovation — Hackathon Compsphere 2025', href: '#awards' },
  { section: 'Awards',   title: '2nd Runner Up — COMPFEST 16 FASILKOM UI', href: '#awards' },
  { section: 'Awards',   title: '2nd Place — KMIPN Innovation Category', href: '#awards' },
  { section: 'Projects', title: 'LLM for Autism Support', href: '#projects' },
  { section: 'Projects', title: 'Sign Language App', href: '#projects' },
  { section: 'Projects', title: 'River Trash Segmentation', href: '#projects' },
  { section: 'Projects', title: 'IoT Forest Fire Prevention', href: '#projects' },
  { section: 'Projects', title: 'KAI Reality Game', href: '#projects' },
  { section: 'Skills',   title: 'Azure AI Engineer Associate (AI-102)', href: '#skills' },
  { section: 'Skills',   title: 'AWS re/Start 2025', href: '#skills' },
  { section: 'Contact',  title: 'Open for internship in Taiwan', href: '#contact' },
];

function openSearch() { searchOverlay.classList.remove('hidden'); searchInput.focus(); renderResults(''); }
function closeSearch() { searchOverlay.classList.add('hidden'); searchInput.value = ''; }
function renderResults(q) {
  const q2 = q.toLowerCase().trim();
  const filtered = q2
    ? searchData.filter(d => d.title.toLowerCase().includes(q2) || d.section.toLowerCase().includes(q2))
    : searchData.slice(0, 7);
  searchResults.innerHTML = filtered.length
    ? filtered.map(d => `<a href="${d.href}" class="search-result-item"><span class="sri-label">${d.section}</span><div class="sri-title">${d.title}</div></a>`).join('')
    : '<div style="padding:20px;text-align:center;color:#8b7c63;font-family:var(--font-hand);">Nothing matches, but keep scrolling!</div>';
  searchResults.querySelectorAll('a').forEach(a => a.addEventListener('click', closeSearch));
}
searchToggle.addEventListener('click', openSearch);
searchClose.addEventListener('click',  closeSearch);
searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
searchInput.addEventListener('input', () => renderResults(searchInput.value));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
});

// ══════════════════════════════════════════════════════════════
// SMOOTH SCROLL
// ══════════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ══════════════════════════════════════════════════════════════
// CHARACTER CLICK — in hero (random greetings)
// ══════════════════════════════════════════════════════════════
const heroGreetings = [
  "Hey there! 👋",
  "Scroll to see my work!",
  "I build AI stuff!",
  "Drop money below ↓",
  "Let's be friends!",
  "😊",
  "You clicked me!",
];
charImg.addEventListener('click', () => {
  if (isReacting) return;
  const msg = heroGreetings[Math.floor(Math.random() * heroGreetings.length)];
  playReaction(CHAR.happy, 1200, msg);
});

// Companion click
compFrame.addEventListener('click', () => {
  showCompBubble("Hi! Scroll to see more 👇");
});

// ══════════════════════════════════════════════════════════════
// CONTACT — INTERACTIVE REVEAL + PET MECHANIC + HIRE CTA
// ══════════════════════════════════════════════════════════════
const contactSection = document.getElementById('contact');
let interactiveRevealed = false;

const contactObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      if (!interactiveRevealed) {
        interactiveRevealed = true;
        // Reveal the banner
        setTimeout(() => interactiveBanner.classList.add('shown'), 200);
        // Spawn bonus money
        setTimeout(() => {
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              const x = 140 + Math.random() * (window.innerWidth - 360);
              const y = 160 + Math.random() * 220;
              moneySystem.spawn(x, y);
            }, i * 500);
          }
        }, 800);
        // Character reacts to reaching contact
        setTimeout(() => {
          playReaction(CHAR.shock, 1400, "Wait! You made it!");
        }, 300);
        setTimeout(() => {
          showSpeech("Please consider hiring me 🙏", true);
        }, 1800);
      }
    } else if (interactiveRevealed) {
      hideSpeech();
    }
  });
}, { threshold: 0.25 });
contactObserver.observe(contactSection);

/* ── PET MECHANIC on contact character ── */
const PET_EMOJIS = ['💚', '✨', '💛', '🌟', '⭐', '💫', '🎉'];
const PET_LINES = [
  "hehe!",
  "that tickles!",
  "you're sweet!",
  "more!",
  "I love you!",
  "thanks friend!",
  "okay okay!",
];

contactChar.addEventListener('click', (e) => {
  petCount++;
  petCountEl.textContent = petCount;
  petCounterEl.classList.remove('bump');
  void petCounterEl.offsetWidth;
  petCounterEl.classList.add('bump');

  // Spawn floating emoji
  const p = document.createElement('span');
  p.className = 'pet-particle';
  p.textContent = PET_EMOJIS[Math.floor(Math.random() * PET_EMOJIS.length)];
  const rect = contactChar.getBoundingClientRect();
  p.style.left = ((e.clientX - rect.left)) + 'px';
  p.style.top = ((e.clientY - rect.top)) + 'px';
  p.style.setProperty('--dx', ((Math.random() - 0.5) * 100) + 'px');
  p.style.setProperty('--dy', (-Math.random() * 60) + 'px');
  p.style.setProperty('--r', ((Math.random() - 0.5) * 90) + 'deg');
  petLayer.appendChild(p);
  setTimeout(() => p.remove(), 1400);

  // Character happy reaction
  if (!isReacting) {
    const line = PET_LINES[Math.min(petCount - 1, PET_LINES.length - 1)];
    playReaction(CHAR.happy, 900, line);
  }

  // Milestone pet celebrations
  if (petCount === 5) {
    playReaction(CHAR.tip1, 1800, "You've pet me 5 times!! 🥰");
    burstConfetti(40);
  } else if (petCount === 10) {
    playReaction(CHAR.tip6, 2200, "Okay okay! I'll bow! 🙇");
    burstConfetti(80);
  } else if (petCount === 20) {
    playReaction(CHAR.shock, 2000, "YOU REALLY LIKE ME! Hire me please!!");
    burstConfetti(120);
  }
});

/* ── HIRE ME BUTTON — the climax ── */
hireMeBtn.addEventListener('click', () => {
  // Massive celebration
  burstConfetti(200, true);
  playReaction(CHAR.tip6, 3500, "THANK YOU!! 🙏🎉");
  jarEl.style.animation = 'jarShake 0.4s ease';

  setTimeout(() => {
    thanksModal.classList.remove('hidden');
  }, 1200);

  // Track tip/pet count in mailto
  setTimeout(() => {
    const subject = encodeURIComponent('Hi Gabriel — I want to hire you!');
    const body = encodeURIComponent(
      `Hi Gabriel,\n\nI loved your portfolio! ${tipCount > 0 ? `I even left you ${tipCount} tips (${rupiah(tipCount)}) 😊` : ''}\n\nLet's talk about working together.\n\nBest,\n`
    );
    window.location.href = `mailto:gabrielbatavia7@gmail.com?subject=${subject}&body=${body}`;
  }, 2000);
});

thanksClose.addEventListener('click', () => {
  thanksModal.classList.add('hidden');
});
thanksModal.addEventListener('click', e => {
  if (e.target === thanksModal) thanksModal.classList.add('hidden');
});

// ══════════════════════════════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════════════════════════════
const CONFETTI_COLORS = [
  '#d4a04c', '#1f4a1f', '#b1332f', '#e8a87c', '#fde8c0',
  '#3d6b3d', '#d96f5a', '#2a2520', '#ffffff', '#fbf6ea',
];

function burstConfetti(count = 50, dense = false) {
  for (let i = 0; i < count; i++) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.style.left = (Math.random() * 100) + 'vw';
    c.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    c.style.width = (6 + Math.random() * 8) + 'px';
    c.style.height = (10 + Math.random() * 10) + 'px';
    c.style.setProperty('--dx', ((Math.random() - 0.5) * (dense ? 400 : 200)) + 'px');
    c.style.setProperty('--rot', (Math.random() * 1440) + 'deg');
    c.style.animationDuration = (1.8 + Math.random() * 2) + 's';
    c.style.animationDelay = (Math.random() * 0.4) + 's';
    if (Math.random() > 0.5) c.style.borderRadius = '50%';
    confettiLayer.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}

// ══════════════════════════════════════════════════════════════
// STARTING GREETING
// ══════════════════════════════════════════════════════════════
setTimeout(() => {
  showSpeech("Welcome! Scroll to explore 📖");
}, 1200);

setTimeout(() => {
  if (tipCount === 0) showSpeech("Try dragging the money to me 💵");
}, 8000);
