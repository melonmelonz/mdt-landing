/* ═══════════════════════════════════════════════════════
   MDT — MAUD'DIB TEK
   Sand particle system + scroll behaviors
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── Sand particle system ── */
(function () {
  const canvas = document.getElementById('sand-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;
  let W = 0, H = 0;

  const COLORS_SAND = [
    [201, 169, 110],  // gold sand
    [168, 130,  80],  // mid sand
    [212, 185, 128],  // pale sand
    [139, 111,  71],  // dark sand
  ];
  const COLOR_SPICE = [168, 85, 247]; // purple — rare

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Grain {
    constructor(initY) {
      this.spawn(initY !== undefined ? initY : null);
    }

    spawn(forceY) {
      this.x  = Math.random() * W;
      this.y  = forceY !== null ? Math.random() * H : -4;
      this.r  = Math.random() * 0.9 + 0.2;
      this.vx = (Math.random() - 0.5) * 0.18;
      this.vy = Math.random() * 0.22 + 0.04;

      const isSpice = Math.random() < 0.045;
      const rgb = isSpice
        ? COLOR_SPICE
        : COLORS_SAND[Math.floor(Math.random() * COLORS_SAND.length)];

      const a = isSpice
        ? Math.random() * 0.18 + 0.04
        : Math.random() * 0.30 + 0.06;

      this.fill = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > H + 4) this.spawn(null);
      if (this.x <    -4) this.x = W + 4;
      if (this.x >  W + 4) this.x = -4;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 6.283185);
      ctx.fillStyle = this.fill;
      ctx.fill();
    }
  }

  function buildParticles() {
    const count = Math.min(Math.round((W * H) / 7000), 220);
    particles = Array.from({ length: count }, () => new Grain(true));
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    raf = requestAnimationFrame(tick);
  }

  // Pause when tab is hidden — saves CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      tick();
    }
  });

  window.addEventListener('resize', () => {
    resize();
    buildParticles();
  }, { passive: true });

  resize();
  buildParticles();
  tick();
}());


/* ── Nav scroll class ── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const threshold = 60;
  let ticking = false;

  function update() {
    if (window.scrollY > threshold) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}());


/* ── Scroll reveal (IntersectionObserver) ── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length || !('IntersectionObserver' in window)) {
    // Fallback: just show everything
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  els.forEach(el => observer.observe(el));
}());


/* ── Smooth nav link scroll ── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}());


/* ── Mobile nav toggle ── */
(function () {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;

  function close() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    links.classList.remove('open');
  }

  function open() {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    links.classList.add('open');
  }

  toggle.addEventListener('click', () => {
    if (toggle.getAttribute('aria-expanded') === 'true') close();
    else open();
  });

  // Close on link tap
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Close if window resized above breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 600) close();
  }, { passive: true });
}());
