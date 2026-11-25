// Скриншоты по секциям (обходит предел Chrome 16384 px)
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
const [,, w = '390', path = ''] = process.argv;
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto('http://localhost:8603/' + path, { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')); });
await p.waitForTimeout(1200);
const ids = await p.evaluate(() => [...document.querySelectorAll('[data-block]')].map((s, i) => s.id || 'b' + i));
let i = 0;
for (const id of ids) { const el = await p.$('#' + id); await el.screenshot({ path: new URL(`./shots/seg-${w}-${(path||'full').replace('/','')}-${String(i++).padStart(2,'0')}-${id}.png`, import.meta.url).pathname }); }
console.log(ids.join(' '));
await b.close();
