import { chromium } from '/Users/shyngysnarseyit/Downloads/alterna/pdf-guides/node_modules/playwright/index.mjs';
const b = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8603/', { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
await p.waitForTimeout(1000);
console.log(await p.evaluate(() => {
  const r = [...document.querySelectorAll('.reveal')];
  const who = document.querySelector('.who-top');
  return { total: r.length, inn: r.filter(e => e.classList.contains('in')).length, notIn: r.filter(e => !e.classList.contains('in')).map(e => e.className).slice(0, 10), whoH: who.getBoundingClientRect().height, whoItem: getComputedStyle(document.querySelector('.who-item')).opacity, cubeImg: document.querySelector('.cube-img').getBoundingClientRect().toJSON() };
}));
await b.close();
