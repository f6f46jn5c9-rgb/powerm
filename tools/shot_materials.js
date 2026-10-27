// Снимок страницы «Полезные материалы»: колонка 1100 px, полная высота, все три раздела раскрыты, тестовые данные. Chromium.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const R = path.resolve(__dirname, '..'), OUT = path.join(R, 'dbv-materials-final/screens');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1300, height: 900 } });
  await pg.goto('file://' + path.join(R, 'dbv-materials-final/preview/preview.html'));
  await pg.click('button[data-w="1100"]');
  await pg.waitForSelector('.dbv-acc__b');
  await pg.evaluate(() => document.querySelectorAll('.dbv-acc__b').forEach(x => x.click()));
  await pg.addStyleTag({ content: '.pv-bar,.pv-note,.cap{display:none !important}.pv-body{background:#fff !important}.pv-col{margin:0 !important}' });
  await pg.waitForTimeout(400);
  await pg.locator('#pv-col').screenshot({ path: path.join(OUT, 'materials-1100.png') });
  await b.close();
})();
