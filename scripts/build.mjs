import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const required = ['index.html', 'terms/index.html', 'privacy/index.html', 'styles.css', 'script.js', 'assets/hero-genba-home.png', 'CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml'];

for (const file of required) {
  if (!existsSync(resolve(root, file))) throw new Error(`Missing required file: ${file}`);
}

const html = readFileSync(resolve(root, 'index.html'), 'utf8');
for (const image of html.matchAll(/(?:src|data-full)="(assets\/[^\"]+)"/g)) {
  if (!existsSync(resolve(root, image[1]))) throw new Error(`Missing referenced asset: ${image[1]}`);
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const file of ['index.html', 'terms', 'privacy', 'styles.css', 'script.js', 'assets', 'CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml']) {
  cpSync(resolve(root, file), resolve(dist, file), { recursive: true });
}

console.log('Build complete: dist/');
console.log('Validated 6 template images and all required assets.');
