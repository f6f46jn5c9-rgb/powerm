const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 800 }, deviceScaleFactor: 1 });
  for (const k of ['hub', 'pra', 'sp', 'np', 'ctr', 'nad']) {
    await p.goto('file://' + path.join(__dirname, `../inzh-final/preview/inzh-${k}-preview.html`)); await p.click('button[data-w="1100"]');
    await p.locator('#pv-col').screenshot({ path: path.join(__dirname, `../inzh-final/screens/inzh-${k}-1100.png`) }); }
  await b.close(); })();
