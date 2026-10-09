/* ==========================================================================
   Ahmet Tekin · Tekinify — etkileşimler ve efektler
   Bağımlılık yok; saf JavaScript.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const verticalProcess = window.matchMedia('(max-width: 1080px)');
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Metinler (TR / EN) ---------- */
  const TEXT = {
    tr: {
      title: 'Ahmet Tekin · Tekinify — Yapay Zekâ ile Oyun Geliştirici',
      typed: [
        'Yapay zekâ ile oyun geliştiriyorum.',
        'Fikirleri oynanabilir oyunlara dönüştürüyorum.',
        'Oyunlarımı Google Play\'de yayınlıyorum.',
        'Yapay zekâyı bir üretim ortağı olarak kullanıyorum.',
        'Kod yazıyor, teknik sorunlara çözüm üretiyorum.',
      ],
      terminal: [
        {
          prompt: 'Basit ama bağımlılık yapan bir mobil oyun tasarla',
          steps: ['Oyun mekaniği tasarlanıyor', 'Godot sahnesi kuruluyor', '3B modeller hazırlanıyor (Meshy)', 'Testler çalıştırılıyor', 'Google Play için derleniyor'],
          done: '✓ Yayına hazır! 🚀',
        },
        {
          prompt: 'Garip Lig\'e çevrimiçi 2v2 maç modu ekle',
          steps: ['Mevcut kod inceleniyor', 'Eşleştirme sistemi kuruluyor', 'Ağ senkronizasyonu yazılıyor', 'Çok oyunculu testler', 'Google Play\'e gönderiliyor'],
          done: '✓ 2v2 maçlar yayında! ⚽',
        },
        {
          prompt: 'Frost Beat\'te müzik komboyla birlikte yükselsin',
          steps: ['Müzik katmanlara ayrılıyor', 'Kombo sistemine bağlanıyor', 'Ritim testleri', 'Güncelleme derleniyor'],
          done: '✓ Güncelleme yayında! 🎵',
        },
        {
          prompt: 'Oyundaki çökme hatasını bul ve düzelt',
          steps: ['Hata kayıtları okunuyor', 'Sorunun kaynağı bulundu', 'Düzeltme uygulanıyor', 'Tüm testler geçti'],
          done: '✓ Hata giderildi! 🛠️',
        },
        {
          prompt: 'Kişisel CV sitemi efektli bir şekilde kodla',
          steps: ['Tasarım planlanıyor', 'HTML, CSS ve JavaScript yazılıyor', 'Efektler ekleniyor', 'Mobil uyum test ediliyor'],
          done: '✓ Şu an bu sitedesin! 👋',
        },
      ],
      toast: '🎮 Gizli mod açıldı! Bir oyun geliştiricisinin sitesinde bunu bekliyordun, değil mi?',
    },
    en: {
      title: 'Ahmet Tekin · Tekinify — AI-Powered Game Developer',
      typed: [
        'I build games with AI.',
        'I turn ideas into playable games.',
        'I publish my games on Google Play.',
        'I use AI as a production partner.',
        'I write code and solve technical problems.',
      ],
      terminal: [
        {
          prompt: 'Design a simple but addictive mobile game',
          steps: ['Designing the core mechanic', 'Setting up the Godot scene', 'Preparing 3D models (Meshy)', 'Running tests', 'Building for Google Play'],
          done: '✓ Ready to ship! 🚀',
        },
        {
          prompt: 'Add online 2v2 matches to Garip Lig',
          steps: ['Reviewing existing code', 'Building matchmaking', 'Writing network sync', 'Multiplayer tests', 'Shipping to Google Play'],
          done: '✓ 2v2 matches are live! ⚽',
        },
        {
          prompt: 'Make the music in Frost Beat build with the combo',
          steps: ['Splitting music into layers', 'Hooking into the combo system', 'Rhythm tests', 'Building the update'],
          done: '✓ Update is live! 🎵',
        },
        {
          prompt: 'Find and fix the crash in the game',
          steps: ['Reading crash logs', 'Root cause found', 'Applying the fix', 'All tests passed'],
          done: '✓ Bug fixed! 🛠️',
        },
        {
          prompt: 'Code my personal CV site, with effects',
          steps: ['Planning the design', 'Writing HTML, CSS and JavaScript', 'Adding effects', 'Testing on mobile'],
          done: '✓ You\'re looking at it! 👋',
        },
      ],
      toast: '🎮 Secret mode unlocked! You expected this on a game developer\'s site, right?',
    },
  };

  let lang = root.getAttribute('data-lang') === 'en' ? 'en' : 'tr';

  /* ---------- Giriş bölümü görünür mü? (animasyonları duraklatmak için) ---------- */
  const hero = $('.hero');
  let heroVisible = true;
  const waitActive = async (alive) => {
    while (alive() && (!heroVisible || document.hidden)) await sleep(250);
  };

  /* ---------- Dil ---------- */
  function setLang(next, persist) {
    lang = next;
    root.setAttribute('data-lang', next);
    root.lang = next;
    document.title = TEXT[next].title;
    $$('[data-label-tr]').forEach((el) => el.setAttribute('aria-label', el.getAttribute(`data-label-${next}`)));
    if (persist) {
      try { localStorage.setItem('lang', next); } catch (e) { /* gizli sekme vb. */ }
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('lang')) {
          url.searchParams.set('lang', next);
          history.replaceState(null, '', url);
        }
      } catch (e) { /* yoksay */ }
    }
    counters.forEach((el) => {
      if (el.dataset.animating) return;
      const shown = parseFloat(el.textContent.replace(',', '.'));
      el.textContent = formatCount(el, shown);
    });
    runTyped();
    runTerminal();
  }

  $('.lang-toggle')?.addEventListener('click', () => setLang(lang === 'tr' ? 'en' : 'tr', true));

  /* ---------- Menü ---------- */
  const nav = $('#nav');
  const burger = $('.nav__burger');
  const closeMenu = () => {
    root.classList.remove('nav-open');
    burger?.setAttribute('aria-expanded', 'false');
  };
  burger?.addEventListener('click', () => {
    const open = root.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('.nav__links a').forEach((a) => a.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) closeMenu(); });

  // Aktif bölümü menüde vurgula
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

  /* ---------- Kaydırma: ilerleme çubuğu, menü arka planı, başa dön, süreç çizgisi ---------- */
  const progressBar = $('.scroll-progress');
  const toTop = $('.to-top');
  const toTopRing = $('.to-top__progress');
  const RING = 138.3;
  const processEl = $('.process');
  const processTrack = $('.process__track');
  const processSteps = $$('.process__step');

  function updateProcess(vh) {
    if (!processEl) return;
    if (reduceMotion) {
      processEl.style.setProperty('--p', '1');
      processSteps.forEach((s) => s.classList.add('is-active'));
      return;
    }
    if (verticalProcess.matches) {
      const line = vh * 0.65;
      const track = processTrack.getBoundingClientRect();
      processEl.style.setProperty('--p', clamp((line - track.top) / track.height, 0, 1).toFixed(4));
      processSteps.forEach((step) => {
        const node = step.querySelector('.process__node').getBoundingClientRect();
        step.classList.toggle('is-active', node.top + node.height / 2 <= line);
      });
    } else {
      const rect = processEl.getBoundingClientRect();
      const p = clamp((vh * 0.8 - rect.top) / (vh * 0.45), 0, 1);
      processEl.style.setProperty('--p', p.toFixed(4));
      const last = processSteps.length - 1;
      processSteps.forEach((step, i) => step.classList.toggle('is-active', p > 0 && p >= i / last - 0.001));
    }
  }

  let scrollQueued = false;
  function onScroll() {
    scrollQueued = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const sp = max > 0 ? clamp(y / max, 0, 1) : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${sp})`;
    if (toTopRing) toTopRing.style.strokeDashoffset = String(RING * (1 - sp));
    nav?.classList.toggle('is-scrolled', y > 24);
    toTop?.classList.toggle('is-visible', y > vh * 0.8);
    updateProcess(vh);
  }
  const queueScroll = () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); }
  };
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll);
  verticalProcess.addEventListener('change', queueScroll);
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

  /* ---------- Sayaçlar ---------- */
  const counters = $$('[data-count]');
  const formatCount = (el, value) => {
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const text = value.toFixed(decimals);
    return lang === 'tr' ? text.replace('.', ',') : text;
  };
  const showFinalCounts = () => counters.forEach((el) => {
    if (!el.dataset.animating) el.textContent = formatCount(el, parseFloat(el.dataset.count));
  });
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
        countUp(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Harf karıştırma (decode) efekti ---------- */
  const GLYPHS = 'ABCDEFGHIJKLMNOPRSTUVYZ0123456789#%&*+=<>/';
  let scrambleHalted = false;
  function scramble(el, delay = 0) {
    if (reduceMotion || scrambleHalted || el.dataset.scrambling) return;
    const final = el.dataset.final || el.textContent;
    el.dataset.final = final;
    el.dataset.scrambling = '1';
    const chars = Array.from(final);
    const shown = chars.map((c) => (c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]));
    const start = performance.now() + delay;
    let lastSwap = 0;
    const tick = (now) => {
      if (scrambleHalted) {
        el.textContent = final;
        delete el.dataset.scrambling;
        return;
      }
      const t = now - start;
      if (t >= 0 && now - lastSwap > 45) {
        lastSwap = now;
        let done = true;
        chars.forEach((c, i) => {
          if (c === ' ' || t >= 160 + i * 95) shown[i] = c;
          else { done = false; shown[i] = GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
        });
        el.textContent = shown.join('');
        if (done) { delete el.dataset.scrambling; return; }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  $$('[data-scramble]').forEach((el, i) => scramble(el, 250 + i * 320));
  // Yazdırırken isim her zaman okunaklı olsun
  window.addEventListener('beforeprint', () => {
    showFinalCounts();
    scrambleHalted = true;
    $$('[data-final]').forEach((el) => { el.textContent = el.dataset.final; });
  });
  window.addEventListener('afterprint', () => { scrambleHalted = false; });
  $$('[data-scramble-hover]').forEach((el) => {
    el.closest('a')?.addEventListener('mouseenter', () => scramble(el));
  });

  /* ---------- Daktilo efekti ---------- */
  let typedRun = 0;
  async function runTyped() {
    const el = $('.typed');
    if (!el) return;
    const id = ++typedRun;
    const alive = () => id === typedRun;
    const phrases = TEXT[lang].typed;
    el.textContent = phrases[0];
    if (reduceMotion) return;
    let index = 0;
    await sleep(2600);
    while (alive()) {
      await waitActive(alive);
      if (!alive()) return;
      let current = Array.from(el.textContent);
      while (current.length && alive()) {
        current.pop();
        el.textContent = current.join('');
        await sleep(24);
      }
      if (!alive()) return;
      index = (index + 1) % phrases.length;
      const next = Array.from(phrases[index]);
      await sleep(320);
      for (let c = 1; c <= next.length && alive(); c++) {
        el.textContent = next.slice(0, c).join('');
        await sleep(36 + Math.random() * 46);
      }
      await sleep(2500);
    }
  }

  /* ---------- Yapay zekâ terminali ---------- */
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  function commandLine(promptText, withCommand = true) {
    const line = make('div', 'tl tl--cmd');
    line.append(
      make('span', 'tl__user', 'tekinify@ai'),
      make('span', 'tl__path', ' ~ '),
      make('span', 'tl__sym', '$ '),
    );
    if (withCommand) line.append(make('span', 'tl__cmd', 'claude '));
    const str = make('span', 'tl__str', promptText);
    line.append(str);
    return { line, str };
  }

  function stepLine(text) {
    const row = make('div', 'tl tl--step');
    const time = make('span', 'tl__time', '');
    row.append(make('span', 'tl__ico'), make('span', 'tl__txt', text), make('span', 'tl__dots'), time);
    return { row, time };
  }

  function renderTerminalStatic(body, script) {
    body.textContent = '';
    body.append(commandLine(`"${script.prompt}"`).line, make('div', 'tl tl--gap'));
    script.steps.forEach((s) => {
      const { row } = stepLine(s);
      row.classList.add('is-done');
      body.append(row);
    });
    body.append(make('div', 'tl tl--done', script.done));
  }

  let terminalRun = 0;
  async function runTerminal() {
    const body = $('#terminal-body');
    if (!body) return;
    const id = ++terminalRun;
    const alive = () => id === terminalRun;
    const scripts = TEXT[lang].terminal;
    body.classList.remove('is-clearing');
    if (reduceMotion) { renderTerminalStatic(body, scripts[0]); return; }

    let k = 0;
    while (alive()) {
      const script = scripts[k % scripts.length];
      body.textContent = '';
      body.classList.remove('is-clearing');
      await waitActive(alive);
      if (!alive()) return;

      // Komutu yaz
      const { line, str } = commandLine('');
      const cursor = make('span', 'tcursor');
      line.append(cursor);
      body.append(line);
      const text = Array.from(`"${script.prompt}"`);
      for (let c = 1; c <= text.length; c++) {
        if (!alive()) return;
        str.textContent = text.slice(0, c).join('');
        await sleep(26 + Math.random() * 38);
      }
      cursor.remove();
      body.append(make('div', 'tl tl--gap'));
      await sleep(380);

      // Adımlar
      for (const s of script.steps) {
        await waitActive(alive);
        if (!alive()) return;
        const { row, time } = stepLine(s);
        body.append(row);
        const ms = 520 + Math.random() * 760;
        await sleep(ms);
        if (!alive()) return;
        row.classList.add('is-done');
        time.textContent = `${(ms / 1000).toFixed(1)}s`;
      }
      await sleep(260);
      if (!alive()) return;
      body.append(make('div', 'tl tl--done', script.done));

      // Yeni komut satırı ve bekleme
      const idle = commandLine('', false);
      idle.line.append(make('span', 'tcursor'));
      body.append(idle.line);
      await sleep(3000);
      if (!alive()) return;
      body.classList.add('is-clearing');
      await sleep(420);
      k++;
    }
  }

  /* ---------- Sinir ağı arka planı (canvas) ---------- */
  function createNeural(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const LINK = 140;
    const COLORS = [[34, 211, 238], [139, 92, 246], [236, 72, 153]];
    const nodes = [];
    const pulses = [];
    const ripples = [];
    const mouse = { x: -9999, y: -9999, on: false };
    let w = 0;
    let h = 0;
    let running = false;
    let raf = 0;
    let last = 0;
    let spawnTimer = 0;
    let party = false;

    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const colorAt = (t) => (t < 0.5 ? mix(COLORS[0], COLORS[1], t * 2) : mix(COLORS[1], COLORS[2], (t - 0.5) * 2));

    // Önceden çizilmiş parlama (performans için)
    const glow = document.createElement('canvas');
    glow.width = glow.height = 64;
    const g = glow.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.18, 'rgba(180,240,255,0.9)');
    grd.addColorStop(0.5, 'rgba(139,92,246,0.3)');
    grd.addColorStop(1, 'rgba(139,92,246,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);

    const makeNode = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.8,
      c: colorAt(Math.random()),
      ph: Math.random() * Math.PI * 2,
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(clamp((w * h) / 12500, 26, 115));
      while (nodes.length < target) nodes.push(makeNode());
      nodes.length = target;
      nodes.forEach((n) => {
        if (n.x > w) n.x = Math.random() * w;
        if (n.y > h) n.y = Math.random() * h;
      });
      pulses.length = 0;
      if (!running) draw(performance.now(), 0);
    }

    function neighbors(n, exclude) {
      const out = [];
      for (const m of nodes) {
        if (m === n || m === exclude) continue;
        const dx = m.x - n.x;
        const dy = m.y - n.y;
        if (dx * dx + dy * dy < LINK * LINK) out.push(m);
      }
      return out;
    }

    function spawnPulse(from) {
      const a = from || nodes[(Math.random() * nodes.length) | 0];
      if (!a) return;
      const nb = neighbors(a);
      if (!nb.length) return;
      pulses.push({
        a,
        b: nb[(Math.random() * nb.length) | 0],
        t: 0,
        v: 0.018 + Math.random() * 0.022,
        hops: 3 + ((Math.random() * 5) | 0),
        hue: Math.random() * 360,
      });
    }

    function draw(now, dt) {
      const k = dt / 16.67;
      ctx.clearRect(0, 0, w, h);

      // Düğümleri hareket ettir
      for (const n of nodes) {
        n.x += n.vx * k;
        n.y += n.vy * k;
        if (n.x < -12) n.x = w + 12; else if (n.x > w + 12) n.x = -12;
        if (n.y < -12) n.y = h + 12; else if (n.y > h + 12) n.y = -12;
        if (mouse.on) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 170 * 170 && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = (1 - d / 170) * 0.9 * k;
            n.x += (dx / d) * f;
            n.y += (dy / d) * f;
          }
        }
      }

      // Bağlantılar
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const o = (1 - Math.sqrt(d2) / LINK) * 0.26;
          ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${o.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // İmlece bağlantılar
      if (mouse.on) {
        for (const n of nodes) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 230 * 230) continue;
          const o = (1 - Math.sqrt(d2) / 230) * 0.55;
          ctx.strokeStyle = `rgba(236,72,153,${o.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }

      // Düğümler
      for (const n of nodes) {
        const tw = 0.6 + Math.sin(now * 0.002 + n.ph) * 0.4;
        ctx.fillStyle = `rgba(${n.c[0]},${n.c[1]},${n.c[2]},${(0.5 + tw * 0.5).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sinyaller: düğümden düğüme akan ışık
      if (dt > 0) {
        spawnTimer += dt;
        const every = party ? 45 : 360;
        while (spawnTimer > every) {
          spawnTimer -= every;
          if (pulses.length < (party ? 70 : 14)) spawnPulse();
        }
      }
      ctx.lineWidth = 1.5;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.v * k;
        if (p.t >= 1) {
          p.hops -= 1;
          const nb = p.hops > 0 ? neighbors(p.b, p.a) : [];
          if (!nb.length) { pulses.splice(i, 1); continue; }
          p.a = p.b;
          p.b = nb[(Math.random() * nb.length) | 0];
          p.t = 0;
        }
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.strokeStyle = party ? `hsla(${(p.hue + now / 6) % 360},95%,65%,0.8)` : 'rgba(34,211,238,0.6)';
        ctx.beginPath();
        ctx.moveTo(p.a.x, p.a.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.drawImage(glow, x - 13, y - 13, 26, 26);
      }

      // Tıklama dalgaları
      ctx.lineWidth = 1.5;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.t += 0.025 * k;
        if (r.t >= 1) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(139,92,246,${(1 - r.t) * 0.7})`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 10 + r.t * 110, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function frame(now) {
      if (!running) return;
      const dt = last ? Math.min(50, now - last) : 16.67;
      last = now;
      draw(now, dt);
      raf = requestAnimationFrame(frame);
    }

    const api = {
      start() {
        if (running || reduceMotion) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      },
      stop() {
        running = false;
        cancelAnimationFrame(raf);
      },
      pointer(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = clientX - rect.left;
        mouse.y = clientY - rect.top;
        mouse.on = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= rect.width && mouse.y <= rect.height;
      },
      leave() { mouse.on = false; },
      burst(clientX, clientY) {
        if (reduceMotion) return;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        let best = null;
        let bestD = Infinity;
        for (const n of nodes) {
          const d = (n.x - x) ** 2 + (n.y - y) ** 2;
          if (d < bestD) { bestD = d; best = n; }
        }
        ripples.push({ x, y, t: 0 });
        for (let i = 0; i < 7; i++) spawnPulse(best);
      },
      setParty(on) { party = on; },
    };

    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);
    return api;
  }

  const neural = $('#neural') ? createNeural($('#neural')) : null;
  if (neural) {
    window.addEventListener('pointermove', (e) => neural.pointer(e.clientX, e.clientY), { passive: true });
    document.addEventListener('pointerleave', () => neural.leave());
    hero?.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      neural.burst(e.clientX, e.clientY);
    });
  }

  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible && !document.hidden) neural?.start();
      else neural?.stop();
    }).observe(hero);
  } else {
    neural?.start();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) neural?.stop();
    else if (heroVisible) neural?.start();
  });

  /* ---------- İmleç ışığı, kart ışığı, 3B eğim, mıknatıslı butonlar ---------- */
  if (finePointer && !reduceMotion) {
    const glowEl = $('.cursor-glow');
    let tx = 0; let ty = 0; let cx = 0; let cy = 0; let glowRaf = 0;
    const follow = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      glowEl.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      glowRaf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(follow) : 0;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!root.classList.contains('has-cursor')) {
        cx = tx; cy = ty;
        root.classList.add('has-cursor');
      }
      if (!glowRaf) glowRaf = requestAnimationFrame(follow);
    }, { passive: true });
    document.addEventListener('pointerleave', () => root.classList.remove('has-cursor'));

    $$('.tilt').forEach((el) => {
      const max = parseFloat(el.dataset.tilt || '8');
      el.addEventListener('pointerenter', () => el.classList.add('is-tilting'));
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });

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

  if (finePointer) {
    $$('.spot').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
        el.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
      });
    });
  }

  /* ---------- Bildirim ---------- */
  let toastTimer = 0;
  function toast(message) {
    const el = $('.toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4500);
  }

  /* ---------- Gizli mod: Konami kodu (↑↑↓↓←→←→BA) ya da logoya 5 kez dokunma ---------- */
  let partyTimer = 0;
  function partyMode() {
    root.classList.add('party');
    neural?.setParty(true);
    toast(TEXT[lang].toast);
    clearTimeout(partyTimer);
    partyTimer = setTimeout(() => {
      root.classList.remove('party');
      neural?.setParty(false);
    }, 9000);
  }
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiPos = 0;
  window.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[konamiPos]) konamiPos += 1;
    else konamiPos = key === KONAMI[0] ? 1 : 0;
    if (konamiPos === KONAMI.length) {
      konamiPos = 0;
      partyMode();
    }
  });
  let taps = [];
  $$('.logo').forEach((logo) => logo.addEventListener('click', () => {
    const now = Date.now();
    taps = taps.filter((t) => now - t < 2000);
    taps.push(now);
    if (taps.length >= 5) {
      taps = [];
      partyMode();
    }
  }));

  /* ---------- Diğer ---------- */
  $$('[data-print]').forEach((btn) => btn.addEventListener('click', () => window.print()));
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  setLang(lang, false);

  console.log(
    '%cTekinify%c\nMerhaba! 👋 Kodu incelemeye geldiysen iyi anlaşacağız.\nHi! 👋 If you are reading the source, we will get along.\n→ #contact',
    'font: 700 28px "Space Grotesk Variable", sans-serif; color: #22d3ee; text-shadow: 0 0 12px rgba(139,92,246,.8);',
    'font: 13px "Inter Variable", sans-serif; color: #a6abc8;',
  );
})();
