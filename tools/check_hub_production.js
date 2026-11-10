// Проверка хаба «Производство» в Chromium: ширины, скролл, контраст, hover, backdrop-filter, сеть, консоль, reduced-motion.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const R = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(R, 'dist/hub-production.html'), 'utf8');
const lum = c => { c = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const reqs = [], errs = [];
  async function open(w, vw, opts = {}) {
    const ctx = await b.newContext({ viewport: { width: vw || w + 40, height: 900 }, reducedMotion: opts.rm ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(String(e)));
    pg.on('request', r => { if (!r.url().startsWith('data:') && !r.url().startsWith('about:')) reqs.push(r.url()); });
    await pg.setContent('<!doctype html><meta charset=utf-8><body style="margin:0;background:#fff"><div id="col" style="width:' + w + 'px;max-width:100%;margin:0;font:16px Arial">' + html + '</div>');
    await pg.waitForTimeout(opts.rm ? 100 : 800);
    return pg;
  }
  for (const [w, vw] of [[1100, 1300], [960, 1300], [820, 1300], [700, 1300], [560, 1300], [343, 375]]) {
    const pg = await open(w, vw);
    const r = await pg.evaluate(() => {
      const col = document.getElementById('col'), cw = col.getBoundingClientRect().width;
      const over = []; col.querySelectorAll('*').forEach(e => { const b = e.getBoundingClientRect(); if (b.width && (b.right > cw + 0.5 || b.left < -0.5) && !e.closest('.sm-prod-suzhety__fx,.sm-prod-suzhety__glass,svg')) over.push(e.className || e.tagName); });
      const clip = []; col.querySelectorAll('h2,h3,p,a.sm-prod-hero__back,.sm-prod-suzhety__name').forEach(e => { if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) clip.push(e.className + ':' + e.textContent.slice(0, 20)); });
      const cols = getComputedStyle(document.querySelector('.sm-prod-suzhety__grid')).gridTemplateColumns.split(' ').length;
      const tiles = [...document.querySelectorAll('.sm-prod-suzhety__tile')].map(e => Math.round(e.getBoundingClientRect().height));
      return { sw: document.documentElement.scrollWidth, vw: innerWidth, cw, over, clip, cols, tiles };
    });
    ok(r.sw <= r.vw && !r.over.length, `${w}px: нет горизонтального скролла (scrollW ${r.sw}/${r.vw}) ${r.over.slice(0, 3)}`);
    ok(!r.clip.length, `${w}px: текст не обрезан ${r.clip.slice(0, 3)}`);
    ok(r.cols === (w >= 700 ? 3 : 2), `${w}px: колонки сюжетов ${r.cols}`);
    ok(r.tiles.every(h => h === 110), `${w}px: высота плашек 110 (${r.tiles.join(',')})`);
    await pg.context().close();
  }
  // основной прогон 1100
  const pg = await open(1100);
  // контраст текста плашек: пиксели под текстом без текста
  const hide = await pg.evaluate(() => { const els = [...document.querySelectorAll('.sm-prod-suzhety__name')]; return els.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, t: e.textContent }; }); });
  await pg.addStyleTag({ content: '#col .sm-prod-suzhety .sm-prod-suzhety__name{color:transparent !important;text-shadow:none !important}.sm-prod-suzhety__tile{animation:none !important}' });
  await pg.waitForTimeout(200);
  await pg.evaluate(() => window.scrollTo(0, 0));
  const png = await pg.screenshot({ fullPage: true });
  const tmp = path.join(R, 'tools/_hub_c.png'); fs.writeFileSync(tmp, png);
  const py = `import sys,json\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nout=[]\nfor h in json.loads(sys.argv[2]):\n  for y in range(int(h["y"]),int(h["y"]+h["h"]),2):\n    for x in range(int(h["x"]),int(h["x"]+h["w"]),3):\n      out.append((im.getpixel((x,y)),h["t"]))\nprint(json.dumps(out))`;
  const res = JSON.parse(require('child_process').execFileSync('python3', ['-I', '-c', py, tmp, JSON.stringify(hide)], { maxBuffer: 1 << 28 }).toString());
  fs.rmSync(tmp);
  let worst = 99, worstT = '';
  for (const [c, t] of res) { const k = cr([255, 255, 255], c); if (k < worst) { worst = k; worstT = t + ' rgb ' + c; } }
  ok(worst >= 4.5, `контраст белого названия на плашках, худший пиксель ${worst.toFixed(2)}:1 (${worstT})`);
  // расчётные контрасты палитры
  const pairs = [['#0a5f5e', '#ffffff', 'заголовок-градиент (тёмный край)'], ['#0e7c7b', '#ffffff', 'градиент заголовка (hub-accent)'], ['#6b7280', '#ffffff', 'крошка ← БУП'], ['#6b7280', '#ffffff', 'подзаголовок/«Сюжеты»'], ['#1a2a5e', '#ffffff', 'заголовки'], ];
  const hx = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  pairs.forEach(([f, bg, n]) => ok(cr(hx(f), hx(bg)) >= 4.5, `контраст ${f} на ${bg} = ${cr(hx(f), hx(bg)).toFixed(2)}:1 (${n})`));
  // hover
  const tile = pg.locator('.sm-prod-suzhety__tile').first(); await tile.scrollIntoViewIfNeeded(); await tile.hover(); await pg.waitForTimeout(450);
  const th = await pg.evaluate(() => { const t = document.querySelector('.sm-prod-suzhety__tile'); return { tr: getComputedStyle(t).transform, sh: getComputedStyle(t).boxShadow, ar: getComputedStyle(t.querySelector('.sm-prod-suzhety__arrow')).transform }; });
  ok(/matrix\(1, 0, 0, 1, 0, -3\)/.test(th.tr), 'hover плашки: подъём -3px (' + th.tr + ')');
  ok(/matrix\(1, 0, 0, 1, 4, 0\)/.test(th.ar), 'hover плашки: стрелка +4px');
  // курсор, backdrop, фокус, ссылки
  const m = await pg.evaluate(() => {
    const cur = []; document.querySelectorAll('#col *').forEach(e => { if (getComputedStyle(e).cursor === 'pointer' && !e.closest('a')) cur.push(e.className || e.tagName); });
    const g = getComputedStyle(document.querySelector('.sm-prod-suzhety__glass'));
    const links = [...document.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.target]);
    return { cur, bf: g.backdropFilter || g.webkitBackdropFilter, links, svgHidden: [...document.querySelectorAll('svg')].every(s => s.getAttribute('aria-hidden') === 'true'), title: getComputedStyle(document.querySelector('.sm-prod-hero__title')).webkitTextFillColor, fs: getComputedStyle(document.querySelector('.sm-prod-hero__title')).fontSize, sizes: (() => { const g = (q, p) => getComputedStyle(document.querySelector(q))[p]; const i = document.querySelector('.sm-prod-hero__ico').getBoundingClientRect(); return { ico: Math.round(i.width) + 'x' + Math.round(i.height), back: g('.sm-prod-hero__back', 'fontSize'), sub: g('.sm-prod-hero__sub', 'fontSize'), line: g('.sm-prod-hero__line', 'height'), name: g('.sm-prod-suzhety__name', 'fontSize'), lab: g('.sm-prod-suzhety__title', 'fontSize') }; })() };
  });
  ok(!m.cur.length, 'cursor:pointer только у ссылок ' + m.cur.slice(0, 3));
  ok(/blur\(14px\)/.test(m.bf), 'backdrop-filter в Chromium: ' + m.bf);
  ok(m.links.length === 7 && m.links.slice(1).every(l => l[1] === '_blank'), 'ссылок 7 (крошка + 6 плашек), плашки target=_blank');
  ok(m.links[0][0] === 'URL_PLACEHOLDER_STARTOVAYA', 'крошка → URL_PLACEHOLDER_STARTOVAYA');
  ok(m.fs === '26px', 'размер заголовка 26px');
  ok(m.sizes.ico === '44x44' && m.sizes.back === '13px' && m.sizes.sub === '14px' && m.sizes.line === '4px' && m.sizes.name === '15px' && m.sizes.lab === '11px', 'размеры по ТЗ ' + JSON.stringify(m.sizes));
  await pg.keyboard.press('Tab');
  const fo = await pg.evaluate(() => { const e = document.activeElement; return getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth + ' ' + e.className; });
  ok(/solid 3px/.test(fo), 'focus-visible: ' + fo);
  await pg.screenshot({ path: path.join(R, 'tools/_hub_tile.png'), clip: { x: 0, y: 0, width: 10, height: 10 } }).catch(() => {});
  await pg.context().close();
  // reduced motion
  const rm = await open(1100, 1300, { rm: true });
  const an = await rm.evaluate(() => [...document.querySelectorAll('.sm-prod-suzhety__tile')].map(e => getComputedStyle(e).animationName));
  ok(an.every(n => n === 'none'), 'prefers-reduced-motion: анимации входа выключены (' + [...new Set(an)] + ')');
  await rm.context().close();
  ok(!reqs.length, 'внешние запросы: ' + (reqs.length ? reqs.join(',') : 'нет'));
  ok(!errs.length, 'ошибки консоли: ' + (errs.length ? errs.join('|') : 'нет'));
  ok(!/(https?:)?\/\/[^"' )]*\.(js|css|woff2?|png|jpe?g)|@import|<link|url\(|localStorage|sessionStorage|position:\s*fixed|100vh|E31E24/i.test(html), 'нет внешних ресурсов/localStorage/fixed/100vh/E31E24');
  ok(!/(^|[}\s,])(\*|body|html|a|h2|h3|p)\s*[{,]/.test(html.replace(/\.sm-prod-[^{,]*/g, '')), 'нет глобальных селекторов (грубая проверка)');
  const kb = Buffer.byteLength(html) / 1024; ok(kb <= 38, `размер ${kb.toFixed(1)} КБ ≤ 38`);
  await b.close(); fs.rmSync(path.join(R, 'tools/_hub_tile.png'), { force: true });
  console.log(fails ? `\nПРОВАЛЕНО: ${fails}` : '\nВСЕ ПРОВЕРКИ ПРОЙДЕНЫ'); process.exit(fails ? 1 : 0);
})();
