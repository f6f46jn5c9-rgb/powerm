// Снимок страницы: колонка 1100 px, полная высота, Chromium. Если выше 6000 px, делит по границам блоков (-1, -2).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const R = path.resolve(__dirname, '..'), OUT = path.join(R, 'bp-final/screens');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1300, height: 900 } });
  await pg.goto('file://' + path.join(R, 'bp-final/preview/bp.html'));
  await pg.click('button[data-w="1100"]');
  await pg.addStyleTag({ content: '.pv-bar,.cap{display:none !important}.pv-body{background:#fff !important}.pv-col{margin:0 !important;gap:28px !important}' });
  const col = pg.locator('#pv-col'); const h = (await col.boundingBox()).height;
  console.log('высота', h);
  if (h <= 6000) await col.screenshot({ path: path.join(OUT, 'bp-1100.png') });
  else {
    const macs = await pg.$$('.mac'); const boxes = []; for (const m of macs) boxes.push(await m.boundingBox());
    const cb = await col.boundingBox(); const cut = boxes[1].y + boxes[1].height - cb.y;
    await pg.screenshot({ path: path.join(OUT, 'bp-1100-1.png'), fullPage: true, clip: { x: cb.x, y: cb.y, width: cb.width, height: cut } });
    await pg.screenshot({ path: path.join(OUT, 'bp-1100-2.png'), fullPage: true, clip: { x: cb.x, y: cb.y + cut, width: cb.width, height: cb.height - cut } });
  }
  await b.close();
})();
