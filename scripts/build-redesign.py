from pathlib import Path
import json, html, re
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://inversionesdavar.com'
TODAY = date.today().isoformat()

with open(ROOT/'data/properties.json', encoding='utf-8') as f:
    raw_props = json.load(f)

route_map = {
    'residential-construction-projects-in-palm-beach': {
        'en':'/florida/palm-beach/residential-construction-projects/',
        'es':'/es/florida/palm-beach/proyectos-residenciales-en-construccion/',
        'location':'palm-beach', 'city':'Palm Beach, FL', 'type':'residential'
    },
    'residential-house-in-loxahatchee-fl': {
        'en':'/florida/loxahatchee/residential-house/',
        'es':'/es/florida/loxahatchee/casa-residencial/',
        'location':'loxahatchee', 'city':'Loxahatchee, FL', 'type':'residential'
    },
    'great-residential-house-in-loxahatchee-fl': {
        'en':'/florida/loxahatchee/great-residential-house/',
        'es':'/es/florida/loxahatchee/gran-casa-residencial/',
        'location':'loxahatchee', 'city':'Loxahatchee, FL', 'type':'residential'
    },
    'vitalis-tower-project': {
        'en':'/florida/aventura/vitalis-tower/',
        'es':'/es/florida/aventura/vitalis-tower/',
        'location':'aventura', 'city':'Aventura, FL', 'type':'commercial'
    }
}

copy = {
    'residential-construction-projects-in-palm-beach': {
        'en': {
            'title':'Residential Construction in Palm Beach',
            'summary':'A single-story residence designed for active adults 55+, with an open Great Room, connected kitchen and a covered outdoor deck.',
            'type':'Residential',
            'highlights':['55+ active adult living','Single-story layout','Open Great Room and kitchen','Covered outdoor deck']
        },
        'es': {
            'title':'Proyecto residencial en Palm Beach',
            'summary':'Residencia de una planta diseñada para adultos activos 55+, con sala principal abierta, cocina integrada y terraza exterior cubierta.',
            'type':'Residencial',
            'highlights':['Comunidad para adultos activos 55+','Distribución de una planta','Sala principal y cocina abiertas','Terraza exterior cubierta']
        }
    },
    'residential-house-in-loxahatchee-fl': {
        'en': {
            'title':'Residential House in Loxahatchee',
            'summary':'A modern single-story twin home with an open layout connecting the kitchen, dining room and Great Room for practical everyday living.',
            'type':'Residential',
            'highlights':['Single-story twin home','Open-plan living area','Equipped kitchen','Connected dining and Great Room']
        },
        'es': {
            'title':'Casa residencial en Loxahatchee',
            'summary':'Casa moderna de una planta con distribución abierta que conecta cocina, comedor y sala principal para una experiencia cómoda y funcional.',
            'type':'Residencial',
            'highlights':['Casa de una planta','Distribución abierta','Cocina equipada','Comedor y sala principal integrados']
        }
    },
    'great-residential-house-in-loxahatchee-fl': {
        'en': {
            'title':'Great Residential House in Loxahatchee',
            'summary':'A two-story residence with a spacious open main living area, fully equipped kitchen, dining room and a covered lanai for outdoor living.',
            'type':'Residential',
            'highlights':['Two-story residence','Four-bedroom layout','Open main living area','Covered lanai']
        },
        'es': {
            'title':'Gran casa residencial en Loxahatchee',
            'summary':'Residencia de dos plantas con amplia zona social abierta, cocina equipada, comedor y lanai cubierto para disfrutar del exterior.',
            'type':'Residencial',
            'highlights':['Residencia de dos plantas','Distribución de cuatro habitaciones','Zona social abierta','Lanai cubierto']
        }
    },
    'vitalis-tower-project': {
        'en': {
            'title':'Vitalis Tower',
            'summary':'Medical and professional spaces in Aventura with contemporary interiors and amenities designed for working, meeting and recharging.',
            'type':'Commercial',
            'highlights':['Medical and professional spaces','Lobby and reception','Meeting room','Gym and sauna','Outdoor views','Contemporary common areas']
        },
        'es': {
            'title':'Vitalis Tower',
            'summary':'Espacios médicos y profesionales en Aventura con interiores contemporáneos y amenidades pensadas para trabajar, reunirse y recargar energías.',
            'type':'Comercial',
            'highlights':['Espacios médicos y profesionales','Lobby y recepción','Meeting room','Gym y sauna','Vistas exteriores','Áreas comunes contemporáneas']
        }
    }
}

props=[]
for p in raw_props:
    if p['slug'] not in route_map: continue
    q=dict(p)
    q.update(route_map[p['slug']])
    q['city']=route_map[p['slug']]['city']
    props.append(q)

# Update canonical dataset while keeping legacy url for the local admin compatible.
for p in raw_props:
    if p['slug'] in route_map:
        p['city'] = route_map[p['slug']]['city']
        p['routes'] = {'en':route_map[p['slug']]['en'], 'es':route_map[p['slug']]['es']}
        p['locationKey'] = route_map[p['slug']]['location']
        p['propertyType'] = route_map[p['slug']]['type']
with open(ROOT/'data/properties.json','w',encoding='utf-8') as f:
    json.dump(raw_props,f,ensure_ascii=False,indent=2)


def esc(s): return html.escape(str(s), quote=True)
def absurl(path): return SITE + (path if path.startswith('/') else '/'+path)
def write_page(path, content):
    rel=path.strip('/')
    target = ROOT/'index.html' if path=='/' else ROOT/rel/'index.html' if path.endswith('/') else ROOT/rel
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding='utf-8')


def json_script(data):
    return '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+'</script>'


def head(lang,title,description,canonical,alternate=None,image='/assets/img/hero-miami.webp',robots='index, follow, max-image-preview:large',schemas=None, preload=None):
    locale='en_US' if lang=='en' else 'es_US'
    alts=''
    if alternate:
        other='es' if lang=='en' else 'en'
        alts += f'<link rel="alternate" hreflang="{other}" href="{absurl(alternate)}">'
        alts += f'<link rel="alternate" hreflang="{lang}" href="{absurl(canonical)}">'
        alts += f'<link rel="alternate" hreflang="x-default" href="{absurl(canonical if lang=="en" else alternate)}">'
    schema_html=''.join(json_script(s) for s in (schemas or []))
    preload_html=f'<link rel="preload" as="image" href="{preload}" fetchpriority="high">' if preload else ''
    return f'''<!doctype html><html lang="{lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title><meta name="description" content="{esc(description)}"><meta name="robots" content="{robots}">
<link rel="canonical" href="{absurl(canonical)}">{alts}
<meta property="og:type" content="website"><meta property="og:locale" content="{locale}"><meta property="og:site_name" content="Inversiones Davar"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{absurl(canonical)}"><meta property="og:image" content="{absurl(image)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(title)}"><meta name="twitter:description" content="{esc(description)}"><meta name="twitter:image" content="{absurl(image)}">
<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><meta name="theme-color" content="#0f1828">{preload_html}
<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"><link rel="stylesheet" href="/assets/css/davar.css">{schema_html}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TYR5W4T4VP"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','G-TYR5W4T4VP');</script>
</head><body>'''


