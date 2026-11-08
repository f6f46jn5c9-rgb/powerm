// Скриншоты: колонка 1100 px, полная высота -> champ-final/screens/
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..'); const N = ['champ-hub', 'champ-golos', 'champ-2023', 'champ-2024', 'champ-2025'];
(async () => { const br = await chromium.launch(); fs.mkdirSync(R + '/champ-final/screens', { recursive: true });
  for (const n of N) { const pg = await br.newPage({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 1 });
    await pg.setContent(`<body style="margin:0;background:#fff;font-family:Arial"><div id="w" style="width:1100px;padding:0">${fs.readFileSync(R + '/dist/' + n + '.html', 'utf8')}</div></body>`);
    await pg.waitForTimeout(300); const h = await pg.evaluate(() => Math.ceil(document.getElementById("w").getBoundingClientRect().height)+16);
    await pg.screenshot({ path: `${R}/champ-final/screens/${n}.png`, clip: { x: 0, y: 0, width: 1100, height: h } }); console.log(n, h); await pg.close(); }
  await br.close(); })();
