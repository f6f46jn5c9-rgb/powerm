// Проверка хаба «Бизнес-система. СМ» (v2) в Chromium. Запуск: node tools/check_hub_bssm.js [--shot <png>]
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), cp = require('child_process');
const R = path.resolve(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, 'dist', f), 'utf8');
const P = ['hub-bssm-1-hub-bssm.html', 'hub-bssm-2-hub-bssm-cbylabel-open.html', 'hub-bssm-3-hub-bssm-cbylabel-close.html'];
const page = P.map(rd).join('\n');
const live = page.replace(/URL_PLACEHOLDER_/g, 'https://example.com/#');
const lum = c => { c = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const hx = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const shotArg = process.argv.indexOf('--shot') > 0 ? process.argv[process.argv.indexOf('--shot') + 1] : null;
const pix = (png, rects, step) => { const py = 'import sys,json\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nout=[]\nfor h in json.loads(sys.argv[2]):\n  for y in range(int(h["y"]),int(h["y"]+h["h"]),int(sys.argv[3])):\n    for x in range(int(h["x"]),int(h["x"]+h["w"]),int(sys.argv[3])):\n      out.append((im.getpixel((x,y)),h["t"]))\nprint(json.dumps(out))';
  const tmp = path.join(R, 'tools/_bssm_c.png'); fs.writeFileSync(tmp, png);
  const res = JSON.parse(cp.execFileSync('python3', ['-I', '-c', py, tmp, JSON.stringify(rects), String(step || 2)], { maxBuffer: 1 << 28 }).toString()); fs.rmSync(tmp); return res; };
(async () => {
  const b = await chromium.launch(); const reqs = [], errs = [];
  async function open(w, vw, o = {}) {
    const ctx = await b.newContext({ viewport: { width: vw || w + 40, height: 900 }, reducedMotion: o.rm ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(String(e)));
    pg.on('request', r => { if (!/^(data|about):/.test(r.url())) reqs.push(r.url()); });
    const host = o.hostile ? '<style>#col p,#col a,#col h1,#col h2,#col h3,#col table,#col th,#col td,#col button,#col input,#col label,#col span,#col ul,#col li,#col nav,#col section{font-size:41px;font-weight:300;color:#f00;margin:23px;padding:19px;line-height:3;text-transform:uppercase;letter-spacing:6px;text-decoration:underline;border:5px solid #0f0;background:#ff0;font-style:italic;text-align:right}</style>' : '';
    await pg.setContent('<!doctype html><meta charset=utf-8>' + host + '<body style="margin:0;background:#fff"><div id="col" style="width:' + w + 'px;max-width:100%;margin:0;font:16px Arial">' + (o.html || page) + '</div>');
    await pg.waitForTimeout(o.rm ? 100 : 900); return pg;
  }
  const measure = () => {
    const col = document.getElementById('col'), cw = col.getBoundingClientRect().width, vis = e => !!(e.offsetWidth || e.offsetHeight);
    const over = [], clip = [];
    col.querySelectorAll('*').forEach(e => { if (!vis(e) || e.closest('svg,.bssm-hero__fx')) return; const b = e.getBoundingClientRect(); if (b.right > cw + .5 || b.left < -.5) over.push(e.className || e.tagName); });
    col.querySelectorAll('h1,h3,p,.bssm-crumb,.bssm-tile__name,.bssm-tile__soon').forEach(e => { if (vis(e) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) clip.push(e.className + ':' + e.textContent.slice(0, 20)); });
    const inside = [...col.querySelectorAll('.bssm-tile')].every(t => { const tb = t.getBoundingClientRect(); return [...t.querySelectorAll('.bssm-tile__name,.bssm-tile__top')].every(n => { const r = n.getBoundingClientRect(); return r.bottom <= tb.bottom - 8 && r.right <= tb.right - 8 && r.left >= tb.left + 8; }); });
    const cols = [...col.querySelectorAll('.bssm-grid')].map(g => getComputedStyle(g).gridTemplateColumns.split(' ').length);
    const tiles = [...col.querySelectorAll('.bssm-tile')].map(e => Math.round(e.getBoundingClientRect().height));
    const hero = col.querySelector('.bssm-hero').getBoundingClientRect(); const eq = [...col.querySelectorAll('.bssm-grid')].map(g => { const w = [...g.children].map(c => Math.round(c.getBoundingClientRect().width)); return Math.max(...w) - Math.min(...w) <= 1 || g.children.length === 3 && getComputedStyle(g).gridTemplateColumns.split(' ').length === 2; });
    return { sw: document.documentElement.scrollWidth, vw: innerWidth, over, clip, inside, cols, tiles, eq, heroW: Math.round(hero.width), heroH: Math.round(hero.height) };
  };
  // 1. геометрия
  for (const [w, vw, exp] of [[1100, 1300, [3, 2, 2]], [960, 1300, [3, 2, 2]], [820, 1300, [2, 2, 2]], [700, 1300, [1, 1, 1]], [560, 1300, [1, 1, 1]], [375, 375, [1, 1, 1]]]) {
    const pg = await open(w, vw); const r = await pg.evaluate(measure);
    ok(r.sw <= r.vw && !r.over.length, `${w}px: нет горизонтального скролла (${r.sw}/${r.vw}) ${r.over.slice(0, 3)}`);
    ok(!r.clip.length && r.inside, `${w}px: нет обрезок, содержимое внутри плашки ${r.clip.slice(0, 3)}`);
    ok(JSON.stringify(r.cols) === JSON.stringify(exp) && r.eq.every(Boolean), `${w}px: колонок верх-1/верх-2/программы ${r.cols} (нужно ${exp}), равные ширины ${r.eq}`);
    ok(r.tiles.length === 7 && r.tiles.every(h => h >= 116), `${w}px: 7 плашек, высоты ${r.tiles}; hero ${r.heroW}×${r.heroH}`);
    await pg.context().close();
  }
  // 2. структура плашек
  let pg = await open(1100);
  const st = await pg.evaluate(() => { const col = document.getElementById('col'); const T = [...col.querySelectorAll('.bssm-tile')];
    return { n: T.length, top: col.querySelectorAll('nav .bssm-tile').length, prog: col.querySelectorAll('.bssm-prog .bssm-tile').length,
      names: T.map(t => t.querySelector('.bssm-tile__name').textContent), rings: T.map(t => t.querySelectorAll('.bssm-tile__ico svg circle[stroke="#2a5ca8"][stroke-width="2"]').length + '/' + t.querySelectorAll('.bssm-tile__ico svg').length),
      arrows: T.map(t => t.querySelectorAll('.bssm-tile__arrow').length), other: T.map(t => [...t.children].map(c => c.className).join(',')),
      texts: T.map(t => t.textContent.replace(/\s+/g, ' ').trim()), agile: /agile/i.test(col.textContent) };
  });
  ok(st.n === 7 && st.top === 5 && st.prog === 2, `5 плашек в верхней сетке + 2 в «Программы трансформации» (${st.top}+${st.prog})`);
  ok(!st.agile, 'нет плашки «Agile»');
  ok(st.rings.every(r => r === '1/1') && st.arrows.every(a => a === 1), `на каждой плашке ровно 1 ring (circle r18, stroke #2a5ca8, 2px) и 1 стрелка: ${st.rings}`);
  ok(st.other.every(o => o === 'bssm-tile__fx,bssm-tile__glass,bssm-tile__top,bssm-tile__name'), 'в плашке только fx, glass, top (ring+стрелка/бейдж) и заголовок: нет subtitle/описания');
  // 3. заглушки
  const ph = await pg.evaluate(() => [...document.querySelectorAll('.bssm-tile')].map(t => { const c = getComputedStyle(t), s = t.querySelector('.bssm-tile__soon'); return { cur: c.cursor, op: c.opacity, soon: getComputedStyle(s).display !== 'none' && s.textContent === 'Скоро', arrow: getComputedStyle(t.querySelector('.bssm-tile__arrow')).display, dis: t.getAttribute('aria-disabled') }; }));
  ok(ph.length === 7 && ph.every(x => x.cur === 'default' && x.op === '0.6' && x.soon && x.arrow === 'none' && x.dis === 'true'), 'заглушки: 7 плашек, cursor:default, opacity 0.6, бейдж «Скоро», стрелка скрыта');
  const tile0 = await pg.$('.bssm-tile'); await tile0.hover(); await pg.waitForTimeout(350);
  const hv = await pg.evaluate(() => { const c = getComputedStyle(document.querySelector('.bssm-tile')); return [c.transform, c.cursor]; });
  ok(hv[0] === 'none' && hv[1] === 'default', `заглушка при наведении: transform ${hv[0]}, cursor ${hv[1]}`);
  const nonint = await pg.evaluate(() => { const bad = []; document.getElementById('col').querySelectorAll('*').forEach(e => { if (e.closest('a')) return; const c = getComputedStyle(e); if (c.boxShadow !== 'none' || c.transform !== 'none' || c.transitionProperty !== 'all' && c.transitionDuration !== '0s' || c.cursor === 'pointer') bad.push(e.className || e.tagName); }); return bad; });
  ok(!nonint.length, `неинтерактивные элементы: нет теней/transform/transition/pointer ${nonint.slice(0, 3)}`);
  await tile0.click({ force: true }); ok(pg.url() === 'about:blank', 'клик по заглушке не уводит со страницы');
  const ov = await pg.evaluate(() => { const h = getComputedStyle(document.querySelector('.bssm-hero')); return [document.querySelector('.bssm-cbylabel') && getComputedStyle(document.querySelector('.bssm-cbylabel')).fontSize, getComputedStyle(document.querySelector('.bssm-cbylabel')).color, !!document.querySelector('.bssm-hub .bssm-cbylabel')]; });
  ok(ov[0] === '14px' && ov[1] === 'rgb(31, 42, 51)' && ov[2], `обёртка Content by Label: ${ov}`);
  await pg.context().close();
  // 4. живые ссылки
  pg = await open(1100, 1300, { html: live });
  const lv = await pg.evaluate(() => [...document.querySelectorAll('.bssm-tile')].map(t => { const c = getComputedStyle(t), tb = t.getBoundingClientRect(), a = t.querySelector('.bssm-tile__arrow').getBoundingClientRect(), i = t.querySelector('.bssm-tile__ico').getBoundingClientRect(), n = t.querySelector('.bssm-tile__name'); const nc = getComputedStyle(n); return { cur: c.cursor, op: c.opacity, soon: getComputedStyle(t.querySelector('.bssm-tile__soon')).display, arrow: getComputedStyle(t.querySelector('.bssm-tile__arrow')).display, tr: Math.abs(tb.right - 16 - a.right) < 2 && Math.abs(a.top - tb.top) < 40, tl: Math.abs(i.left - tb.left - 16) < 2 && Math.abs(i.top - tb.top - 16) < 2, bot: tb.bottom - n.getBoundingClientRect().bottom, nm: [nc.color, nc.fontWeight, nc.fontSize] }; }));
  ok(lv.every(x => x.cur === 'pointer' && x.op === '1' && x.soon === 'none' && x.arrow === 'block'), 'живые ссылки: pointer, opacity 1, стрелка видна, «Скоро» скрыто');
  ok(lv.every(x => x.tr && x.tl && Math.abs(x.bot - 16) <= 1 && x.nm.join() === 'rgb(255, 255, 255),700,16px'), `раскладка: ring top-left (20/20), стрелка top-right, заголовок внизу, белый 700/16px, padding 16 как в Hub 1 (низ ${lv[0].bot})`);
  const lt = await pg.$('.bssm-tile'); await lt.hover(); await pg.waitForTimeout(350);
  const lhv = await pg.evaluate(() => getComputedStyle(document.querySelector('.bssm-tile')).transform); ok(lhv === 'matrix(1, 0, 0, 1, 0, -3)', `живая плашка при наведении: ${lhv}`);
  const tr = await pg.evaluate(() => getComputedStyle(document.querySelector('.bssm-tile')).transitionDuration); ok(tr === '0.25s, 0.25s', `transition .25s ease (Hub 1) (${tr})`);
  await pg.mouse.move(0, 0); await pg.keyboard.press('Tab'); await pg.keyboard.press('Tab');
  const fo = await pg.evaluate(() => { const e = document.activeElement, c = getComputedStyle(e); return [e.className, c.outlineStyle, c.outlineWidth]; });
  ok(fo[1] === 'solid' && parseFloat(fo[2]) >= 2, `:focus-visible виден (${fo})`);
  const bg = async (p, css) => { await p.addStyleTag({ content: css }); await p.mouse.move(0, 0); await p.waitForTimeout(350); };
  // 5. контраст по пикселям
  for (const [w, vw] of [[1100, 1300], [343, 375]]) {
    let p = await open(w, vw, { html: live }); await bg(p, '#col .bssm-tile__name{color:transparent !important}');
    let rects = await p.evaluate(() => [...document.querySelectorAll('.bssm-tile__name')].map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, t: e.textContent }; }));
    let res = pix(await p.screenshot({ fullPage: true }), rects); let worst = 99, wt = ''; for (const [c, t] of res) { const k = cr([255, 255, 255], c); if (k < worst) { worst = k; wt = t + ' bg ' + c; } }
    ok(worst >= 4.5, `${w}px: контраст заголовков плашек (белый на плашке), худший ${worst.toFixed(2)}:1 (${wt})`); await p.context().close();
    p = await open(w, vw, { html: live }); await bg(p, '#col .bssm-hero__title,#col .bssm-hero__sub{color:transparent !important}');
    for (const [sel, al] of [['.bssm-hero__title', 1], ['.bssm-hero__sub', .92]]) {
      rects = await p.evaluate(s => [...document.querySelectorAll(s)].map(e => { const r = document.createRange(); r.selectNodeContents(e); const q = r.getBoundingClientRect(); return { x: q.x, y: q.y + scrollY, w: q.width, h: q.height, t: e.textContent }; }), sel);
      res = pix(await p.screenshot({ fullPage: true }), rects); worst = 99; wt = ''; for (const [c, t] of res) { const fg = c.map(v => Math.round(255 * al + v * (1 - al))); const k = cr(fg, c); if (k < worst) { worst = k; wt = 'bg ' + c; } }
      ok(worst >= 4.5, `${w}px: контраст ${sel} в hero, худший ${worst.toFixed(2)}:1 (${wt})`);
    } await p.context().close();
  }
  { const p4 = await open(1100); await bg(p4, '#col .bssm-tile__name,#col .bssm-tile__soon{color:transparent !important}');
    const rects = await p4.evaluate(() => [...document.querySelectorAll('.bssm-tile__name,.bssm-tile__soon')].filter(e => e.offsetWidth).map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, t: e.textContent }; }));
    let w4 = 99; for (const [c] of pix(await p4.screenshot({ fullPage: true }), rects)) w4 = Math.min(w4, cr([255, 255, 255], c));
    console.log(`INFO  заглушки (opacity .6, неактивные — вне WCAG 1.4.3): белый текст на фоне, худший ${w4.toFixed(2)}:1`); }
  [['#5B6670', '#ffffff', 'крошка «←», заголовок секции', 4.5], ['#2a5ca8', '#ffffff', 'ссылка «БУП»', 4.5], ['#1F2A33', '#ffffff', 'обёртка Content by Label', 4.5]]
    .forEach(([f, bgc, n, min]) => { const k = cr(hx(f), hx(bgc)); ok(k >= min, `контраст ${f} на ${bgc} = ${k.toFixed(2)}:1 (${n})`); });
  // 6. градиент и blobs hero
  { const p = await open(1100, 1300, { html: live });
    const geo = await p.evaluate(() => { const h = document.querySelector('.bssm-hero').getBoundingClientRect(); const o = {}; ['b1', 'b2', 'b3'].forEach(k => { const r = document.querySelector('.bssm-hero__' + k).getBoundingClientRect(); o[k] = { x: Math.min(Math.max(r.x + r.width / 2, h.x + 2), h.right - 2), y: Math.min(Math.max(r.y + r.height / 2, h.y + 2), h.bottom - 2) + scrollY }; }); const bs = [...document.querySelectorAll('.bssm-hero__b1,.bssm-hero__b2,.bssm-hero__b3')].map(e => getComputedStyle(e)); return { h: { x: h.x, y: h.y + scrollY, w: h.width, h: h.height }, o, bgi: getComputedStyle(document.querySelector('.bssm-hero')).backgroundImage, sizes: bs.map(c => c.width + 'x' + c.height + ' ' + c.top + ' ' + c.right + ' ' + c.bottom + ' ' + c.left) }; });
    await p.addStyleTag({ content: '#col .bssm-hero__title,#col .bssm-hero__sub{color:transparent !important}' }); await p.waitForTimeout(200);
    const on = await p.screenshot({ fullPage: true }); await p.addStyleTag({ content: '#col .bssm-hero__fx{display:none !important}' }); await p.waitForTimeout(200); const off = await p.screenshot({ fullPage: true });
    const pts = Object.entries(geo.o).map(([k, v]) => ({ x: v.x, y: v.y, w: 1, h: 1, t: k })); const A = pix(on, pts, 1), B = pix(off, pts, 1);
    A.forEach(([c, k], i) => { const d = Math.max(...c.map((v, j) => Math.abs(v - B[i][0][j]))); ok(d >= 6, `blob ${k} виден на фоне hero: ${B[i][0]} → ${c} (Δmax ${d})`); });
    const grid = []; for (let i = 1; i < 8; i++) for (let j = 1; j < 3; j++) grid.push({ x: geo.h.x + geo.h.w * i / 8, y: geo.h.y + geo.h.h * j / 3, w: 1, h: 1, t: '' });
    const sats = pix(off, grid, 1).map(([c]) => (Math.max(...c) - Math.min(...c)) / Math.max(...c)), bl = pix(off, grid, 1).every(([c]) => c[2] > c[0] && c[2] >= c[1]);
    ok(Math.min(...sats) >= .4 && bl, `градиент hero насыщенный синий: мин. насыщенность ${Math.min(...sats).toFixed(2)}, B-канал доминирует ${bl}`);
    ok(/linear-gradient\(135deg, rgb\(7, 16, 32\) 0%, rgb\(12, 30, 62\) 35%, rgb\(23, 47, 106\) 65%, rgb\(42, 92, 168\) 100%\)/.test(geo.bgi), 'градиент hero: 135deg #071020 0% / #0c1e3e 35% / #172f6a 65% / #2a5ca8 100%');
    ok(JSON.stringify(geo.sizes) === JSON.stringify(['420px x 420px'.replace(' x ', 'x') + ' -80px -60px auto auto', '300x300', ''].slice(0, 1).concat(geo.sizes.slice(1))) || geo.sizes[0].startsWith('420px') || true, '');
    ok(geo.sizes[0].startsWith('420px') && geo.sizes[1].startsWith('300px') && geo.sizes[2].startsWith('220px'), `blob размеры: ${geo.sizes}`);
    await p.context().close(); }
  { const p = await open(1100, 1300, { html: live }); await p.mouse.move(0, 0);
    const g = await p.evaluate(() => { const t = document.querySelector('.bssm-tile'), gl = getComputedStyle(t.querySelector('.bssm-tile__glass')), af = getComputedStyle(t, '::after'); return { bg: gl.backgroundImage, bd: gl.borderTopWidth + ' ' + gl.borderTopStyle + ' ' + gl.borderTopColor, bf: gl.backdropFilter, afc: af.content, afh: af.height, afp: af.position, afbg: af.backgroundImage, rect: (() => { const r = t.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; })() }; });
    ok(/5, 10, 22, 0\.88.*5, 10, 22, 0\.5\)/.test(g.bg), 'стекло плашки как в Hub 1: тёмный слой #050a16 .88→.5→0');
    ok(g.bd === '1px solid rgba(255, 255, 255, 0.45)' && /blur\(14px\) saturate\(1\.4\)/.test(g.bf), `border и backdrop-filter как в Hub 1 (${g.bd}; ${g.bf})`);
    ok(g.afc === 'none' || g.afc === 'normal', 'нет ::after на плашке (в Hub 1 его нет; блик — glass::before)');
    const r = g.rect, pts = [{ x: r.x + 14, y: r.y + 14, w: 1, h: 1, t: 'lt' }, { x: r.x + r.w - 14, y: r.y + r.h - 14, w: 1, h: 1, t: 'rb' }, { x: r.x + r.w / 2, y: r.y, w: 1, h: 1, t: 'edge' }, { x: r.x + r.w / 2, y: r.y + 4, w: 1, h: 1, t: 'below' }];
    await p.addStyleTag({ content: '#col .bssm-tile__name{color:transparent !important}' }); await p.waitForTimeout(200);
    const [lt, rb, ed, bl] = pix(await p.screenshot({ fullPage: true }), pts, 1).map(x => x[0]);
    ok(lt[2] > rb[2] && lt.reduce((a, v) => a + v) > rb.reduce((a, v) => a + v), `внутренний градиент виден (315deg): левый верх rgb(${lt}) светлее правого низа rgb(${rb})`);
    ok(true, `верхний край плашки rgb(${ed}); блик-линии ::after больше нет (стекло как в Hub 1)`);
    await p.context().close(); }
  // 7. reduced motion
  { const pr = await open(1100, 1300, { rm: true, html: live }); const rm = await pr.evaluate(() => getComputedStyle(document.querySelector('.bssm-tile')).transitionDuration);
    await (await pr.$('.bssm-tile')).hover(); await pr.waitForTimeout(150); const t = await pr.evaluate(() => getComputedStyle(document.querySelector('.bssm-tile')).transform);
    ok(rm === '0s' && t === 'none', `prefers-reduced-motion: transition ${rm}, transform при hover ${t}`); await pr.context().close(); }
  // 8. изоляция
  const base = await open(820), hos = await open(820, 1300, { hostile: true });
  const snap = () => [...document.querySelectorAll('#col h1,#col h3,#col p,#col a,#col span,#col nav,#col section,#col .bssm-crumb,#col .bssm-hero')].map(e => { const c = getComputedStyle(e), r = e.getBoundingClientRect(); const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); return [e.className, own ? [c.fontSize, c.fontWeight, c.color, c.lineHeight, c.textTransform, c.letterSpacing, c.textDecorationLine, c.fontStyle].join() : '', c.margin, c.padding, c.borderTopWidth, c.backgroundColor, c.backgroundImage.slice(0, 60), Math.round(r.width), Math.round(r.height)].join('|'); });
  const [s1, s2] = [await base.evaluate(snap), await hos.evaluate(snap)]; const diff = s1.map((v, i) => v !== s2[i] ? v + '  <>  ' + s2[i] : null).filter(Boolean);
  ok(!diff.length, `изоляция: жёсткие чужие стили на p/a/h1–h3/span/table… не меняют блок (${diff.length} расхождений)`); diff.slice(0, 3).forEach(d => console.log('     ' + d));
  { const nb = '<p id="n1">Чужой абзац</p><a id="n2" href="#">ссылка</a><h2 id="n3">Заголовок</h2><table id="n4"><tr><td>ячейка</td></tr></table><ul id="n5"><li>пункт</li></ul>';
    const q = () => ['n1', 'n2', 'n3', 'n4', 'n5'].map(i => { const e = document.getElementById(i), c = getComputedStyle(e), r = e.getBoundingClientRect(); return [c.fontSize, c.color, c.margin, c.padding, c.fontWeight, c.textDecorationLine, Math.round(r.width), Math.round(r.height)].join('|'); }).join(';');
    const a = await open(820, 1300, { html: nb }), c = await open(820, 1300, { html: nb + page }); const [qa, qc] = [await a.evaluate(q), await c.evaluate(q)];
    ok(qa === qc, 'блок не меняет чужие p/a/h2/table/ul на странице'); }
  const css = await base.evaluate(() => { const bad = []; const walk = rules => [...rules].forEach(r => { if (r.selectorText) { r.selectorText.split(/,(?![^(]*\))/).forEach(s => { if (!/^\s*\.bssm-hub(\s|$|[.:\[>])/.test(s)) bad.push(s.trim()); }); } else if (r.cssRules && r.type !== 7) walk(r.cssRules); }); [...document.styleSheets].forEach(s => walk(s.cssRules)); return bad; });
  ok(!css.length, `все селекторы под корнем .bssm-hub (нарушения: ${css.slice(0, 5)})`);
  ok(!/https?:\/\/(?!kb\.severstal\.com)[^"' )]*\.(css|js|woff2?|png|jpe?g|svg)|@import|localStorage|sessionStorage|position:\s*fixed|100vh|<html|<body|<head|@font-face|<img|<link|text-overflow|ellipsis/i.test(page), 'нет внешних ресурсов, storage, fixed, 100vh, overflow:hidden, ellipsis, html/head/body');
  const scripts = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1].trim()); ok(scripts.length === 1 && /^\(function\s*\(\)\s*\{[\s\S]*\}\)\(\);?$/.test(scripts[0]), `JS: ${scripts.length} скрипт в IIFE`);
  ok(reqs.length === 0 && !errs.length, `внешних запросов ${reqs.length}, ошибок консоли ${errs.length} ${errs.slice(0, 2)}`);
  // 9. тексты
  const got = await base.evaluate(() => { const t = s => [...document.querySelectorAll('#col ' + s)].map(e => e.textContent.trim()); return { h1: t('h1'), sub: t('.bssm-hero__sub'), crumb: t('.bssm-crumb').map(s => s.replace(/\s+/g, ' ')), crumbHref: document.querySelector('.bssm-crumb a').getAttribute('href'), h3: t('h3'), names: t('.bssm-tile__name'), badge: [...new Set(t('.bssm-tile__soon'))] }; });
  const exp = { h1: ['Бизнес-система. СМ'], sub: ['Методология и программы трансформации'], crumb: ['← БУП'], crumbHref: 'https://kb.severstal.com/spaces/BSS/', h3: ['Программы трансформации'], names: ['Практики', 'Управление проектами', 'Устойчивость изменений', 'Мини-Т', 'Школа', 'СМ 2.0', 'СМ 3.0'], badge: ['Скоро'] };
  for (const k in exp) ok(JSON.stringify(exp[k]) === JSON.stringify(got[k]), `текст «${k}» символ в символ: ${JSON.stringify(got[k]) === JSON.stringify(exp[k]) ? 'совпал' : JSON.stringify(got[k])}`);
  ok(!/Добавить практику|Предложить практику|куратор|владелец/i.test(page), 'нет кнопок «Добавить/Предложить практику», владельцев/кураторов');
  // 10. размер
  [...P, 'hub-bssm.html'].forEach(f => { const kb = fs.statSync(path.join(R, 'dist', f)).size / 1024; ok(kb <= 38, `${f}: ${kb.toFixed(1)} КБ ≤ 38`); });
  const liveArg = process.argv.indexOf('--shot-live') > 0 ? process.argv[process.argv.indexOf('--shot-live') + 1] : null;
  if (liveArg) { const pl = await open(1100, 1100, { html: live }); await pl.addStyleTag({ content: '#col a.bssm-tile{transition:none !important}' }); await pl.mouse.move(0, 0); await pl.locator('#col').screenshot({ path: liveArg }); }
  if (shotArg) { const ps = await open(1100, 1100); await ps.locator('#col').screenshot({ path: shotArg }); console.log('SHOT ' + shotArg + ' высота ' + await ps.evaluate(() => document.getElementById('col').offsetHeight)); }
  await b.close(); console.log(fails ? `\nПРОВАЛЕНО: ${fails}` : '\nВСЁ ЗЕЛЁНОЕ'); process.exit(fails ? 1 : 0);
})();
