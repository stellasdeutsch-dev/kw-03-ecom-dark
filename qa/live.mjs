// Проверка 4а «Живой сайт»: целые страницы 1440 и 390 (по секциям, склеиваются в live-*.jpg),
// прогон с reducedMotion: 'reduce' и без JS (весь контент должен быть виден сразу). Звук выключен.
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
const BASE = 'http://localhost:8603/';
const OUT = new URL('./shots/', import.meta.url).pathname;
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });

// сколько элементов не видно сразу (opacity < 0.99) и что показывают счётчики
async function hiddenNow(p) {
  return p.evaluate(() => {
    const all = [...document.querySelectorAll('#app *')].filter(e => !e.closest('[hidden]'));
    const hid = all.filter(e => +getComputedStyle(e).opacity < 0.99 && !e.closest('.fcard, .pie-l, .hero-word, .bg-word')).map(e => e.className.baseVal ?? e.className);
    return { hidden: hid.length, sample: [...new Set(hid)].slice(0, 6), counts: [...document.querySelectorAll('.count')].map(c => c.textContent), blocks: document.querySelectorAll('[data-block]').length };
  });
}

const res = [];
for (const lang of ['en', 'tr']) {
  // 1. без движения
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  let p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(BASE + lang + '/', { waitUntil: 'networkidle' });
  res.push({ lang, mode: 'reduce', ...(await hiddenNow(p)), errs });
  await ctx.close();
  // 2. без JS
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  p = await ctx.newPage();
  await p.goto(BASE + lang + '/', { waitUntil: 'networkidle' });
  res.push({ lang, mode: 'nojs', ...(await hiddenNow(p)) });
  await ctx.close();
  // 3. с движением: до прокрутки внизу всё спрятано, после прокрутки всё появилось
  for (const w of [1440, 390]) {
    ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'no-preference' });
    p = await ctx.newPage(); const e2 = [];
    p.on('pageerror', e => e2.push(String(e))); p.on('console', m => m.type() === 'error' && e2.push(m.text()));
    await p.goto(BASE + lang + '/', { waitUntil: 'networkidle' });
    const before = await hiddenNow(p);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 160)); } });
    await p.waitForTimeout(2500);
    const after = await hiddenNow(p);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    const ids = await p.evaluate(() => [...document.querySelectorAll('[data-block]')].map(s => s.id));
    let i = 0;
    for (const id of ids) await (await p.$('#' + id)).screenshot({ path: `${OUT}live-${lang}-${w}-${String(i++).padStart(2, '0')}.png` });
    res.push({ lang, mode: 'motion', w, scrollWidth: sw, hiddenBefore: before.hidden, hiddenAfter: after.hidden, sampleAfter: after.sample, counts: after.counts, errs: e2 });
    await ctx.close();
  }
}
await b.close();
for (const r of res) console.log(JSON.stringify(r));