def header(lang='en', alt='/es/'):
    es=lang=='es'
    labels = {
        'home':'Inicio' if es else 'Home', 'florida':'Florida', 'properties':'Propiedades' if es else 'Properties',
        'honduras':'Honduras', 'contact':'Contacto' if es else 'Contact', 'menu':'Menú' if es else 'Menu',
        'cta':'Hablar con un asesor' if es else 'Talk to an advisor'
    }
    root='/es/' if es else '/'; florida='/es/florida/' if es else '/florida/'; properties='/es/propiedades/' if es else '/properties/'; honduras='/es/honduras/' if es else '/honduras/'; contact=root+('#contacto' if es else '#contact')
    pb='/es/florida/palm-beach/' if es else '/florida/palm-beach/'; lx='/es/florida/loxahatchee/' if es else '/florida/loxahatchee/'; av='/es/florida/aventura/' if es else '/florida/aventura/'
    langlabel='EN' if es else 'ES'
    return f'''<a class="skip-link" href="#main">{'Saltar al contenido' if es else 'Skip to content'}</a>
<header class="site-header" data-header><div class="nav-shell container-wide">
<a class="brand" href="{root}" aria-label="Inversiones Davar"><img src="/assets/img/logo-mark.webp" alt="" width="46" height="46"><span class="brand-copy"><strong>Inversiones Davar</strong><small>S.A. de C.V.</small></span></a>
<nav class="desktop-nav" aria-label="{'Navegación principal' if es else 'Primary navigation'}"><a href="{root}">{labels['home']}</a><div class="nav-dropdown"><a class="nav-parent" href="{florida}">{labels['florida']} <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></a><div class="nav-dropdown-menu"><a href="{pb}"><i class="fa-solid fa-water" aria-hidden="true"></i>Palm Beach</a><a href="{lx}"><i class="fa-solid fa-house" aria-hidden="true"></i>Loxahatchee</a><a href="{av}"><i class="fa-solid fa-building" aria-hidden="true"></i>Aventura</a></div></div><a href="{properties}">{labels['properties']}</a><a href="{honduras}">{labels['honduras']}</a><a href="{contact}">{labels['contact']}</a></nav>
<a class="lang-switch" href="{alt}" hreflang="{'en' if es else 'es'}" lang="{'en' if es else 'es'}"><i class="fa-solid fa-globe" aria-hidden="true"></i>{langlabel}</a><a class="btn btn-primary btn-sm nav-cta" href="{contact}">{labels['cta']}</a>
<button class="menu-toggle" type="button" data-menu-open aria-label="{labels['menu']}" aria-expanded="false"><i class="fa-solid fa-bars" aria-hidden="true"></i></button></div></header>
<div class="mobile-backdrop" data-menu-backdrop></div><aside class="mobile-menu" data-mobile-menu aria-hidden="true"><div class="mobile-menu-head"><span>{labels['menu']}</span><button class="menu-close" type="button" data-menu-close aria-label="{'Cerrar menú' if es else 'Close menu'}"><i class="fa-solid fa-xmark"></i></button></div><nav class="mobile-nav"><a href="{root}">{labels['home']}</a><a href="{florida}">{labels['florida']}</a><a href="{pb}">Palm Beach</a><a href="{lx}">Loxahatchee</a><a href="{av}">Aventura</a><a href="{properties}">{labels['properties']}</a><a href="{honduras}">{labels['honduras']}</a><a href="{contact}">{labels['contact']}</a></nav><div class="mobile-actions"><a class="mobile-lang" href="{alt}" hreflang="{'en' if es else 'es'}"><i class="fa-solid fa-globe"></i>{langlabel}</a><a class="btn btn-gold btn-full" href="{contact}">{labels['cta']}</a></div></aside>'''


def footer(lang='en'):
    es=lang=='es'; root='/es/' if es else '/'; props_path='/es/propiedades/' if es else '/properties/'; fl='/es/florida/' if es else '/florida/'; hn='/es/honduras/' if es else '/honduras/'
    return f'''<footer class="footer"><div class="container-wide footer-grid"><div class="footer-brand"><div class="footer-brand-row"><img src="/assets/img/logo-mark.webp" alt="" width="54" height="54" loading="lazy"><strong>Inversiones Davar</strong></div><p>{'Portafolio inmobiliario y acompañamiento para evaluar oportunidades en Florida y Honduras.' if es else 'Real estate portfolio and guidance for evaluating opportunities in Florida and Honduras.'}</p></div><div><h3>{'Explorar' if es else 'Explore'}</h3><div class="footer-links"><a href="{fl}">Florida</a><a href="{props_path}">{'Propiedades' if es else 'Properties'}</a><a href="{hn}">Honduras</a><a href="/blog/">{'Blog inmobiliario' if es else 'Spanish insights'}</a></div></div><div><h3>{'Zonas' if es else 'Locations'}</h3><div class="footer-links"><a href="{'/es' if es else ''}/florida/palm-beach/">Palm Beach</a><a href="{'/es' if es else ''}/florida/loxahatchee/">Loxahatchee</a><a href="{'/es' if es else ''}/florida/aventura/">Aventura</a></div></div><div><h3>{'Contacto' if es else 'Contact'}</h3><div class="footer-links"><a href="tel:+13059304423">+1 (305) 930-4423</a><a href="https://wa.me/13059304423" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:realestate.davar@gmail.com">realestate.davar@gmail.com</a><a href="{'/politica-privacidad.html' if es else '/privacy-policy.html'}">{'Privacidad' if es else 'Privacy'}</a><a href="{'/terminos-condiciones.html' if es else '/terms-conditions.html'}">{'Términos' if es else 'Terms'}</a></div></div></div><div class="footer-bottom container-wide"><p>© 2026 Inversiones Davar S.A. de C.V.</p><p>{'Desarrollado por' if es else 'Developed by'} <a href="https://edevisraga.com" target="_blank" rel="noopener">Edevis Raga</a></p></div></footer><button class="floating-whatsapp" type="button" data-whatsapp aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></button><script src="/assets/js/davar.js" defer></script></body></html>'''


