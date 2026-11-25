import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
const BASE = process.argv[2] || 'http://localhost:8603/';
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const out = {};
for (const lang of ['en', 'tr']) {
  await p.goto(BASE + lang + '/', { waitUntil: 'networkidle' });
  await p.click('#path .goal[data-i="3"]');
  out[lang + '_goal3'] = await p.isVisible('#path .pslide[data-i="3"]') && await p.getAttribute('#path .goal[data-i="3"]', 'aria-selected');
  await p.click('#path .pnext'); out[lang + '_next'] = await p.getAttribute('#path .goal[data-i="4"]', 'aria-selected');
  await p.click('#program .tile[data-m="2"]'); out[lang + '_module'] = await p.textContent('#program .prog-name');
  out[lang + '_wa'] = await p.$$eval('a[href*="wa.me"]', a => a.length);
}
for (const [from, to] of [['', '/en/'], ['lesson/', '/en/'], ['en/lesson/', '/en/'], ['tr/lesson/', '/tr/']]) { await p.goto(BASE + from, { waitUntil: 'networkidle' }); out['redirect_' + (from || 'root')] = new URL(p.url()).pathname.endsWith(to); }
console.log(JSON.stringify(out)); await b.close();
