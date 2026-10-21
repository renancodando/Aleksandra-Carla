(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const header = document.querySelector('.site-header');
  const loader = document.querySelector('.loader');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const progress = document.querySelector('.scroll-progress i');

  const finishLoader = () => {
    if (!loader) return;
    window.setTimeout(() => loader.classList.add('is-done'), reduceMotion ? 0 : 1050);
  };
  if (document.readyState === 'complete') finishLoader();
  else window.addEventListener('load', finishLoader, { once: true });

  const updateChrome = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 18);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    }
  };
  updateChrome();
  window.addEventListener('scroll', updateChrome, { passive: true });

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

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.11, rootMargin: '0px 0px -35px' });

  document.querySelectorAll('.reveal, .reveal-text').forEach(el => observer.observe(el));

  if (!reduceMotion) {
    const kineticLines = [...document.querySelectorAll('.hero-line, .experience-word')];
    let scrollTick = false;

    const updateKinetic = () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        kineticLines.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const delta = (window.innerHeight / 2 - center) / window.innerHeight;
          const x = delta * (index % 2 === 0 ? 34 : -28);
          el.style.transform = `translate3d(${x}px,0,0)`;
        });
        scrollTick = false;
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

    const face = document.getElementById('faceSystem');
    if (face) {
      face.addEventListener('mousemove', event => {
        const rect = face.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        face.querySelectorAll('.face-node').forEach(node => {
          const depth = Number(node.dataset.depth || 1);
          node.style.transform = `translate(${nx * 18 * depth}px,${ny * 18 * depth}px)`;
        });
      });
      face.addEventListener('mouseleave', () => {
        face.querySelectorAll('.face-node').forEach(node => { node.style.transform = ''; });
      });
    }
  }

  const canvas = document.getElementById('fieldCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pointerX = 0.72;
    let pointerY = 0.28;
    let raf = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
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
        const segments = 110;
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          const wobble = Math.sin(a * 3 + time * 0.00025 + ringIndex) * (6 + ringIndex * 1.1);
          const breathe = Math.sin(time * 0.0004 + ringIndex * 0.6) * 7;
          const r = base + wobble + breathe;
          const x = ox + Math.cos(a) * r * 1.18;
          const y = oy + Math.sin(a) * r * 0.82;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = ringIndex % 2
          ? 'rgba(215,160,110,0.055)'
          : 'rgba(233,228,218,0.035)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.min(width, height) * 0.45);
      glow.addColorStop(0, 'rgba(114,45,54,.08)');
      glow.addColorStop(1, 'rgba(114,45,54,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    if (reduceMotion) draw(0);
    else raf = requestAnimationFrame(draw);

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', event => {
      pointerX += ((event.clientX / Math.max(1, width)) - pointerX) * 0.18;
      pointerY += ((event.clientY / Math.max(1, height)) - pointerY) * 0.18;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (reduceMotion) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    });
  }

  const mapInfo = document.getElementById('mapInfo');
  const mapPoints = [...document.querySelectorAll('.map-point')];
  const resetMap = () => {
    mapPoints.forEach(point => point.classList.remove('is-active'));
    if (!mapInfo) return;
    mapInfo.querySelector('.map-info-index').textContent = '00 / 04';
    mapInfo.querySelector('h3').textContent = 'Leitura integrada';
    mapInfo.querySelector('p').textContent = 'Nenhum ponto existe isolado. O rosto é lido como conjunto.';
  };

  mapPoints.forEach((point, index) => {
    const activate = () => {
      mapPoints.forEach(item => item.classList.remove('is-active'));
      point.classList.add('is-active');
      if (!mapInfo) return;
      mapInfo.querySelector('.map-info-index').textContent = `${String(index + 1).padStart(2, '0')} / 04`;
      mapInfo.querySelector('h3').textContent = point.dataset.title || '';
      mapInfo.querySelector('p').textContent = point.dataset.copy || '';
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
      const available = rect.height + window.innerHeight;
      const progressValue = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / available));
      flowFill.style.height = `${progressValue * 100}%`;
    };
    updateFlow();
    window.addEventListener('scroll', updateFlow, { passive: true });
    window.addEventListener('resize', updateFlow);
  }

  const counter = document.querySelector('[data-value="165"]');
  if (counter) {
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

  if (!reduceMotion) {
    document.querySelectorAll('.procedure-card').forEach(card => {
      card.addEventListener('mousemove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        card.style.setProperty('--pointer-x', `${x * 100}%`);
      });
    });
  }
})();