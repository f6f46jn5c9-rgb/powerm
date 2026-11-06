// Проверка хаба «HR и обучение» в Chromium.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const R = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(R, 'dist/hub-hr.html'), 'utf8');
const lum = c => { c = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const hx = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const reqs = [], errs = [];
  async function open(w, vw, rm) {
    const ctx = await b.newContext({ viewport: { width: vw || w + 40, height: 900 }, reducedMotion: rm ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(String(e)));
    pg.on('request', r => { if (!/^(data|about):/.test(r.url())) reqs.push(r.url()); });
    await pg.setContent('<!doctype html><meta charset=utf-8><body style="margin:0;background:#fff"><div id="col" style="width:' + w + 'px;max-width:100%;margin:0;font:16px Arial">' + html + '</div>');
    await pg.waitForTimeout(rm ? 100 : 800); return pg;
  }
  const measure = () => {
    const col = document.getElementById('col'), cw = col.getBoundingClientRect().width;
    const vis = e => !!(e.offsetWidth || e.offsetHeight);
    const over = [], clip = [];
    col.querySelectorAll('*').forEach(e => { if (!vis(e) || e.closest('svg,.sm-hr-tabs__fx,.sm-hr-tabs__glass')) return; const b = e.getBoundingClientRect(); if (b.right > cw + .5 || b.left < -.5) over.push(e.className || e.tagName); });
    col.querySelectorAll('h2,h3,p,a.sm-hr-hero__back,.sm-hr-tabs__name,.sm-hr-tabs__stub,.sm-hr-tabs__tab,.sm-hr-cta__title,.sm-hr-cta__hint').forEach(e => { if (vis(e) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) clip.push(e.className + ':' + e.textContent.slice(0, 20)); });
    const inside = [...col.querySelectorAll('.sm-hr-tabs__tile')].filter(vis).every(t => { const tb = t.getBoundingClientRect(), n = t.querySelector('.sm-hr-tabs__name').getBoundingClientRect(); return n.bottom <= tb.bottom - 8 && n.right <= tb.right - 8; });
    const g = p => getComputedStyle(document.querySelector('.sm-hr-tabs__panel:not([hidden]) .sm-hr-tabs__grid')).gridTemplateColumns.split(' ').length;
    const tiles = [...col.querySelectorAll('.sm-hr-tabs__tile')].filter(vis).map(e => Math.round(e.getBoundingClientRect().height));
    return { sw: document.documentElement.scrollWidth, vw: innerWidth, over, clip, inside, cols: g(), tiles };
  };
  for (const [w, vw] of [[1100, 1300], [960, 1300], [820, 1300], [700, 1300], [560, 1300], [343, 375]]) {
    const pg = await open(w, vw);
    for (const tab of ['hr', 'bs']) {
      if (tab === 'bs') await pg.click('#sm-hr-tab-bs');
      const r = await pg.evaluate(measure);
      ok(r.sw <= r.vw && !r.over.length, `${w}px/${tab}: нет горизонтального скролла (${r.sw}/${r.vw}) ${r.over.slice(0, 3)}`);
      ok(!r.clip.length && r.inside, `${w}px/${tab}: текст не обрезан, название внутри плашки ${r.clip.slice(0, 3)}`);
      ok(r.cols === (w >= 700 ? 3 : 2) && r.tiles.length === 5 && r.tiles.every(h => h === 110), `${w}px/${tab}: колонок ${r.cols}, плашек ${r.tiles.length}, высоты ${r.tiles}`);
    }
    await pg.context().close();
  }
  const pg = await open(1100);
  // контраст белого названия — обе вкладки
  let worst = 99, wt = '';
  for (const tab of ['hr', 'bs']) {
    if (tab === 'bs') await pg.click('#sm-hr-tab-bs');
    await pg.addStyleTag({ content: '#col .sm-hr-tabs__name{color:transparent !important;text-shadow:none !important}.sm-hr-tabs__tile{animation:none !important}' });
    await pg.waitForTimeout(250);
    const rects = await pg.evaluate(() => [...document.querySelectorAll('.sm-hr-tabs__panel:not([hidden]) .sm-hr-tabs__name')].map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, t: e.textContent }; }));
    const png = await pg.screenshot({ fullPage: true }); const tmp = path.join(R, 'tools/_hr_c.png'); fs.writeFileSync(tmp, png);
    const py = 'import sys,json\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nout=[]\nfor h in json.loads(sys.argv[2]):\n  for y in range(int(h["y"]),int(h["y"]+h["h"]),2):\n    for x in range(int(h["x"]),int(h["x"]+h["w"]),3):\n      out.append((im.getpixel((x,y)),h["t"]))\nprint(json.dumps(out))';
    const res = JSON.parse(require('child_process').execFileSync('python3', ['-I', '-c', py, tmp, JSON.stringify(rects)], { maxBuffer: 1 << 28 }).toString()); fs.rmSync(tmp);
    for (const [c, t] of res) { const k = cr([255, 255, 255], c); if (k < worst) { worst = k; wt = tab + ' ' + t + ' ' + c; } }
  }
  ok(worst >= 4.5, `контраст белого названия на плашках (обе вкладки), худший ${worst.toFixed(2)}:1 (${wt})`);
  [['#ffffff', '#4a6cb7', 'активный таб (белый на акценте)'], ['#1a2a5e', '#ffffff', 'неактивный таб/заголовок'], ['#4a6cb7', '#ffffff', 'HR градиент (конец)'], ['#3a5ba0', '#ffffff', 'HR градиент (начало)'], ['#6b7280', '#ffffff', 'крошка/подзаголовок/метка'], ['#6b7280', '#f7f9fb', 'заглушка'], ['#3a5ba0', '#f7f9fb', 'тег в заглушке'], ['#4a5a85', '#f1f5fb', 'подсказка CTA'], ['#3a5ba0', '#ffffff', 'CTA иконка/стрелка']]
    .forEach(([f, bg, n]) => ok(cr(hx(f), hx(bg)) >= 4.5, `контраст ${f} на ${bg} = ${cr(hx(f), hx(bg)).toFixed(2)}:1 (${n})`));
  // вкладки: мышь
  await pg.evaluate(() => window.scrollTo(0, 0));
  const st = () => pg.evaluate(() => ({ sel: [...document.querySelectorAll('[role=tab]')].map(t => t.getAttribute('aria-selected')), hid: [...document.querySelectorAll('[role=tabpanel]')].map(p => p.hidden), ti: [...document.querySelectorAll('[role=tab]')].map(t => t.tabIndex), fo: document.activeElement.id }));
  const pg2 = await open(1100); let s = await st.call(null).catch(() => null);
  const S = () => pg2.evaluate(() => ({ sel: [...document.querySelectorAll('[role=tab]')].map(t => t.getAttribute('aria-selected')).join(), hid: [...document.querySelectorAll('[role=tabpanel]')].map(p => p.hidden).join(), fo: document.activeElement.id }));
  s = await S(); ok(s.sel === 'true,false' && s.hid === 'false,true', 'по умолчанию активен HR ' + JSON.stringify(s));
  await pg2.click('#sm-hr-tab-bs'); s = await S(); ok(s.sel === 'false,true' && s.hid === 'true,false', 'клик БССМ: панели переключены');
  await pg2.click('#sm-hr-tab-hr'); s = await S(); ok(s.sel === 'true,false' && s.hid === 'false,true', 'клик HR: назад');
  // клавиатура
  await pg2.focus('#sm-hr-tab-hr'); await pg2.keyboard.press('ArrowRight'); s = await S();
  ok(s.fo === 'sm-hr-tab-bs' && s.sel === 'true,false', 'Right: фокус на БССМ, выбор не меняется до Enter ' + JSON.stringify(s));
  await pg2.keyboard.press('Enter'); s = await S(); ok(s.sel === 'false,true' && s.hid === 'true,false', 'Enter: БССМ активна');
  await pg2.keyboard.press('ArrowLeft'); s = await S(); ok(s.fo === 'sm-hr-tab-hr', 'Left: фокус на HR');
  await pg2.keyboard.press('Enter'); s = await S(); ok(s.sel === 'true,false', 'Enter: HR активна');
  const fo = await pg2.evaluate(() => { const e = document.activeElement, c = getComputedStyle(e); return c.outlineStyle + ' ' + c.outlineWidth; });
  ok(/solid 3px/.test(fo), 'focus-visible таба: ' + fo);
  // hover плашки
  const tile = pg2.locator('.sm-hr-tabs__panel:not([hidden]) .sm-hr-tabs__tile').first(); await tile.hover(); await pg2.waitForTimeout(450);
  const th = await pg2.evaluate(() => { const t = document.querySelector('.sm-hr-tabs__panel:not([hidden]) .sm-hr-tabs__tile'); return [getComputedStyle(t).transform, getComputedStyle(t.querySelector('.sm-hr-tabs__arrow')).transform]; });
  ok(/matrix\(1, 0, 0, 1, 0, -3\)/.test(th[0]) && /matrix\(1, 0, 0, 1, 4, 0\)/.test(th[1]), 'hover плашки: подъём и стрелка ' + th);
  const btn = pg2.locator('.sm-hr-cta__btn'); await btn.hover(); await pg2.waitForTimeout(450);
  ok(/matrix\(1, 0, 0, 1, 0, -3\)/.test(await btn.evaluate(e => getComputedStyle(e).transform)), 'hover CTA: подъём');
  const m = await pg2.evaluate(() => {
    const g = (q, p) => getComputedStyle(document.querySelector(q))[p]; const i = document.querySelector('.sm-hr-hero__ico').getBoundingClientRect();
    return { ico: Math.round(i.width) + 'x' + Math.round(i.height), fs: g('.sm-hr-hero__title', 'fontSize'), back: g('.sm-hr-hero__back', 'fontSize'), sub: g('.sm-hr-hero__sub', 'fontSize'), line: g('.sm-hr-hero__line', 'height'), lab: g('.sm-hr-tabs__label', 'fontSize'),
      bf: g('.sm-hr-tabs__glass', 'backdropFilter'), cur: [...document.querySelectorAll('#col *')].filter(e => getComputedStyle(e).cursor === 'pointer' && !e.closest('a') && e.getAttribute('role') !== 'tab').length,
      links: [...document.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.target]), act: getComputedStyle(document.querySelector('[role=tab][aria-selected=true]')).backgroundColor };
  });
  ok(m.ico === '44x44' && m.fs === '26px' && m.back === '13px' && m.sub === '14px' && m.line === '4px' && m.lab === '11px', 'размеры шапки/метки по ТЗ ' + JSON.stringify([m.ico, m.fs, m.back, m.sub, m.line, m.lab]));
  ok(/blur\(14px\)/.test(m.bf), 'backdrop-filter: ' + m.bf);
  ok(m.act === 'rgb(74, 108, 183)', 'активный таб: фон акцента ' + m.act);
  ok(m.links.length === 12 && m.links[0][0] === 'URL_PLACEHOLDER_STARTOVAYA' && m.links.slice(1).every(l => l[1] === '_blank') && m.links[11][0] === 'URL_PLACEHOLDER_БУДЬ_В_КУРСЕ', 'ссылок 12: крошка + 10 плашек + CTA, _blank у всех кроме крошки');
  ok(!m.cur, 'cursor:pointer только у ссылок и табов');
  await pg2.context().close(); await pg.context().close();
  const rm = await open(1100, 1300, true);
  const an = await rm.evaluate(() => [...document.querySelectorAll('.sm-hr-tabs__tile,.sm-hr-cta__btn')].map(e => getComputedStyle(e).animationName));
  ok(an.every(n => n === 'none'), 'prefers-reduced-motion: анимации выключены'); await rm.context().close();
  ok(!reqs.length, 'внешние запросы: ' + (reqs.join(',') || 'нет')); ok(!errs.length, 'ошибки консоли: ' + (errs.join('|') || 'нет'));
  ok(!/(https?:)?\/\/[^"' )]*\.(js|css|woff2?|png|jpe?g)|@import|<link|url\(|localStorage|sessionStorage|position:\s*fixed|100vh|E31E24|data:image/i.test(html), 'нет внешних ресурсов/storage/fixed/100vh/E31E24/base64');
  ok(!/(^|[}\s,])(\*|body|html|a|h2|h3|p|button)\s*[{,]/.test(html.replace(/\.sm-hr-[^{,]*/g, '')), 'нет глобальных селекторов');
  const kb = Buffer.byteLength(html) / 1024; ok(kb <= 38, `размер ${kb.toFixed(1)} КБ ≤ 38`);
  await b.close(); console.log(fails ? `\nПРОВАЛЕНО: ${fails}` : '\nВСЕ ПРОВЕРКИ ПРОЙДЕНЫ'); process.exit(fails ? 1 : 0);
})();
