import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const siteUrl = new URL(process.env.SS_SITE_URL || 'https://findyourmargin.com/sunshinesmiles/');
if (siteUrl.protocol !== 'https:' || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) {
  throw new Error('SS_SITE_URL must be an HTTPS URL without credentials, a query, or a fragment.');
}
siteUrl.pathname = siteUrl.pathname.replace(/\/?$/, '/');
const base = siteUrl.href;
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
for (const name of pages) {
  let html = fs.readFileSync(path.join(root, name), 'utf8');
  const url = base + (name === 'index.html' ? '' : name);
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const description = html.match(/name="description" content="([^"]+)"/)[1];
  for (const asset of ['site.css', 'site.js', 'support.js', 'vendor/react.production.min.js', 'vendor/react-dom.production.min.js']) {
    const version = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, asset))).digest('hex').slice(0, 12);
    html = html.replace(`"${asset}"`, `"${asset}?v=${version}"`).replace(`"./${asset}"`, `"${asset}?v=${version}"`);
  }
  html = html.replace(/<link rel="canonical"[^>]+>/, `<link rel="canonical" href="${url}">`);
  html = html.replace('</head>', `<meta name="robots" content="noindex, nofollow">\n<meta property="og:type" content="website">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">\n<meta property="og:url" content="${url}">\n<meta property="og:image" content="${base}images/sunshine-staff/family_orig.jpg">\n<meta name="twitter:card" content="summary_large_image">\n</head>`);
  fs.writeFileSync(path.join(out, name), html);
}
for (const name of ['support.js', 'site.js', 'site.css', 'contact.php', 'sunshine-smiles-site-tour.mp4']) {
  fs.copyFileSync(path.join(root, name), path.join(out, name));
}
const familyDocuments = new Set([
  'parent-handbook-2026.pdf',
  'summary-of-laws-rules-nc.pdf',
  'holiday-closings-2026.pdf',
  'rates-fees-2026.pdf'
]);
for (const name of ['images', 'documents', 'vendor']) {
  fs.cpSync(path.join(root, name), path.join(out, name), {
    recursive: true,
    filter: source => !['.DS_Store', 'manifest.json'].includes(path.basename(source))
      && (name !== 'documents' || fs.statSync(source).isDirectory() || familyDocuments.has(path.basename(source)))
  });
}
const subfolderRedirect = siteUrl.pathname === '/' ? '' : `<IfModule mod_rewrite.c>\n  DirectorySlash Off\n  RewriteOptions AllowNoSlash\n  RewriteEngine On\n  RewriteCond %{REQUEST_URI} ^${siteUrl.pathname.slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$\n  RewriteRule ^ ${base} [R=301,L]\n</IfModule>\n`;
fs.writeFileSync(path.join(out, '.htaccess'), `Options -Indexes\nDirectoryIndex index.html\n${subfolderRedirect}<IfModule mod_headers.c>\n  Header set X-Robots-Tag "noindex, nofollow"\n  Header set X-Content-Type-Options "nosniff"\n</IfModule>\n`);
const files = {};
function inventory(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) inventory(full);
    else files[path.relative(out, full).split(path.sep).join('/')] = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  }
}
inventory(out);
fs.writeFileSync(path.join(out, 'release.json'), JSON.stringify({ site: 'sunshine-smiles', base, files }, null, 2) + '\n');
console.log(`Built ${pages.length} pages and ${Object.keys(files).length} public files in dist/.`);
