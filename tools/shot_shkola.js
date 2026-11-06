// Скриншот предпросмотра «БССМ. Школа»: колонка 1100 px, полная высота. Запуск: node tools/shot_shkola.js <preview.html> <out.png>
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1300, height: 900 }, deviceScaleFactor: 1 });
  await pg.goto('file://' + path.resolve(process.argv[2])); await pg.click('button[data-w="1100"]'); await pg.waitForTimeout(200);
  await (await pg.$('#pv-col')).screenshot({ path: process.argv[3] }); await b.close(); })();
