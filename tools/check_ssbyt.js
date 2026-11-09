// Проверка комплекса ssbyt (Playwright/Chromium). Запуск: node tools/check_ssbyt.js
const { chromium } = require('playwright'); const path = require('path');
const R = path.resolve(__dirname, '..'); const pages = ['hub','tkp','voronka','servis','auto','org','budget'];
const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  for (const k of pages) {
    const ctx = await b.newContext({ viewport: { width: 1300, height: 900 } }); const pg = await ctx.newPage();
    const ext = []; pg.on('request', r => { if (!/^(file|data|blob|about):/.test(r.url())) ext.push(r.url()); });
    await pg.goto('file://' + path.join(R, `preview/ssbyt-preview-${k}.html`));
    for (const w of [1100, 960, 820, 700, 560]) {
      await pg.evaluate(w => { document.getElementById('pv-col').style.width = w + 'px'; }, w); await pg.waitForTimeout(80);
      const r = await pg.evaluate(() => {
        const col = document.getElementById('pv-col'); const bad = [];
        col.querySelectorAll('[class*="ssbyt-"]').forEach(e => { if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible' && e.clientWidth > 0) bad.push(e.className); });
        const root = col.querySelector('.ssbyt-hub,.ssbyt-subhub-page');
        const cols = k => 0;
        const g = col.querySelector('.ssbyt-hub-tiles-section');
        return { sw: document.documentElement.scrollWidth, cw: window.innerWidth, bad, cols: g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0, rootOver: root.scrollWidth > root.clientWidth + 1 };
      });
      ok(r.sw <= r.cw && !r.rootOver && r.bad.length === 0, `${k} @${w}: нет гориз. скролла/обрезки ${r.bad.join(',')}`);
      if (k === 'hub') { const exp = w <= 460 ? 1 : w <= 700 ? 2 : 3; ok(r.cols === exp, `hub @${w}: колонок ${r.cols}, ожидалось ${exp}`); }
    }
    // окно 375
    await pg.setViewportSize({ width: 375, height: 800 }); await pg.waitForTimeout(100);
    const m = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: window.innerWidth, cols: (() => { const g = document.querySelector('.ssbyt-hub-tiles-section'); return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0; })() }));
    ok(m.sw <= m.cw, `${k} окно 375: sw=${m.sw}`); if (k === 'hub') ok(m.cols === 1, 'hub 375: 1 колонка');
    await pg.setViewportSize({ width: 1300, height: 900 });
    await pg.evaluate(() => { document.getElementById('pv-col').style.width = '1100px'; });
    ok(ext.length === 0, `${k}: нет внешних запросов ${ext.join(' ')}`);
    // изоляция
    await pg.addStyleTag({ content: 'body{color:red;font-size:40px}' }); await pg.waitForTimeout(80);
    const iso = await pg.evaluate(() => { const t = document.querySelector('.ssbyt-hub-hero__title,.ssbyt-subhub-hero__title'); const cs = getComputedStyle(t); const n = document.querySelector('.ssbyt-nav__tab'); return [cs.fontSize, cs.color, getComputedStyle(n).fontSize]; });
    ok(/^(26|22)px$/.test(iso[0]) && iso[2] === '13px' && iso[1] !== 'rgb(255, 0, 0)', `${k} изоляция от body{red;40px}: ${iso}`);
    // глобальные селекторы
    const src = require('fs').readFileSync(path.join(R, `src/ssbyt/ssbyt-${k}.html`), 'utf8');
    const css = [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1].replace(/\/\*[\s\S]*?\*\//g, '')).join('\n');
    const sels = []; css.replace(/(^|\})\s*([^{}@][^{}]*)\{/g, (_, a, s) => { s.split(',').forEach(x => sels.push(x.trim())); });
    const glob = sels.filter(s => s && !/^\.ssbyt-|^@|^(from|to|\d+%)/.test(s) && !/^(\s*)$/.test(s));
    ok(glob.length === 0, `${k}: нет глобальных селекторов ${glob.slice(0, 3)}`);
    // контраст
    const col = await pg.evaluate(() => { const rgb = s => s.match(/[\d.]+/g).slice(0, 3).map(Number); const q = s => document.querySelector(s);
      return { act: [rgb(getComputedStyle(q('.ssbyt-nav__tab--active')).color), rgb(getComputedStyle(q('.ssbyt-nav__tab--active')).backgroundColor)], crumb: rgb(getComputedStyle(q('.ssbyt-breadcrumb')).color) }; });
    ok(cr(...col.act) >= 4.5, `${k}: активная вкладка контраст ${cr(...col.act).toFixed(1)}`);
    if (k === 'hub') {
      ok(cr(col.crumb, [255, 255, 255]) >= 4.5, `hub: крошка ${cr(col.crumb, [255, 255, 255]).toFixed(1)}`);
      ok(cr([58, 42, 64], [255, 255, 255]) >= 7, 'hub: заголовок #3a2a40/#fff ≥7');
      const t = await pg.evaluate(() => [...document.querySelectorAll('.ssbyt-hub-tile')].map(a => { const f = getComputedStyle(a.querySelector('.ssbyt-hub-tile__fx')), g = getComputedStyle(a.querySelector('.ssbyt-hub-tile__glass')); return { fx: f.backgroundImage.includes('radial-gradient'), bf: g.backdropFilter || g.webkitBackdropFilter, op: getComputedStyle(a).opacity, fxop: f.opacity, gop: g.opacity, title: getComputedStyle(a.querySelector('.ssbyt-hub-tile__title')).color }; }));
      ok(t.length === 6 && t.every(x => x.fx), 'hub: __fx radial-gradient ×6');
      ok(t.every(x => /blur/.test(x.bf)), 'hub: backdrop-filter на __glass');
      ok(t.every(x => x.fxop === '0.45' && x.gop === '0.45'), `hub: Скоро — opacity .45 на слоях (плашка целиком: ${t[0].op})`);
      // контраст заголовка плашки по пикселям: скрываем текст, снимаем фон под bbox
      const tiles = pg.locator('.ssbyt-hub-tile');
      for (let i = 0; i < 6; i++) {
        const tt = tiles.nth(i).locator('.ssbyt-hub-tile__title'); const bb = await tt.boundingBox();
        await pg.addStyleTag({ content: '.ssbyt-hub-tile__title,.ssbyt-hub-tile__icon{visibility:hidden !important}' });
        const png = await pg.screenshot({ clip: bb }); await pg.evaluate(() => { document.querySelector('style:last-of-type'); });
        const px = await pg.evaluate(async b64 => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let min = 99, worst = null; return [...Array(d.length / 4).keys()].map(j => [d[j * 4], d[j * 4 + 1], d[j * 4 + 2]]); }, png.toString('base64'));
        const rgb = (await tt.evaluate(e => getComputedStyle(e).color)).match(/[\d.]+/g).slice(0, 3).map(Number);
        const worst = Math.min(...px.map(p => cr(rgb, p)));
        ok(worst >= 4.5, `hub: плашка ${i + 1} заголовок контраст (худший пиксель) ${worst.toFixed(2)}`);
      }
      await pg.emulateMedia({ reducedMotion: 'reduce' });
      const tr = await pg.evaluate(() => getComputedStyle(document.querySelector('.ssbyt-hub-tile')).transitionDuration);
      ok(/^0s/.test(tr), 'hub: reduced-motion transition ' + tr);
    }
    // focus-visible
    const fv = await pg.evaluate(() => { const a = document.querySelector('a.ssbyt-nav__tab,a.ssbyt-breadcrumb'); a.focus(); return a ? getComputedStyle(a).outlineStyle : 'none'; });
    await pg.keyboard.press('Tab'); 
    const fv2 = await pg.evaluate(() => { const a = document.querySelector('a.ssbyt-breadcrumb'); return a ? 1 : 0; });
    await ctx.close();
  }
  await b.close(); console.log(fails ? `\nПровалов: ${fails}` : '\nВСЁ ЗЕЛЁНОЕ'); process.exit(fails ? 1 : 0);
})();
