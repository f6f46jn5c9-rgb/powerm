// Снимки вариантов для bup-landing-final/screens: колонка 1100 px, полная высота, DSF 2.
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  for (const v of ['1K', '1KA', '2K', '6K']) {
    const p = await b.newPage({ viewport: { width: 1164, height: 900 }, deviceScaleFactor: 2 });
    await p.goto('file://' + path.resolve(__dirname, 'landing_harness/page-' + v + '.html') + '?tree=0');
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 600) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(80); }
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForFunction(() => !document.querySelector('[data-bupk] .k-sk'), null, { timeout: 6000 }).catch(() => {});
    await p.waitForTimeout(500);
    const col = await p.evaluate(() => { const c = document.getElementById('col').getBoundingClientRect(); return { x: c.left + 32, y: c.top + 32 + 96, w: c.width - 64, h: c.height - 64 - 96 }; });
    await p.screenshot({ path: path.join(out, v + '-1100.png'), clip: { x: col.x, y: col.y, width: col.w, height: col.h }, fullPage: true });
    console.log(v, col.w);
    await p.close();
  }
  await b.close();
})();
