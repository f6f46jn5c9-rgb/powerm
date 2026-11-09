const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 800 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, '../izm-final/preview/izm-preview.html')); await p.click('button[data-w="1100"]');
  await p.locator('#pv-col').screenshot({ path: path.join(__dirname, '../izm-final/screens/izm-1100.png') }); await b.close(); })();
