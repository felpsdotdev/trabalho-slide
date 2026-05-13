/* =============================================
   EXPRESSIONISMO ABSTRATO & POP ART
   Presentation Script
   ============================================= */

(function () {
  'use strict';

  /* ── STATE ──────────────────────────────── */
  const slides      = Array.from(document.querySelectorAll('.slide'));
  const total       = slides.length;
  let   current     = 0;
  let   isAnimating = false;

  /* ── ELEMENTS ───────────────────────────── */
  const progressBar  = document.getElementById('progressBar');
  const slideCounter = document.getElementById('slideCounter');
  const prevBtn      = document.getElementById('prevBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const dotNav       = document.getElementById('dotNav');
  const coverDate    = document.getElementById('coverDate');

  /* ── DATE ───────────────────────────────── */
  if (coverDate) {
    const now = new Date();
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    coverDate.textContent = now.toLocaleDateString('pt-BR', opts);
  }

  /* ── DOT NAV BUILD ──────────────────────── */
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot-nav-item' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotNav.appendChild(dot);
  });

  /* ── UPDATE UI ──────────────────────────── */
  function updateUI() {
    const pct = ((current + 1) / total) * 100;
    progressBar.style.width = pct + '%';

    const n = String(current + 1).padStart(2, '0');
    const t = String(total).padStart(2, '0');
    slideCounter.textContent = `${n} / ${t}`;

    document.querySelectorAll('.dot-nav-item').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });

    // Disable buttons at boundaries (keep them invisible via the auto-hide system)
    prevBtn.style.pointerEvents = current === 0 ? 'none' : 'auto';
    nextBtn.style.pointerEvents = current === total - 1 ? 'none' : 'auto';
  }

  /* ── GO TO SLIDE ────────────────────────── */
  function goTo(index, dir = null) {
    if (isAnimating || index === current || index < 0 || index >= total) return;

    const direction = dir ?? (index > current ? 1 : -1);
    const oldSlide  = slides[current];
    const newSlide  = slides[index];

    isAnimating = true;

    // Prepare new slide off-screen
    newSlide.style.transition = 'none';
    newSlide.style.opacity    = '0';
    newSlide.style.transform  = `translateX(${direction * 60}px)`;
    newSlide.classList.add('active');
    newSlide.classList.remove('exit-left');

    // Force reflow
    newSlide.getBoundingClientRect();

    // Animate old out + new in
    oldSlide.style.transition  = 'opacity 0.65s cubic-bezier(0.77,0,0.18,1), transform 0.65s cubic-bezier(0.77,0,0.18,1)';
    oldSlide.style.opacity     = '0';
    oldSlide.style.transform   = `translateX(${direction * -60}px)`;

    newSlide.style.transition  = 'opacity 0.65s cubic-bezier(0.77,0,0.18,1), transform 0.65s cubic-bezier(0.77,0,0.18,1)';
    newSlide.style.opacity     = '1';
    newSlide.style.transform   = 'translateX(0)';

    setTimeout(() => {
      oldSlide.classList.remove('active');
      oldSlide.style.transition = '';
      oldSlide.style.opacity    = '';
      oldSlide.style.transform  = '';

      newSlide.style.transition = '';
      newSlide.style.opacity    = '';
      newSlide.style.transform  = '';

      current = index;
      updateUI();
      triggerEntryAnimations(newSlide);
      isAnimating = false;
    }, 680);
  }

  function next() { goTo(current + 1,  1); }
  function prev() { goTo(current - 1, -1); }

  /* ── ENTRY ANIMATIONS ───────────────────── */
  function triggerEntryAnimations(slide) {
    // Stagger child elements on entry
    const targets = slide.querySelectorAll(
      '.feat-card, .pop-feat-card, .artist-card, .work-card, ' +
      '.timeline-block, .tech-item, .infl-item, .concl-block, ' +
      '.compare-table tbody tr'
    );
    targets.forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = 'none';
      setTimeout(() => {
        el.style.transition  = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.opacity     = '1';
        el.style.transform   = 'translateY(0)';
      }, 120 + i * 70);
    });
  }

  /* ── AUTO-HIDE NAV + DOTS ON IDLE ───────── */
  const dotNavEl = document.getElementById('dotNav');
  let idleTimer = null;
  function showNav() {
    prevBtn.classList.add('visible');
    nextBtn.classList.add('visible');
    dotNavEl.classList.add('visible');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      prevBtn.classList.remove('visible');
      nextBtn.classList.remove('visible');
      dotNavEl.classList.remove('visible');
    }, 2000);
  }
  document.addEventListener('mousemove', showNav);
  document.addEventListener('mousedown', showNav);
  showNav(); // show on load

  /* ── EVENTS ─────────────────────────────── */
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); goTo(0); break;
      case 'End':
        e.preventDefault(); goTo(total - 1); break;
    }
  });

  /* ── TOUCH SWIPE ────────────────────────── */
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      dx > 0 ? next() : prev();
    }
  }, { passive: true });

  /* ── MOUSE WHEEL ────────────────────────── */
  let wheelCooldown = false;
  document.addEventListener('wheel', (e) => {
    if (wheelCooldown) return;
    wheelCooldown = true;
    e.deltaY > 0 ? next() : prev();
    setTimeout(() => { wheelCooldown = false; }, 900);
  }, { passive: true });

  /* ── INIT ───────────────────────────────── */
  updateUI();
  triggerEntryAnimations(slides[0]);

})();
