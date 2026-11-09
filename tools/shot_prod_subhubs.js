const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const P = [[1, 'svar'], [2, 'zapasy'], [3, 'smarket'], [4, 'hranenie'], [5, 'fabrika'], [6, 'ppraktiki']];
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1300, height: 800 }, deviceScaleFactor: 1 });
  for (const [n, p] of P) { await pg.goto('file://' + path.join(__dirname, `../prod-subhubs-final/preview/${n}-${p}-preview.html`)); await pg.click('button[data-w="1100"]');
    const h = await pg.evaluate(() => document.getElementById('pv-col').getBoundingClientRect().height); if (h > 6000) throw new Error('>6000 ' + p);
    await pg.locator('#pv-col').screenshot({ path: path.join(__dirname, `../prod-subhubs-final/screens/${n}-${p}-1100.png`) }); console.log(p, Math.round(h)); }
  await b.close(); })();
