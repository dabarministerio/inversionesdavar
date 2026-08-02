(() => {
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const whatsappUrl = 'https://wa.me/13059304423?text=';
  const defaultMessage = 'Hola Inversiones Davar, quiero solicitar una asesoría inmobiliaria.';

  const scripts = qsa('script[src*="assets/js/app.js"]');
  const fallbackScript = scripts.length ? scripts[scripts.length - 1].getAttribute('src') : 'assets/js/app.js';
  const scriptSrc = (document.currentScript && document.currentScript.getAttribute('src')) || fallbackScript;
  const siteRoot = new URL('../../', new URL(scriptSrc, location.href));
  const rootUrl = (path = '') => new URL(String(path).replace(/^\/+/, ''), siteRoot).href;
  const escapeHtml = (value = '') => String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  const menu = qs('[data-mobile-menu]');
  const backdrop = qs('[data-menu-backdrop]');
  const openBtn = qs('[data-menu-open]');
  const closeBtn = qs('[data-menu-close]');
  let lastFocused = null;
  let menuTimer = null;

  const lockScroll = (locked) => {
    document.documentElement.classList.toggle('menu-open', locked);
    document.body.classList.toggle('menu-open', locked);
  };

  const openMenu = () => {
    if (!menu || !backdrop || !openBtn) return;
    clearTimeout(menuTimer);
    lastFocused = document.activeElement;
    menu.removeAttribute('inert');
    menu.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    requestAnimationFrame(() => {
      menu.classList.add('is-open');
      backdrop.classList.add('is-open');
      setTimeout(() => {
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      }, 80);
    });
  };

  const closeMenu = () => {
    if (!menu || !backdrop || !openBtn) return;
    clearTimeout(menuTimer);
    if (document.activeElement && menu.contains(document.activeElement)) {
      (lastFocused && typeof lastFocused.focus === 'function' ? lastFocused : openBtn).focus({ preventScroll: true });
    }
    menu.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    menuTimer = setTimeout(() => {
      menu.setAttribute('aria-hidden', 'true');
      menu.setAttribute('inert', '');
    }, 260);
  };

  if (openBtn) openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  qsa('.mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));
  qsa('[data-submenu-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const parent = button.closest('[data-mobile-subnav]');
      const open = !(parent && parent.classList.contains('is-open'));
      qsa('[data-mobile-subnav]').forEach(item => {
        item.classList.remove('is-open');
        const toggle = qs('[data-submenu-toggle]', item);
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
      if (parent) parent.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });
  window.addEventListener('resize', () => { if (window.innerWidth >= 1080) closeMenu(); }, { passive: true });

  const modal = qs('[data-modal]');
  const setModal = (open) => {
    if (!modal) return;
    modal.classList.toggle('is-open', open);
    modal.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  document.addEventListener('click', (event) => {
    const modalOpen = event.target.closest('[data-modal-open]');
    if (modalOpen) {
      event.preventDefault();
      const subject = modalOpen.getAttribute('data-property-title') || 'la propiedad seleccionada';
      const modalLink = modal ? qs('.modal-card .btn', modal) : null;
      if (modalLink) {
        modalLink.href = whatsappUrl + encodeURIComponent(`Hola Inversiones Davar, quiero solicitar información sobre ${subject}.`);
      }
      setModal(true);
    }
    if (event.target.closest('[data-modal-close]')) setModal(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { setModal(false); closeMenu(); }
    if (event.key === 'Tab' && menu && menu.classList.contains('is-open')) {
      const focusable = qsa('a[href], button:not([disabled])', menu).filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const whatsappBtn = qs('[data-whatsapp]');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      window.open(whatsappUrl + encodeURIComponent(defaultMessage), '_blank', 'noopener');
    });
  }

  qsa('[data-google-translate]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const canonical = qs('link[rel="canonical"]')?.getAttribute('href') || location.href;
      const target = 'https://translate.google.com/translate?sl=es&tl=en&u=' + encodeURIComponent(canonical);
      window.open(target, '_blank', 'noopener');
    });
  });

  qsa('[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const lines = [
        'Hola Inversiones Davar, quiero solicitar una asesoría.',
        `Nombre: ${data.get('nombre') || ''}`,
        `Correo: ${data.get('correo') || ''}`,
        `WhatsApp: ${data.get('whatsapp') || ''}`,
        `País: ${data.get('pais') || ''}`,
        `Capital aproximado: ${data.get('capital') || ''}`,
        `Objetivo: ${data.get('objetivo') || ''}`,
        `Mensaje: ${data.get('mensaje') || ''}`
      ].filter(line => !line.endsWith(': '));
      window.open(whatsappUrl + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  });

  const showAnimated = () => {
    const animated = qsa('[data-animate]');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      animated.forEach(el => io.observe(el));
    } else {
      animated.forEach(el => el.classList.add('is-visible'));
    }
  };

  const fetchJson = async (path, fallback = []) => {
    try {
      const response = await fetch(rootUrl(path), { cache: 'no-cache' });
      if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
      return await response.json();
    } catch (error) {
      console.warn(error.message);
      return fallback;
    }
  };

  const arrowSvg = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
  const leftSvg = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>';
  const rightSvg = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';

  const PAGE_SIZE = 10;

  const buildPageItems = (total, current) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, total, current, current - 1, current + 1]);
    const nums = Array.from(set).filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
    const items = [];
    nums.forEach((n, i) => {
      if (i && n - nums[i - 1] > 1) items.push('…');
      items.push(n);
    });
    return items;
  };

  const renderPagination = (list, totalPages, currentPage, onChange) => {
    let pager = list.nextElementSibling && list.nextElementSibling.classList && list.nextElementSibling.classList.contains('pagination') ? list.nextElementSibling : null;
    if (totalPages <= 1) {
      if (pager) pager.remove();
      return;
    }
    if (!pager) {
      pager = document.createElement('nav');
      pager.className = 'pagination';
      pager.setAttribute('aria-label', 'Paginación');
      list.insertAdjacentElement('afterend', pager);
    }
    const pages = buildPageItems(totalPages, currentPage).map(item => {
      if (item === '…') return '<span class="pagination-dots" aria-hidden="true">…</span>';
      return `<button type="button" class="${item === currentPage ? 'is-active' : ''}" aria-current="${item === currentPage ? 'page' : 'false'}" data-page="${item}">${item}</button>`;
    }).join('');
    pager.innerHTML = `<button type="button" data-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>${pages}<button type="button" data-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>`;
    qsa('button[data-page]', pager).forEach(button => {
      button.addEventListener('click', () => {
        const next = Number(button.dataset.page || currentPage);
        if (!Number.isFinite(next) || next === currentPage) return;
        onChange(next);
      });
    });
  };

  const renderBlogLists = async () => {
    const lists = qsa('[data-blog-list]');
    if (!lists.length) return;
    const posts = (await fetchJson('data/blog.json', [])).filter(post => post.status !== 'draft');
    posts.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

    lists.forEach((list) => {
      const hasLimit = Object.prototype.hasOwnProperty.call(list.dataset, 'limit') && list.dataset.limit !== '';
      const limit = Number(list.dataset.limit || posts.length);
      const perPage = Number(list.dataset.perPage || PAGE_SIZE);

      const renderList = () => {
        const source = hasLimit ? posts.slice(0, limit) : posts;
        const totalPages = !hasLimit && source.length > perPage ? Math.ceil(source.length / perPage) : 1;
        const current = Math.min(Math.max(Number(list.dataset.page || 1), 1), totalPages);
        list.dataset.page = String(current);
        const entries = totalPages > 1 ? source.slice((current - 1) * perPage, current * perPage) : source;

        if (!entries.length) {
          list.innerHTML = `<p class="cms-empty">${escapeHtml(list.dataset.empty || 'No hay artículos publicados todavía.')}</p>`;
          renderPagination(list, 1, 1, () => {});
          return;
        }

        list.innerHTML = entries.map((post, index) => {
          const absoluteIndex = totalPages > 1 ? (current - 1) * perPage + index : index;
          const href = rootUrl(post.url || `blog/${post.slug}/`);
          const img = rootUrl(post.image || 'assets/img/hero-miami.svg');
          return `<article class="article-card" data-animate>
            <a class="article-card-media" href="${href}" aria-label="Leer ${escapeHtml(post.title)}"><img src="${img}" alt="${escapeHtml(post.imageAlt || post.title)}" width="1400" height="840" loading="lazy" decoding="async"></a>
            <div class="article-card-body"><span>${String(absoluteIndex + 1).padStart(2, '0')} · ${escapeHtml(post.category || 'Blog')}</span><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt || post.description || '')}</p><a href="${href}">Leer artículo${arrowSvg}</a></div>
          </article>`;
        }).join('');

        renderPagination(list, totalPages, current, (next) => {
          list.dataset.page = String(next);
          renderList();
          list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        showAnimated();
      };

      renderList();
    });
  };

  const carouselHtml = (images, title) => {
    const items = Array.isArray(images) && images.length ? images : [{ src: 'assets/img/property-florida.svg', alt: title }];
    const slides = items.map((img, i) => `<img class="property-slide ${i === 0 ? 'is-active' : ''}" src="${rootUrl(img.src)}" alt="${escapeHtml(img.alt || title)}" width="1200" height="800" loading="lazy" decoding="async" data-slide-index="${i}">`).join('');
    const dots = items.map((_, i) => `<button class="carousel-dot ${i === 0 ? 'is-active' : ''}" type="button" aria-label="Ver imagen ${i + 1}" data-carousel-dot="${i}"></button>`).join('');
    const controls = items.length > 1 ? `<button class="carousel-btn carousel-prev" type="button" aria-label="Imagen anterior" data-carousel-prev>${leftSvg}</button><button class="carousel-btn carousel-next" type="button" aria-label="Imagen siguiente" data-carousel-next>${rightSvg}</button><div class="carousel-dots">${dots}</div>` : '';
    return `<div class="property-carousel" data-carousel><div class="property-track">${slides}</div>${controls}</div>`;
  };

  const initCarousels = (ctx = document) => {
    qsa('[data-carousel]', ctx).forEach((carousel) => {
      if (carousel.dataset.carouselReady === 'true') return;
      carousel.dataset.carouselReady = 'true';

      const slides = qsa('.property-slide', carousel);
      const dots = qsa('[data-carousel-dot]', carousel);
      const prev = qs('[data-carousel-prev]', carousel);
      const next = qs('[data-carousel-next]', carousel);
      const track = qs('.property-track', carousel) || carousel;
      if (!slides.length) return;

      let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
      if (current < 0) current = 0;

      const setSlide = (index) => {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          const active = i === current;
          slide.classList.toggle('is-active', active);
          slide.setAttribute('aria-hidden', String(!active));
        });
        dots.forEach((dot, i) => {
          const active = i === current;
          dot.classList.toggle('is-active', active);
          dot.setAttribute('aria-current', active ? 'true' : 'false');
        });
      };

      const goPrev = () => setSlide(current - 1);
      const goNext = () => setSlide(current + 1);

      if (prev) {
        prev.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          goPrev();
        });
      }

      if (next) {
        next.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          goNext();
        });
      }

      dots.forEach((dot) => {
        dot.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          setSlide(Number(dot.dataset.carouselDot || 0));
        });
      });

      let startX = 0;
      let startY = 0;
      let activeTouch = false;

      const onStart = (clientX, clientY) => {
        startX = clientX;
        startY = clientY;
        activeTouch = true;
      };

      const onEnd = (clientX, clientY) => {
        if (!activeTouch || slides.length < 2) return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        activeTouch = false;
        if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
        if (dx < 0) goNext();
        else goPrev();
      };

      track.addEventListener('touchstart', (event) => {
        const touch = event.changedTouches && event.changedTouches[0];
        if (touch) onStart(touch.clientX, touch.clientY);
      }, { passive: true });

      track.addEventListener('touchend', (event) => {
        const touch = event.changedTouches && event.changedTouches[0];
        if (touch) onEnd(touch.clientX, touch.clientY);
      }, { passive: true });

      track.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse') return;
        onStart(event.clientX, event.clientY);
      }, { passive: true });

      track.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse') return;
        onEnd(event.clientX, event.clientY);
      }, { passive: true });

      carousel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') goPrev();
        if (event.key === 'ArrowRight') goNext();
      });

      setSlide(current);
    });
  };

  const renderPropertyLists = async () => {
    const lists = qsa('[data-property-list]');
    if (!lists.length) return;
    const data = (await fetchJson('data/properties.json', [])).filter(item => item.status !== 'draft');

    lists.forEach((list) => {
      const section = list.closest('.section') || document;
      const filterRoot = qs('[data-filters]', section);
      const search = filterRoot ? qs('[data-filter-search]', filterRoot) : null;
      const type = filterRoot ? qs('[data-filter-type]', filterRoot) : null;
      const hasLimit = Object.prototype.hasOwnProperty.call(list.dataset, 'limit') && list.dataset.limit !== '';
      const limit = Number(list.dataset.limit || data.length);
      const perPage = Number(list.dataset.perPage || PAGE_SIZE);

      const renderList = (resetPage = false) => {
        if (resetPage) list.dataset.page = '1';
        const term = ((search && search.value) || '').trim().toLowerCase();
        const selected = (type && type.value) || 'all';
        let entries = data.filter(item => {
          if (list.dataset.featuredOnly && !item.featured) return false;
          const itemType = item.type || 'residencial';
          const searchable = [item.title, item.type, item.typeLabel, item.city, item.summary, item.price].filter(Boolean).join(' ').toLowerCase();
          const matchesType = selected === 'all' || itemType === selected;
          const matchesText = !term || searchable.includes(term);
          return matchesType && matchesText;
        });
        if (hasLimit) entries = entries.slice(0, limit);

        const totalPages = !hasLimit && entries.length > perPage ? Math.ceil(entries.length / perPage) : 1;
        const current = Math.min(Math.max(Number(list.dataset.page || 1), 1), totalPages);
        list.dataset.page = String(current);
        const visible = totalPages > 1 ? entries.slice((current - 1) * perPage, current * perPage) : entries;

        if (!visible.length) {
          list.innerHTML = '<p class="cms-empty">No hay propiedades publicadas todavía.</p>';
          renderPagination(list, 1, 1, () => {});
          return;
        }

        list.innerHTML = visible.map(item => {
          const searchable = [item.title, item.type, item.typeLabel, item.city, item.summary, item.price].filter(Boolean).join(' ').toLowerCase();
          return `<article class="property-card" data-property data-type="${escapeHtml(item.type || 'residencial')}" data-text="${escapeHtml(searchable)}">
            ${carouselHtml(item.images, item.title)}
            <div class="property-body"><span class="property-type">${escapeHtml(item.typeLabel || item.type || 'Propiedad')}</span><h3>${escapeHtml(item.title)}</h3><strong>${escapeHtml(item.price || 'Consultar precio')}</strong><p class="property-summary">${escapeHtml(item.summary || '')}</p><div class="property-meta"><span>${escapeHtml(item.city || 'Florida')}</span><span>${escapeHtml(item.bedrooms || '')}</span><span>${escapeHtml(item.bathrooms || '')}</span><span>${escapeHtml(item.area || '')}</span></div><button class="btn btn-gold btn-full" type="button" data-modal-open data-property-title="${escapeHtml(item.title)}">Solicitar información</button></div>
          </article>`;
        }).join('');

        initCarousels(list);
        renderPagination(list, totalPages, current, (next) => {
          list.dataset.page = String(next);
          renderList(false);
          list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        showAnimated();
      };

      if (filterRoot && !filterRoot.dataset.paginationReady) {
        filterRoot.dataset.paginationReady = 'true';
        if (search) search.addEventListener('input', () => renderList(true));
        if (type) type.addEventListener('change', () => renderList(true));
      }
      renderList(false);
    });
  };

  const initViewTransitions = () => {
    if (!('startViewTransition' in document)) return;
    qsa('a[href]').forEach(link => {
      const raw = link.getAttribute('href') || '';
      if (raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('https://wa.me')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || link.target || link.hasAttribute('download')) return;
      link.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        document.startViewTransition(() => { location.href = link.href; });
      });
    });
  };

  renderBlogLists();
  renderPropertyLists();
  initCarousels(document);
  showAnimated();
  initViewTransitions();
})();
