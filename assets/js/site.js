/* ==========================================================================
   Tekinify · etkileşimler (bağımlılık yok)
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const TITLES = {
    tr: 'Tekinify Studios · Küçük, hızlı, neon arcade oyunları',
    en: 'Tekinify Studios · Small, fast, neon arcade games',
  };
  const NAMES = {
    tr: { frostbeat: 'Frost Beat', clawloft: 'Clawloft', twinwing: 'Twinwing', hangmanescape: 'Adam Asmaca: Kaçış', tilkiyeborc: 'Tilkiye Borç', gariplig: 'Garip Lig' },
    en: { frostbeat: 'Frost Beat', clawloft: 'Clawloft', twinwing: 'Twinwing', hangmanescape: 'Hangman: Escape', tilkiyeborc: 'Owe the Fox', gariplig: 'Garip Lig' },
  };

  let lang = root.getAttribute('data-lang') === 'en' ? 'en' : 'tr';

  /* ---------- Görünürlük: giriş bölümü ekranda mı? ---------- */
  const hero = $('.hero');
  let heroVisible = true;
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);
  }

  /* ---------- Sayaçlar ---------- */
  const counters = $$('[data-count]');
  const formatCount = (el, value) => {
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const text = value.toFixed(decimals);
    return lang === 'tr' ? text.replace('.', ',') : text;
  };
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const start = performance.now();
    el.dataset.animating = '1';
    const step = (now) => {
      const p = Math.min(1, (now - start) / 1400);
      el.textContent = formatCount(el, target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
      else delete el.dataset.animating;
    };
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    counters.forEach((el) => { el.textContent = formatCount(el, 0); });
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        setTimeout(() => countUp(entry.target), 500);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Telefon: oyunlar arasında geçiş ---------- */
  const phone = $('[data-phone]');
  const caption = $('[data-caption]');
  const picks = $$('[data-pick]');
  const ORDER = ['frostbeat', 'gariplig', 'clawloft', 'twinwing', 'hangmanescape', 'tilkiyeborc'];
  let current = 'frostbeat';
  let holdUntil = 0;

  function showGame(game) {
    if (!phone) return;
    current = game;
    $$('.phone__screen img', phone).forEach((img) => img.classList.toggle('is-active', img.dataset.game === game));
    phone.classList.toggle('is-land', game === 'gariplig');
    picks.forEach((b) => b.classList.toggle('is-current', b.dataset.pick === game));
    if (caption) caption.textContent = NAMES[lang][game];
  }
  picks.forEach((btn) => {
    const choose = () => { holdUntil = performance.now() + 9000; showGame(btn.dataset.pick); };
    btn.addEventListener('click', choose);
    if (finePointer) btn.addEventListener('mouseenter', choose);
  });
  if (phone && !reduceMotion) {
    setInterval(() => {
      if (!heroVisible || document.hidden || performance.now() < holdUntil) return;
      showGame(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
    }, 3400);
  }
  // Telefon fareyi hafifçe takip eder
  const stage = $('[data-stage]');
  if (stage && phone && finePointer && !reduceMotion) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty('--px', px.toFixed(3));
      phone.style.translate = `${(px * 14).toFixed(1)}px ${(py * 14).toFixed(1)}px`;
    });
    stage.addEventListener('pointerleave', () => { phone.style.translate = ''; });
  }

  /* ---------- Öne çıkan oyun: slayt gösterisi ---------- */
  const feature = $('.feature');
  const slides = $$('[data-slides] img');
  const thumbs = $$('.feature__thumbs [data-slide]');
  const SLIDE_MS = 5000;
  let slideIndex = 0;
  let slideTimer = 0;
  function goSlide(i) {
    slideIndex = (i + slides.length) % slides.length;
    slides.forEach((img, k) => img.classList.toggle('is-active', k === slideIndex));
    thumbs.forEach((t, k) => {
      t.classList.remove('is-active');
      if (k === slideIndex) { void t.offsetWidth; t.classList.add('is-active'); }
    });
  }
  function scheduleSlide() {
    clearTimeout(slideTimer);
    if (reduceMotion) return;
    slideTimer = setTimeout(() => {
      if (!feature.classList.contains('is-paused') && !document.hidden) goSlide(slideIndex + 1);
      scheduleSlide();
    }, SLIDE_MS);
  }
  if (feature && slides.length) {
    feature.style.setProperty('--slide-ms', `${SLIDE_MS}ms`);
    thumbs.forEach((t) => t.addEventListener('click', () => { goSlide(Number(t.dataset.slide)); scheduleSlide(); }));
    if (finePointer) {
      const media = $('.feature__media');
      media.addEventListener('mouseenter', () => feature.classList.add('is-paused'));
      media.addEventListener('mouseleave', () => feature.classList.remove('is-paused'));
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { goSlide(slideIndex); scheduleSlide(); } else clearTimeout(slideTimer);
      }, { threshold: 0.3 }).observe(feature);
    } else {
      scheduleSlide();
    }
  }

  /* ---------- Dil ---------- */
  function setLang(next, persist) {
    lang = next;
    root.setAttribute('data-lang', next);
    root.lang = next;
    document.title = TITLES[next];
    $$('[data-label-tr]').forEach((el) => el.setAttribute('aria-label', el.getAttribute(`data-label-${next}`)));
    counters.forEach((el) => {
      if (el.dataset.animating) return;
      el.textContent = formatCount(el, parseFloat(el.textContent.replace(',', '.')));
    });
    if (caption) caption.textContent = NAMES[next][current];
    if (persist) {
      try { localStorage.setItem('tekinify-lang', next); } catch (e) { /* gizli sekme vb. */ }
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('lang')) { url.searchParams.set('lang', next); history.replaceState(null, '', url); }
      } catch (e) { /* yoksay */ }
    }
  }
  $('.lang-toggle')?.addEventListener('click', () => setLang(lang === 'tr' ? 'en' : 'tr', true));

  /* ---------- Menü ---------- */
  const nav = $('#nav');
  const burger = $('.nav__burger');
  const closeMenu = () => { root.classList.remove('nav-open'); burger?.setAttribute('aria-expanded', 'false'); };
  burger?.addEventListener('click', () => {
    const open = root.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('.nav__links a').forEach((a) => a.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });

  const navLinks = $$('.nav__links a');
  const linkById = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('is-active'));
        linkById.get(entry.target.id)?.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => sectionObserver.observe(s));
  }

  /* ---------- Kaydırma: ilerleme çubuğu, menü arka planı, başa dön ---------- */
  const progressBar = $('.scroll-progress');
  const toTop = $('.to-top');
  let scrollQueued = false;
  function onScroll() {
    scrollQueued = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    nav?.classList.toggle('is-scrolled', y > 24);
    toTop?.classList.toggle('is-visible', y > window.innerHeight * 0.8);
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Kaydırınca beliren öğeler ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Kart ışığı ve mıknatıslı butonlar ---------- */
  if (finePointer) {
    $$('.spot').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
        el.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
      });
    });
    if (!reduceMotion) {
      $$('.magnetic').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - (r.left + r.width / 2);
          const y = e.clientY - (r.top + r.height / 2);
          el.style.transform = `translate(${(x * 0.18).toFixed(1)}px, ${(y * 0.28).toFixed(1)}px)`;
        });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
      });
    }
  }

  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  setLang(lang, false);
  showGame(current);
})();
