// QA: ширины 1440/834/390, обе версии. Звук выключен (--mute-audio).
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
const BASE = process.argv[2] || 'http://localhost:8603/';
const OUT = new URL('./shots/', import.meta.url).pathname;
const widths = [1440, 834, 390];
const pages = [['full', ''], ['lesson', 'lesson/']];
const browser = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const report = [];
for (const [name, path] of pages) for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  // прокрутка, чтобы сработали lazy и reveal
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 140)); } window.scrollTo(0, 0); document.querySelectorAll(".reveal").forEach(e => e.classList.add("in")); });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const imgs = [...document.images];
    const wide = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.right > document.documentElement.clientWidth + 1 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 8).map(e => e.className || e.tagName);
    return {
      scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth,
      imgs: imgs.length, broken: imgs.filter(i => !i.closest("[hidden]") && !(i.complete && i.naturalWidth > 0)).map(i => i.getAttribute('src')),
      lava: [...document.querySelectorAll('a[href*="lava.top"]')].map(a => a.href),
      blocks: [...document.querySelectorAll('[data-block]')].map(s => s.dataset.block),
      height: document.body.scrollHeight, wide
    };
  });
  await page.screenshot({ path: `${OUT}${name}-${w}-top.png` });
  await page.screenshot({ path: `${OUT}${name}-${w}-full.png`, fullPage: true });
  for (const id of ['authors', 'inside', 'price']) {
    const el = await page.$('#' + id);
    if (el) await el.screenshot({ path: `${OUT}${name}-${w}-${id}.png` });
  }
  report.push({ name, w, ...r, errors });
  await ctx.close();
}
await browser.close();
for (const r of report) console.log(JSON.stringify({ page: r.name, w: r.w, scrollWidth: r.scrollWidth, ok: r.scrollWidth === r.w, imgs: r.imgs, broken: r.broken, lava: r.lava.length, uniqLava: [...new Set(r.lava)], blocks: r.blocks.length, height: r.height, wide: r.wide, errors: r.errors }));
