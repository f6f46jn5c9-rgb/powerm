// Проверка страницы «БССМ. Школа» в Chromium. Запуск: node tools/check_shkola.js
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), cp = require('child_process');
const R = path.resolve(__dirname, '..'); const rd = f => fs.readFileSync(path.join(R, 'dist', f), 'utf8');
const [H, O, C] = ['1-shkola-hero.html', '2-shkola-cbl-open.html', '3-shkola-cbl-close.html'].map(rd);
const CBL = '<ul><li><a href="#p1">Практика один</a></li><li><a href="#p2">Практика два</a></li></ul>';
const page = H + '\n' + O + CBL + C, live = page.replace(/URL_БУП/g, 'https://example.com/bup');
const lum = c => { c = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const png = (w, h) => cp.execFileSync('python3', ['-I', '-c', 'import sys,io\nfrom PIL import Image\nb=io.BytesIO();Image.new("RGB",(int(sys.argv[1]),int(sys.argv[2])),(200,210,225)).save(b,"PNG");sys.stdout.buffer.write(b.getvalue())', String(w), String(h)], { maxBuffer: 1 << 26 });
const IMG = [png(1200, 700), png(1000, 900)];
const pix = (buf, rects) => { const py = 'import sys,json\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nout=[]\nfor h in json.loads(sys.argv[2]):\n  for y in range(int(h["y"]),int(h["y"]+h["h"]),2):\n    for x in range(int(h["x"]),int(h["x"]+h["w"]),2):\n      out.append(im.getpixel((x,y)))\nprint(json.dumps(out))';
  const tmp = path.join(R, 'tools/_shkola_c.png'); fs.writeFileSync(tmp, buf);
  const r = JSON.parse(cp.execFileSync('python3', ['-I', '-c', py, tmp, JSON.stringify(rects)], { maxBuffer: 1 << 28 }).toString()); fs.rmSync(tmp); return r; };
(async () => {
  const b = await chromium.launch(); const reqs = [], errs = [];
  async function open(w, vw, o = {}) {
    const ctx = await b.newContext({ viewport: { width: vw || w + 40, height: 900 }, reducedMotion: o.rm ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(String(e)));
    pg.on('request', r => { if (!/^(data|about):/.test(r.url())) reqs.push(r.url()); });
    await pg.route('https://kb.test/**', rt => { const u = rt.request().url(); if (/\/download\/attachments\//.test(u)) return rt.fulfill({ contentType: 'image/png', body: IMG[/%D0%BA%D1%80/.test(u) ? 0 : 1] }); return rt.fulfill({ contentType: 'text/html', body: 'x' }); });
    const host = o.hostile ? '<style>#col h1,#col h2,#col h3,#col p,#col a,#col img,#col figure,#col ul,#col li,#col span,#col div,#col section{font-size:41px;font-weight:300;color:green;margin:23px;padding:19px;line-height:3;text-transform:uppercase;letter-spacing:6px;text-decoration:underline;border:5px solid #0f0;background:#ff0;font-style:italic;text-align:right}h2,a,p{color:red!important}a{color:green!important}</style>' : '';
    await pg.goto('https://kb.test/page'); await pg.setContent('<!doctype html><meta charset=utf-8>' + host + '<body style="margin:0;background:#fff"><div id="col" style="width:' + w + 'px;max-width:100%;font:16px Arial">' + (o.html || page) + '</div>', { waitUntil: 'load' });
    await pg.waitForTimeout(300); return pg;
  }
  const measure = () => {
    const col = document.getElementById('col'), cw = col.getBoundingClientRect().width, vis = e => !!(e.offsetWidth || e.offsetHeight), over = [], clip = [];
    col.querySelectorAll('*').forEach(e => { if (!vis(e)) return; const b = e.getBoundingClientRect(); if (b.right > cw + .5 || b.left < -.5) over.push(e.className || e.tagName); });
    col.querySelectorAll('h2,h3,.shkola-hero__crumb').forEach(e => { if (vis(e) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) clip.push(e.textContent); });
    const im = [...col.querySelectorAll('img')].map(i => { const r = i.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top), nat: i.naturalWidth }; });
    const top = col.querySelector('.shkola-hero__top').getBoundingClientRect();
    return { sw: document.documentElement.scrollWidth, vw: innerWidth, cw, over, clip, im, topH: Math.round(top.height), topW: Math.round(top.width), cols: getComputedStyle(col.querySelector('.shkola-hero__imgs')).gridTemplateColumns.split(' ').length };
  };
  for (const [w, vw, cols] of [[1100, 1300, 2], [960, 1300, 2], [820, 1300, 2], [700, 1300, 2], [560, 1300, 1], [375, 375, 1]]) {
    const pg = await open(w, vw); const r = await pg.evaluate(measure);
    ok(r.sw <= r.vw && !r.over.length, `${w}px: нет горизонтального скролла (${r.sw}/${r.vw}) ${r.over.slice(0, 3)}`);
    ok(!r.clip.length, `${w}px: нет обрезок текста`);
    ok(r.cols === cols, `${w}px: колонок изображений ${r.cols} (нужно ${cols})`);
    const sameRow = r.im.length === 2 && Math.abs(r.im[0].y - r.im[1].y) < 2;
    ok(r.im.length === 2 && r.im.every(i => i.nat > 0 && i.x >= 0 && i.x + i.w <= r.cw + .5) && sameRow === (cols === 2), `${w}px: 2 картинки внутри контейнера ${JSON.stringify(r.im.map(i => [i.w, i.h]))}, ${sameRow ? 'в ряд' : 'стопкой'}`);
    ok(r.im.every(i => Math.abs(i.h / i.w - (i.nat === 1200 ? 700 / 1200 : 900 / 1000)) < .01), `${w}px: height:auto — пропорции сохранены`);
    ok(r.topH >= 160, `${w}px: hero min-height ≥160 (${r.topH})`);
    await pg.context().close();
  }
  let pg = await open(1100);
  const st = await pg.evaluate(() => { const col = document.getElementById('col'), t = col.querySelector('.shkola-hero__title'), c = col.querySelector('.shkola-hero__crumb'), l = col.querySelector('.shkola-hero__label'), im = col.querySelector('img'), gs = getComputedStyle;
    return { title: [t.tagName, t.textContent, gs(t).fontSize, gs(t).fontWeight, gs(t).color], crumb: [c.tagName, c.textContent, gs(c).color, !!col.querySelector('.shkola-hero a')], label: [l.textContent, gs(l).fontSize, gs(l).fontWeight, gs(l).color, gs(l).letterSpacing, gs(l).backgroundColor, gs(l).borderTopWidth],
      img: [gs(im).borderRadius, gs(im).borderTopWidth, gs(im).borderTopColor, im.getAttribute('src'), im.hasAttribute('height')], bg: gs(col.querySelector('.shkola-hero__top')).backgroundImage, rest: col.querySelectorAll('.shkola-hero svg,.shkola-hero button,.shkola-hero input').length, accent: gs(col.querySelector('.shkola-hero')).getPropertyValue('--shkola-accent') };
  });
  ok(st.title.join() === 'H2,БССМ. Школа,26px,800,rgb(255, 255, 255)', 'заголовок: ' + st.title);
  ok(st.crumb[0] === 'SPAN' && st.crumb[1] === '← БУП' && !st.crumb[3], `крошка при пустом URL — серый текст без <a>: ${st.crumb}`);
  ok(st.label.join() === 'Материалы программы,13px,600,rgb(91, 102, 112),0.65px,rgba(0, 0, 0, 0),0px', 'метка «Материалы программы»: ' + st.label);
  ok(st.img[0] === '8px' && st.img[1] === '1px' && st.img[2] === 'rgb(227, 234, 237)' && !st.img[4] && /^\/download\/attachments\/SHKOLA_PAGE_ID\//.test(st.img[3]), 'картинки: radius 8, рамка 1px #E3EAED, без фикс. высоты, src на вложение: ' + st.img.slice(0, 3));
  ok(/38% 35% at 78% 18%, rgba\(100, 180, 255, 0.88\) 0%/.test(st.bg) && /25% 25% at 14% 82%, rgba\(42, 92, 168, 0.52\) 0%/.test(st.bg) && /140deg, rgb\(4, 8, 16\) 0%, rgb\(8, 16, 42\) 40%, rgb\(21, 32, 72\) 72%, rgb\(42, 92, 168\) 100%/.test(st.bg), 'фон hero — градиент hub-bssm (2 blob ×0,7 + linear 140deg)');
  ok(st.rest === 0 && st.accent === '#2a5ca8', 'нет иконок/кнопок/инпутов; --shkola-accent #2a5ca8');
  const ni = await pg.evaluate(() => { const bad = []; document.getElementById('col').querySelectorAll('*').forEach(e => { const c = getComputedStyle(e); if (c.boxShadow !== 'none' || c.transform !== 'none' || c.transitionDuration !== '0s' || c.animationName !== 'none' || c.backdropFilter !== 'none') bad.push(e.className || e.tagName); }); return bad; });
  ok(!ni.length, `нет теней/transform/transition/animation/backdrop ни у одного элемента ${ni.slice(0, 3)}`);
  await pg.hover('.shkola-hero img'); await pg.waitForTimeout(150);
  ok(await pg.evaluate(() => { const c = getComputedStyle(document.querySelector('.shkola-hero img')); return c.transform === 'none' && c.boxShadow === 'none'; }), 'hover на картинке: без подъёма и тени');
  // контраст: фон под текстом без текста
  const rects = await pg.evaluate(() => ['.shkola-hero__title', '.shkola-hero__crumb'].map(s => { const g = document.createRange(); g.selectNodeContents(document.querySelector(s)); const r = g.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, t: s }; }));
  await pg.addStyleTag({ content: '#col .shkola-hero .shkola-hero__title,#col .shkola-hero .shkola-hero__crumb{color:transparent !important}' });
  const shot = await pg.screenshot({ fullPage: true });
  const worst = rs => { let m = null, mx = -1; for (const p of pix(shot, rs)) { const l = lum(p); if (l > mx) { mx = l; m = p; } } return m; };
  const wt = worst([rects[0]]), wc = worst([rects[1]]);
  ok(cr([255, 255, 255], wt) >= 4.5, `контраст заголовка: белый на самом светлом пикселе фона ${wt} = ${cr([255, 255, 255], wt).toFixed(2)}:1`);
  const gray = [0xb4, 0xbd, 0xd2]; ok(cr(gray, wc) >= 4.5, `контраст серой крошки #b4bdd2 на фоне ${wc} = ${cr(gray, wc).toFixed(2)}:1`);
  const bl = wc.map((v, i) => Math.round(.75 * 255 + .25 * v)); ok(cr(bl, wc) >= 4.5, `контраст ссылки rgba(255,255,255,.75) на ${wc} = ${cr(bl, wc).toFixed(2)}:1`);
  ok(cr([0x5b, 0x66, 0x70], [255, 255, 255]) >= 4.5 && cr([0x2a, 0x5c, 0xa8], [255, 255, 255]) >= 4.5, `контраст #5B6670 и #2a5ca8 на белом: ${cr([0x5b, 0x66, 0x70], [255, 255, 255]).toFixed(2)} / ${cr([0x2a, 0x5c, 0xa8], [255, 255, 255]).toFixed(2)}`);
  // для узкого hero (375): blob шире относительно текста
  await pg.context().close();
  pg = await open(375, 375); const r2 = await pg.evaluate(() => ['.shkola-hero__title', '.shkola-hero__crumb'].map(s => { const g = document.createRange(); g.selectNodeContents(document.querySelector(s)); const r = g.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }));
  await pg.addStyleTag({ content: '#col .shkola-hero .shkola-hero__title,#col .shkola-hero .shkola-hero__crumb{color:transparent !important}' });
  const s2 = await pg.screenshot({ fullPage: true }); let mx = -1, mp = null; for (const p of pix(s2, r2)) { if (lum(p) > mx) { mx = lum(p); mp = p; } }
  ok(cr([255, 255, 255], mp) >= 4.5 && cr([0xb4, 0xbd, 0xd2], mp) >= 4.5, `375px: контраст заголовка/крошки на ${mp} = ${cr([255, 255, 255], mp).toFixed(2)} / ${cr([0xb4, 0xbd, 0xd2], mp).toFixed(2)}`);
  await pg.context().close();
  // живая крошка
  pg = await open(1100, 1300, { html: live });
  const lv = await pg.evaluate(() => { const a = document.querySelector('.shkola-hero a.shkola-hero__crumb'); return a && [a.getAttribute('href'), getComputedStyle(a).color, getComputedStyle(a).pointerEvents]; });
  ok(lv && lv[0] === 'https://example.com/bup' && lv[1] === 'rgba(255, 255, 255, 0.75)' && lv[2] === 'auto', `с URL крошка — ссылка rgba(255,255,255,.75): ${lv}`);
  await pg.keyboard.press('Tab'); const fo = await pg.evaluate(() => { const c = getComputedStyle(document.activeElement); return [document.activeElement.className, c.outlineStyle, c.outlineWidth]; });
  ok(fo[0] === 'shkola-hero__crumb' && fo[1] === 'solid' && fo[2] === '3px', 'видимый :focus-visible у ссылки ' + fo);
  await pg.context().close();
  // reduced motion
  pg = await open(1100, 1300, { rm: true }); ok(await pg.evaluate(() => [...document.querySelectorAll('#col *')].every(e => { const c = getComputedStyle(e); return c.transitionDuration === '0s' && c.animationName === 'none'; })), 'reduced-motion: ни transition, ни animation'); await pg.context().close();
  ok(!/transition|animation|@keyframes/.test(H + O + C), 'в исходниках нет transition/animation/@keyframes (нечего оборачивать в prefers-reduced-motion)');
  // изоляция
  pg = await open(820, 1300, { hostile: true }); const h = await pg.evaluate(() => { const col = document.getElementById('col'), gs = getComputedStyle, t = col.querySelector('.shkola-hero__title'), l = col.querySelector('.shkola-hero__label'), im = col.querySelector('img'), a = col.querySelector('.shkola-cbylabel a'), li = col.querySelector('.shkola-cbylabel li'), top = col.querySelector('.shkola-hero__top');
    return { t: [gs(t).color, gs(t).fontSize, gs(t).textTransform, gs(t).letterSpacing], l: [gs(l).color, gs(l).fontSize, gs(l).textTransform], im: [gs(im).borderTopWidth, gs(im).borderRadius, gs(im).margin, gs(im).height !== '41px'], a: [gs(a).color, gs(a).fontSize, gs(a).textDecorationLine], li: [gs(li).paddingTop, gs(li).borderBottomWidth], bgY: gs(top).backgroundColor, sw: document.documentElement.scrollWidth <= innerWidth };
  });
  ok(h.t.join() === 'rgb(255, 255, 255),26px,none,normal' && h.l.join() === 'rgb(91, 102, 112),13px,none' && h.im.join() === '1px,8px,0px,true' && h.a.join() === 'rgb(42, 92, 168),15px,none' && h.li.join() === '8px,1px' && h.bgY === 'rgba(0, 0, 0, 0)' && h.sw, 'изоляция от жёстких чужих стилей (h2/a/p red!important и др.): ' + JSON.stringify(h));
  await pg.context().close();
  // обёртка CBL
  pg = await open(1100); const w = await pg.evaluate(() => { const c = document.querySelector('#col > .shkola-cbylabel'), p = c.querySelector('p'), u = c.querySelector('ul'), li = c.querySelector('li'), gs = getComputedStyle; return { n: document.querySelectorAll('.shkola-cbylabel').length, kids: [...c.children].map(e => e.tagName), p: [p.textContent, gs(p).fontSize, gs(p).fontWeight, gs(p).color, gs(p).letterSpacing], ul: [gs(u).paddingLeft, gs(u).listStyleType], li: [gs(li).paddingTop, gs(li).borderBottomColor], hero: !c.contains(document.querySelector('.shkola-hero')) }; });
  ok(w.n === 1 && w.kids.join() === 'STYLE,P,UL' && w.p.join() === 'ПРАКТИКИ,13px,600,rgb(91, 102, 112),0.65px' && w.ul.join() === '0px,none' && w.hero, 'обёртка CBL: открывающий+закрывающий div сбалансированы, стили списка: ' + JSON.stringify(w));
  await pg.context().close();
  // файлы и сеть
  for (const f of ['1-shkola-hero.html', '2-shkola-cbl-open.html', '3-shkola-cbl-close.html']) { const kb = fs.statSync(path.join(R, 'dist', f)).size / 1024; ok(kb <= 38, `${f}: ${kb.toFixed(2)} КБ ≤ 38`); }
  const ext = reqs.filter(u => !/^(data|about):/.test(u) && !/\/download\/attachments\/SHKOLA_PAGE_ID\//.test(u) && !/^https:\/\/kb\.test\/page$/.test(u) && !/^https:\/\/example\.com\/bup/.test(u));
  ok(!ext.length, `внешних запросов нет (только вложения Confluence): ${ext.slice(0, 3)}`);
  ok(!errs.length, `ошибок в консоли нет ${errs.slice(0, 3)}`);
  ok(!/\b(position\s*:\s*fixed|100vh|localStorage|sessionStorage|base64)\b/.test(H + O + C), 'нет fixed/100vh/localStorage/base64');
  ok(!/(^|[}\s,])(\*|body|html|a|h1|h2|h3|p|img)\s*[,{]/m.test((H.match(/<style>[\s\S]*?<\/style>/) || [''])[0].replace(/\.shkola-[^{]*\{/g, '.shkola{').replace(/\.shkola\{[^}]*\}/g, '')), 'в <style> нет глобальных селекторов (все под .shkola-*)');
  await b.close(); console.log(fails ? `\nПРОВАЛОВ: ${fails}` : '\nВСЁ ЗЕЛЁНОЕ'); process.exit(fails ? 1 : 0);
})();
