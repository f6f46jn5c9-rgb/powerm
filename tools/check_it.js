const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const assert = require('assert');
const R = path.join(__dirname, '..'); const D = path.join(R, 'dist'); const F = path.join(R, 'it-final');
const rd = f => fs.readFileSync(path.join(D, f), 'utf8');
const lum = ([r, g, b]) => { const c = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * c(r) + .7152 * c(g) + .0722 * c(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const PAGES = {
  hub: ['it-hub.html'],
  pra: ['it-pra-1-hero.html', 'it-pra-2-cbl-open.html', '<ul><li><a href="#">Пример материала практики</a></li></ul>', 'it-pra-3-cbl-close.html'],
  dig: ['it-dig-1-hero.html', 'it-dig-2-cbl-open.html', '<ul><li><a href="#">Пример выпуска дайджеста</a></li></ul>', 'it-dig-3-cbl-close.html']
};
const doc = (key, w, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font:14px Arial}#col{width:${w}px}${extra}</style></head><body><div id="col">${PAGES[key].map(x => x.endsWith('.html') ? rd(x) : x).join('\n')}</div></body></html>`;
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
const HUBS = 'https://kb.severstal.com/spaces/BSS/pages/161546386/,https://kb.severstal.com/spaces/BSS/pages/195920114/,https://kb.severstal.com/spaces/BSS/pages/186319055/';
(async () => {
  const b = await chromium.launch();
  for (const [w, vw] of [[1100, 1300], [960, 1200], [820, 1000], [700, 900], [560, 800], [375, 375]]) {
    for (const key of Object.keys(PAGES)) {
      const ctx = await b.newContext({ viewport: { width: vw, height: 900 } }); const pg = await ctx.newPage();
      const errs = [], reqs = [];
      pg.on('console', m => m.type() === 'error' && errs.push(m.text())); pg.on('pageerror', e => errs.push(String(e)));
      pg.on('request', r => { if (!/^(data:|about:)/.test(r.url())) reqs.push(r.url()); });
      await pg.setContent(doc(key, w)); await pg.waitForTimeout(100);
      const sw = await pg.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      ok(sw[0] <= sw[1], `${key}@${w} h-scroll ${sw}`);
      const over = await pg.evaluate(() => [...document.querySelectorAll('#col *')].filter(e => !e.closest('svg') && e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1).map(e => e.className));
      ok(over.length === 0, `${key}@${w} overflow ${over}`);
      ok(!errs.length && !reqs.length, `${key}@${w} errs ${errs} reqs ${reqs}`);
      if (key === 'hub') {
        const cols = await pg.evaluate(() => getComputedStyle(document.querySelector('.it-hub-tiles-section')).gridTemplateColumns.split(' ').length);
        ok(cols === (w < 500 ? 1 : 2), `hub@${w} cols ${cols}`);
        const clip = await pg.evaluate(() => [...document.querySelectorAll('.it-hub-tile__title')].map(e => e.scrollHeight > e.clientHeight + 1));
        ok(!clip.some(Boolean), `hub@${w} title clipped`);
        if (w === 1100 || w === 375) {
          for (const t of await pg.$$('.it-hub-tile__title')) {
            await t.evaluate(e => { e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('text-shadow', 'none', 'important'); });
            const png = await t.screenshot(); await t.evaluate(e => { e.style.removeProperty('color'); e.style.removeProperty('text-shadow'); });
            const px = await pg.evaluate(async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let best = null, bl = -1; for (let i = 0; i < d.length; i += 4) { const l = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]; if (l > bl) { bl = l; best = [d[i], d[i + 1], d[i + 2]]; } } return best; }, png.toString('base64'));
            const c = cr([255, 255, 255], px); ok(c >= 4.5, `contrast ${c.toFixed(2)} @${w} bg ${px}`); console.log('contrast@' + w, c.toFixed(2), px.join(','));
          }
        }
      }
      if (w === 1100) {
        if (key === 'hub') {
          const tile = await pg.$('.it-hub-tile');
          const tileBg = await pg.evaluate(el => el.style.background || 'none', tile); assert(tileBg === 'none' || tileBg === '', 'Tile has own bg: ' + tileBg);
          const cbg = await pg.evaluate(el => { const s = getComputedStyle(el); return s.backgroundImage + '|' + s.backgroundColor; }, tile); ok(cbg === 'none|rgba(0, 0, 0, 0)', 'tile computed bg ' + cbg);
          const fx = await pg.$('.it-hub-tile__fx'); const fxBg = await pg.evaluate(el => getComputedStyle(el).backgroundImage, fx); assert(fxBg.includes('radial-gradient'), 'FX layer missing gradient: ' + fxBg);
          ok(fxBg.includes('rgba(80, 180, 255'), 'fx colour');
          const sec = await pg.evaluate(() => { const s = getComputedStyle(document.querySelector('.it-hub-tiles-section')); return s.backgroundImage + s.backgroundColor; }); ok(sec === 'nonergba(0, 0, 0, 0)', 'section bg ' + sec);
          const h1 = await pg.evaluate(() => getComputedStyle(document.querySelector('.it-hub h1')).color); ok(h1 === 'rgb(0, 91, 142)', 'h1 colour ' + h1);
          const hrefs = await pg.evaluate(() => [...document.querySelectorAll('.it-hub a')].map(a => a.getAttribute('href')));
          ok(hrefs.join() === HUBS.replace('195920114', '195920114'), 'hub hrefs ' + hrefs);
          const crumbC = await pg.evaluate(() => getComputedStyle(document.querySelector('.it-hub-crumb a')).color); console.log('crumb', crumbC);
          await pg.hover('.it-hub-tile'); await pg.waitForTimeout(350);
          const tr = await pg.evaluate(() => getComputedStyle(document.querySelector('.it-hub-tile')).transform); ok(tr !== 'none', 'hover transform');
          await pg.keyboard.press('Tab'); await pg.keyboard.press('Tab');
          const fo = await pg.evaluate(() => getComputedStyle(document.activeElement).outlineStyle); ok(fo === 'solid', 'focus outline ' + fo);
        } else {
          const h = await pg.evaluate(() => { const s = getComputedStyle(document.querySelector('.it-sub h1')); return [s.color, s.fontSize, s.fontWeight, document.querySelector('.it-sub-hero').getBoundingClientRect().height, document.querySelector('.it-sub-crumb a').getAttribute('href'), document.querySelector('.it-cbl-wrap li').closest('.it-cbl-wrap') !== null, getComputedStyle(document.querySelector('.it-cbl-wrap a')).color, document.querySelectorAll('.it-cbl-wrap').length]; });
          ok(h[0] === 'rgb(255, 255, 255)' && h[1] === '22px' && h[2] === '800' && h[3] >= 160 && h[4] === 'https://kb.severstal.com/spaces/BSS/pages/161546386/' && h[5] && h[6] === 'rgb(0, 91, 142)' && h[7] === 1, `${key} hero ${h}`);
        }
      }
      await ctx.close();
    }
  }
  // isolation + reduced motion
  for (const key of ['hub', 'pra']) {
    const pg = await (await b.newContext({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' })).newPage();
    await pg.setContent(doc(key, 1000, 'body{color:red !important;background:black !important}a{color:lime}h1{color:red}'));
    const r = await pg.evaluate(() => { const h = document.querySelector('.it-hub h1,.it-sub h1'); const tile = document.querySelector('.it-hub-tile'); const t = document.querySelector('.it-hub-tile__title'); return [t ? getComputedStyle(t).color : 'n/a', getComputedStyle(h).color, tile ? getComputedStyle(tile).transitionDuration : '0s', tile ? getComputedStyle(tile.querySelector('.it-hub-tile__fx')).backgroundImage.includes('radial') : true]; });
    console.log('isolation', key, r.join(' | '));
    ok(r[3], 'iso fx'); ok(r[0] === 'rgb(255, 255, 255)' || r[0] === 'n/a', 'iso title ' + r[0]);
    ok(key === 'pra' ? r[1] === 'rgb(255, 255, 255)' : r[1] === 'rgb(0, 91, 142)', 'iso h1 ' + r[1]);
    ok(r[2] === '0s', 'reduced motion ' + r[2]);
  }
  // screens (preview pages, column 1100)
  fs.mkdirSync(path.join(F, 'screens'), { recursive: true });
  for (const name of ['1-it-hub', '2-it-pra', '3-it-dig']) {
    const pg = await (await b.newContext({ viewport: { width: 1300, height: 800 }, deviceScaleFactor: 1 })).newPage();
    await pg.goto('file://' + path.join(F, 'preview', name + '-preview.html')); await pg.click('button[data-w="1100"]'); await pg.waitForTimeout(700);
    await pg.locator('#pv-col').screenshot({ path: path.join(F, 'screens', name + '-1100.png') });
  }
  await b.close(); console.log(fails ? 'FAILS ' + fails : 'ALL GREEN'); process.exit(fails ? 1 : 0);
})();
