const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 800 }, deviceScaleFactor: 1 });
  for (const pre of ['inzh-hub', 'inzh-pra']) {
    await p.goto('file://' + path.join(__dirname, `../inzh-final/preview/${pre}-preview.html`)); await p.click('button[data-w="1100"]');
    await p.locator('#pv-col').screenshot({ path: path.join(__dirname, `../inzh-final/screens/${pre}-1100.png`) }); }
  await b.close(); })();
