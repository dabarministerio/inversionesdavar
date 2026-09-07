(() => {
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const state = { blog: [], properties: [] };
  const statusEl = qs('[data-admin-status]');
  const previewEl = qs('[data-preview]');
  const currentEl = qs('[data-current-content]');

  const setStatus = (message, ok = true) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', !ok);
  };

  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const slugify = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90);
  const today = () => new Date().toISOString().slice(0, 10);
  const asset = (path = '') => path.startsWith('http') ? path : `../${path.replace(/^\/+/,'')}`;

  qsa('[name="date"]').forEach(input => { if (!input.value) input.value = today(); });

  const request = async (action, formData = null) => {
    const options = formData ? { method: 'POST', body: formData } : {};
    const response = await fetch(`api.php?action=${encodeURIComponent(action)}`, options);
    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (error) {
      const snippet = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
      throw new Error(snippet ? `El servidor no devolvió JSON válido: ${snippet}` : 'El servidor no devolvió respuesta.');
    }
    if (!response.ok || !data.ok) throw new Error(data.message || 'Error procesando la solicitud.');
    return data;
  };

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
    renderCurrent();
  }));

  const setFormValues = (form, values = {}) => {
    Object.entries(values).forEach(([key, value]) => {
      const field = qs(`[name="${key}"]`, form);
      if (!field || field.type === 'file') return;
      field.value = value ?? '';
    });
  };

  const resetBlog = () => {
    const form = qs('[data-blog-form]');
    form?.reset();
    if (form) {
      qs('[name="author"]', form).value = 'Inversiones Davar';
      qs('[name="date"]', form).value = today();
      qs('[name="domain"]', form).value = 'https://inversionesdavar.com/';
      qs('[name="originalSlug"]', form).value = '';
    }
    const currentImage = qs('[data-current-blog-image]');
    if (currentImage) currentImage.innerHTML = '';
    setStatus('Formulario listo para crear un artículo nuevo.');
  };

  const resetProperty = () => {
    const form = qs('[data-property-form]');
    form?.reset();
    if (form) qs('[name="originalSlug"]', form).value = '';
    const currentImages = qs('[data-current-property-images]');
    if (currentImages) currentImages.innerHTML = '';
    setStatus('Formulario listo para crear una propiedad nueva.');
  };

  qs('[data-reset-blog]')?.addEventListener('click', resetBlog);
  qs('[data-reset-property]')?.addEventListener('click', resetProperty);

  const renderBlogList = () => {
    const posts = [...state.blog].sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')));
    if (!posts.length) return '<p>No hay artículos todavía.</p>';
    return `<div class="content-list">${posts.map(post => `<article class="content-row">
      <img src="${asset(post.image || 'assets/img/blog/invertir-miami.svg')}" alt="${escapeHtml(post.imageAlt || post.title)}" loading="lazy">
      <div><strong>${escapeHtml(post.title)}</strong><small>${escapeHtml(post.slug)} · ${escapeHtml(post.status || 'published')} · ${escapeHtml(post.date || '')}</small></div>
      <div class="row-actions"><button type="button" data-edit-blog="${escapeHtml(post.slug)}">Editar</button><a href="../${escapeHtml(post.url || `blog/${post.slug}/`)}" target="_blank" rel="noopener">Ver</a><button type="button" data-delete-blog="${escapeHtml(post.slug)}">Eliminar</button></div>
    </article>`).join('')}</div>`;
  };

  const renderPropertyList = () => {
    if (!state.properties.length) return '<p>No hay propiedades todavía.</p>';
    return `<div class="content-list">${state.properties.map(item => {
      const img = item.images?.[0]?.src || 'assets/img/properties/casa-homestead-1.svg';
      return `<article class="content-row">
        <img src="${asset(img)}" alt="${escapeHtml(item.images?.[0]?.alt || item.title)}" loading="lazy">
        <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.slug)} · ${escapeHtml(item.status || 'published')} · ${item.featured ? 'Destacada' : 'No destacada'}</small></div>
        <div class="row-actions"><button type="button" data-edit-property="${escapeHtml(item.slug)}">Editar</button><a href="../${escapeHtml(item.url || `propiedades/${item.slug}/`)}" target="_blank" rel="noopener">Ver</a><button type="button" data-delete-property="${escapeHtml(item.slug)}">Eliminar</button></div>
      </article>`;
    }).join('')}</div>`;
  };

  const renderCurrent = () => {
    const activeTab = qs('[data-tab].is-active')?.dataset.tab || 'blog';
    if (!currentEl) return;
    currentEl.innerHTML = activeTab === 'blog' ? renderBlogList() : renderPropertyList();
  };

  const hydrate = (data) => {
    if (Array.isArray(data.blog)) state.blog = data.blog;
    if (Array.isArray(data.properties)) state.properties = data.properties;
    renderCurrent();
  };

  const loadAll = async () => {
    try {
      const status = await request('status');
      setStatus(`${status.message} Ruta local: ${status.root}. ${status.gdWebp ? 'Optimización WEBP disponible.' : 'WEBP no disponible; se guardará formato original.'}`);
      const data = await request('list');
      hydrate(data);
    } catch (error) {
      setStatus(error.message || 'No se pudo cargar el panel PHP.', false);
      if (currentEl) currentEl.innerHTML = '<p>Revisa que estés abriendo el panel desde XAMPP con una URL tipo http://localhost/davar/admin/.</p>';
    }
  };

  qs('[data-preview-blog]')?.addEventListener('click', () => {
    const form = qs('[data-blog-form]');
    const data = new FormData(form);
    const imageFile = qs('[name="image"]', form)?.files?.[0];
    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : '../assets/img/blog/invertir-miami.svg';
    previewEl.innerHTML = `<article class="article-card"><a class="article-card-media"><img src="${imageUrl}" alt="${escapeHtml(data.get('imageAlt') || data.get('title') || '')}"></a><div class="article-card-body"><span>${escapeHtml(data.get('category') || 'Blog')}</span><h3>${escapeHtml(data.get('title') || 'Título del artículo')}</h3><p>${escapeHtml(data.get('excerpt') || data.get('description') || 'Resumen del artículo')}</p></div></article>`;
  });

  qs('[data-preview-property]')?.addEventListener('click', () => {
    const form = qs('[data-property-form]');
    const data = new FormData(form);
    const file = qs('[name="images[]"]', form)?.files?.[0];
    const imageUrl = file ? URL.createObjectURL(file) : '../assets/img/properties/casa-homestead-1.svg';
    previewEl.innerHTML = `<article class="property-card"><div class="property-carousel"><div class="property-track"><img class="property-slide is-active" src="${imageUrl}" alt="${escapeHtml(data.get('title') || '')}"></div></div><div class="property-body"><span class="property-type">${escapeHtml(data.get('typeLabel') || data.get('type') || 'Propiedad')}</span><h3>${escapeHtml(data.get('title') || 'Título de propiedad')}</h3><strong>${escapeHtml(data.get('price') || 'Consultar precio')}</strong><p class="property-summary">${escapeHtml(data.get('summary') || '')}</p><div class="property-meta"><span>${escapeHtml(data.get('city') || 'Florida')}</span><span>${escapeHtml(data.get('bedrooms') || '')}</span><span>${escapeHtml(data.get('bathrooms') || '')}</span><span>${escapeHtml(data.get('area') || '')}</span></div></div></article>`;
  });

  qs('[data-blog-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    try {
      setStatus('Guardando artículo...');
      const data = await request('save_blog', fd);
      hydrate(data);
      setStatus(data.message + ` Archivo: blog/${data.post.slug}/index.html`);
      qs('[data-current-blog-image]').innerHTML = `<span>Imagen actual:</span><img src="${asset(data.post.image)}" alt="${escapeHtml(data.post.imageAlt || data.post.title)}">`;
      qs('[name="originalSlug"]', form).value = data.post.slug;
    } catch (error) {
      setStatus(error.message || 'Error guardando artículo.', false);
    }
  });

  qs('[data-property-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    try {
      setStatus('Guardando propiedad...');
      const data = await request('save_property', fd);
      hydrate(data);
      setStatus(data.message + ` Archivo: propiedades/${data.property.slug}/index.html y data/properties.json actualizado.`);
      const images = data.property.images || [];
      qs('[data-current-property-images]').innerHTML = images.length ? `<span>Galería actual:</span><div class="image-list">${images.map(img => `<img src="${asset(img.src)}" alt="${escapeHtml(img.alt || data.property.title)}">`).join('')}</div>` : '';
      qs('[name="originalSlug"]', form).value = data.property.slug;
    } catch (error) {
      setStatus(error.message || 'Error guardando propiedad.', false);
    }
  });

  currentEl?.addEventListener('click', async (event) => {
    const editBlog = event.target.closest('[data-edit-blog]');
    const editProperty = event.target.closest('[data-edit-property]');
    const deleteBlog = event.target.closest('[data-delete-blog]');
    const deleteProperty = event.target.closest('[data-delete-property]');

    if (editBlog) {
      const post = state.blog.find(item => item.slug === editBlog.dataset.editBlog);
      if (!post) return;
      const form = qs('[data-blog-form]');
      setFormValues(form, { ...post, originalSlug: post.slug, content: post.contentRaw || post.contentHtml || '' });
      qs('[data-current-blog-image]').innerHTML = `<span>Imagen actual:</span><img src="${asset(post.image || 'assets/img/blog/invertir-miami.svg')}" alt="${escapeHtml(post.imageAlt || post.title)}">`;
      qsa('[data-tab]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.tab === 'blog'));
      qsa('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== 'blog'; });
      setStatus(`Editando artículo: ${post.title}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (editProperty) {
      const item = state.properties.find(prop => prop.slug === editProperty.dataset.editProperty);
      if (!item) return;
      const form = qs('[data-property-form]');
      setFormValues(form, { ...item, originalSlug: item.slug, featured: String(Boolean(item.featured)) });
      const images = item.images || [];
      qs('[data-current-property-images]').innerHTML = images.length ? `<span>Galería actual:</span><div class="image-list">${images.map(img => `<img src="${asset(img.src)}" alt="${escapeHtml(img.alt || item.title)}">`).join('')}</div>` : '';
      qsa('[data-tab]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.tab === 'property'));
      qsa('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== 'property'; });
      setStatus(`Editando propiedad: ${item.title}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (deleteBlog) {
      const slug = deleteBlog.dataset.deleteBlog;
      if (!confirm(`¿Eliminar el artículo ${slug}?`)) return;
      try {
        const fd = new FormData();
        fd.append('slug', slug);
        fd.append('domain', 'https://inversionesdavar.com/');
        const data = await request('delete_blog', fd);
        hydrate(data);
        setStatus(data.message);
      } catch (error) { setStatus(error.message || 'No se pudo eliminar.', false); }
    }

    if (deleteProperty) {
      const slug = deleteProperty.dataset.deleteProperty;
      if (!confirm(`¿Eliminar la propiedad ${slug}?`)) return;
      try {
        const fd = new FormData();
        fd.append('slug', slug);
        const data = await request('delete_property', fd);
        hydrate(data);
        setStatus(data.message);
      } catch (error) { setStatus(error.message || 'No se pudo eliminar.', false); }
    }
  });

  qs('[data-rebuild-site]')?.addEventListener('click', async () => {
    try {
      const fd = new FormData();
      fd.append('domain', 'https://inversionesdavar.com/');
      setStatus('Regenerando páginas del blog, propiedades y sitemap...');
      const data = await request('rebuild', fd);
      hydrate(data);
      setStatus(data.message);
    } catch (error) {
      setStatus(error.message || 'No se pudo regenerar.', false);
    }
  });

  loadAll();
})();
