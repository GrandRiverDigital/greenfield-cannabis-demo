/* =============================================
   GREENFIELD CANNABIS CO. — script.js
   ============================================= */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefRed = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────────
   1. AGE GATE
───────────────────────────────────────────── */
(function() {
  const gate = $('#age-gate');
  const yesBtn = $('#ag-yes');
  if (!gate) return;

  // Check if already verified this session
  if (sessionStorage.getItem('gfc_age_verified')) {
    gate.classList.add('hidden');
    return;
  }

  // Prevent scroll while gate is open
  document.body.style.overflow = 'hidden';

  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      sessionStorage.setItem('gfc_age_verified', '1');
      gate.style.opacity = '0';
      gate.style.transition = 'opacity 0.4s ease';
      setTimeout(() => {
        gate.classList.add('hidden');
        document.body.style.overflow = '';
      }, 400);
    });
  }
})();

/* ─────────────────────────────────────────────
   2. SCROLL REVEAL
───────────────────────────────────────────── */
if (!prefRed) {
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('up');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  $$('.sr').forEach(el => revealIO.observe(el));
} else {
  $$('.sr').forEach(el => el.classList.add('up'));
}

/* ─────────────────────────────────────────────
   3. STICKY HEADER
───────────────────────────────────────────── */
const hdr = $('#hdr');
if (hdr) {
  window.addEventListener('scroll', () => {
    hdr.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   4. SMOOTH SCROLL
───────────────────────────────────────────── */
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const target = $(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80 + 38;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: prefRed ? 'auto' : 'smooth' });
  });
});

/* ─────────────────────────────────────────────
   5. MOBILE NAV
───────────────────────────────────────────── */
const hamburger = $('#hamburger');
const mobileNav = $('#mobile-nav');
let navOpen = false;

function openNav() {
  navOpen = true;
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  navOpen = false;
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}
if (hamburger) {
  hamburger.addEventListener('click', () => navOpen ? closeNav() : openNav());
  $$('.mobile-link').forEach(link => link.addEventListener('click', () => { if (navOpen) closeNav(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navOpen) closeNav(); });
}

/* ─────────────────────────────────────────────
   6. STAT COUNTERS
───────────────────────────────────────────── */
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function animateCounter(el, target, suffix, duration) {
  if (!el || prefRed) {
    if (el) el.innerHTML = target + '<span class="accent">' + suffix + '</span>';
    return;
  }
  const start = performance.now();
  const isFloat = String(target).includes('.');
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const val = easeOut(p) * target;
    el.innerHTML = (isFloat ? val.toFixed(1) : Math.round(val)) + '<span class="accent">' + suffix + '</span>';
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

let countersDone = false;
const statsSection = $('#stats');
if (statsSection) {
  const statsIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !countersDone) {
        countersDone = true;
        statsIO.disconnect();
        animateCounter($('#sn-skus'), 250, '+', 1400);
        animateCounter($('#sn-customers'), 12, 'k+', 1600);
      }
    });
  }, { threshold: 0.3 });
  statsIO.observe(statsSection);
}

/* ─────────────────────────────────────────────
   7. TESTIMONIALS CAROUSEL
───────────────────────────────────────────── */
const track = $('#carousel-track');
const dotsContainer = $('#carousel-dots');
const prevBtn = $('#prev-btn');
const nextBtn = $('#next-btn');
const cards = track ? $$('.testimonial-card', track) : [];

if (track && cards.length) {
  let currentSlide = 0;
  let autoInterval = null;

  function getSlidesPerView() {
    if (window.innerWidth >= 1080) return 3;
    if (window.innerWidth >= 600) return 2;
    return 1;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const spv = getSlidesPerView();
    const total = Math.ceil(cards.length / spv);
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === currentSlide ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.setAttribute('aria-selected', String(i === currentSlide));
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const spv = getSlidesPerView();
    const total = Math.ceil(cards.length / spv);
    $$('.carousel-dot', dotsContainer).forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', String(i === currentSlide));
    });
  }

  function goTo(index) {
    const spv = getSlidesPerView();
    const total = Math.ceil(cards.length / spv);
    currentSlide = (index + total) % total;
    const cardWidth = cards[0].offsetWidth + 20;
    track.style.transform = 'translateX(-' + (currentSlide * spv * cardWidth) + 'px)';
    updateDots();
  }

  function startAuto() {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => goTo(currentSlide + 1), 5000);
  }
  function stopAuto() { clearInterval(autoInterval); }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(currentSlide - 1); stopAuto(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(currentSlide + 1); stopAuto(); startAuto(); });

  let touchStartX = null;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { goTo(currentSlide + (dx < 0 ? 1 : -1)); stopAuto(); startAuto(); }
    touchStartX = null;
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { goTo(0); buildDots(); }, 250);
  });

  buildDots();
  if (!prefRed) startAuto();
}

/* ─────────────────────────────────────────────
   8. MOBILE STICKY BAR
───────────────────────────────────────────── */
const mobBar = $('#mob-bar');
if (mobBar) {
  let shown = false;
  const show = () => { if (!shown) { shown = true; mobBar.classList.add('visible'); } };
  window.addEventListener('scroll', show, { passive: true, once: true });
  setTimeout(show, 600);
}

/* ─────────────────────────────────────────────
   9. CONTACT FORM HANDLER
───────────────────────────────────────────── */
const contactForm = $('#contact-form');
const contactSubmitBtn = $('#contact-submit-btn');
if (contactForm && contactSubmitBtn) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = document.createTextNode('\u2705 Sent! We\u2019ll be in touch soon.');
    contactSubmitBtn.replaceChildren(text);
    contactSubmitBtn.style.background = '#10B981';
    contactSubmitBtn.style.borderColor = '#10B981';
    contactSubmitBtn.style.boxShadow = '0 8px 24px rgba(16,185,129,.38)';
    contactSubmitBtn.style.pointerEvents = 'none';
  });
}

/* ─── IMMEDIATE REVEAL: fire on anchor nav + viewport check ─── */
(function() {
  function revealInView() {
    document.querySelectorAll('.sr, .reveal').forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('up');
        el.classList.add('is-visible');
      }
    });
  }
  // Run on load
  setTimeout(revealInView, 50);
  setTimeout(revealInView, 300);
  // Run on any scroll
  window.addEventListener('scroll', revealInView, { passive: true });
  // Run when anchor links are clicked
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    setTimeout(revealInView, 100);
    setTimeout(revealInView, 400);
    setTimeout(revealInView, 800);
  });
})();
