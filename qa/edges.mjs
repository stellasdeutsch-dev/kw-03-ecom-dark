// Край вырезок в увеличении на фоне сайта: node qa/edges.mjs <base> <tag>
import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
const [,, BASE, TAG] = process.argv;
const OUT = new URL('./edges/', import.meta.url).pathname;
const items = [
  ['en/', '.hero-person img', 0, 'en-hero'], ['en/', '.res-person img', 0, 'en-result'], ['en/', '.au-person img', 0, 'en-author'],
  ['en/', '.cube-img', 0, 'who-1'], ['en/', '.cube-img', 2, 'who-3'], ['en/', '.cube-img', 4, 'who-5'], ['en/', '.why-circle img', 0, 'why-1'],
  ['tr/', '.hero-person img', 0, 'tr-hero'], ['tr/', '.res-person img', 0, 'tr-result'], ['tr/', '.au-person img', 0, 'tr-author'], ['tr/', '.m-person img', 0, 'tr-mentor']];
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const p = await ctx.newPage(); let cur = '';
for (const [path, sel, idx, name] of items) {
  if (cur !== path) { await p.goto(BASE + path, { waitUntil: 'networkidle' }); cur = path; }
  const el = (await p.$$(sel))[idx]; if (!el) { console.log('missing', name); continue; }
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const bb = await el.boundingBox(); const h = Math.min(bb.height * 0.4, 260);
  await p.screenshot({ path: `${OUT}${name}-${TAG}.png`, clip: { x: bb.x - 20, y: bb.y + 2, width: bb.width + 40, height: h } });
}
await b.close(); console.log('done', TAG);
