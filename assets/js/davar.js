(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const body = document.body;
  // Resolve the project root from this script URL so navigation also works when
  // the site is served from /project-name/ in XAMPP or GitHub Pages.
  const selfScript = [...document.scripts].find(s => /assets\/js\/davar\.js(?:\?|$)/.test(s.src));
  const projectBase = selfScript ? new URL('../../', selfScript.src) : new URL('./', location.href);
  const localUrl = path => new URL(String(path || '').replace(/^\/+/, ''), projectBase).href;
  const header = $('[data-header]');
  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  const backdrop = $('[data-menu-backdrop]');
  const menu = $('[data-mobile-menu]');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    if(openBtn) openBtn.setAttribute('aria-expanded', String(open));
    if(menu) menu.setAttribute('aria-hidden', String(!open));
  };
  openBtn?.addEventListener('click', () => setMenu(true));
  closeBtn?.addEventListener('click', () => setMenu(false));
  backdrop?.addEventListener('click', () => setMenu(false));
  $$('.mobile-nav a', menu || document).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') setMenu(false); });
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    }), {threshold:.08, rootMargin:'0px 0px -30px'});
    $$('[data-reveal]').forEach(el => io.observe(el));
  } else { $$('[data-reveal]').forEach(el => el.classList.add('is-visible')); }

  const searchForm = $('[data-property-search]');
  searchForm?.addEventListener('submit', e => {
    e.preventDefault();
    const lang = searchForm.dataset.lang || 'en';
    const destination = $('[name="destination"]', searchForm)?.value || '';
    const type = $('[name="type"]', searchForm)?.value || '';
    const q = $('[name="q"]', searchForm)?.value?.trim() || '';
    const direct = {
      en:{florida:'/florida/', 'palm-beach':'/florida/palm-beach/', loxahatchee:'/florida/loxahatchee/', aventura:'/florida/aventura/', honduras:'/honduras/'},
      es:{florida:'/es/florida/', 'palm-beach':'/es/florida/palm-beach/', loxahatchee:'/es/florida/loxahatchee/', aventura:'/es/florida/aventura/', honduras:'/es/honduras/'}
    };
    if(destination && !type && !q && direct[lang]?.[destination]){ location.href = localUrl(direct[lang][destination]); return; }
    const base = lang === 'es' ? '/es/propiedades/' : '/properties/';
    const params = new URLSearchParams();
    if(destination) params.set('location', destination);
    if(type) params.set('type', type);
    if(q) params.set('q', q);
    location.href = localUrl(`${base}${params.toString() ? '?' + params.toString() : ''}`);
  });

  const filterRoot = $('[data-portfolio-filters]');
  const cards = $$('[data-property-card]');
  if(filterRoot && cards.length){
    const search = $('[data-filter-search]', filterRoot);
    const loc = $('[data-filter-location]', filterRoot);
    const type = $('[data-filter-type]', filterRoot);
    const reset = $('[data-filter-reset]', filterRoot);
    const count = $('[data-filter-count]');
    const empty = $('[data-filter-empty]');
    const params = new URLSearchParams(location.search);
    if(search && params.get('q')) search.value = params.get('q');
    if(loc && params.get('location')) loc.value = params.get('location');
    if(type && params.get('type')) type.value = params.get('type');
    const apply = () => {
      const q = (search?.value || '').toLowerCase().trim();
      const l = loc?.value || '';
      const t = type?.value || '';
      let n = 0;
      cards.forEach(card => {
        const hay = `${card.dataset.title} ${card.dataset.city} ${card.dataset.country} ${card.dataset.type}`.toLowerCase();
        const ok = (!q || hay.includes(q)) && (!l || card.dataset.location === l) && (!t || card.dataset.type === t);
        card.hidden = !ok; if(ok) n++;
      });
      if(count) count.textContent = count.dataset.template?.replace('{n}', n) || `${n} results`;
      if(empty) empty.hidden = n !== 0;
    };
    [search,loc,type].forEach(el => el?.addEventListener(el === search ? 'input' : 'change', apply));
    reset?.addEventListener('click', () => { if(search) search.value=''; if(loc) loc.value=''; if(type) type.value=''; history.replaceState({},'',location.pathname); apply(); });
    apply();
  }

  const gallery = $('[data-gallery]');
  if(gallery){
    const images = JSON.parse(gallery.dataset.images || '[]');
    const main = $('[data-gallery-main]', gallery);
    const count = $('[data-gallery-count]', gallery);
    const thumbs = $$('[data-gallery-thumb]', gallery);
    let index = 0;
    const render = i => {
      if(!images.length) return;
      index = (i + images.length) % images.length;
      if(main){ main.src = images[index].src; main.alt = images[index].alt || ''; }
      if(count) count.textContent = `${index+1} / ${images.length}`;
      thumbs.forEach((t,idx) => t.classList.toggle('active', idx === index));
    };
    $('[data-gallery-prev]', gallery)?.addEventListener('click', () => render(index-1));
    $('[data-gallery-next]', gallery)?.addEventListener('click', () => render(index+1));
    thumbs.forEach((t,idx) => t.addEventListener('click', () => render(idx)));
    render(0);
    const lightbox = $('[data-lightbox]');
    const lbImg = $('[data-lightbox-image]');
    main?.addEventListener('click', () => { if(lightbox && lbImg){ lbImg.src=images[index].src; lbImg.alt=images[index].alt||''; lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden','false'); } });
    $('[data-lightbox-close]')?.addEventListener('click', () => { lightbox?.classList.remove('open'); lightbox?.setAttribute('aria-hidden','true'); });
    lightbox?.addEventListener('click', e => { if(e.target===lightbox) $('[data-lightbox-close]')?.click(); });
  }

  $$('[data-lead-form]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if(!form.reportValidity()) return;
    const d = new FormData(form);
    const lang = form.dataset.lang || 'en';
    const intro = lang === 'es' ? 'Hola Inversiones Davar, quiero solicitar información.' : 'Hello Inversiones Davar, I would like to request information.';
    const labels = lang === 'es' ? {name:'Nombre',email:'Correo',phone:'WhatsApp',interest:'Interés',message:'Mensaje'} : {name:'Name',email:'Email',phone:'WhatsApp',interest:'Interest',message:'Message'};
    const lines = [intro];
    [['name',labels.name],['email',labels.email],['phone',labels.phone],['interest',labels.interest],['message',labels.message]].forEach(([key,label]) => { const v=d.get(key); if(v) lines.push(`${label}: ${v}`); });
    window.open(`https://wa.me/13059304423?text=${encodeURIComponent(lines.join('\n'))}`,'_blank','noopener');
  }));

  // Blog search and category filters.
  const blogCards = $$('[data-blog-card]');
  if(blogCards.length){
    const search = $('[data-blog-search]');
    const chips = $$('[data-blog-filter]');
    const empty = $('[data-blog-empty]');
    let category = 'all';
    const applyBlog = () => {
      const q = (search?.value || '').toLowerCase().trim();
      let visible = 0;
      blogCards.forEach(card => {
        if(card.classList.contains('blog-card-featured')) return;
        const text = card.textContent.toLowerCase();
        const cat = card.dataset.blogCategory || '';
        const ok = (!q || text.includes(q)) && (category === 'all' || cat === category);
        card.hidden = !ok;
        if(ok) visible++;
      });
      if(empty) empty.hidden = visible !== 0;
    };
    search?.addEventListener('input', applyBlog);
    chips.forEach(chip => chip.addEventListener('click', () => {
      category = chip.dataset.blogFilter || 'all';
      chips.forEach(c => c.classList.toggle('is-active', c === chip));
      applyBlog();
    }));
  }

  $$('[data-whatsapp]').forEach(btn => btn.addEventListener('click', () => window.open('https://wa.me/13059304423','_blank','noopener')));
})();
