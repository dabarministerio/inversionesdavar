(() => {
  'use strict';
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const WHATSAPP_NUMBER = '13059304423';
  const DEFAULT_TEXT = 'Hola Inversiones Davar, quiero información sobre Vitalis Tower Project.';
  const whatsappUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text || DEFAULT_TEXT)}`;

  const header = qs('[data-header]');
  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  window.addEventListener('scroll', setHeader, { passive: true });
  setHeader();

  const menu = qs('[data-mobile-menu]');
  const backdrop = qs('[data-menu-backdrop]');
  const openBtn = qs('[data-menu-open]');
  const closeBtn = qs('[data-menu-close]');
  let lastFocused = null;
  const lockScroll = (locked) => document.body.classList.toggle('menu-open', locked);
  const openMenu = () => {
    if (!menu || !backdrop || !openBtn) return;
    lastFocused = document.activeElement;
    menu.removeAttribute('inert');
    menu.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    requestAnimationFrame(() => {
      menu.classList.add('is-open');
      backdrop.classList.add('is-open');
      setTimeout(() => closeBtn?.focus({ preventScroll: true }), 80);
    });
  };
  const closeMenu = () => {
    if (!menu || !backdrop || !openBtn) return;
    if (document.activeElement && menu.contains(document.activeElement)) {
      (lastFocused && typeof lastFocused.focus === 'function' ? lastFocused : openBtn).focus({ preventScroll: true });
    }
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    setTimeout(() => {
      menu.setAttribute('aria-hidden', 'true');
      menu.setAttribute('inert', '');
    }, 260);
  };
  openBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  backdrop?.addEventListener('click', closeMenu);
  qsa('.mobile-drawer a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth >= 1080) closeMenu(); }, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
    if (event.key === 'Tab' && menu?.classList.contains('is-open')) {
      const focusable = qsa('a[href], button:not([disabled])', menu).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const showAnimated = () => {
    const animated = qsa('[data-animate]:not(.is-visible)');
    if (!animated.length) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      animated.forEach((el) => io.observe(el));
    } else {
      animated.forEach((el) => el.classList.add('is-visible'));
    }
  };
  showAnimated();

  const navLinks = qsa('.nav-links a[href^="#"]');
  const activeNav = () => {
    const y = window.scrollY + 120;
    let activeId = '';
    navLinks.forEach((link) => {
      const section = qs(link.getAttribute('href'));
      if (section && section.offsetTop <= y) activeId = section.id;
    });
    navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`));
  };
  window.addEventListener('scroll', activeNav, { passive: true });
  activeNav();

  let captchaAnswer = 0;
  const makeCaptcha = () => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 7) + 3;
    captchaAnswer = a + b;
    const question = qs('[data-captcha-question]');
    if (question) question.textContent = `Verificación antispam: ¿cuánto es ${a} + ${b}?`;
  };
  makeCaptcha();

  const showFormMessage = (form, text, type = 'error') => {
    const msg = qs('[data-form-message]', form);
    if (!msg) return;
    msg.textContent = text;
    msg.className = `form-message is-${type}`;
  };

  qsa('[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const answer = Number(String(data.get('captcha') || '').trim());
      if (answer !== captchaAnswer) {
        showFormMessage(form, 'La verificación no coincide. Intenta nuevamente.', 'error');
        makeCaptcha();
        const cap = qs('[name="captcha"]', form);
        if (cap) { cap.value = ''; cap.focus(); }
        return;
      }
      const nombre = String(data.get('nombre') || '').trim();
      const apellido = String(data.get('apellido') || '').trim();
      const correo = String(data.get('correo') || '').trim();
      const telefono = String(data.get('telefono') || '').trim();
      const pais = String(data.get('pais') || '').trim();
      const ciudad = String(data.get('ciudad') || '').trim();
      const mensaje = String(data.get('mensaje') || '').trim();
      const lines = [
        'Hola Inversiones Davar, quiero información sobre Vitalis Tower Project.',
        '',
        `Nombre: ${nombre} ${apellido}`,
        `Correo: ${correo}`,
        `Teléfono: ${telefono}`,
        `País: ${pais}`,
        `Ciudad: ${ciudad}`,
        mensaje ? `Mensaje: ${mensaje}` : 'Mensaje: Quiero recibir precios, unidades disponibles, metrajes, forma de pago y próximos pasos.',
        '',
        'Landing: https://inversionesdavar.com/vitalis-tower-project/'
      ];
      showFormMessage(form, 'Perfecto. Se abrirá WhatsApp con tu solicitud preparada.', 'success');
      setTimeout(() => window.open(whatsappUrl(lines.join('\n')), '_blank', 'noopener'), 220);
      if (window.gtag) window.gtag('event', 'generate_lead', { event_category: 'Vitalis Tower', event_label: 'WhatsApp Lead Form' });
    });
  });

  // ===== LÓGICA DEL VIDEO MODIFICADA PARA YOUTUBE =====
  const videoShell = qs('[data-video-shell]');
  const playBtn = qs('[data-video-play]', videoShell || document);
  playBtn?.addEventListener('click', () => {
    if (!videoShell) return;
    const videoId = (videoShell.dataset.videoId || '').trim();
    const posterContainer = qs('[data-video-poster]', videoShell);
    const embedContainer = qs('[data-video-embed]', videoShell);
    
    if (!videoId) {
      const caption = qs('.video-caption p', videoShell);
      if (caption) caption.textContent = 'El ID del video de YouTube no ha sido configurado. Agrega data-video-id al contenedor.';
      playBtn.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.08)' }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 320, easing: 'cubic-bezier(0,0,.2,1)' });
      return;
    }

    // Crear el iframe de YouTube
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.title = 'Video presentación de Vitalis Tower';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;

    // Si existe el contenedor del embed, úsalo
    if (embedContainer) {
      embedContainer.innerHTML = '';
      embedContainer.appendChild(iframe);
      embedContainer.hidden = false;
      if (posterContainer) posterContainer.hidden = true;
    } else {
      // Fallback: reemplazar todo el contenido del shell
      videoShell.innerHTML = '';
      videoShell.appendChild(iframe);
    }

    if (window.gtag) window.gtag('event', 'video_start', { event_category: 'Vitalis Tower', event_label: 'YouTube Video' });
  });
  // ===== FIN DE LA LÓGICA DEL VIDEO =====

  const initShowcase = () => {
    const shell = qs('[data-showcase]');
    if (!shell) return;
    const slides = qsa('.showcase-slide', shell);
    const dotsWrap = qs('[data-showcase-dots]', shell);
    const prev = qs('[data-showcase-prev]', shell);
    const next = qs('[data-showcase-next]', shell);
    if (!slides.length || !dotsWrap) return;
    let current = 0;
    let timer = null;
    let touchStartX = 0;

    dotsWrap.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Ver imagen ${i + 1}" data-dot="${i}"></button>`).join('');
    const dots = qsa('button', dotsWrap);

    const goTo = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };
    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 6500);
    };
    dots.forEach((dot) => dot.addEventListener('click', () => { goTo(Number(dot.dataset.dot || 0)); restart(); }));
    prev?.addEventListener('click', () => { goTo(current - 1); restart(); });
    next?.addEventListener('click', () => { goTo(current + 1); restart(); });
    shell.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
    shell.addEventListener('touchend', (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) { goTo(current + (delta < 0 ? 1 : -1)); restart(); }
    }, { passive: true });
    goTo(0);
    restart();
  };
  initShowcase();

  qsa('[data-faq] .faq-item button').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('.faq-item')?.classList.toggle('is-open'));
  });

  const smartLead = qs('[data-smart-lead]');
  const smartClose = qs('[data-smart-close]');
  let smartDismissed = false;
  const maybeShowSmartLead = () => {
    if (!smartLead || smartDismissed || smartLead.classList.contains('is-visible')) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    if (progress > 0.18) smartLead.classList.add('is-visible');
  };
  setTimeout(() => smartLead?.classList.add('is-visible'), 8000);
  window.addEventListener('scroll', maybeShowSmartLead, { passive: true });
  smartClose?.addEventListener('click', () => { smartDismissed = true; smartLead?.classList.remove('is-visible'); });
})();