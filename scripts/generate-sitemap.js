const fs = require('fs');
const SITE = 'https://inversionesdavar.com';
const today = new Date().toISOString().slice(0, 10);
const props = fs.existsSync('data/properties.json') ? JSON.parse(fs.readFileSync('data/properties.json','utf8')) : [];
const blogEn = fs.existsSync('data/blog-en.json') ? JSON.parse(fs.readFileSync('data/blog-en.json','utf8')) : (fs.existsSync('data/blog.json') ? JSON.parse(fs.readFileSync('data/blog.json','utf8')) : []);
const blogEs = fs.existsSync('data/blog-es.json') ? JSON.parse(fs.readFileSync('data/blog-es.json','utf8')) : [];
const staticPaths = [
  '/', '/es/', '/properties/', '/es/propiedades/',
  '/florida/', '/es/florida/',
  '/florida/palm-beach/', '/es/florida/palm-beach/',
  '/florida/loxahatchee/', '/es/florida/loxahatchee/',
  '/florida/aventura/', '/es/florida/aventura/',
  '/honduras/', '/es/honduras/'
];
const paths = [...staticPaths, '/blog/', '/es/blog/'];
for (const p of props) {
  if ((p.status || 'published') === 'draft') continue;
  if (p.routes?.en) paths.push(p.routes.en);
  if (p.routes?.es) paths.push(p.routes.es);
}
for (const post of [...blogEn, ...blogEs]) {
  if ((post.status || 'published') === 'draft') continue;
  paths.push('/' + String(post.url || `blog/${post.slug}/`).replace(/^\/+/,''));
}
const seen = [...new Set(paths)];
const xml = seen.map(path => {
  const priority = path === '/' ? '1.0' : (path.includes('/florida/') || path.includes('properties') || path.includes('propiedades')) ? '0.9' : '0.7';
  const freq = ['/', '/es/', '/properties/', '/es/propiedades/'].includes(path) ? 'weekly' : 'monthly';
  return `  <url><loc>${SITE}${path}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
}).join('\n');
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`);
console.log(`sitemap.xml generated with ${seen.length} canonical URLs`);
