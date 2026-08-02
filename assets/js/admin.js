(() => {
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const state = { root: null, blog: [], properties: [] };
  const statusEl = qs('[data-admin-status]');
  const rootStatus = qs('[data-root-status]');
  const preview = qs('[data-preview]');
  const current = qs('[data-current-content]');

  const setStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };
  const escapeHtml = (value = '') => String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const slugify = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90);
  const today = () => new Date().toISOString().slice(0, 10);

  qsa('[name="date"]').forEach(input => { if (!input.value) input.value = today(); });

  const wireSlug = (form) => {
    const title = qs('[name="title"]', form);
    const slug = qs('[name="slug"]', form);
    let manual = false;
    slug?.addEventListener('input', () => { manual = true; slug.value = slugify(slug.value); });
    title?.addEventListener('input', () => { if (!manual && slug) slug.value = slugify(title.value); });
  };
  qsa('form').forEach(wireSlug);

  qsa('[data-tab]').forEach(button => button.addEventListener('click', () => {
    qsa('[data-tab]').forEach(btn => btn.classList.toggle('is-active', btn === button));
    qsa('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== button.dataset.tab; });
  }));

  const getDir = async (parts = [], create = true) => {
    if (!state.root) throw new Error('Primero selecciona la carpeta raíz del proyecto.');
    let dir = state.root;
    for (const part of parts.filter(Boolean)) {
      dir = await dir.getDirectoryHandle(part, { create });
    }
    return dir;
  };

  const getFileHandle = async (path, create = true) => {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    const dir = await getDir(parts, create);
    return dir.getFileHandle(name, { create });
  };

  const readText = async (path) => {
    const handle = await getFileHandle(path, false);
    const file = await handle.getFile();
    return await file.text();
  };

  const writeText = async (path, content) => {
    const handle = await getFileHandle(path, true);
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  };

  const writeBlob = async (path, blob) => {
    const handle = await getFileHandle(path, true);
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  };

  const readJson = async (path, fallback) => {
    try { return JSON.parse(await readText(path)); }
    catch { return fallback; }
  };

  const imageToWebp = async (file, maxWidth = 1600, quality = 0.82) => {
    if (!file) return null;
    if (file.type === 'image/svg+xml') return { blob: file, ext: 'svg' };
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, maxWidth / bitmap.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      return { blob: blob || file, ext: blob ? 'webp' : (file.name.split('.').pop() || 'jpg').toLowerCase() };
    } catch {
      return { blob: file, ext: (file.name.split('.').pop() || 'jpg').toLowerCase() };
    }
  };

  const contentToHtml = (content = '') => {
    const trimmed = content.trim();
    if (/<(p|h2|h3|ul|ol|blockquote|section|article)\b/i.test(trimmed)) return trimmed;
    return trimmed.split(/\n{2,}/).map(block => {
      const clean = block.trim();
      if (!clean) return '';
      if (clean.startsWith('### ')) return `<h3>${escapeHtml(clean.slice(4))}</h3>`;
      if (clean.startsWith('## ')) return `<h2>${escapeHtml(clean.slice(3))}</h2>`;
      return `<p>${escapeHtml(clean).replace(/\n/g, '<br>')}</p>`;
    }).join('');
  };

  const normalizeDomain = (domain = 'https://inversionesdavar.com/') => domain.endsWith('/') ? domain : `${domain}/`;

  const commonHeader = (title, desc, image, canonical, active = 'blog') => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="es" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="es_US">
  <meta property="og:site_name" content="Inversiones Davar">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${normalizeDomain(canonical).split('/blog/')[0]}/${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${normalizeDomain(canonical).split('/blog/')[0]}/${image}">
  <link rel="icon" href="../../assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../site.webmanifest">
  <meta name="theme-color" content="#10192A">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="../../assets/css/tailwind.css">
</head>
<body>
<header class="site-header" data-header>
  <a class="skip-link" href="#main">Saltar al contenido</a>
  <div class="nav-shell container-wide"><a class="brand" href="../../index.html" aria-label="Inversiones Davar"><img src="../../assets/img/logo-davar.webp" alt="Logo de Inversiones Davar S.A. de C.V." width="96" height="96" decoding="async"><span><strong>Inversiones Davar</strong><small>S.A. de C.V.</small></span></a><nav class="desktop-nav" aria-label="Menú principal"><a href="../../index.html">Inicio</a><a href="../../nosotros/index.html">Nosotros</a><a href="../../inversiones-florida/index.html">Inversiones</a><a href="../../proyectos-propiedades/index.html">Proyectos</a><a href="../../guia-inversionistas-extranjeros/index.html">Recursos</a><a href="../../blog/index.html">Blog</a><a href="../../contacto/index.html">Contacto</a></nav><a class="translate-btn desktop-translate" href="https://translate.google.com/translate?sl=es&tl=en&u=${encodeURIComponent(canonical)}" target="_blank" rel="noopener nofollow" aria-label="Traducir esta página con Google Translate" data-google-translate><i class="fa-solid fa-language" aria-hidden="true"></i><span>Traducir</span></a><a class="btn btn-small btn-gold nav-cta" href="../../contacto/index.html">Agenda una Asesoría</a><button class="menu-toggle" type="button" aria-label="Abrir menú" aria-controls="mobile-menu" aria-expanded="false" data-menu-open><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></button></div>
  <div class="mobile-backdrop" data-menu-backdrop></div><aside class="mobile-menu" id="mobile-menu" aria-hidden="true" inert aria-label="Menú principal" data-mobile-menu><div class="mobile-menu-head"><span>Menú principal</span><button class="menu-close" type="button" aria-label="Cerrar menú" data-menu-close><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg></button></div><a class="translate-btn mobile-translate" href="https://translate.google.com/translate?sl=es&tl=en&u=${encodeURIComponent(canonical)}" target="_blank" rel="noopener nofollow" aria-label="Traducir esta página con Google Translate" data-google-translate><i class="fa-solid fa-language" aria-hidden="true"></i><span>Traducir con Google</span></a><nav><a href="../../index.html">Inicio</a><a href="../../nosotros/index.html">Nosotros</a><a href="../../inversiones-florida/index.html">Inversiones</a><a href="../../proyectos-propiedades/index.html">Proyectos</a><a href="../../guia-inversionistas-extranjeros/index.html">Recursos</a><a href="../../blog/index.html">Blog</a><a href="../../contacto/index.html">Contacto</a></nav><a class="btn btn-gold btn-full" href="../../contacto/index.html">Agenda una Asesoría</a></aside>
</header>`;

  const commonFooter = () => `<footer class="footer"><div class="container-wide footer-grid"><div class="footer-brand"><img src="../../assets/img/logo-davar.webp" alt="Inversiones Davar" width="80" height="80" loading="lazy" decoding="async"><p>Firma inmobiliaria enfocada en conectar inversionistas latinoamericanos con oportunidades estratégicas en Florida.</p></div><div><h3>Navegación</h3><div class="footer-links"><a href="../../index.html">Inicio</a><a href="../../nosotros/index.html">Nosotros</a><a href="../../inversiones-florida/index.html">Inversiones</a><a href="../../proyectos-propiedades/index.html">Proyectos</a><a href="../../guia-inversionistas-extranjeros/index.html">Recursos</a><a href="../../blog/index.html">Blog</a><a href="../../contacto/index.html">Contacto</a></div></div><div><h3>Contacto</h3><div class="footer-links footer-contact"><a href="tel:+13059304423">+1 (305) 930-4423</a><a href="https://wa.me/13059304423" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:realestate.davar@gmail.com">realestate.davar@gmail.com</a></div></div><div><h3>Legal</h3><div class="footer-links"><a href="../../politica-privacidad/index.html">Política de privacidad</a><a href="../../terminos-condiciones/index.html">Términos</a></div></div></div><div class="footer-bottom container-wide"><p>Inversiones Davar 2026 - Derechos Reservados - Desarrollado por <a href="https://edevisraga.com" target="_blank" rel="noopener">Edevis Raga</a></p></div></footer><button class="floating-whatsapp" type="button" data-whatsapp aria-label="Contactar por WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 6.1 16.1A8 8 0 1 1 9 18.9L5 19Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8.8c.4 2.6 2.4 4.6 5 5l1.4-1.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button><script defer src="../../assets/js/app.js"></script></body></html>`;

  const articleTemplate = (post, domain) => {
    const canonical = `${normalizeDomain(domain)}blog/${post.slug}/`;
    const articleJson = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.description, image: `${normalizeDomain(domain)}${post.image}`, author: { '@type': 'Organization', name: post.author || 'Inversiones Davar' }, publisher: { '@type': 'Organization', name: 'Inversiones Davar' }, datePublished: post.date, dateModified: today(), mainEntityOfPage: canonical, inLanguage: 'es' };
    return `${commonHeader(post.seoTitle || `${post.title} | Inversiones Davar`, post.description, post.image, canonical)}<script type="application/ld+json">${JSON.stringify(articleJson)}</script><main id="main"><article class="article"><header class="page-hero article-hero"><div class="container narrow" data-animate><span class="eyebrow">${escapeHtml(post.category)}</span><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.description)}</p></div></header><section class="section"><div class="container narrow"><figure class="article-cover"><img src="../../${post.image}" alt="${escapeHtml(post.imageAlt)}" width="1400" height="840" loading="eager" decoding="async"><figcaption>${escapeHtml(post.category)} · ${escapeHtml(post.author)}</figcaption></figure><div class="article-content">${post.contentHtml}</div><div class="article-cta"><a class="btn btn-gold" href="../../contacto/index.html">Solicitar asesoría<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div></div></section></article></main>${commonFooter()}`;
  };

  const refreshSummary = () => {
    current.innerHTML = `<strong>Artículos:</strong> ${state.blog.length}<br><strong>Propiedades:</strong> ${state.properties.length}<br><small>Los listados públicos se actualizan desde data/blog.json y data/properties.json.</small>`;
  };

  const loadCurrentData = async () => {
    state.blog = await readJson('data/blog.json', []);
    state.properties = await readJson('data/properties.json', []);
    refreshSummary();
  };

  qs('[data-open-project]')?.addEventListener('click', async () => {
    if (!window.showDirectoryPicker) {
      setStatus('Tu navegador no permite escritura local desde HTML. Usa Chrome, Edge o Brave en localhost.');
      return;
    }
    try {
      state.root = await window.showDirectoryPicker({ mode: 'readwrite' });
      rootStatus.textContent = `Carpeta seleccionada: ${state.root.name}`;
      await loadCurrentData();
      setStatus('Carpeta conectada. Ya puedes guardar artículos o propiedades.');
    } catch (error) {
      setStatus('No se seleccionó carpeta o no se otorgó permiso de escritura.');
    }
  });

  const upsert = (items, record, key = 'slug') => {
    const index = items.findIndex(item => item[key] === record[key]);
    if (index >= 0) items[index] = { ...items[index], ...record };
    else items.unshift(record);
    return items;
  };

  const buildSitemap = async (domain) => {
    const base = normalizeDomain(domain);
    const staticPages = ['', 'nosotros/', 'inversiones-florida/', 'proyectos-propiedades/', 'guia-inversionistas-extranjeros/', 'blog/', 'preguntas-frecuentes/', 'contacto/', 'politica-privacidad/', 'terminos-condiciones/', 'en/', 'en/about/', 'en/florida-investments/', 'en/projects-properties/', 'en/foreign-investor-guide/', 'en/blog/', 'en/faq/', 'en/contact/'];
    const urls = [...staticPages, ...state.blog.filter(p => p.status !== 'draft').map(p => p.url || `blog/${p.slug}/`)];
    const todayDate = today();
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${base}${url}</loc><lastmod>${todayDate}</lastmod><changefreq>${url.includes('blog/') ? 'monthly' : 'weekly'}</changefreq><priority>${url === '' ? '1.0' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`;
  };

  qs('[data-preview-blog]')?.addEventListener('click', () => {
    const form = qs('[data-blog-form]');
    const data = Object.fromEntries(new FormData(form));
    preview.innerHTML = `<article class="article-card"><div class="article-card-body"><span>${escapeHtml(data.category || 'Blog')}</span><h3>${escapeHtml(data.title || 'Título del artículo')}</h3><p>${escapeHtml(data.excerpt || data.description || 'Resumen del artículo')}</p></div></article>`;
  });

  qs('[data-blog-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!state.root) throw new Error('Selecciona la carpeta raíz antes de guardar.');
      const form = event.currentTarget;
      const data = Object.fromEntries(new FormData(form));
      const slug = slugify(data.slug || data.title);
      const imageFile = qs('[name="image"]', form).files[0];
      let imagePath = `assets/img/blog/${slug}.svg`;
      if (imageFile) {
        const converted = await imageToWebp(imageFile, 1600, 0.82);
        imagePath = `assets/img/blog/${slug}.${converted.ext}`;
        await writeBlob(imagePath, converted.blob);
      } else {
        const existing = state.blog.find(item => item.slug === slug);
        imagePath = existing?.image || 'assets/img/blog/invertir-miami.svg';
      }
      const post = { slug, url: `blog/${slug}/`, title: data.title.trim(), seoTitle: data.seoTitle.trim() || `${data.title.trim()} | Inversiones Davar`, description: data.description.trim(), excerpt: data.excerpt.trim() || data.description.trim(), category: data.category.trim() || 'Blog', date: data.date || today(), author: data.author.trim() || 'Inversiones Davar', image: imagePath, imageAlt: data.imageAlt.trim() || data.title.trim(), status: data.status || 'published', contentHtml: contentToHtml(data.content) };
      state.blog = upsert(state.blog, post);
      await writeText('data/blog.json', JSON.stringify(state.blog, null, 2));
      await writeText(`blog/${slug}/index.html`, articleTemplate(post, data.domain || 'https://inversionesdavar.com/'));
      await writeText('sitemap.xml', await buildSitemap(data.domain || 'https://inversionesdavar.com/'));
      refreshSummary();
      setStatus(`Artículo guardado: blog/${slug}/index.html. Blog e Inicio se actualizan desde data/blog.json.`);
    } catch (error) {
      setStatus(error.message || 'Error guardando el artículo.');
    }
  });

  qs('[data-preview-property]')?.addEventListener('click', () => {
    const form = qs('[data-property-form]');
    const data = Object.fromEntries(new FormData(form));
    preview.innerHTML = `<article class="property-card"><div class="property-body"><span class="property-type">${escapeHtml(data.typeLabel || data.type || 'Propiedad')}</span><h3>${escapeHtml(data.title || 'Título de propiedad')}</h3><strong>${escapeHtml(data.price || 'Consultar precio')}</strong><p class="property-summary">${escapeHtml(data.summary || '')}</p><div class="property-meta"><span>${escapeHtml(data.city || 'Florida')}</span><span>${escapeHtml(data.bedrooms || '')}</span><span>${escapeHtml(data.bathrooms || '')}</span><span>${escapeHtml(data.area || '')}</span></div></div></article>`;
  });

  qs('[data-property-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (!state.root) throw new Error('Selecciona la carpeta raíz antes de guardar.');
      const form = event.currentTarget;
      const data = Object.fromEntries(new FormData(form));
      const slug = slugify(data.slug || data.title);
      const files = [...qs('[name="images"]', form).files];
      let images = [];
      if (files.length) {
        for (let i = 0; i < files.length; i += 1) {
          const converted = await imageToWebp(files[i], 1400, 0.82);
          const imagePath = `assets/img/properties/${slug}-${i + 1}.${converted.ext}`;
          await writeBlob(imagePath, converted.blob);
          images.push({ src: imagePath, alt: `${data.title} imagen ${i + 1}` });
        }
      } else {
        const existing = state.properties.find(item => item.slug === slug);
        images = existing?.images || [{ src: 'assets/img/properties/casa-homestead-1.svg', alt: data.title }];
      }
      const property = { slug, title: data.title.trim(), type: data.type || 'residencial', typeLabel: data.typeLabel.trim() || data.type, price: data.price.trim() || 'Consultar precio', city: data.city.trim() || 'Florida', bedrooms: data.bedrooms.trim(), bathrooms: data.bathrooms.trim(), area: data.area.trim(), summary: data.summary.trim(), status: data.status || 'published', featured: data.featured === 'true', images };
      state.properties = upsert(state.properties, property);
      await writeText('data/properties.json', JSON.stringify(state.properties, null, 2));
      refreshSummary();
      setStatus('Propiedad guardada. La sección Proyectos y las propiedades destacadas se actualizan desde data/properties.json.');
    } catch (error) {
      setStatus(error.message || 'Error guardando la propiedad.');
    }
  });
})();
