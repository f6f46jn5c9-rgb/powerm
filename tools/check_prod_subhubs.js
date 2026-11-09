// Проверка 6 страниц Производство (Тип Б). node tools/check_prod_subhubs.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const D = path.join(__dirname, '../dist'); const rd = n => fs.readFileSync(path.join(D, n), 'utf8');
const BUP = 'https://kb.severstal.com/spaces/BSS/pages/161546386/';
const PAGES = [['svar', 'Производство. Обучение сварщиков'], ['zapasy', 'Производство. Снижение запасов'], ['smarket', 'Производство. Супермаркет'], ['hranenie', 'Производство. Адресное хранение'], ['fabrika', 'Производство. Фабрика идей'], ['ppraktiki', 'Производство. Практики']];
const CBL = '<ul><li><a href="#">Страница с длинным названием для проверки переноса строки</a></li><li><a href="#">Страница 2</a></li></ul>';
const HOSTILE = 'a{color:red!important;text-decoration:underline!important;padding:20px!important}h1,h2,h3{font-size:50px!important;color:red!important;margin:40px!important;font-weight:400!important}p,ul,li,div,span{margin:20px!important;padding:20px!important;background:yellow!important}*{box-sizing:content-box!important}';
const page = (p, w, h) => `<!doctype html><meta charset=utf-8><style>body{margin:0}${h ? HOSTILE : ''}</style><div id=col style="width:${w}px">${rd(`prod-${p}-1-hero.html`)}${rd(`prod-${p}-2-cbl-open.html`)}${CBL}${rd(`prod-${p}-3-cbl-close.html`)}</div>`;
const lum = c => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
(async () => {
  const br = await chromium.launch(); let fail = 0; const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) fail++; };
  for (const [p, title] of PAGES) {
    console.log('== ' + p);
    for (const w of [1100, 960, 820, 700, 560, 375]) {
      const pg = await br.newPage({ viewport: { width: w === 375 ? 375 : 1200, height: 900 } }); const errs = [], reqs = [];
      pg.on('console', m => m.type() === 'error' && errs.push(m.text())); pg.on('pageerror', e => errs.push(String(e))); pg.on('request', r => !/^(data|about):/.test(r.url()) && reqs.push(r.url()));
      await pg.setContent(page(p, w === 375 ? 343 : w, false)); await pg.waitForTimeout(80);
      const r = await pg.evaluate(p => {
        const de = document.documentElement, bad = [];
        document.querySelectorAll(`.${p}-hub *`).forEach(e => { if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline') bad.push(e.className); });
        const a = document.querySelector(`.${p}-crumb a`), t = document.querySelector(`.${p}-title`), hero = document.querySelector(`.${p}-hero`), wr = document.querySelector(`.${p}-cbl-wrap`), cs = getComputedStyle(wr), hs = getComputedStyle(hero);
        return { hs: de.scrollWidth > de.clientWidth, bad, heroH: hero.getBoundingClientRect().height, href: a && a.href, title: t.textContent, fs: getComputedStyle(t).fontSize, fw: getComputedStyle(t).fontWeight, mt: getComputedStyle(t).marginTop, pad: hs.padding, minH: hs.minHeight,
          wrap: [cs.borderTopWidth, cs.boxShadow, cs.backgroundColor, cs.backgroundImage], blobs: (hs.backgroundImage.match(/radial-gradient/g) || []).length,
          anim: [...document.querySelectorAll(`.${p}-hub *`)].filter(e => parseFloat(getComputedStyle(e).transitionDuration) > 0).length };
      }, p);
      ok(!r.hs && !r.bad.length, `${w}: нет гор. скролла/обрезок ${r.bad}`); ok(r.heroH >= 160 && r.minH === '160px', `${w}: hero ${Math.round(r.heroH)}px`);
      ok(r.href === BUP, `${w}: крошка → ${r.href}`); ok(r.title === title, `${w}: заголовок «${r.title}»`);
      ok(r.fs === '22px' && r.fw === '700' && r.mt === '10px', `${w}: заголовок 22/700/mt10`); ok(r.blobs === 2, `${w}: 2 blob`);
      ok(r.wrap[0] === '0px' && r.wrap[1] === 'none' && r.wrap[2] === 'rgba(0, 0, 0, 0)' && r.wrap[3] === 'none', `${w}: CBL-обёртка без рамок/фона`);
      ok(!errs.length && !reqs.length && !r.anim, `${w}: консоль/сеть/анимации чисто ${errs} ${reqs}`);
      // контраст: фон без текста (цвет текста прозрачный) → пиксели под строками текста
      await pg.addStyleTag({ content: `html body .${p}-hub h1.${p}-title,html body .${p}-hub .${p}-crumb a,html body .${p}-hub .${p}-crumb a:visited{color:transparent !important}` });
      const boxes = await pg.evaluate(p => { const out = []; for (const [s, a] of [[`.${p}-title`, 1], [`.${p}-crumb a`, .65]]) { const el = document.querySelector(s), rg = document.createRange(); rg.selectNodeContents(el); for (const q of rg.getClientRects()) out.push([q.x, q.y, q.width, q.height, a]); } return out; }, p);
      const shot = (await pg.screenshot()).toString('base64');
      const worst = await pg.evaluate(async ([b64, boxes]) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
        const L = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4, lm = c => .2126 * L(c[0]) + .7152 * L(c[1]) + .0722 * L(c[2]); let w = 99;
        for (const [bx, by, bw, bh, a] of boxes) { const d = x.getImageData(Math.floor(bx), Math.floor(by), Math.ceil(bw), Math.ceil(bh)).data; for (let i = 0; i < d.length; i += 4) { const bg = [d[i], d[i + 1], d[i + 2]], fg = bg.map(v => 255 * a + v * (1 - a)); const l1 = lm(fg), l2 = lm(bg); w = Math.min(w, (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05)); } } return w; }, [shot, boxes]);
      ok(worst >= 4.5, `${w}: контраст текста hero худший ${worst.toFixed(2)}`);
      await pg.close();
    }
    // hover/focus/клик, reduced-motion, изоляция
    const pg = await br.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' }); await pg.setContent(page(p, 1100, false));
    await pg.hover(`.${p}-crumb a`); ok(await pg.evaluate(p => getComputedStyle(document.querySelector(`.${p}-crumb a`)).textDecorationLine, p) === 'underline', 'hover: underline');
    await pg.keyboard.press('Tab'); ok(await pg.evaluate(p => getComputedStyle(document.querySelector(`.${p}-crumb a`)).outlineStyle !== 'none', p), 'focus-visible outline');
    ok(await pg.evaluate(p => matchMedia('(prefers-reduced-motion:reduce)').matches && ![...document.querySelectorAll(`.${p}-hub *`)].some(e => parseFloat(getComputedStyle(e).animationDuration) > 0), p), 'reduced-motion'); await pg.close();
    const ph = await br.newPage({ viewport: { width: 1200, height: 900 } }); await ph.setContent(page(p, 1100, true));
    const s = await ph.evaluate(p => { const g = (q, k) => getComputedStyle(document.querySelector(q))[k]; return [g(`.${p}-title`, 'fontSize'), g(`.${p}-title`, 'color'), g(`.${p}-title`, 'fontWeight'), g(`.${p}-crumb a`, 'color'), g(`.${p}-crumb a`, 'paddingTop'), g(`.${p}-hero`, 'paddingLeft'), g(`.${p}-cbl-wrap`, 'backgroundColor'), g(`.${p}-cbl-wrap li`, 'paddingTop'), g(`.${p}-cbl-wrap li`, 'borderBottomWidth'), g(`.${p}-cbl-wrap a`, 'color')]; }, p);
    ok(s.join('|') === '22px|rgb(255, 255, 255)|700|rgba(255, 255, 255, 0.65)|2px|32px|rgba(0, 0, 0, 0)|8px|1px|rgb(14, 124, 123)', 'изоляция от чужих стилей ' + s);
    await ph.close();
    for (const part of ['1-hero', '2-cbl-open', '3-cbl-close']) ok(fs.statSync(path.join(D, `prod-${p}-${part}.html`)).size <= 38 * 1024, `${part} ≤ 38 КБ`);
    ok(!/localStorage|sessionStorage|position:\s*fixed|100vh|https?:\/\/(?!kb\.severstal)|@import|<link|<img|url\(/.test(rd(`prod-${p}-1-hero.html`) + rd(`prod-${p}-2-cbl-open.html`)), 'нет запрещённого');
  }
  await br.close(); console.log(fail ? `ПРОВАЛОВ: ${fail}` : 'ВСЁ ЗЕЛЁНОЕ'); process.exit(fail ? 1 : 0);
})();
