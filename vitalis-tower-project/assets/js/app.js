(() => {
  'use strict';

  const qs=(s,c=document)=>c.querySelector(s);
  const qsa=(s,c=document)=>[...c.querySelectorAll(s)];
  const WHATSAPP='13059304423';
  const VIDEO_ID='qr8pB24sDF8';

  const track=(event,label='')=>{
    if(window.gtag) window.gtag('event',event,{event_category:'Vitalis Tower',event_label:label});
  };

  // Header, reveals and conversion controls.
  const header=qs('[data-header]');
  const wa=qs('[data-whatsapp-float]');
  const mobileConversion=qs('[data-mobile-conversion]');
  const updateScroll=()=>{
    const active=window.scrollY>36;
    header?.classList.toggle('is-scrolled',active);
    wa?.classList.toggle('is-visible',window.scrollY>520);
    mobileConversion?.classList.toggle('is-visible',window.scrollY>520 && window.scrollY < document.body.scrollHeight-window.innerHeight-520);
  };
  updateScroll();
  addEventListener('scroll',updateScroll,{passive:true});

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}});
  },{threshold:.12,rootMargin:'0px 0px -6%'});
  qsa('.reveal').forEach(el=>observer.observe(el));

  // Mobile menu.
  const menu=qs('[data-mobile-menu]');
  const overlay=qs('[data-menu-overlay]');
  const openBtn=qs('[data-menu-open]');
  const closeBtn=qs('[data-menu-close]');
  const setMenu=(open)=>{
    menu?.classList.toggle('is-open',open);overlay?.classList.toggle('is-open',open);
    openBtn?.setAttribute('aria-expanded',String(open));menu?.setAttribute('aria-hidden',String(!open));
    if(menu) menu.inert=!open;
    document.body.classList.toggle('modal-open',open);
    if(open) setTimeout(()=>closeBtn?.focus(),80);
  };
  openBtn?.addEventListener('click',()=>setMenu(true));
  closeBtn?.addEventListener('click',()=>setMenu(false));
  overlay?.addEventListener('click',()=>setMenu(false));
  qsa('a',menu).forEach(a=>a.addEventListener('click',()=>setMenu(false)));

  // Video loads only after interaction.
  const videoModal=qs('[data-video-modal]');
  const videoFrame=qs('[data-video-frame]');
  let lastVideoTrigger=null;
  const openVideo=(trigger)=>{
    lastVideoTrigger=trigger||document.activeElement;
    if(videoFrame && !videoFrame.firstChild){
      const iframe=document.createElement('iframe');
      iframe.src=`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title='Video presentación Vitalis Tower';iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.allowFullscreen=true;
      videoFrame.appendChild(iframe);
    }
    videoModal?.classList.add('is-open');videoModal?.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
    setTimeout(()=>qs('.modal-close',videoModal)?.focus(),50);track('video_start','Presentation modal');
  };
  const closeVideo=()=>{
    videoModal?.classList.remove('is-open');videoModal?.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');
    if(videoFrame) videoFrame.innerHTML='';
    lastVideoTrigger?.focus?.();
  };
  qsa('[data-open-video]').forEach(b=>b.addEventListener('click',()=>openVideo(b)));
  qsa('[data-close-video]').forEach(b=>b.addEventListener('click',closeVideo));
  qs('[data-video-contact]')?.addEventListener('click',()=>{closeVideo();setTimeout(()=>qs('#contacto')?.scrollIntoView({behavior:'smooth'}),50);track('cta_click','Video contact')});

  // Render gallery. Only the active render is requested from the network.
  const galleryData={
    'Lobby':[
      ['lobby-1','Lobby de Vitalis Tower'],['lobby-2','Lobby de Vitalis Tower'],['lobby-3','Lobby de Vitalis Tower']
    ],
    'Gym':[
      ['gym-1','Gym de Vitalis Tower'],['gym-2','Gym de Vitalis Tower']
    ],
    'Meeting Room':[
      ['meeting-1','Meeting Room de Vitalis Tower'],['meeting-2','Meeting Room de Vitalis Tower']
    ],
    'Reception':[
      ['reception-1','Reception de Vitalis Tower']
    ],
    'Sauna':[
      ['sauna-1','Sauna de Vitalis Tower'],['sauna-2','Sauna de Vitalis Tower'],['sauna-3','Wellness de Vitalis Tower']
    ],
    'Scene':[
      ['scene-1','Scene de Vitalis Tower'],['scene-2','Scene de Vitalis Tower'],['scene-3','Scene de Vitalis Tower']
    ],
    'Outdoor':[
      ['outdoor-1','Outdoor Views de Vitalis Tower'],['outdoor-2','Outdoor Views de Vitalis Tower'],['outdoor-3','Outdoor Views de Vitalis Tower']
    ]
  };
  const gallery=qs('[data-gallery]');
  if(gallery){
    const tabs=qs('[data-gallery-tabs]',gallery), stage=qs('[data-gallery-stage]',gallery), img=qs('[data-gallery-image]',gallery), title=qs('[data-gallery-title]',gallery), idx=qs('[data-gallery-index]',gallery);
    let category='Lobby',current=0,startX=null;
    const setImage=(animate=true)=>{
      const list=galleryData[category], item=list[current], base=item[0];
      if(animate) stage.classList.add('is-changing');
      const apply=()=>{
        img.src=`assets/img/renders/${base}-1440.webp`;
        img.srcset=`assets/img/renders/${base}-640.webp 640w, assets/img/renders/${base}-960.webp 960w, assets/img/renders/${base}-1440.webp 1440w, assets/img/renders/${base}-1920.webp 1920w`;
        img.alt=item[1];title.textContent=category;idx.textContent=`${String(current+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`;
        requestAnimationFrame(()=>stage.classList.remove('is-changing'));
      };
      animate?setTimeout(apply,110):apply();
      // Preload next render at 960px after active image update.
      const next=list[(current+1)%list.length][0];
      if('requestIdleCallback' in window) requestIdleCallback(()=>{const p=new Image();p.src=`assets/img/renders/${next}-960.webp`},{timeout:1200});
    };
    Object.keys(galleryData).forEach((name,i)=>{
      const b=document.createElement('button');b.type='button';b.role='tab';b.textContent=name;b.className=i===0?'is-active':'';b.setAttribute('aria-selected',i===0?'true':'false');
      b.addEventListener('click',()=>{category=name;current=0;qsa('button',tabs).forEach(x=>{x.classList.remove('is-active');x.setAttribute('aria-selected','false')});b.classList.add('is-active');b.setAttribute('aria-selected','true');setImage();track('gallery_category',name)});
      tabs.appendChild(b);
    });
    const move=(dir)=>{const n=galleryData[category].length;current=(current+dir+n)%n;setImage();track('gallery_navigation',category)};
    qs('[data-gallery-prev]',gallery)?.addEventListener('click',()=>move(-1));
    qs('[data-gallery-next]',gallery)?.addEventListener('click',()=>move(1));
    stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)});
    stage.addEventListener('pointerdown',e=>{startX=e.clientX});
    stage.addEventListener('pointerup',e=>{if(startX===null)return;const d=e.clientX-startX;startX=null;if(Math.abs(d)>55)move(d>0?-1:1)});
    qs('[data-gallery-expand]',gallery)?.addEventListener('click',()=>openLightbox(img.src,img.alt,`${category} · ${idx.textContent}`));
  }

  // Lightbox.
  const lightbox=qs('[data-lightbox]'),lightImg=qs('[data-lightbox-image]'),lightCaption=qs('[data-lightbox-caption]');
  let lightboxReturn=null;
  function openLightbox(src,alt,caption){
    lightboxReturn=document.activeElement;if(lightImg){lightImg.src=src;lightImg.alt=alt||'Render de Vitalis Tower'}if(lightCaption)lightCaption.textContent=caption||'';
    lightbox?.classList.add('is-open');lightbox?.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');setTimeout(()=>qs('.modal-close',lightbox)?.focus(),50);track('gallery_expand',caption||'Render');
  }
  const closeLightbox=()=>{lightbox?.classList.remove('is-open');lightbox?.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(lightImg)lightImg.src='';lightboxReturn?.focus?.()};
  qsa('[data-lightbox-close]').forEach(b=>b.addEventListener('click',closeLightbox));

  addEventListener('keydown',e=>{if(e.key==='Escape'){if(videoModal?.classList.contains('is-open'))closeVideo();if(lightbox?.classList.contains('is-open'))closeLightbox();if(menu?.classList.contains('is-open'))setMenu(false)}});

  // Campaign attribution persisted for the session.
  const params=new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'].forEach(key=>{
    const incoming=params.get(key);if(incoming) sessionStorage.setItem(`vitalis_${key}`,incoming);
    qsa(`[data-utm="${key}"]`).forEach(input=>input.value=incoming||sessionStorage.getItem(`vitalis_${key}`)||'');
  });

  // Lead capture + immediate WhatsApp handoff. PHP storage is additive; WhatsApp remains the fallback.
  qsa('[data-lead-form]').forEach(form=>{
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const status=qs('[data-form-status]',form);
      if(!form.checkValidity()){form.reportValidity();if(status){status.textContent='Revisa los campos requeridos.';status.className='form-status error'}return}
      const data=new FormData(form);
      if(data.get('website')) return;
      const name=String(data.get('nombre')||'').trim();
      const phone=String(data.get('telefono')||'').trim();
      const email=String(data.get('correo')||'').trim();
      const interest=String(data.get('interes')||'').trim();
      const text=[
        'Hola Inversiones Davar, quiero recibir información sobre Vitalis Tower.',
        `Nombre: ${name}`,
        `Teléfono: ${phone}`,
        `Email: ${email}`,
        `Interés: ${interest}`
      ].join('\n');
      const waUrl=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
      // Open from the direct submit gesture to avoid popup blockers.
      const w=window.open(waUrl,'_blank','noopener');
      if(!w) location.href=waUrl;
      fetch('api/lead.php',{method:'POST',body:data,headers:{'X-Requested-With':'XMLHttpRequest'},keepalive:true}).catch(()=>{});
      if(status){status.textContent='Solicitud preparada. Continuamos por WhatsApp.';status.className='form-status success'}
      track('generate_lead',interest||'Vitalis Tower');
      form.reset();
      qsa('[data-utm]').forEach(input=>{const key=input.dataset.utm;input.value=sessionStorage.getItem(`vitalis_${key}`)||''});
    });
  });

  qsa('[data-track]').forEach(el=>el.addEventListener('click',()=>track('cta_click',el.dataset.track)));
})();
