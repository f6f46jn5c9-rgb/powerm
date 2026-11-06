// Проверка комплекса «Инжиниринг» (2 страницы). node tools/check_inzh.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), crypto = require('crypto');
const D = path.join(__dirname, '../dist'); const rd = n => fs.readFileSync(path.join(D, n), 'utf8');
const BUP = 'https://kb.severstal.com/spaces/BSS/pages/161546386/';
const PAGES = [['inzh-hub', 'Инжиниринг. Силовые машины'], ['inzh-pra', 'Инжиниринг. Практики']];
const CBL = '<ul><li><a href="#">Практика 1 с длинным названием для проверки переноса строки</a></li><li><a href="#">Практика 2</a></li></ul>';
const HOSTILE = 'a{color:red!important;text-decoration:underline!important;font-size:30px!important}h1,h2,h3{font-size:50px!important;color:red!important;margin:40px!important}p,ul,li,div{margin:20px!important;padding:20px!important}span{color:red!important}li{border:3px solid red!important}';
const page = (pre, w, hostile) => `<!doctype html><meta charset=utf-8><style>body{margin:0}${hostile ? HOSTILE : ''}</style><div id=col style="width:${w}px">${rd(pre + '-1-hero.html')}${rd(pre + '-2-cbl-open.html')}${CBL}${rd(pre + '-3-cbl-close.html')}</div>`;
const lum = c => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
(async () => {
  const br = await chromium.launch(); let fail = 0; const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) fail++; };
  const dec = await br.newPage();
  for (const [pre, title] of PAGES) {
    console.log('== ' + pre);
    for (const w of [1100, 960, 820, 700, 560, 375]) {
      const p = await br.newPage({ viewport: { width: w === 375 ? 375 : 1200, height: 900 } }); const errs = [], reqs = [];
      p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e))); p.on('request', r => !/^(data|about):/.test(r.url()) && reqs.push(r.url()));
      await p.setContent(page(pre, w === 375 ? 343 : w, false)); await p.waitForTimeout(100);
      const r = await p.evaluate(pre => {
        const de = document.documentElement, bad = [];
        document.querySelectorAll('[class^="' + pre + '-"]').forEach(e => { if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline') bad.push(e.className); });
        const q = s => document.querySelector('.' + pre + '-' + s), cs = (e, k) => getComputedStyle(e)[k];
        const wrap = q('cbl-wrap'), t = q('title'), lis = [...wrap.querySelectorAll('li')];
        return { hs: de.scrollWidth > de.clientWidth, bad, heroH: q('hero').getBoundingClientRect().height, title: t.textContent, tfs: cs(t, 'fontSize'), tfw: cs(t, 'fontWeight'), tmt: cs(t, 'marginTop'), pad: cs(q('hero'), 'padding'),
          href: q('crumb').querySelector('a').href, bgi: cs(q('hero'), 'backgroundImage').match(/radial-gradient/g).length,
          wrapBox: [cs(wrap, 'borderTopWidth'), cs(wrap, 'boxShadow'), cs(wrap, 'backgroundColor')].join('|'), sep: lis.every(l => cs(l, 'borderBottomWidth') === '1px' && cs(l, 'borderBottomColor') === 'rgb(227, 234, 237)'),
          lc: cs(wrap.querySelector('a'), 'color'), lfs: cs(wrap.querySelector('a'), 'fontSize'), tail: wrap.lastElementChild.getBoundingClientRect().height,
          shadow: [...document.querySelectorAll('[class^="' + pre + '-"]')].filter(e => cs(e, 'boxShadow') !== 'none').length,
          boxes: ['title', 'crumb'].flatMap(s => { const rg = document.createRange(); rg.selectNodeContents(q(s)); return [...rg.getClientRects()].map(r => [s, r.x, r.y, r.width, r.height]); }) };
      }, pre);
      ok(!r.hs && !r.bad.length, `${w}: нет гор. скролла/обрезок ${r.bad}`); ok(r.heroH >= 160, `${w}: hero ${r.heroH}px ≥160`);
      ok(r.title === title && r.tfs === '22px' && r.tfw === '700' && r.tmt === '10px', `${w}: заголовок «${r.title}» 22/700/mt10`);
      ok(r.href === BUP, `${w}: крошка → ${r.href}`); ok(r.bgi === 2, `${w}: 2 blob-а`);
      ok(r.wrapBox === '0px|none|rgba(0, 0, 0, 0)' && r.sep && r.lc === 'rgb(84, 110, 122)' && r.lfs === '15px' && r.tail === 16, `${w}: CBL без рамок/фона, разделители, ссылки #546e7a 15px, хвост 16px`);
      ok(!r.shadow, `${w}: нет теней`); ok(!errs.length && !reqs.length, `${w}: консоль/сеть чисто ${errs} ${reqs}`);
      // контраст расчётом: фон под текстом (текст скрыт) + альфа-цвет
      await p.addStyleTag({ content: `html body .${pre}-root h1.${pre}-title,html body .${pre}-root .${pre}-crumb,html body .${pre}-root .${pre}-crumb a,html body .${pre}-root .${pre}-crumb a:visited{color:transparent !important}` });
      const shot = (await p.screenshot()).toString('base64');
      const worst = await dec.evaluate(async ([b64, boxes]) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
        const lum = c => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
        return boxes.map(([s, x, y, w, h]) => { let m = 99; const a = s === 'title' ? 1 : .65; for (let yy = Math.floor(y); yy < y + h; yy += 2) for (let xx = Math.floor(x); xx < x + w; xx += 2) { const d = g.getImageData(xx, yy, 1, 1).data; const fg = [0, 1, 2].map(k => 255 * a + d[k] * (1 - a)); const A = lum(fg), B = lum([d[0], d[1], d[2]]); m = Math.min(m, (Math.max(A, B) + .05) / (Math.min(A, B) + .05)); } return [s, m]; }); }, [shot, r.boxes]);
      worst.forEach(([s, m]) => ok(m >= 4.5, `${w}: контраст ${s}: худший ${m.toFixed(2)}`));
      if (w === 1100) {
        const a = p.locator(`.${pre}-crumb a`); await a.hover(); await p.waitForTimeout(50);
        ok(await a.evaluate(e => getComputedStyle(e).textDecorationLine) === 'underline', 'hover крошки: underline');
        await a.focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
        ok(await a.evaluate(e => getComputedStyle(e).outlineStyle !== 'none'), 'focus-visible крошки');
        const l = p.locator(`.${pre}-cbl-wrap a`).first(); await l.focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
        ok(await l.evaluate(e => getComputedStyle(e).outlineStyle !== 'none'), 'focus-visible ссылки CBL');
        const lc = await l.evaluate(e => getComputedStyle(e).color); ok(cr([84, 110, 122], [255, 255, 255]) >= 4.5, `контраст ссылок CBL ${cr([84, 110, 122], [255, 255, 255]).toFixed(2)}`);
        await p.emulateMedia({ reducedMotion: 'reduce' }); ok(await p.evaluate(pre => [...document.querySelectorAll('[class^="' + pre + '-"]')].every(e => parseFloat(getComputedStyle(e).transitionDuration) === 0 && getComputedStyle(e).animationName === 'none'), pre), 'reduced-motion: без transition/animation');
      }
      await p.close();
    }
    // изоляция от жёстких чужих стилей
    const p = await br.newPage({ viewport: { width: 1200, height: 900 } }); await p.setContent(page(pre, 1100, true));
    const s = await p.evaluate(pre => { const q = s => document.querySelector('.' + pre + '-' + s), g = (e, k) => getComputedStyle(e)[k]; const li = q('cbl-wrap li'); return [g(q('title'), 'fontSize'), g(q('title'), 'color'), g(q('crumb a'), 'fontSize'), g(q('crumb a'), 'textDecorationLine'), g(q('hero'), 'paddingTop'), g(li, 'paddingTop'), g(li, 'borderBottomWidth'), g(q('cbl-wrap a'), 'color'), g(q('cbl-wrap a'), 'fontSize'), g(q('cbl-wrap a'), 'textDecorationLine')]; }, pre);
    ok(s.join() === ['50px' && '22px', 'rgb(255, 255, 255)', '13px', 'none', '24px', '8px', '1px', 'rgb(84, 110, 122)', '15px', 'none'].join(), 'изоляция от чужих стилей ' + s);
    await p.close();
    fs.readdirSync(D).filter(n => n.startsWith(pre + '-')).forEach(n => ok(fs.statSync(path.join(D, n)).size <= 38 * 1024, n + ' ≤ 38 КБ'));
    ok(!/localStorage|sessionStorage|position:\s*fixed|100vh|https?:\/\/(?!kb\.severstal\.com)|@import|<link|<img|url\(/.test(['1-hero', '2-cbl-open', '3-cbl-close'].map(k => rd(pre + '-' + k + '.html')).join('')), 'нет запрещённого (storage/fixed/100vh/внешнее)');
    ok(!/(^|[\s,}])(\*|body|html|a|h1|h2|p)\s*[{,]/m.test(['1-hero', '2-cbl-open'].map(k => rd(pre + '-' + k + '.html').replace(/<style>|<\/style>/g, '')).join('').replace(/\.[\w-]+[^{}]*\{/g, '.x{')), 'нет глобальных селекторов');
  }
  await br.close(); process.exit(fail ? 1 : 0);
})();
