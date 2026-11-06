// Снимок хаба «Производство»: колонка 1100 px, полная высота, Chromium. Если выше 6000 px, режет на части (-1, -2).
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const R = path.resolve(__dirname, '..'), OUT = path.join(R, 'hub-production-final/screens');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1300, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto('file://' + path.join(R, 'hub-production-final/preview/hub-production-preview.html'));
  await pg.click('button[data-w="1100"]');
  await pg.addStyleTag({ content: '.pv-bar,.cap{display:none !important}.pv-body{background:#fff !important}' });
  await pg.waitForTimeout(900);
  const col = pg.locator('#pv-col'); const h = (await col.boundingBox()).height; console.log('высота', h);
  if (h <= 6000) await col.screenshot({ path: path.join(OUT, 'hub-production.png') });
  else console.log('нужно резать');
  await b.close();
})();
