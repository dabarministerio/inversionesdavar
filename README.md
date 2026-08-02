# Inversiones Davar - Web completa estática

Versión de revisión para la web formal de Inversiones Davar S.A. de C.V.

## Incluye

- Home y estructura de 8 páginas principales en español.
- Versión en inglés para hreflang.
- Blog inicial con 3 artículos SEO.
- Página 404, página 500, política de privacidad y términos.
- Sitemap XML, robots.txt, canonical, Open Graph, Twitter Cards, JSON-LD y breadcrumbs.
- Menú responsive mobile-first con hamburger desplegable a la derecha.
- Micro-interacciones con transiciones entre 200 ms y 360 ms.
- Imágenes locales optimizadas, `loading="lazy"`, SVGs ligeros y logo en WebP.
- Formulario conectado a WhatsApp con los datos prellenados.
- Sección de Staff con Yma Avila, Nélida Gómez y Maria Boscan.

## Colores corporativos

- Primary: #10192A
- Secondary: #C59854
- Complement: #F1D28F
- Text: #2c2c2c

## Contacto configurado

- Email: realestate.davar@gmail.com
- Teléfono y WhatsApp: +1 (305) 930-4423

## Cómo revisar

Abre `index.html` en el navegador o, preferiblemente, levanta un servidor local:

```bash
npx http-server . -p 8080 -c-1
```

Luego abre `http://localhost:8080`.

## Notas para producción

1. Reemplazar `https://inversionesdavar.com` por el dominio real si cambia.
2. Revisar textos legales con asesor legal antes de publicar.
3. Cargar propiedades reales con precio, disponibilidad y documentación actualizada.
4. Ejecutar PageSpeed Insights después del despliegue real. La versión está optimizada para carga rápida, pero el 100% depende del hosting, caché, CDN y medición final.
5. Regenerar sitemap si se cambian slugs:

```bash
node scripts/generate-sitemap.js
```


## Ajustes de revisión UI/UX
- Menú hamburguesa corregido: drawer lateral derecho, sin desbordamiento horizontal y con scroll interno seguro en móviles pequeños.
- Corrección de accesibilidad: se evita el aviso de `aria-hidden` sobre elementos enfocados usando `inert` y devolviendo el foco al botón del menú al cerrar.
- Agregado switch ES/EN con banderas SVG en escritorio y móvil.
- Rutas internas root-absolute ajustadas para funcionar mejor en `localhost/davar/`.
- Manifest corregido para no solicitar iconos desde `/assets` cuando se prueba dentro de subcarpetas.

## Actualización v3 - Blog/Propiedades administrables

### Correcciones aplicadas
- Switch ES/EN corregido: la versión inglesa principal regresa a `../index.html`, evitando la navegación accidental a `500.html` en local.
- Blog con imágenes en cards y artículos individuales, usando carga diferida en listados y carga prioritaria en la portada del artículo.
- Proyectos/Propiedades ahora se alimenta desde `data/properties.json` y cada card soporta varias fotos en carrusel: swipe táctil en móvil y botones/dots en escritorio.
- Inicio y Blog se alimentan desde `data/blog.json`, por lo que al guardar un artículo desde el panel se actualizan automáticamente los listados.

### Panel interno local
Ruta:

`/admin/index.html`

Uso recomendado en XAMPP/local:
1. Abrir `http://localhost/davar/admin/`.
2. Presionar **Seleccionar carpeta del proyecto** y elegir la carpeta raíz `davar`.
3. Crear artículos o propiedades.
4. El panel guardará archivos estáticos: `data/blog.json`, `data/properties.json`, imágenes optimizadas y páginas HTML de artículos.
5. Subir/commitear la carpeta actualizada a GitHub Pages.

### Importante sobre GitHub Pages
GitHub Pages ejecuta HTML, CSS y JavaScript estático. Por seguridad del navegador, una web publicada en GitHub Pages no puede escribir archivos directamente dentro del repositorio sin backend o autenticación con API. Por eso el panel está preparado para trabajar localmente: genera los archivos estáticos y luego se publican en GitHub.

### Estructura editable
- Blog: `data/blog.json` + páginas dentro de `blog/{slug}/index.html`.
- Propiedades: `data/properties.json` + imágenes dentro de `assets/img/properties/`.
- Imágenes de blog: `assets/img/blog/`.
- Sitemap: el panel regenera `sitemap.xml` al guardar artículos.

## Actualización v4 - Panel admin PHP local

Esta versión reemplaza el panel basado en escritura del navegador por un panel local con PHP para XAMPP.

### Panel interno

Abrir en local:

```txt
http://localhost/davar/admin/
```

Funciones incluidas:

- Crear y editar artículos del blog.
- Subir imagen principal del artículo.
- Crear automáticamente `/blog/<slug>/index.html`.
- Actualizar `data/blog.json`.
- Regenerar `sitemap.xml`.
- Crear y editar propiedades.
- Subir varias fotos por propiedad.
- Actualizar `data/properties.json`.
- Mantener carrusel táctil/click en las cards públicas de propiedades.

### GitHub Pages

La web pública sigue siendo estática y compatible con GitHub Pages. El panel PHP es solo para uso local antes de subir los archivos generados. Recomendación: no publicar `/admin/` si el repositorio será público.

- Nueva página de Inversiones Honduras y versión EN.
- Menú de Inversiones con dropdown para Florida y Honduras.
- Navbar fixed y menú inferior mobile.
