// Снимки комплекса ssbyt: колонка 1100 px, полная высота -> ssbyt-final/screens/*.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const R = path.resolve(__dirname, '..'), OUT = path.join(R, 'ssbyt-final/screens');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1300, height: 900 }, deviceScaleFactor: 2 });
  for (const k of ['hub','tkp','voronka','servis','auto','org','budget']) {
    await pg.goto('file://' + path.join(R, `preview/ssbyt-preview-${k}.html`));
    await pg.click('button[data-w="1100"]'); await pg.addStyleTag({ content: '.pv-bar,.cap{display:none !important}.pv-body{padding:0 !important;background:#fff !important}' });
    await pg.waitForTimeout(500); const col = pg.locator('#pv-col'); const h = (await col.boundingBox()).height;
    await col.screenshot({ path: path.join(OUT, `ssbyt-${k}.png`) }); console.log(k, Math.round(h));
  }
  await b.close();
})();