def breadcrumb_schema(items):
    return {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':name,'item':absurl(path)} for i,(name,path) in enumerate(items)]}

def breadcrumbs(items):
    return '<nav class="breadcrumbs" aria-label="Breadcrumb">'+''.join((f'<a href="{path}">{esc(name)}</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>' if i<len(items)-1 else f'<span>{esc(name)}</span>') for i,(name,path) in enumerate(items))+'</nav>'


def property_card(p, lang='en'):
    c=copy[p['slug']][lang]; r=route_map[p['slug']]; es=lang=='es'
    facts=[]
    if p.get('bedrooms'): facts.append(f'<span><i class="fa-solid fa-bed"></i>{esc(p["bedrooms"])}</span>')
    if p.get('bathrooms'): facts.append(f'<span><i class="fa-solid fa-bath"></i>{esc(p["bathrooms"])}</span>')
    if p.get('area'): facts.append(f'<span><i class="fa-solid fa-ruler-combined"></i>{esc(p["area"])}</span>')
    img='/'+p['images'][0]['src']
    return f'''<article class="property-card" data-property-card data-title="{esc(c['title'])}" data-city="{esc(p['city'])}" data-country="united-states" data-location="{r['location']}" data-type="{r['type']}"><a href="{r[lang]}" aria-label="{esc(c['title'])}"><div class="property-media"><img src="{img}" alt="{esc(c['title'])}" width="956" height="535" loading="lazy" decoding="async"><span class="property-badge">{esc(c['type'])}</span></div><div class="property-body"><span class="property-kicker">{esc(p['city'])}</span><h3>{esc(c['title'])}</h3><p>{esc(c['summary'])}</p><div class="facts">{''.join(facts)}</div><div class="property-footer"><span class="property-price">{'Price' if not es else 'Precio'}<strong>{'Upon request' if not es else 'A consultar'}</strong></span><span class="text-link">{'View property' if not es else 'Ver propiedad'} <i class="fa-solid fa-arrow-right"></i></span></div></div></a></article>'''


def contact_section(lang='en'):
    es=lang=='es'
    return f'''<section class="section contact-section" id="{'contacto' if es else 'contact'}"><div class="container contact-grid"><div class="contact-copy" data-reveal><span class="eyebrow">{'Contacto' if es else 'Contact'}</span><h2>{'Cuéntanos qué tipo de inversión estás evaluando.' if es else 'Tell us what kind of investment you are evaluating.'}</h2><p>{'Comparte tu objetivo y un asesor te orientará sobre las oportunidades disponibles y los próximos pasos.' if es else 'Share your goal and an advisor will guide you through available opportunities and the next steps.'}</p><div class="contact-list"><a class="contact-link" href="tel:+13059304423"><i class="fa-solid fa-phone"></i><span><strong>{'Estados Unidos' if es else 'United States'}</strong><span>+1 (305) 930-4423</span></span></a><a class="contact-link" href="https://wa.me/13059304423" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i><span><strong>WhatsApp</strong><span>+1 (305) 930-4423</span></span></a><a class="contact-link" href="mailto:realestate.davar@gmail.com"><i class="fa-solid fa-envelope"></i><span><strong>Email</strong><span>realestate.davar@gmail.com</span></span></a></div></div><form class="lead-form" data-lead-form data-lang="{lang}"><label>{'Nombre' if es else 'Name'}<input name="name" autocomplete="name" required placeholder="{'Tu nombre' if es else 'Your name'}"></label><div class="form-row"><label>Email<input name="email" type="email" autocomplete="email" required placeholder="name@email.com"></label><label>WhatsApp<input name="phone" autocomplete="tel" required placeholder="+1 000 000 0000"></label></div><label>{'Interés' if es else 'Interest'}<select name="interest"><option>{'Propiedad residencial' if es else 'Residential property'}</option><option>{'Inversión comercial' if es else 'Commercial investment'}</option><option>Florida</option><option>Honduras</option></select></label><label>{'Mensaje' if es else 'Message'}<textarea name="message" rows="4" placeholder="{'¿Qué estás buscando?' if es else 'What are you looking for?'}"></textarea></label><button class="btn btn-primary btn-full" type="submit">{'Continuar por WhatsApp' if es else 'Continue on WhatsApp'} <i class="fa-brands fa-whatsapp"></i></button><p class="form-note">{'El formulario prepara tu consulta y abre WhatsApp.' if es else 'The form prepares your inquiry and opens WhatsApp.'}</p></form></div></section>'''


def home(lang='en'):
    es=lang=='es'; canonical='/es/' if es else '/'; alt='/' if es else '/es/'
    title='Inversiones Davar | Propiedades e inversiones en Florida y Honduras' if es else 'Inversiones Davar | Real Estate in Florida & Honduras'
    desc='Explora propiedades y proyectos inmobiliarios en Florida y Honduras con una experiencia visual, asesoría y contacto directo.' if es else 'Explore real estate properties and projects in Florida and Honduras with a visual portfolio, guidance and direct advisor contact.'
    org={'@context':'https://schema.org','@type':'RealEstateAgent','@id':SITE+'/#organization','name':'Inversiones Davar S.A. de C.V.','url':SITE+'/','logo':SITE+'/assets/img/logo-davar.webp','email':'realestate.davar@gmail.com','telephone':'+1-305-930-4423','areaServed':[{'@type':'State','name':'Florida'},{'@type':'Country','name':'Honduras'}]}
    website={'@context':'https://schema.org','@type':'WebSite','@id':SITE+'/#website','url':SITE+'/','name':'Inversiones Davar','inLanguage':['en','es'],'publisher':{'@id':SITE+'/#organization'}}
    h=head(lang,title,desc,canonical,alt,schemas=[org,website,breadcrumb_schema([('Home' if not es else 'Inicio',canonical)])],preload='/assets/img/hero-miami.webp')+header(lang,alt)
    if es:
        hero_title='Encuentra oportunidades inmobiliarias con un camino más claro.'; hero_p='Explora proyectos en Florida y Honduras en una plataforma diseñada para comparar, descubrir y consultar sin perderte entre demasiado texto.'
        location_title='Explora por ubicación'; location_p='Ve directo a la zona que te interesa y descubre los proyectos disponibles.'; featured='Propiedades destacadas'; fdesc='Una selección visual de oportunidades actualmente publicadas.'
        fl_title='Florida, organizada por zonas.'; fl_p='Encuentra proyectos residenciales y comerciales a través de una navegación sencilla por ciudad y ubicación.'
        vitalis_title='Vitalis Tower, Aventura'; vitalis_p='Una presentación visual de espacios médicos y profesionales con lobby, recepción, meeting room, gym, sauna y áreas exteriores.'
        process_title='Menos fricción. Más claridad.'; process_p='La plataforma prioriza lo que necesitas para evaluar una oportunidad y contactar a un asesor.'
        steps=[('01','Explora','Filtra por zona y tipo de propiedad.'),('02','Compara','Revisa imágenes, características y ubicación.'),('03','Consulta','Habla directamente con un asesor por WhatsApp.')]
    else:
        hero_title='Find real estate opportunities with a clearer path.'; hero_p='Explore projects in Florida and Honduras through a portfolio designed to help you compare, discover and inquire without getting lost in excessive copy.'
        location_title='Explore by location'; location_p='Go directly to the area you care about and discover available projects.'; featured='Featured properties'; fdesc='A visual selection of opportunities currently published.'
        fl_title='Florida, organized by location.'; fl_p='Discover residential and commercial projects through simple navigation by city and area.'
        vitalis_title='Vitalis Tower, Aventura'; vitalis_p='A visual presentation of medical and professional spaces with lobby, reception, meeting room, gym, sauna and outdoor areas.'
        process_title='Less friction. More clarity.'; process_p='The platform prioritizes what you need to evaluate an opportunity and connect with an advisor.'
        steps=[('01','Explore','Filter by location and property type.'),('02','Compare','Review imagery, features and location.'),('03','Inquire','Connect directly with an advisor on WhatsApp.')]
    prop_path='/es/propiedades/' if es else '/properties/'
    h += f'''<main id="main"><section class="hero"><div class="hero-media"><img src="/assets/img/hero-miami.webp" alt="{'Vista aérea del área de Miami y Florida' if es else 'Aerial view of the Miami and Florida area'}" width="2200" height="1152" fetchpriority="high" decoding="async"></div><div class="container hero-content"><div class="hero-copy" data-reveal><span class="eyebrow light">Inversiones Davar</span><h1>{hero_title}</h1><p>{hero_p}</p><form class="hero-search" data-property-search data-lang="{lang}"><div class="search-field"><label>{'Ubicación' if es else 'Location'}</label><select name="destination" aria-label="{'Ubicación' if es else 'Location'}"><option value="">{'Todas las ubicaciones' if es else 'All locations'}</option><option value="florida">Florida</option><option value="palm-beach">Palm Beach</option><option value="loxahatchee">Loxahatchee</option><option value="aventura">Aventura</option><option value="honduras">Honduras</option></select></div><div class="search-field"><label>{'Tipo' if es else 'Property type'}</label><select name="type" aria-label="{'Tipo' if es else 'Property type'}"><option value="">{'Todos' if es else 'All types'}</option><option value="residential">{'Residencial' if es else 'Residential'}</option><option value="commercial">{'Comercial' if es else 'Commercial'}</option></select></div><button class="btn btn-gold" type="submit"><i class="fa-solid fa-magnifying-glass"></i>{'Buscar' if es else 'Search'}</button></form><div class="hero-note"><i class="fa-solid fa-location-dot"></i>{'Florida + oportunidades seleccionadas en Honduras' if es else 'Florida + selected opportunities in Honduras'}</div></div></div></section>'''
    h += f'''<section class="section"><div class="container"><div class="section-head" data-reveal><div class="section-head-copy"><span class="eyebrow">{'Ubicaciones' if es else 'Locations'}</span><h2>{location_title}</h2><p class="section-lead">{location_p}</p></div><a class="btn btn-outline" href="{prop_path}">{'Ver todo el portafolio' if es else 'View all properties'}</a></div><div class="location-grid">'''
    locations=[
      ('Palm Beach','Florida · Residential','/assets/img/properties/residential-construction-projects-in-palm-beach-1.webp','/es/florida/palm-beach/' if es else '/florida/palm-beach/'),
      ('Loxahatchee','Florida · Residential','/assets/img/properties/great-residential-house-in-loxahatchee-fl-1.webp','/es/florida/loxahatchee/' if es else '/florida/loxahatchee/'),
      ('Aventura','Florida · Commercial','/assets/img/properties/vitalis-tower-project-7.webp','/es/florida/aventura/' if es else '/florida/aventura/'),
      ('Honduras','Central America','/assets/img/hero-honduras.webp','/es/honduras/' if es else '/honduras/')]
    for i,(name,kicker,img,url) in enumerate(locations):
        kicker = kicker.replace('Residential','Residencial').replace('Commercial','Comercial').replace('Central America','Centroamérica') if es else kicker
        h += f'''<a class="location-card{' featured' if i==0 else ''}" href="{url}" data-reveal><img src="{img}" alt="{esc(name)}" loading="lazy" decoding="async"><div class="location-card-content"><span>{esc(kicker)}</span><h3>{esc(name)}</h3><p>{'Explorar oportunidades' if es else 'Explore opportunities'} <i class="fa-solid fa-arrow-right"></i></p></div></a>'''
    h += '</div></div></section>'
    cards=''.join(property_card(p,lang) for p in props)
    h += f'''<section class="section section-soft"><div class="container"><div class="section-head" data-reveal><div class="section-head-copy"><span class="eyebrow">{'Portafolio' if es else 'Portfolio'}</span><h2>{featured}</h2><p class="section-lead">{fdesc}</p></div><a class="text-link" href="{prop_path}">{'Ver todas' if es else 'See all'} <i class="fa-solid fa-arrow-right"></i></a></div><div class="property-grid four">{cards}</div></div></section>'''
    h += f'''<section class="section"><div class="container split-feature"><div class="feature-image" data-reveal><img src="/assets/img/florida-market.webp" alt="Florida" loading="lazy" decoding="async"><span class="image-label">Florida</span></div><div class="split-copy" data-reveal><span class="eyebrow">Florida</span><h2>{fl_title}</h2><p>{fl_p}</p><div class="actions"><a class="btn btn-primary" href="{'/es/florida/' if es else '/florida/'}">{'Explorar Florida' if es else 'Explore Florida'}</a><a class="btn btn-outline" href="{'/es/florida/palm-beach/' if es else '/florida/palm-beach/'}">Palm Beach</a></div><div class="mini-stats"><div class="mini-stat"><strong>{'Residencial' if es else 'Residential'}</strong><span>{'Casas y nuevos desarrollos' if es else 'Homes and new developments'}</span></div><div class="mini-stat"><strong>{'Comercial' if es else 'Commercial'}</strong><span>{'Proyectos profesionales seleccionados' if es else 'Selected professional projects'}</span></div></div></div></div></section>'''
    h += f'''<section class="section section-dark"><div class="container split-feature reverse"><div class="feature-image" data-reveal><img src="/assets/img/properties/vitalis-tower-project-8.webp" alt="Vitalis Tower" loading="lazy" decoding="async"><span class="image-label">Aventura · Florida</span></div><div class="split-copy" data-reveal><span class="eyebrow light">{'Proyecto destacado' if es else 'Featured project'}</span><h2>{vitalis_title}</h2><p>{vitalis_p}</p><div class="actions"><a class="btn btn-gold" href="{route_map['vitalis-tower-project'][lang]}">{'Ver Vitalis Tower' if es else 'View Vitalis Tower'} <i class="fa-solid fa-arrow-right"></i></a></div></div></div></section>'''
    h += f'''<section class="section section-dark" style="padding-top:0"><div class="container"><div class="section-head" data-reveal><div class="section-head-copy"><span class="eyebrow light">{'Experiencia' if es else 'Experience'}</span><h2>{process_title}</h2><p class="section-lead">{process_p}</p></div></div><div class="process-grid">'''+''.join(f'<article class="process-card" data-reveal><span>{n}</span><h3>{t}</h3><p>{p}</p></article>' for n,t,p in steps)+'''</div></div></section>'''
    h += contact_section(lang) + '</main>' + footer(lang)
    return h


def portfolio_page(lang='en'):
    es=lang=='es'; canonical='/es/propiedades/' if es else '/properties/'; alt='/properties/' if es else '/es/propiedades/'
    title='Propiedades en Florida y Honduras | Inversiones Davar' if es else 'Properties in Florida & Honduras | Inversiones Davar'
    desc='Explora y filtra el portafolio de propiedades y proyectos de Inversiones Davar por ubicación y tipo.' if es else 'Explore and filter the Inversiones Davar property portfolio by location and property type.'
    items=[{'@type':'ListItem','position':i+1,'url':absurl(route_map[p['slug']][lang]),'name':copy[p['slug']][lang]['title']} for i,p in enumerate(props)]
    schemas=[breadcrumb_schema([('Inicio' if es else 'Home','/es/' if es else '/'),('Propiedades' if es else 'Properties',canonical)]),{'@context':'https://schema.org','@type':'ItemList','name':title,'itemListElement':items}]
    h=head(lang,title,desc,canonical,alt,image='/assets/img/florida-market.webp',schemas=schemas)+header(lang,alt)
    h+=f'''<main id="main"><section class="location-hero"><img class="hero-bg" src="/assets/img/florida-market.webp" alt="Florida" width="1600" height="899"><div class="container">{breadcrumbs([('Inicio' if es else 'Home','/es/' if es else '/'),('Propiedades' if es else 'Properties',canonical)])}<span class="eyebrow light">{'Portafolio' if es else 'Portfolio'}</span><h1>{'Encuentra una propiedad.' if es else 'Find a property.'}</h1><p>{'Filtra por ubicación y tipo. Cada ficha prioriza imágenes, características y una vía directa para consultar.' if es else 'Filter by location and type. Each listing prioritizes imagery, key details and a direct way to inquire.'}</p></div></section><section class="section"><div class="container"><div class="portfolio-filters" data-portfolio-filters><input data-filter-search type="search" placeholder="{'Buscar por nombre o ciudad' if es else 'Search by name or city'}" aria-label="Search"><select data-filter-location><option value="">{'Todas las ubicaciones' if es else 'All locations'}</option><option value="palm-beach">Palm Beach</option><option value="loxahatchee">Loxahatchee</option><option value="aventura">Aventura</option></select><select data-filter-type><option value="">{'Todos los tipos' if es else 'All types'}</option><option value="residential">{'Residencial' if es else 'Residential'}</option><option value="commercial">{'Comercial' if es else 'Commercial'}</option></select><button class="btn btn-outline" data-filter-reset type="button">{'Limpiar' if es else 'Reset'}</button><p class="filter-count" data-filter-count data-template="{'{n} propiedades encontradas' if es else '{n} properties found'}"></p></div><div class="property-grid">{''.join(property_card(p,lang) for p in props)}<div class="empty-state" data-filter-empty hidden>{'No encontramos propiedades con esos filtros.' if es else 'No properties match those filters.'}</div></div></div></section>{contact_section(lang)}</main>{footer(lang)}'''
    return h

location_data={
 'florida':{
   'en':{'path':'/florida/','alt':'/es/florida/','title':'Florida Real Estate | Inversiones Davar','desc':'Explore Davar real estate opportunities in Florida, organized by Palm Beach, Loxahatchee and Aventura.','h1':'Explore Florida by location.','intro':'A clearer way to discover residential and commercial opportunities without navigating through long blocks of text.','image':'/assets/img/florida-market.webp','points':[('Palm Beach','Residential opportunities'),('Loxahatchee','New homes and residences'),('Aventura','Commercial and professional spaces')]},
   'es':{'path':'/es/florida/','alt':'/florida/','title':'Inversiones inmobiliarias en Florida | Inversiones Davar','desc':'Explora oportunidades inmobiliarias Davar en Florida organizadas por Palm Beach, Loxahatchee y Aventura.','h1':'Explora Florida por ubicación.','intro':'Una forma más clara de descubrir oportunidades residenciales y comerciales sin navegar entre largos bloques de texto.','image':'/assets/img/florida-market.webp','points':[('Palm Beach','Oportunidades residenciales'),('Loxahatchee','Nuevas casas y residencias'),('Aventura','Espacios comerciales y profesionales')]}
 },
 'palm-beach':{
   'en':{'path':'/florida/palm-beach/','alt':'/es/florida/palm-beach/','title':'Palm Beach Real Estate | Inversiones Davar','desc':'Browse residential opportunities in Palm Beach, Florida with images, key property details and direct advisor contact.','h1':'Palm Beach real estate.','intro':'Explore the currently published Palm Beach opportunity in a visual format built for quick evaluation.','image':'/assets/img/properties/residential-construction-projects-in-palm-beach-6.webp','points':[('Residential','Single-story opportunity'),('Florida','Palm Beach location'),('Direct inquiry','Advisor contact by WhatsApp')]},
   'es':{'path':'/es/florida/palm-beach/','alt':'/florida/palm-beach/','title':'Propiedades en Palm Beach, Florida | Inversiones Davar','desc':'Explora oportunidades residenciales en Palm Beach, Florida con imágenes, características y contacto directo.','h1':'Propiedades en Palm Beach.','intro':'Explora la oportunidad actualmente publicada en Palm Beach mediante un formato visual pensado para evaluar rápido.','image':'/assets/img/properties/residential-construction-projects-in-palm-beach-6.webp','points':[('Residencial','Oportunidad de una planta'),('Florida','Ubicación Palm Beach'),('Consulta directa','Contacto por WhatsApp')]}
 },
 'loxahatchee':{
   'en':{'path':'/florida/loxahatchee/','alt':'/es/florida/loxahatchee/','title':'Loxahatchee Homes | Inversiones Davar','desc':'Explore residential homes in Loxahatchee, Florida through Davar’s visual property portfolio.','h1':'Homes in Loxahatchee.','intro':'Compare current residential options, layouts and imagery before requesting more information.','image':'/assets/img/properties/great-residential-house-in-loxahatchee-fl-17.webp','points':[('Residential','Current house opportunities'),('Layouts','3 and 4 bedroom options'),('Direct inquiry','Advisor contact by WhatsApp')]},
   'es':{'path':'/es/florida/loxahatchee/','alt':'/florida/loxahatchee/','title':'Casas en Loxahatchee, Florida | Inversiones Davar','desc':'Explora casas residenciales en Loxahatchee, Florida dentro del portafolio visual de Inversiones Davar.','h1':'Casas en Loxahatchee.','intro':'Compara las opciones residenciales actuales, sus distribuciones e imágenes antes de solicitar más información.','image':'/assets/img/properties/great-residential-house-in-loxahatchee-fl-17.webp','points':[('Residencial','Opciones de casas actuales'),('Distribuciones','Opciones de 3 y 4 habitaciones'),('Consulta directa','Contacto por WhatsApp')]}
 },
 'aventura':{
   'en':{'path':'/florida/aventura/','alt':'/es/florida/aventura/','title':'Aventura Commercial Real Estate | Vitalis Tower | Davar','desc':'Discover Vitalis Tower in Aventura, Florida: medical and professional spaces presented through a visual project experience.','h1':'Aventura projects.','intro':'Discover Vitalis Tower through renders, amenities and project highlights, with detailed location information available through inquiry.','image':'/assets/img/properties/vitalis-tower-project-13.webp','points':[('Commercial','Medical and professional spaces'),('Amenities','Lobby, meeting room, gym and sauna'),('Aventura','Florida project')]},
   'es':{'path':'/es/florida/aventura/','alt':'/florida/aventura/','title':'Proyectos comerciales en Aventura | Vitalis Tower | Davar','desc':'Descubre Vitalis Tower en Aventura, Florida: espacios médicos y profesionales presentados en una experiencia visual.','h1':'Proyectos en Aventura.','intro':'Descubre Vitalis Tower mediante renders, amenidades y elementos clave, con información detallada de ubicación disponible al consultar.','image':'/assets/img/properties/vitalis-tower-project-13.webp','points':[('Comercial','Espacios médicos y profesionales'),('Amenidades','Lobby, meeting room, gym y sauna'),('Aventura','Proyecto en Florida')]}
 }
}

def location_page(key,lang='en'):
    d=location_data[key][lang]; es=lang=='es'; path=d['path']; alt=d['alt']
    parent=[('Inicio' if es else 'Home','/es/' if es else '/')]
    if key!='florida': parent += [('Florida','/es/florida/' if es else '/florida/')]
    parent += [(key.replace('-',' ').title() if key!='florida' else 'Florida',path)]
    if key=='florida': subset=props
    else: subset=[p for p in props if route_map[p['slug']]['location']==key]
    item_schema={'@context':'https://schema.org','@type':'ItemList','name':d['h1'],'itemListElement':[{'@type':'ListItem','position':i+1,'url':absurl(route_map[p['slug']][lang]),'name':copy[p['slug']][lang]['title']} for i,p in enumerate(subset)]}
    h=head(lang,d['title'],d['desc'],path,alt,image=d['image'],schemas=[breadcrumb_schema(parent),item_schema])+header(lang,alt)
    h+=f'''<main id="main"><section class="location-hero"><img class="hero-bg" src="{d['image']}" alt="{esc(key.replace('-',' ').title())}" loading="eager" decoding="async"><div class="container">{breadcrumbs(parent)}<span class="eyebrow light">Florida · {esc(key.replace('-',' ').title()) if key!='florida' else ('Portafolio' if es else 'Portfolio')}</span><h1>{d['h1']}</h1><p>{d['intro']}</p><div class="location-actions"><a class="btn btn-gold" href="{'/es/propiedades/' if es else '/properties/'}">{'Ver portafolio' if es else 'View portfolio'}</a><a class="btn btn-ghost" href="{'/es/#contacto' if es else '/#contact'}">{'Solicitar información' if es else 'Request information'}</a></div></div></section><section class="section"><div class="container location-intro"><div class="location-intro-copy" data-reveal><span class="eyebrow">{'Descubrir' if es else 'Discover'}</span><h2>{'Una experiencia de búsqueda más simple.' if es else 'A simpler way to search.'}</h2><p>{d['desc']}</p></div><div class="location-points">'''+''.join(f'<div class="location-point" data-reveal><i class="fa-solid fa-check"></i><span><strong>{esc(a)}</strong><span>{esc(b)}</span></span></div>' for a,b in d['points'])+'''</div></div></section>'''
    if subset:
        h+=f'''<section class="section section-soft"><div class="container"><div class="section-head"><div class="section-head-copy"><span class="eyebrow">{'Propiedades' if es else 'Properties'}</span><h2>{'Oportunidades publicadas' if es else 'Published opportunities'}</h2></div></div><div class="property-grid">{''.join(property_card(p,lang) for p in subset)}</div></div></section>'''
    h += contact_section(lang)+'</main>'+footer(lang)
    return h


def honduras_page(lang='en'):
    es=lang=='es'; path='/es/honduras/' if es else '/honduras/'; alt='/honduras/' if es else '/es/honduras/'
    title='Inversiones inmobiliarias en Honduras | Inversiones Davar' if es else 'Real Estate Opportunities in Honduras | Inversiones Davar'
    desc='Conoce la línea de oportunidades inmobiliarias de Inversiones Davar en Honduras y solicita información sobre disponibilidad.' if es else 'Discover Inversiones Davar real estate opportunities in Honduras and request current availability.'
    bc=[('Inicio' if es else 'Home','/es/' if es else '/'),('Honduras',path)]
    h=head(lang,title,desc,path,alt,image='/assets/img/hero-honduras.webp',schemas=[breadcrumb_schema(bc)])+header(lang,alt)
    h+=f'''<main id="main"><section class="location-hero"><img class="hero-bg" src="/assets/img/hero-honduras.webp" alt="Honduras" width="1800" height="1012"><div class="container">{breadcrumbs(bc)}<span class="eyebrow light">Honduras</span><h1>{'Oportunidades en Honduras.' if es else 'Opportunities in Honduras.'}</h1><p>{'Una línea complementaria para clientes que desean evaluar inversión inmobiliaria en Centroamérica con acompañamiento directo.' if es else 'A complementary portfolio for clients evaluating real estate investment in Central America with direct guidance.'}</p><div class="location-actions"><a class="btn btn-gold" href="{'/es/#contacto' if es else '/#contact'}">{'Consultar oportunidades' if es else 'Ask about opportunities'}</a></div></div></section><section class="section"><div class="container split-feature"><div class="feature-image"><img src="/assets/img/honduras-investments.webp" alt="Honduras real estate" loading="lazy"><span class="image-label">Honduras</span></div><div class="split-copy"><span class="eyebrow">{'Portafolio bajo consulta' if es else 'Portfolio by inquiry'}</span><h2>{'Descubre disponibilidad actual.' if es else 'Discover current availability.'}</h2><p>{'En lugar de mostrar inventario desactualizado, esta sección dirige la consulta hacia las oportunidades activas y la información vigente.' if es else 'Instead of displaying stale inventory, this section directs you to currently active opportunities and up-to-date information.'}</p><div class="actions"><a class="btn btn-primary" href="https://wa.me/13059304423" target="_blank" rel="noopener">WhatsApp</a></div></div></div></section>{contact_section(lang)}</main>{footer(lang)}'''
    return h


def property_page(p,lang='en'):
    es=lang=='es'; c=copy[p['slug']][lang]; r=route_map[p['slug']]; path=r[lang]; alt=r['en' if es else 'es']; img='/'+p['images'][0]['src']
    area_name='Aventura' if r['location']=='aventura' else ('Palm Beach' if r['location']=='palm-beach' else 'Loxahatchee')
    parent=[('Inicio' if es else 'Home','/es/' if es else '/'),('Florida','/es/florida/' if es else '/florida/'),(area_name,('/es' if es else '')+f'/florida/{r["location"]}/'),(c['title'],path)]
    title=f"{c['title']} | Inversiones Davar"
    desc=c['summary']
    schema_type='OfficeBuilding' if r['type']=='commercial' else 'SingleFamilyResidence'
    schema={'@context':'https://schema.org','@type':schema_type,'name':c['title'],'url':absurl(path),'description':desc,'image':[absurl('/'+x['src']) for x in p['images'][:8]],'address':{'@type':'PostalAddress','addressLocality':area_name,'addressRegion':'FL','addressCountry':'US'}}
    if p.get('bedrooms'):
        m=re.search(r'\d+',p['bedrooms']);
        if m: schema['numberOfBedrooms']=int(m.group())
    if p.get('bathrooms'):
        m=re.search(r'\d+',p['bathrooms']);
        if m: schema['numberOfBathroomsTotal']=int(m.group())
    if p.get('area'):
        m=re.search(r'[\d,]+',p['area']);
        if m: schema['floorSize']={'@type':'QuantitativeValue','value':int(m.group().replace(',','')),'unitCode':'FTK'}
    h=head(lang,title,desc,path,alt,image=img,schemas=[breadcrumb_schema(parent),schema])+header(lang,alt)
    imgs=[{'src':'/'+x['src'],'alt':c['title']+' '+str(i+1)} for i,x in enumerate(p['images'])]
    facts=[]
    if p.get('bedrooms'): facts.append(('fa-bed','Bedrooms' if not es else 'Habitaciones',p['bedrooms']))
    if p.get('bathrooms'): facts.append(('fa-bath','Bathrooms' if not es else 'Baños',p['bathrooms']))
    if p.get('area'): facts.append(('fa-ruler-combined','Area',p['area']))
    facts.append(('fa-location-dot','Location' if not es else 'Ubicación',p['city']))
    thumbs=''.join(f'<button class="gallery-thumb" type="button" data-gallery-thumb aria-label="{i+1}"><img src="{x["src"]}" alt="" loading="lazy"></button>' for i,x in enumerate(imgs[:6]))
    related=[x for x in props if x['slug']!=p['slug']][:3]
    h+=f'''<main id="main"><section class="property-header"><div class="container">{breadcrumbs(parent)}<div class="property-title"><div><span class="eyebrow">{esc(c['type'])} · {esc(p['city'])}</span><h1>{esc(c['title'])}</h1><p>{esc(c['summary'])}</p></div><div class="property-title-actions"><a class="btn btn-outline btn-sm" href="https://wa.me/13059304423" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i>{'Consultar' if es else 'Inquire'}</a></div></div></div></section><section><div class="container"><div class="gallery" data-gallery data-images='{esc(json.dumps(imgs,ensure_ascii=False))}'><div class="gallery-main"><img data-gallery-main src="{imgs[0]['src']}" alt="{esc(c['title'])}" width="1400" height="788" fetchpriority="high" decoding="async"><span class="gallery-count" data-gallery-count></span><div class="gallery-controls"><button class="gallery-control" type="button" data-gallery-prev aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button><button class="gallery-control" type="button" data-gallery-next aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button></div></div><div class="gallery-thumbs">{thumbs}</div></div></div></section><section class="section"><div class="container property-layout"><article class="property-content"><span class="eyebrow">{'Descripción' if es else 'Overview'}</span><h2>{'Lo esencial, sin exceso de texto.' if es else 'The essentials, without the overload.'}</h2><p>{esc(c['summary'])}</p><div class="fact-grid">'''+''.join(f'<div class="fact-card"><i class="fa-solid {icon}"></i><strong>{esc(value)}</strong><span>{esc(label)}</span></div>' for icon,label,value in facts)+f'''</div><span class="eyebrow">{'Características' if es else 'Highlights'}</span><div class="highlights">{''.join(f'<div class="highlight"><i class="fa-solid fa-check"></i>{esc(x)}</div>' for x in c['highlights'])}</div></article><aside class="inquiry-card"><span class="eyebrow">{'Información' if es else 'Request details'}</span><h3>{'¿Quieres conocer disponibilidad y condiciones?' if es else 'Want availability and current terms?'}</h3><p>{'Habla directamente con un asesor de Inversiones Davar para recibir información vigente sobre este proyecto.' if es else 'Connect directly with an Inversiones Davar advisor for current information about this opportunity.'}</p><div class="facts"><span><i class="fa-solid fa-location-dot"></i>{esc(p['city'])}</span><span><i class="fa-solid fa-tag"></i>{'Precio a consultar' if es else 'Price upon request'}</span></div><a class="btn btn-gold btn-full" href="https://wa.me/13059304423?text={('Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20' if es else 'Hello%2C%20I%20would%20like%20information%20about%20')+esc(c['title']).replace(' ','%20')}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i>{'Solicitar información' if es else 'Request information'}</a><p class="disclaimer">{'Disponibilidad, precios y condiciones están sujetos a verificación.' if es else 'Availability, pricing and terms are subject to verification.'}</p></aside></div></section><section class="section section-soft related-section"><div class="container"><div class="section-head"><div class="section-head-copy"><span class="eyebrow">{'También puedes explorar' if es else 'You may also explore'}</span><h2>{'Otras propiedades' if es else 'Other properties'}</h2></div></div><div class="property-grid">{''.join(property_card(x,lang) for x in related)}</div></div></section></main><div class="lightbox" data-lightbox aria-hidden="true"><button class="lightbox-close" type="button" data-lightbox-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button><img data-lightbox-image src="" alt=""></div>{footer(lang)}'''
    return h

# Core pages
write_page('/', home('en')); write_page('/es/', home('es'))
write_page('/properties/', portfolio_page('en')); write_page('/es/propiedades/', portfolio_page('es'))
for key in location_data:
    write_page(location_data[key]['en']['path'], location_page(key,'en'))
    write_page(location_data[key]['es']['path'], location_page(key,'es'))
write_page('/honduras/', honduras_page('en')); write_page('/es/honduras/', honduras_page('es'))
for p in props:
    write_page(route_map[p['slug']]['en'], property_page(p,'en'))
    write_page(route_map[p['slug']]['es'], property_page(p,'es'))

# English legal pages: concise translation, self-canonical and Spanish alternate.
def legal_en(kind):
    if kind=='privacy':
        path='/privacy-policy.html'; alt='/politica-privacidad.html'; title='Privacy Policy | Inversiones Davar'; heading='Privacy Policy'; text='We use information voluntarily submitted through contact forms or direct communications only to respond to inquiries, provide requested real estate information and improve our service. We do not sell personal information to advertisers. Third-party services such as Google Analytics or WhatsApp may process data under their own policies.'
    else:
        path='/terms-conditions.html'; alt='/terminos-condiciones.html'; title='Terms & Conditions | Inversiones Davar'; heading='Terms & Conditions'; text='Information on this website is provided for general informational purposes. Property availability, pricing, dimensions, features and terms may change and must be verified with an advisor before making a decision. Website content does not constitute legal, tax or financial advice.'
    desc=text[:155]
    return head('en',title,desc,path,alt,robots='noindex, follow')+header('en',alt)+f'<main id="main"><section class="section"><div class="container" style="max-width:820px"><span class="eyebrow">Inversiones Davar</span><h1 style="font-family:Georgia,serif;font-weight:500;color:var(--navy);font-size:clamp(2.5rem,6vw,4rem)">{heading}</h1><p class="section-lead">{text}</p><p class="section-lead">For questions, contact <a class="text-link" href="mailto:realestate.davar@gmail.com">realestate.davar@gmail.com</a>.</p></div></section></main>'+footer('en')
(ROOT/'privacy-policy.html').write_text(legal_en('privacy'),encoding='utf-8'); (ROOT/'terms-conditions.html').write_text(legal_en('terms'),encoding='utf-8')

# Error pages: GitHub Pages serves 404.html with an actual 404 response for unknown URLs.
def error_page(code):
    title='Page not found' if code==404 else 'Server error'
    msg='The page may have moved or the address may be incorrect.' if code==404 else 'An unexpected error occurred. Please try again from the home page.'
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{code} | Inversiones Davar</title><meta name="robots" content="noindex, follow"><link rel="icon" href="/assets/icons/favicon.svg"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"><link rel="stylesheet" href="/assets/css/davar.css"></head><body><main class="error-page"><section class="error-card"><div class="error-code">{code}</div><h1>{title}</h1><p>{msg}</p><p>Español: La página no está disponible en esta dirección.</p><div class="error-actions"><a class="btn btn-primary" href="/">English home</a><a class="btn btn-outline" href="/es/">Inicio en español</a><a class="btn btn-outline" href="/properties/">Properties</a></div></section></main></body></html>'''
(ROOT/'404.html').write_text(error_page(404),encoding='utf-8'); (ROOT/'500.html').write_text(error_page(500),encoding='utf-8')

# Legacy property URLs: preserve old links while directing visitors/search engines to the Spanish canonical hierarchy.
def redirect_stub(target,title='Moved | Inversiones Davar'):
    return f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="{absurl(target)}"><meta http-equiv="refresh" content="0;url={target}"><script>location.replace({json.dumps(target)});</script></head><body><p>Esta página se movió. <a href="{target}">Continuar</a>.</p></body></html>'''
write_page('/propiedades/', redirect_stub('/es/propiedades/'))
for p in props:
    write_page('/propiedades/'+p['slug']+'/', redirect_stub(route_map[p['slug']]['es'],copy[p['slug']]['es']['title']))

# Sitemap: only canonical/indexable pages plus existing Spanish blog. No legacy redirects/errors/admin.
canonical_paths=['/','/es/','/properties/','/es/propiedades/','/florida/','/es/florida/','/florida/palm-beach/','/es/florida/palm-beach/','/florida/loxahatchee/','/es/florida/loxahatchee/','/florida/aventura/','/es/florida/aventura/','/honduras/','/es/honduras/']
for p in props: canonical_paths += [route_map[p['slug']]['en'],route_map[p['slug']]['es']]
blog=json.load(open(ROOT/'data/blog.json',encoding='utf-8')) if (ROOT/'data/blog.json').exists() else []
for b in blog:
    if b.get('status','published')!='draft': canonical_paths.append('/'+b.get('url',f"blog/{b['slug']}/").lstrip('/'))
seen=[]
for x in canonical_paths:
    if x not in seen: seen.append(x)
body='\n'.join(f'  <url><loc>{absurl(p)}</loc><lastmod>{TODAY}</lastmod><changefreq>{"weekly" if p in ["/","/es/","/properties/","/es/propiedades/"] else "monthly"}</changefreq><priority>{"1.0" if p=="/" else "0.9" if "properties" in p or "propiedades" in p or "/florida/" in p else "0.7"}</priority></url>' for p in seen)
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+body+'\n</urlset>\n',encoding='utf-8')

pages={"siteUrl":SITE,"editableSlugs":[{"title":"English Home","slug":"/","lang":"en","indexable":True},{"title":"Inicio Español","slug":"/es/","lang":"es","indexable":True},{"title":"Properties","slug":"/properties/","lang":"en","indexable":True},{"title":"Propiedades","slug":"/es/propiedades/","lang":"es","indexable":True},{"title":"Florida","slug":"/florida/","lang":"en","indexable":True},{"title":"Florida ES","slug":"/es/florida/","lang":"es","indexable":True},{"title":"Honduras","slug":"/honduras/","lang":"en","indexable":True},{"title":"Honduras ES","slug":"/es/honduras/","lang":"es","indexable":True}]}
(ROOT/'data/pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')

print('Redesign build complete:',len(seen),'canonical URLs')
