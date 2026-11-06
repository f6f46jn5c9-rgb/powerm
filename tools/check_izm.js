// Проверка страницы «БССМ. Устойчивость изменений». node tools/check_izm.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '../dist'); const rd = n => fs.readFileSync(path.join(D, n), 'utf8');
const CBL = '<ul><li><a href="#">Практика 1 с длинным названием для проверки переноса строки</a></li><li><a href="#">Практика 2</a></li></ul>';
const HOSTILE = 'a{color:red!important;text-decoration:underline!important}h1,h3{font-size:50px!important;color:red!important;margin:40px!important}p,ul,li{margin:20px!important;padding:20px!important}span{color:red!important}';
function page(w, hostile) { return `<!doctype html><meta charset=utf-8><style>body{margin:0}${hostile ? HOSTILE : ''}</style><div id=col style="width:${w}px">${rd('1-izm-hero.html')}${rd('2-izm-cbl-open.html')}${CBL}${rd('3-izm-cbl-close.html')}</div>`; }
const lum = c => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
(async () => {
  const br = await chromium.launch(); let fail = 0; const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) fail++; };
  for (const w of [1100, 960, 820, 700, 560, 375]) {
    const p = await br.newPage({ viewport: { width: w === 375 ? 375 : 1200, height: 900 } }); const errs = [], reqs = [];
    p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e))); p.on('request', r => !r.url().startsWith('data:') && !r.url().startsWith('about:') && reqs.push(r.url()));
    await p.setContent(page(w === 375 ? 343 : w, false)); await p.waitForTimeout(100);
    const r = await p.evaluate(() => {
      const de = document.documentElement; const bad = [];
      document.querySelectorAll('.izm-hub *').forEach(e => { if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline' && e.tagName !== 'svg') bad.push(e.className); });
      const hero = document.querySelector('.izm-hero').getBoundingClientRect();
      const t = document.querySelector('.izm-title').getBoundingClientRect(), tt = document.querySelector('.izm-title');
      return { hs: de.scrollWidth > de.clientWidth, bad, heroH: hero.height, titleOK: tt.scrollWidth <= tt.clientWidth, crumb: !!document.querySelector('.izm-crumb__off'), crumbA: !!document.querySelector('.izm-crumb a'), shadow: [...document.querySelectorAll('.izm-hub *')].filter(e => getComputedStyle(e).boxShadow !== 'none').length, trans: [...document.querySelectorAll('.izm-hub *')].filter(e => parseFloat(getComputedStyle(e).transitionDuration) > 0).length };
    });
    ok(!r.hs && !r.bad.length, `${w}: нет гор. скролла/обрезок ${r.bad}`); ok(r.heroH >= 160, `${w}: hero ${r.heroH}px ≥160`); ok(r.crumb && !r.crumbA, `${w}: крошка серым без <a>`); ok(!r.shadow && !r.trans, `${w}: нет теней/transition`);
    ok(!errs.length && !reqs.length, `${w}: консоль/сеть чисто ${errs} ${reqs}`);
    if (w === 1100) { // hover + клик + контраст
      const link = p.locator('a.izm-file').first(); await link.hover();
      ok(await p.evaluate(() => getComputedStyle(document.querySelector('.izm-file__n')).textDecorationLine) === 'underline', 'hover: underline');
      ok(await link.evaluate(a => getComputedStyle(a).pointerEvents !== 'none') && (await p.locator('a.izm-file').count()) === 3, '3 кликабельные ссылки');
      await p.mouse.move(0, 0); await link.focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
      ok(await link.evaluate(a => getComputedStyle(a).outlineStyle !== 'none'), 'focus-visible outline');
      // контраст: пиксели под текстом
      const shot = await p.screenshot(); const { PNG } = (() => { try { return require('pngjs'); } catch (e) { return {}; } })();
      const boxes = await p.evaluate(() => ['.izm-title', '.izm-crumb__off'].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return [s, r.x, r.y, r.width, r.height]; }));
      if (PNG) { const img = PNG.sync.read(shot); for (const [s, x, y, ww, hh] of boxes) { let worst = 99; const white = s === '.izm-title' ? [255, 255, 255] : [255, 255, 255];
        for (let yy = Math.floor(y); yy < y + hh; yy += 2) for (let xx = Math.floor(x); xx < x + ww; xx += 2) { const i = (img.width * yy + xx) * 4; const bg = [img.data[i], img.data[i + 1], img.data[i + 2]];
          const a = s === '.izm-title' ? 1 : .75; const fg = white.map((c, k) => c * a + bg[k] * (1 - a)); worst = Math.min(worst, cr(fg, bg)); }
        ok(worst >= 4.5, `контраст ${s}: худший ${worst.toFixed(2)}`); } } else console.log('pngjs нет, контраст пропущен');
    }
    await p.close();
  }
  // изоляция
  const p = await br.newPage({ viewport: { width: 1200, height: 900 } }); await p.setContent(page(1100, true));
  const s = await p.evaluate(() => { const g = (q, k) => getComputedStyle(document.querySelector(q))[k]; return [g('.izm-title', 'fontSize'), g('.izm-title', 'color'), g('.izm-files__h', 'fontSize'), g('a.izm-file', 'color'), g('.izm-file__e', 'color'), g('.izm-cbylabel li', 'paddingTop'), g('.izm-cbylabel a', 'color')]; });
  ok(s[0] === '26px' && s[1] === 'rgb(255, 255, 255)' && s[2] === '13px' && s[3] === 'rgb(42, 92, 168)' && s[4] === 'rgb(91, 102, 112)' && s[5] === '8px' && s[6] === 'rgb(42, 92, 168)', 'изоляция от чужих стилей ' + s);
  const f = fs.readdirSync(D).filter(n => /izm/.test(n)); f.forEach(n => ok(fs.statSync(path.join(D, n)).size <= 38 * 1024, n + ' ≤ 38 КБ'));
  ok(!/localStorage|sessionStorage|position:\s*fixed|100vh|https?:\/\/|@import|<link/.test(rd('1-izm-hero.html') + rd('2-izm-cbl-open.html')), 'нет запрещённого (storage/fixed/100vh/внешнее)');
  await br.close(); process.exit(fail ? 1 : 0);
})();
