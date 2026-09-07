# Inversiones Davar — Rediseño 2026

Sitio estático preparado para GitHub Pages con arquitectura bilingüe real y SEO técnico.

## Estructura pública

- `/` — Home principal en inglés.
- `/es/` — Home en español.
- `/properties/` y `/es/propiedades/` — Portafolio visual y filtros.
- `/florida/` y `/es/florida/` — Hub de Florida.
- `/florida/palm-beach/`, `/florida/loxahatchee/`, `/florida/aventura/` — hubs geográficos.
- Cada propiedad tiene URL jerárquica EN/ES, canonical propio, `hreflang` y Breadcrumb Schema.
- Las antiguas URLs `/propiedades/.../` permanecen como compatibilidad `noindex` y redirigen a la nueva URL española.
- `/404.html` está preparado para el 404 real que devuelve GitHub Pages en rutas inexistentes.

## SEO

Las páginas indexables usan canonical absoluto, `hreflang` EN/ES + `x-default`, Open Graph, Twitter Cards y JSON-LD según contexto (`RealEstateAgent`, `WebSite`, `BreadcrumbList`, `ItemList`, `SingleFamilyResidence` u `OfficeBuilding`).

`robots.txt` excluye `admin`, `src` y `scripts`. `sitemap.xml` contiene solo URLs canónicas, no redirects ni errores.

## Rendimiento

Los assets principales se optimizaron a WebP. El hero de más de 10 MB fue sustituido por una versión de alrededor de 430 KB. Las imágenes de contenido usan lazy loading salvo el LCP/hero de cada página.

## Desarrollo local

```bash
npm install
npm run serve
```

Abrir `http://localhost:8080/`.

## Regenerar sitemap

```bash
npm run sitemap
```

## Regenerar la arquitectura pública

El script usado para las páginas bilingües está en:

```bash
python scripts/build-redesign.py
```

El panel `/admin/` es una herramienta local heredada para editar `data/blog.json`, `data/properties.json` e imágenes. Después de editar propiedades desde el panel, ejecutar `python scripts/build-redesign.py` antes de publicar para reconstruir las rutas bilingües y el sitemap canónico.

## Publicación

El dominio está definido por `CNAME` como `inversionesdavar.com`. Se puede publicar el contenido de la raíz directamente en GitHub Pages.
