const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/pages.json', 'utf8'));
const blog = fs.existsSync('data/blog.json') ? JSON.parse(fs.readFileSync('data/blog.json', 'utf8')) : [];
const properties = fs.existsSync('data/properties.json') ? JSON.parse(fs.readFileSync('data/properties.json', 'utf8')) : [];
const today = new Date().toISOString().slice(0, 10);
const siteUrl = String(data.siteUrl || 'https://inversionesdavar.com').replace(/\/$/, '');

const staticUrls = data.editableSlugs
  .filter(page => page.indexable && page.lang === 'es' && !page.slug.includes('/en/'))
  .map(page => ({
    loc: `${siteUrl}${page.slug}`,
    changefreq: page.slug === '/' ? 'weekly' : 'weekly',
    priority: page.slug === '/' ? '1.0' : (page.slug.includes('propiedades') ? '0.9' : '0.8')
  }));

const blogUrls = blog
  .filter(post => (post.status || 'published') !== 'draft')
  .map(post => ({
    loc: `${siteUrl}/${(post.url || `blog/${post.slug}/`).replace(/^\/+/, '')}`,
    changefreq: 'monthly',
    priority: '0.7'
  }));

const propertyUrls = properties
  .filter(item => (item.status || 'published') !== 'draft')
  .map(item => ({
    loc: `${siteUrl}/${(item.url || `propiedades/${item.slug}/`).replace(/^\/+/, '')}`,
    changefreq: 'weekly',
    priority: '0.8'
  }));

const seen = new Set();
const urls = [...staticUrls, ...blogUrls, ...propertyUrls].filter(item => {
  if (seen.has(item.loc) || item.loc.includes('/en/')) return false;
  seen.add(item.loc);
  return true;
});

const body = urls.map(item => `  <url>\n    <loc>${item.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>`).join('\n');
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
console.log('sitemap.xml generated for modular landing, blog and property SEO pages');
