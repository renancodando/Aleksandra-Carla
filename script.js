(() => {
  'use strict';

  // Sempre inicia no topo. Safari/iOS costuma restaurar a posição anterior
  // (ou obedecer um hash antigo) mesmo quando o documento foi recarregado.
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  } catch (_) {}

  const forceTop = () => {
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  };

  forceTop();
  requestAnimationFrame(() => {
    forceTop();
    requestAnimationFrame(forceTop);
  });
  window.addEventListener('pageshow', () => {
    forceTop();
    window.setTimeout(forceTop, 60);
    window.setTimeout(forceTop, 220);
  }, { once: true });

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;
  const loader = document.querySelector('.loader');
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const progress = document.querySelector('.scroll-progress i');

  let loaderReleased = false;
  const releaseLoader = () => {
    if (loaderReleased || !loader) return;
    loaderReleased = true;
    loader.classList.add('is-done');
    loader.style.pointerEvents = 'none';
    window.setTimeout(() => {
      if (loader?.parentNode) loader.remove();
    }, 1100);
  };

  window.setTimeout(releaseLoader, reduceMotion ? 80 : 1350);
  document.addEventListener('DOMContentLoaded', () => {
    forceTop();
    window.setTimeout(releaseLoader, reduceMotion ? 0 : 900);
  }, { once: true });
  window.addEventListener('load', () => {
    forceTop();
    releaseLoader();
  }, { once: true });
  window.addEventListener('error', () => window.setTimeout(releaseLoader, 0));
  window.addEventListener('unhandledrejection', () => window.setTimeout(releaseLoader, 0));

  const updateChrome = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 18);
    if (!progress) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.width = `${Math.min(100, Math.max(0, (window.scrollY / max) * 100))}%`;
  };
  updateChrome();
  window.addEventListener('scroll', updateChrome, { passive: true });
  window.addEventListener('resize', updateChrome, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu?.setAttribute('aria-hidden', String(!open));
    mobileMenu?.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  const revealElements = [...document.querySelectorAll('.reveal, .reveal-text')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px' });
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  if (!reduceMotion) {
    const kineticLines = [...document.querySelectorAll('.hero-line, .experience-word')];
    let kineticTick = false;
    const updateKinetic = () => {
      if (kineticTick) return;
      kineticTick = true;
      requestAnimationFrame(() => {
        kineticLines.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const delta = (window.innerHeight / 2 - center) / Math.max(1, window.innerHeight);
          const x = delta * (index % 2 === 0 ? 34 : -28);
          el.style.transform = `translate3d(${x}px,0,0)`;
        });
        kineticTick = false;
      });
    };
    window.addEventListener('scroll', updateKinetic, { passive: true });
    updateKinetic();
  }

  if (finePointer && !reduceMotion) {
    document.body.classList.add('cursor-active');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    window.addEventListener('mousemove', event => {
      mx = event.clientX;
      my = event.clientY;
      if (dot) dot.style.transform = `translate3d(${mx - 2.5}px,${my - 2.5}px,0)`;
    }, { passive: true });

    const follow = () => {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      if (ring) ring.style.transform = `translate3d(${rx - 21}px,${ry - 21}px,0)`;
      requestAnimationFrame(follow);
    };
    follow();

    document.querySelectorAll('a, button, .procedure-card, .review-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', event => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.07}px,${y * 0.1}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  const canvas = document.getElementById('fieldCanvas');
  if (canvas) {
    const ctx = canvas.getContext?.('2d', { alpha: true });
    if (ctx) {
      let width = 0;
      let height = 0;
      let dpr = 1;
      let pointerX = 0.72;
      let pointerY = 0.28;
      let raf = 0;
      const resizeCanvas = () => {
        width = Math.max(1, window.innerWidth);
        height = Math.max(1, window.innerHeight);
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      const draw = time => {
        ctx.clearRect(0, 0, width, height);
        const ox = width * pointerX;
        const oy = height * pointerY;
        for (let ringIndex = 0; ringIndex < 8; ringIndex++) {
          const base = Math.min(width, height) * (0.12 + ringIndex * 0.055);
          ctx.beginPath();
          for (let i = 0; i <= 90; i++) {
            const a = (i / 90) * Math.PI * 2;
            const wobble = Math.sin(a * 3 + time * 0.00025 + ringIndex) * (6 + ringIndex * 1.1);
            const breathe = Math.sin(time * 0.0004 + ringIndex * 0.6) * 7;
            const r = base + wobble + breathe;
            const x = ox + Math.cos(a) * r * 1.18;
            const y = oy + Math.sin(a) * r * 0.82;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = ringIndex % 2 ? 'rgba(215,160,110,0.055)' : 'rgba(233,228,218,0.035)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        const radius = Math.max(1, Math.min(width, height) * 0.45);
        const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, radius);
        glow.addColorStop(0, 'rgba(114,45,54,.08)');
        glow.addColorStop(1, 'rgba(114,45,54,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
        if (!reduceMotion) raf = requestAnimationFrame(draw);
      };
      resizeCanvas();
      if (reduceMotion) draw(0); else raf = requestAnimationFrame(draw);
      window.addEventListener('resize', resizeCanvas, { passive: true });
      window.addEventListener('pointermove', event => {
        pointerX += ((event.clientX / width) - pointerX) * 0.18;
        pointerY += ((event.clientY / height) - pointerY) * 0.18;
      }, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (reduceMotion) return;
        if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(draw);
      });
    }
  }

  const mapInfo = document.getElementById('mapInfo');
  const mapPoints = [...document.querySelectorAll('.map-point')];
  const setMapInfo = (index, title, copy) => {
    if (!mapInfo) return;
    mapInfo.querySelector('.map-info-index')?.replaceChildren(document.createTextNode(index));
    mapInfo.querySelector('h3')?.replaceChildren(document.createTextNode(title));
    mapInfo.querySelector('p')?.replaceChildren(document.createTextNode(copy));
  };
  const resetMap = () => {
    mapPoints.forEach(point => point.classList.remove('is-active'));
    setMapInfo('00 / 04', 'Leitura integrada', 'Nenhum ponto existe isolado. O rosto é lido como conjunto.');
  };
  mapPoints.forEach((point, index) => {
    const activate = () => {
      mapPoints.forEach(item => item.classList.remove('is-active'));
      point.classList.add('is-active');
      setMapInfo(`${String(index + 1).padStart(2, '0')} / 04`, point.dataset.title || '', point.dataset.copy || '');
    };
    point.addEventListener('mouseenter', activate);
    point.addEventListener('focus', activate);
    point.addEventListener('click', activate);
  });
  document.getElementById('analysisStage')?.addEventListener('mouseleave', resetMap);

  const flow = document.querySelector('.experience-flow');
  const flowFill = document.querySelector('.flow-line i');
  if (flow && flowFill && !reduceMotion) {
    const updateFlow = () => {
      const rect = flow.getBoundingClientRect();
      const available = Math.max(1, rect.height + window.innerHeight);
      const value = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / available));
      flowFill.style.height = `${value * 100}%`;
    };
    updateFlow();
    window.addEventListener('scroll', updateFlow, { passive: true });
    window.addEventListener('resize', updateFlow, { passive: true });
  }

  const counter = document.querySelector('[data-value="165"]');
  if (counter && 'IntersectionObserver' in window) {
    let started = false;
    const counterObserver = new IntersectionObserver(entries => {
      if (started || !entries.some(entry => entry.isIntersecting)) return;
      started = true;
      const duration = reduceMotion ? 0 : 900;
      const start = performance.now();
      const tick = now => {
        const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        counter.textContent = String(Math.round(165 * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.disconnect();
    }, { threshold: 0.5 });
    counterObserver.observe(counter);
  }
})();