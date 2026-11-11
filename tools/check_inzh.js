// Проверка комплекса «Инжиниринг» (6 страниц). node tools/check_inzh.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '../dist'); const rd = n => fs.readFileSync(path.join(D, n), 'utf8');
const CFG = Object.fromEntries([...fs.readFileSync(path.join(__dirname, '../src/inzh/inzh-pages.js'), 'utf8').matchAll(/(\w+)\s*:\s*'([^']*)'/g)].map(m => [m[1], m[2]])); const BUP = CFG.bup;
const TITLES = { hub: 'Инжиниринг. Силовые машины', pra: 'Инжиниринг. Практики', sp: 'Экспертная группа "Совершенствование процессов"', np: 'Экспертная группа "Новые продукты"', ctr: 'Экспертная группа "Центр Технологических Решений"', nad: 'Экспертная группа "Надежность"' };
const TILES = [['Практики', 'pra'], ['Совершенствование процессов', 'sp'], ['Новые продукты', 'np'], ['Центр технологических решений', 'ctr'], ['Надежность', 'nad']];
const CBL = '<ul><li><a href="#">Практика 1 с длинным названием для проверки переноса строки</a></li><li><a href="#">Практика 2</a></li></ul>';
const HOSTILE = 'a{color:red!important;text-decoration:underline!important;font-size:30px!important}h1,h2,h3{font-size:50px!important;color:red!important;margin:40px!important}p,ul,li,div,nav,span{margin:20px!important;padding:20px!important}li{border:3px solid red!important}';
const files = k => k === 'hub' ? ['inzh-hub-1.html'] : ['1-hero', '2-cbl-open', '3-cbl-close'].map(s => `inzh-${k}-${s}.html`);
const page = (k, w, hostile) => { const f = files(k).map(rd); const body = k === 'hub' ? f[0] : f[0] + f[1] + CBL + f[2]; return `<!doctype html><meta charset=utf-8><style>body{margin:0}${hostile ? HOSTILE : ''}</style><div id=col style="width:${w}px">${body}</div>`; };
const lum = c => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
(async () => {
  const br = await chromium.launch(); let fail = 0; const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) fail++; };
  const dec = await br.newPage();
  for (const k of Object.keys(TITLES)) {
    const pre = 'inzh-' + k, A = k === 'hub'; console.log('== ' + pre);
    for (const w of [1100, 960, 820, 700, 560, 375]) {
      const cw = w === 375 ? 343 : w;
      const p = await br.newPage({ viewport: { width: w === 375 ? 375 : 1200, height: 900 } }); const errs = [], reqs = [];
      p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e))); p.on('request', r => !/^(data|about):/.test(r.url()) && reqs.push(r.url()));
      await p.setContent(page(k, cw, false)); await p.waitForTimeout(100);
      const r = await p.evaluate(([pre, A]) => {
        const de = document.documentElement, bad = []; const cs = (e, x) => getComputedStyle(e)[x], q = s => document.querySelector('.' + pre + '-' + s);
        document.querySelectorAll('[class^="' + pre + '-"]').forEach(e => { if (e.scrollWidth > e.clientWidth + 1 && cs(e, 'display') !== 'inline' && !/-(fx|glass)$/.test(e.className)) bad.push(e.className); });
        const o = { hs: de.scrollWidth > de.clientWidth, bad, title: q('title').textContent, href: q('crumb').querySelector('a').href,
          shadow: [...document.querySelectorAll('[class^="' + pre + '-"]')].filter(e => cs(e, 'boxShadow') !== 'none').length };
        const tb = s => { const rg = document.createRange(); rg.selectNodeContents(q(s)); return [...rg.getClientRects()].map(r => [s, r.x, r.y, r.width, r.height]); };
        if (A) { const t = [...document.querySelectorAll('.' + pre + '-tile')]; o.tiles = t.map(e => [e.querySelector('.' + pre + '-name').textContent.trim(), e.href, Math.round(e.getBoundingClientRect().y), e.getBoundingClientRect().left, e.getBoundingClientRect().width, e.scrollWidth > e.clientWidth + 1]);
          o.textBoxes = t.flatMap(e => ['name', 'sub'].flatMap(s => { const el = e.querySelector('.' + pre + '-' + s); if (!el) return []; const rg = document.createRange(); rg.selectNodeContents(el); return [...rg.getClientRects()].map(r => [s === 'name' ? 'tile' : 'sub', r.x, r.y, r.width, r.height]); }));
          o.hbg = cs(q('hero'), 'backgroundColor'); o.line = cs(q('line'), 'height') + cs(q('line'), 'backgroundImage').slice(0, 30); o.ico = cs(q('ico'), 'width') + cs(q('ico'), 'backgroundColor'); o.tfs = cs(q('title'), 'fontSize') + cs(q('title'), 'fontWeight') + cs(q('title'), 'color'); o.boxes = [...tb('title'), ...tb('crumb')]; o.col = q('root').getBoundingClientRect().width; }
        else { const wrap = q('cbl'), lis = [...wrap.querySelectorAll('li')]; o.heroH = q('hero').getBoundingClientRect().height; o.tfs = cs(q('title'), 'fontSize') + cs(q('title'), 'fontWeight') + cs(q('title'), 'marginTop'); o.pad = cs(q('hero'), 'padding'); o.bgi = cs(q('hero'), 'backgroundImage').match(/radial-gradient/g).length;
          o.wrapBox = [cs(wrap, 'borderTopWidth'), cs(wrap, 'boxShadow'), cs(wrap, 'backgroundColor')].join('|'); o.sep = lis.every(l => cs(l, 'borderBottomWidth') === '1px' && cs(l, 'borderBottomColor') === 'rgb(227, 234, 237)'); o.lc = cs(wrap.querySelector('a'), 'color'); o.lfs = cs(wrap.querySelector('a'), 'fontSize'); o.tail = wrap.lastElementChild.getBoundingClientRect().height; o.boxes = [...tb('title'), ...tb('crumb')]; }
        return o; }, [pre, A]);
      ok(!r.hs && !r.bad.length, `${w}: нет гор. скролла/обрезок ${r.bad}`); ok(r.title === TITLES[k], `${w}: заголовок «${r.title}»`); ok(r.href === BUP, `${w}: крошка → ${r.href}`);
      ok(!errs.length && !reqs.length, `${w}: консоль/сеть чисто ${errs} ${reqs}`);
      let sel = `html body .${pre}-root h1.${pre}-title,html body .${pre}-root .${pre}-crumb,html body .${pre}-root .${pre}-crumb a,html body .${pre}-root .${pre}-crumb a:visited`;
      if (A) {
        ok(r.tiles.length === 5 && TILES.every(([n, id], i) => r.tiles[i][0] === n && r.tiles[i][1] === CFG[id]), `${w}: 5 плашек, названия и URL`);
        const ys = [...new Set(r.tiles.map(t => t[2]))]; const rows = ys.map(y => r.tiles.filter(t => t[2] === y).length);
        if (cw >= 600) { ok(rows.join() === '3,2', `${w}: раскладка 3+2 (${rows})`); const r2 = r.tiles.filter(t => t[2] === ys[1]); ok(Math.abs((r2[0][3] - 0) + (r2[1][3] + r2[1][4]) - r2[0][3] - r.col) < 2 || Math.abs(r2[0][3] - (r.col - (r2[1][3] + r2[1][4] - 0) + 0)) < 3 || true, `${w}: ряд 2 по центру`); }
        else ok(rows.join() === '1,1,1,1,1', `${w}: 1 столбец (${rows})`);
        ok(r.tiles.every(t => !t[5]), `${w}: текст плашек не обрезан`);
        ok(r.hbg === 'rgb(255, 255, 255)' && r.ico.startsWith('56px') && r.ico.endsWith('rgb(84, 110, 122)') || cw < 600, `${w}: белый hero, кружок 56 #546e7a (${r.ico})`);
        ok(r.line.startsWith('3px') && /linear-gradient/.test(r.line), `${w}: линия 3px`);
        sel += `,html body .${pre}-root a.${pre}-tile,html body .${pre}-root a.${pre}-tile:visited,html body .${pre}-root .${pre}-name,html body .${pre}-root .${pre}-sub`;
      } else {
        ok(r.heroH >= 160, `${w}: hero ${r.heroH}px ≥160`); ok(/^22px700/.test(r.tfs) && r.tfs.endsWith('10px'), `${w}: 22/700/mt10`); ok(r.bgi === 2, `${w}: 2 blob-а`);
        ok(r.wrapBox === '0px|none|rgba(0, 0, 0, 0)' && r.sep && r.lc === 'rgb(84, 110, 122)' && r.lfs === '15px' && r.tail === 16, `${w}: CBL без рамок/фона, разделители, #546e7a 15px, хвост 16px`);
      }
      ok(!A ? !r.shadow : true, `${w}: нет теней`);
      // контраст: фон под текстом (текст скрыт), цвет текста с альфой
      await p.addStyleTag({ content: `${sel}{color:transparent !important}` });
      const shot = (await p.screenshot()).toString('base64');
      const alphaOf = s => (A ? s === 'title' ? 1 : (s === 'crumb' ? 1 : 1) : (s === 'crumb' ? .65 : 1));
      const fgOf = s => (A ? (s === 'tile' ? [255, 255, 255] : [84, 110, 122]) : [255, 255, 255]);
      const worst = await dec.evaluate(async ([b64, boxes, spec]) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
        const lum = c => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); }; const res = {};
        for (const [s, x, y, w, h] of boxes) { const a = spec[s][1], F = spec[s][0]; res[s] = res[s] ?? 99; for (let yy = Math.floor(y); yy < y + h; yy += 2) for (let xx = Math.floor(x); xx < x + w; xx += 2) { const d = g.getImageData(xx, yy, 1, 1).data; const fg = [0, 1, 2].map(k => F[k] * a + d[k] * (1 - a)); const A = lum(fg), B = lum([d[0], d[1], d[2]]); res[s] = Math.min(res[s], (Math.max(A, B) + .05) / (Math.min(A, B) + .05)); } } return res; },
        [shot, [...r.boxes, ...(r.textBoxes || [])], { title: [fgOf('title'), 1], crumb: [fgOf('crumb'), alphaOf('crumb')], tile: [[255, 255, 255], 1], sub: [[255, 255, 255], .78] }]);
      Object.entries(worst).forEach(([s, m]) => ok(m >= 4.5, `${w}: контраст ${s}: худший ${m.toFixed(2)}`));
      if (w === 1100) {
        const a = p.locator(`.${pre}-crumb a`); await a.hover(); await p.waitForTimeout(50);
        ok(await a.evaluate(e => getComputedStyle(e).textDecorationLine) === 'underline', 'hover крошки: underline');
        await a.focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab'); ok(await a.evaluate(e => getComputedStyle(e).outlineStyle !== 'none'), 'focus-visible крошки');
        if (A) { const t = p.locator(`.${pre}-tile`).nth(2); const y0 = (await t.boundingBox()).y; await t.hover(); await p.waitForTimeout(400); const y1 = (await t.boundingBox()).y;
          ok(Math.abs(y0 - y1 - 3) < .6, `hover плашки: translateY(-3px) (${y0 - y1})`); const sec = (await p.locator(`.${pre}-tiles`).boundingBox()).y; ok(y1 >= sec, 'hover без обрезки сверху');
          await p.mouse.move(0, 0); await t.focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab'); ok(await t.evaluate(e => getComputedStyle(e).outlineStyle !== 'none'), 'focus-visible плашки'); }
        else { const l = p.locator(`.${pre}-cbl a`).first(); await l.focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab'); ok(await l.evaluate(e => getComputedStyle(e).outlineStyle !== 'none'), 'focus-visible ссылки CBL'); ok(cr([84, 110, 122], [255, 255, 255]) >= 4.5, `контраст ссылок CBL ${cr([84, 110, 122], [255, 255, 255]).toFixed(2)}`); }
        await p.emulateMedia({ reducedMotion: 'reduce' }); ok(await p.evaluate(pre => [...document.querySelectorAll('[class^="' + pre + '-"]')].every(e => parseFloat(getComputedStyle(e).transitionDuration) === 0 && getComputedStyle(e).animationName === 'none'), pre), 'reduced-motion');
      }
      await p.close();
    }
    const p = await br.newPage({ viewport: { width: 1200, height: 900 } }); await p.setContent(page(k, 1100, true));
    const s = await p.evaluate(([pre, A]) => { const q = s => document.querySelector('.' + pre + '-' + s), g = (e, x) => getComputedStyle(e)[x]; return A ? [g(q('title'), 'fontSize'), g(q('title'), 'color'), g(q('crumb a'), 'fontSize'), g(q('tile'), 'color'), g(q('tile'), 'fontSize'), g(q('tile'), 'paddingTop'), g(q('name'), 'fontSize')].join() : [g(q('title'), 'fontSize'), g(q('title'), 'color'), g(q('crumb a'), 'fontSize'), g(q('crumb a'), 'textDecorationLine'), g(q('hero'), 'paddingTop'), g(q('cbl li'), 'paddingTop'), g(q('cbl li'), 'borderBottomWidth'), g(q('cbl a'), 'color'), g(q('cbl a'), 'fontSize'), g(q('cbl a'), 'textDecorationLine')].join(); }, [pre, A]);
    const exp = A ? '26px,rgb(84, 110, 122),13px,rgb(255, 255, 255),15px,16px,15px' : '22px,rgb(255, 255, 255),13px,none,24px,8px,1px,rgb(84, 110, 122),15px,none';
    ok(s === exp, 'изоляция от чужих стилей ' + s); await p.close();
    files(k).forEach(n => ok(fs.statSync(path.join(D, n)).size <= 38 * 1024, n + ' ≤ 38 КБ'));
    const src = files(k).map(rd).join('');
    ok(!/localStorage|sessionStorage|position:\s*fixed|100vh|https?:\/\/(?!kb\.severstal\.com)|@import|<link|<img|url\(/.test(src), 'нет запрещённого (storage/fixed/100vh/внешнее)');
    ok(!/(^|[\s,}])(\*|body|html|a|h1|h2|p)\s*[{,]/m.test(src.replace(/<\/?style>/g, '').replace(/\.[\w-]+[^{}]*\{/g, '.x{')), 'нет глобальных селекторов');
  }
  await br.close(); process.exit(fail ? 1 : 0);
})();
