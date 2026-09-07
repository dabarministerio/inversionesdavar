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



El dominio está definido por `CNAME` como `inversionesdavar.com`. Se puede publicar el contenido de la raíz directamente en GitHub Pages.
