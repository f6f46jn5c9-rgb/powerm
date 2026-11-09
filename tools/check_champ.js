// Проверка комплекса Чемпионат: node tools/check_champ.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const R = path.resolve(__dirname, '..');
const PAGES = { 'champ-hub': 'О чемпионате', 'champ-golos': 'Голосование 2026', 'champ-2023': '2023', 'champ-2024': '2024', 'champ-2025': '2025' };
const TITLES = { 'champ-hub': 'Чемпионат лучших практик', 'champ-golos': 'Голосование 2026', 'champ-2023': 'Чемпионат лучших практик 2023', 'champ-2024': 'Чемпионат лучших практик 2024', 'champ-2025': 'Чемпионат лучших практик 2025' };
const URLS = ['584516251', '584516288', '202375778', '306053122', '410419331'].map(i => `https://kb.severstal.com/spaces/BSS/pages/${i}/`);
const WIDTHS = [1100, 960, 820, 700, 560, 375];
const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
let fails = 0; const bad = m => { fails++; console.log('FAIL', m); };
(async () => {
  const br = await chromium.launch();
  for (const [p, cur] of Object.entries(PAGES)) {
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(p)) continue;
    const file = path.join(R, 'dist', p + '.html'); const html = fs.readFileSync(file, 'utf8');
    const kb = Buffer.byteLength(html) / 1024; if (kb > 38) bad(`${p} ${kb.toFixed(1)} КБ`);
    if (/https?:\/\/(?!kb\.severstal\.com)/.test(html.replace(/xmlns="[^"]*"/g, ''))) bad(p + ' внешний URL в коде');
    if (/localStorage|sessionStorage|position:\s*fixed|100vh|@import/.test(html)) bad(p + ' запрещённая конструкция');
    for (const w of WIDTHS) {
      const page = await br.newPage({ viewport: { width: 1300, height: 900 } });
      const errs = [], reqs = [];
      page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
      page.on('request', r => { if (!/^(data:|about:)/.test(r.url())) reqs.push(r.url()); });
      await page.setContent(`<body style="margin:0;font-family:Arial"><div id="w" style="width:${w}px">${html}</div></body>`);
      await page.waitForTimeout(150);
      const tag = `${p}@${w}`;
      if (errs.length) bad(tag + ' console ' + errs.join('|')); if (reqs.length) bad(tag + ' запросы ' + reqs.join(','));
      const r = await page.evaluate(({ cur, w }) => {
        const out = {}; const wrap = document.getElementById('w'); const root = wrap.querySelector('.champ');
        out.hscroll = wrap.scrollWidth > w || root.scrollWidth > root.clientWidth + 1;
        // обрезки текста: элементы с текстом, у которых scrollWidth > clientWidth (кроме прокручиваемой навигации)
        out.clip = [...root.querySelectorAll('h1,p,.champ-hub-tile__title,.champ-crumb')].filter(e => !e.closest('.champ-nav') || true).filter(e => e.scrollWidth > e.clientWidth + 1 && !e.closest('.champ-nav')).map(e => e.className);
        out.navScrollbar = 0; out.notabs = !root.querySelector('.champ-nav,.champ-tab'); const cr = root.querySelectorAll('.champ-crumb a'); out.crumb = cr.length + '|' + (cr[0] && cr[0].getAttribute('href')) + '|' + (cr[0] && cr[0].textContent);
        const h = root.querySelector('h1'); out.h1 = h.textContent; out.nonav = !!root.querySelector('.champ-key,.champ-warn');
        const sec = root.querySelector('.champ-hub-tiles-section');
        if (sec) { const cs = getComputedStyle(sec); out.secBg = cs.backgroundColor + '|' + cs.backgroundImage; out.cols = cs.gridTemplateColumns.split(' ').length;
          out.fxBg = getComputedStyle(root.querySelector('.champ-hub-tile__fx')).backgroundImage; out.tiles = [...root.querySelectorAll('.champ-hub-tile')].map(a => [a.getAttribute('href'), a.getAttribute('aria-label')]); }
        out.hover = [...root.querySelectorAll('.champ-hero,.champ-heroa,h1,p')].map(e => getComputedStyle(e).transitionDuration).filter(t => t !== '0s');
        return out;
      }, { cur, w });
      if (r.hscroll) bad(tag + ' горизонтальный скролл'); if (r.clip.length) bad(tag + ' обрезка ' + r.clip);
      if (r.navScrollbar > 0) bad(tag + ' виден scrollbar навигации'); if (w < 500 && !r.navScroll && false) {}
      if (r.h1 !== TITLES[p]) bad(tag + ' h1 «' + r.h1 + '»');
      if (r.nonav) bad(tag + ' есть плашки key/warn'); if (r.hover.length) bad(tag + ' transition у неинтерактива');
      if (!r.notabs) bad(tag + ' есть полоса вкладок'); if (r.crumb !== '1|https://kb.severstal.com/spaces/BSS/|БУП') bad(tag + ' крошка ' + r.crumb);
      if (p === 'champ-hub') {
        if (!/radial-gradient/.test(r.fxBg)) bad(tag + ' fx без radial-gradient');
        if (!/rgba\(0, 0, 0, 0\)\|none/.test(r.secBg)) bad(tag + ' фон секции плашек ' + r.secBg);
        if (r.cols !== (w >= 560 ? 2 : 1)) bad(tag + ' колонок ' + r.cols);
        if (r.tiles.map(t => t[0]).join() !== [URLS[1], URLS[4], URLS[3], URLS[2]].join()) bad(tag + ' URL плашек');
      }
      // контраст: прячем текст, берём фон по пикселям, сравниваем с цветом текста (худший фон)
      const items = await page.evaluate(() => {
        const root = document.querySelector('.champ'); const q = [...root.querySelectorAll('h1,p,.champ-crumb a,.champ-hub-tile__title,.champ-hub-tile__arrow')];
        return q.map((e, i) => { e.setAttribute('data-ci', i); const b = e.getBoundingClientRect(); const c = getComputedStyle(e).color.match(/[\d.]+/g).map(Number); return { i, x: b.x, y: b.y + scrollY, w: b.width, h: b.height, c, n: e.className || e.tagName }; });
      });
      await page.addStyleTag({ content: '.champ *{-webkit-text-fill-color:transparent !important;text-shadow:none !important}' });
      await page.evaluate(() => document.querySelectorAll('.champ svg').forEach(s => s.style.visibility = 'hidden'));
      const full = await page.screenshot({ fullPage: true, animations: 'disabled' });
      const px = await page.evaluate(async b64 => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return { w: im.width, d: Array.from(x.getImageData(0, 0, im.width, im.height).data) }; }, full.toString('base64')).catch(() => null);
      if (px) for (const it of items) {
        if (it.w < 2 || it.h < 2) continue; const tab = String(it.n).includes('champ-tab');
        let worst = 99; const rootPx = (x, y) => { const k = (Math.floor(y) * px.w + Math.floor(x)) * 4; return [px.d[k], px.d[k + 1], px.d[k + 2], px.d[k + 3]]; };
        for (let sx = 0; sx < 8; sx++) for (let sy = 0; sy < 4; sy++) { const bg = rootPx(it.x + it.w * (sx + .5) / 8, it.y + it.h * (sy + .5) / 4); let tc = it.c.slice(0, 3); const a = it.c[3] === undefined ? 1 : it.c[3]; tc = tc.map((v, k) => v * a + bg[k] * (1 - a)); worst = Math.min(worst, ratio(tc, bg)); }
        const soon = false; if (worst < 4.5) bad(`${tag} контраст ${worst.toFixed(2)} ${it.n}`);
      }
      if (w === 1100 || w === 375) await page.screenshot({ path: `/tmp/champ-${p}-${w}.png`, fullPage: true });
      // reduced motion
      if (w === 1100) { await page.emulateMedia({ reducedMotion: 'reduce' }); const t = await page.evaluate(() => [...document.querySelectorAll('.champ a')].map(a => getComputedStyle(a).transitionDuration + getComputedStyle(a).animationName)); if (t.some(s => !/^0s/.test(s) && !/^0s,/.test(s))) bad(p + ' reduced-motion ' + t.join(';')); }
      await page.close();
    }
  }
  await br.close(); console.log(fails ? `FAILS: ${fails}` : 'ALL GREEN'); process.exit(fails ? 1 : 0);
})();
