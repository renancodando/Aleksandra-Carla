(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const heroImage = document.querySelector('.hero-media img');

  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const nextOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(nextOpen));
    mobileMenu.setAttribute('aria-hidden', String(!nextOpen));
    mobileMenu.classList.toggle('open', nextOpen);
    document.body.classList.toggle('menu-open', nextOpen);
  });

  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  if (!reduceMotion && heroImage) {
    let ticking = false;
    const parallaxHero = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const translate = Math.min(window.scrollY * 0.08, 72);
        heroImage.style.transform = `scale(1.04) translate3d(0, ${translate}px, 0)`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', parallaxHero, { passive: true });
  }

  if (!reduceMotion) {
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = Number(el.dataset.parallax) || 0.03;
      window.addEventListener('scroll', () => {
        const rect = el.getBoundingClientRect();
        const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed;
        el.style.setProperty('--parallax-y', `${offset}px`);
      }, { passive: true });
    });
  }

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    document.body.classList.add('cursor-active');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', event => {
      mx = event.clientX;
      my = event.clientY;
      if (dot) dot.style.transform = `translate3d(${mx - 2.5}px, ${my - 2.5}px, 0)`;
    });

    const follow = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      if (ring) ring.style.transform = `translate3d(${rx - 20}px, ${ry - 20}px, 0)`;
      requestAnimationFrame(follow);
    };
    follow();

    document.querySelectorAll('a, button, .treatment-row').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', event => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.06}px, ${y * 0.09}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  const canvas = document.getElementById('ambientCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let points = [];
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = Array.from({ length: Math.max(14, Math.floor(width / 90)) }, (_, i) => ({
        x: (i / Math.max(1, Math.floor(width / 90) - 1)) * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + .3
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createRadialGradient(width * .76, height * .28, 10, width * .76, height * .28, Math.max(width, height) * .45);
      gradient.addColorStop(0, 'rgba(142,95,84,.18)');
      gradient.addColorStop(1, 'rgba(142,95,84,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(42,26,22,.28)';
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    resize();
    draw();
    window.addEventListener('resize', () => { resize(); draw(); });
  }

  document.querySelectorAll('.treatment-row').forEach(row => {
    row.addEventListener('click', () => {
      const target = 'https://wa.me/5511984831332?text=' + encodeURIComponent(`Olá! Gostaria de saber mais sobre ${row.querySelector('h3')?.textContent || 'os procedimentos'}.`);
      window.open(target, '_blank', 'noopener,noreferrer');
    });
    row.setAttribute('role', 'link');
    row.setAttribute('tabindex', '0');
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') row.click();
    });
  });
})();