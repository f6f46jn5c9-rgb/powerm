// Проверка страницы «Лучшие практики проектов» в Chromium (Playwright). Запуск: node tools/check_bp.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..');
const NAMES = ['1-shapka', '2-programma-dbv', '3-shkola-v-razrabotke'];
const blocks = NAMES.map(n => fs.readFileSync(path.join(R, 'dist/bp', n + '.html'), 'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(R, 'src/bp/practices.json'), 'utf8'));
const HOSTILE = `a,a:visited,a:hover{color:#f00 !important;font-size:31px !important;text-decoration:none !important;font-weight:400 !important;background:#ff0 !important}
h1,h2,h3{color:#f00 !important;font-size:47px !important;margin:33px !important;padding:19px !important;border-bottom:5px solid #f00 !important;background:#0f0 !important;text-transform:uppercase !important}
p{color:#f00 !important;font-size:29px !important;margin:31px !important;padding:17px !important;line-height:2.5 !important}
table,td,th{color:#f00 !important;font-size:29px !important;margin:31px !important;padding:17px !important}
ol,ul,li{margin:29px !important;padding:23px !important;list-style:disc !important;color:#f00 !important}
.wiki-content a,.wiki-content h1,.wiki-content h2,.wiki-content h3,.wiki-content p,.wiki-content li{color:#f00 !important;font-size:35px !important;margin:21px !important}`;
const page = (w, hostile) => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#fff;font-family:serif}#c{width:${w}px;max-width:100%}${hostile ? HOSTILE : ''}</style></head><body class="wiki-content"><h2 id="out-h">Чужой заголовок</h2><p id="out-p">Чужой текст <a id="out-a" href="#" tabindex="-1">ссылка</a></p><div id="c">${blocks.join('\n')}</div></body></html>`;
const res = []; const fail = [];
const ok = (name, cond, info = '') => { res.push([cond ? 'OK ' : 'FAIL', name, info]); if (!cond) fail.push(name + ' ' + info); };
const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

(async () => {
  const browser = await chromium.launch();
  const consoleErr = [], ext = [];
  const mk = async (opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: opts.vw || 1300, height: 900 }, reducedMotion: opts.rm ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleErr.push(m.text()); });
    pg.on('pageerror', e => consoleErr.push(String(e)));
    pg.on('request', r => { if (!/^(data:|about:)/.test(r.url()) && r.url() !== pg.url()) ext.push(r.url()); });
    return pg;
  };
  const load = async (pg, w, hostile) => { await pg.setContent(page(w, hostile), { waitUntil: 'load' }); };

  // 1. геометрия по ширинам колонки + окно 375
  const cases = [[1100, 1300], [960, 1300], [820, 1300], [700, 1300], [560, 1300], ['100%', 375]];
  for (const [w, vw] of cases) {
    const pg = await mk({ vw }); await load(pg, w === '100%' ? 375 : w, false);
    const r = await pg.evaluate(() => {
      const c = document.getElementById('c'), cw = c.getBoundingClientRect();
      let over = [], clip = [];
      c.querySelectorAll('*').forEach(e => {
        const b = e.getBoundingClientRect(), s = getComputedStyle(e);
        if (b.width && b.right > cw.right + .5) over.push(e.className + ':' + Math.round(b.right - cw.right));
        if (s.overflow !== 'visible' || s.textOverflow !== 'clip' || s.hyphens === 'auto') clip.push(e.className);
        if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth && getComputedStyle(e).display !== 'inline') over.push('sw:' + e.className);
      });
      return { over, clip, hs: document.documentElement.scrollWidth - document.documentElement.clientWidth, cw: cw.width };
    });
    ok(`ширина ${w}/окно ${vw}: нет горизонтального скролла и выхода за колонку`, r.over.length === 0 && r.hs <= 0, JSON.stringify(r.over.slice(0, 4)) + ' hs=' + r.hs + ' колонка=' + r.cw);
    ok(`ширина ${w}: нет overflow/ellipsis/hyphens:auto`, r.clip.length === 0, r.clip.join(','));
    // макет: широкая = 3 колонки, узкая = 1
    const lay = await pg.evaluate(() => { const li = document.querySelector('.bp-row'); return getComputedStyle(li).gridTemplateColumns.split(' ').length; });
    const exp = (w === '100%' ? 375 : w) >= 720 ? 3 : 2;
    ok(`ширина ${w}: сетка строки ${exp} кол.`, lay === exp, 'факт ' + lay);
    await pg.context().close();
  }

  const pg = await mk(); await load(pg, 1100, false);

  // 2. контраст по вычисленным цветам
  const txt = await pg.evaluate(() => {
    const out = [], parse = s => (s.match(/[\d.]+/g) || []).map(Number);
    const bgOf = e => { for (; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.length === 3 || (c.length === 4 && c[3] > 0)) return c.slice(0, 3); } return [255, 255, 255]; };
    document.querySelectorAll('#c *').forEach(e => {
      const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (own) out.push({ cls: e.className || e.tagName, fg: parse(getComputedStyle(e).color).slice(0, 3), bg: bgOf(e), op: getComputedStyle(e).opacity, size: getComputedStyle(e).fontSize });
    });
    document.querySelectorAll('#c .bp-arr,#c .bp-note__l').forEach(e => { const s = getComputedStyle(e, '::before'); if (s.content !== 'none') out.push({ cls: e.className + '::before', fg: parse(s.backgroundColor).slice(0, 3), bg: bgOf(e), op: '1', size: '8' }); });
    return out;
  });
  let minC = 99, worst = '';
  txt.forEach(t => { const c = cr(t.fg, t.bg); if (c < minC) { minC = c; worst = t.cls; } });
  ok('контраст текста ≥ 4.5 (мин. ' + minC.toFixed(2) + ', ' + worst + ', проверено ' + txt.length + ' узлов)', minC >= 4.5);
  ok('opacity не используется для приглушения', txt.every(t => t.op === '1'));

  // 3. аудит иерархии
  const au = await pg.evaluate(() => {
    const out = { colored: [], grad: [], shadow: [], pointer: [], hover: [], red: [], radius: [], bgimg: [], fixed: [], transitions: [] };
    const parse = s => (s.match(/[\d.]+/g) || []).map(Number);
    const isRed = c => c.length >= 3 && c[0] > 150 && c[0] > c[1] + 70 && c[0] > c[2] + 70;
    document.querySelectorAll('#c *').forEach(e => {
      const s = getComputedStyle(e), n = e.className || e.tagName;
      const bg = parse(s.backgroundColor);
      const hasBg = bg.length === 3 || (bg.length === 4 && bg[3] > 0);
      const bl = parseFloat(s.borderLeftWidth) > 0, bt = parseFloat(s.borderTopWidth) > 0;
      if ((hasBg && !(bg[0] === 255 && bg[1] === 255 && bg[2] === 255 && !bl && !bt)) || (bl && parseFloat(s.borderLeftWidth) >= 2 && e.tagName !== 'LI') || (bt && parseFloat(s.borderTopWidth) >= 1 && parseFloat(s.borderLeftWidth) > 0)) out.colored.push(n);
      if (hasBg && bg[0] === 255 && bt && parseFloat(s.borderLeftWidth) > 0 && !out.colored.includes(n)) out.colored.push(n);
      if (s.backgroundImage !== 'none') out.bgimg.push(n);
      if (s.boxShadow !== 'none') out.shadow.push(n);
      if (s.cursor === 'pointer' && e.tagName !== 'A' && !e.closest('a')) out.pointer.push(n);
      if (parseFloat(s.borderTopLeftRadius) > 0) out.radius.push(n);
      if (s.position === 'fixed') out.fixed.push(n);
      if (parseFloat(s.transitionDuration) > 0 || parseFloat(s.animationDuration) > 0 || s.transform !== 'none') out.transitions.push(n);
      [s.color, s.backgroundColor, s.borderLeftColor, s.borderBottomColor].forEach(c => { if (isRed(parse(c))) out.red.push(n); });
    });
    return out;
  });
  const colored = [...new Set(au.colored)];
  ok('цветных плашек ровно 2 по реестру (bp-hero, bp-note)', JSON.stringify(colored.sort()) === JSON.stringify(['bp-hero', 'bp-note']), colored.join(','));
  ok('нет градиентов/фоновых картинок', au.bgimg.length === 0, au.bgimg.join(','));
  ok('нет теней', au.shadow.length === 0, au.shadow.join(','));
  ok('нет cursor:pointer вне ссылок', au.pointer.length === 0, au.pointer.join(','));
  ok('нет transition/animation/transform (hover-подъёма нет)', au.transitions.length === 0, au.transitions.join(','));
  ok('нет красного', au.red.length === 0, au.red.join(','));
  ok('нет position:fixed', au.fixed.length === 0);
  ok('скругления только у точки-маркера (::before, не элемент)', au.radius.length === 0, au.radius.join(','));
  // hover неинтерактивного: плашка и строки не меняются
  const before = await pg.evaluate(() => { const e = document.querySelector('.bp-note'); const s = getComputedStyle(e); return s.backgroundColor + s.boxShadow + s.transform + s.cursor; });
  await pg.hover('.bp-note'); const after = await pg.evaluate(() => { const e = document.querySelector('.bp-note'); const s = getComputedStyle(e); return s.backgroundColor + s.boxShadow + s.transform + s.cursor; });
  ok('hover на плашке без изменений', before === after);
  const rb = await pg.evaluate(() => { const e = document.querySelector('.bp-row'); const s = getComputedStyle(e); return s.backgroundColor + s.boxShadow + s.transform + s.cursor; });
  await pg.hover('.bp-row .bp-d'); const ra = await pg.evaluate(() => { const e = document.querySelector('.bp-row'); const s = getComputedStyle(e); return s.backgroundColor + s.boxShadow + s.transform + s.cursor; });
  ok('hover на строке без изменений (не интерактивна)', rb === ra);
  ok('плашек в html: .bp-hero 1, .bp-note 1, прочих .bp-key/.bp-warn/.bp-panel 0', await pg.evaluate(() => document.querySelectorAll('.bp-hero').length === 1 && document.querySelectorAll('.bp-note').length === 1 && document.querySelectorAll('.bp-key,.bp-warn,.bp-panel').length === 0));
  ok('в плашке .bp-note нет ссылок/кнопок', await pg.evaluate(() => document.querySelectorAll('.bp-note a,.bp-note button,.bp-note [tabindex]').length === 0));
  ok('блоков ровно 3, <script> нет, внешних ресурсов в разметке нет', await pg.evaluate(() => document.querySelectorAll('#c style').length === 3 && document.querySelectorAll('#c script,#c img,#c link,#c iframe').length === 0) && blocks.every(b => !/(@import|url\(|<script|src=)/.test(b)));
  ok('нет глобальных селекторов (все правила под корнем блока)', await pg.evaluate(() => {
    const bad = [], roots = ['bp-hero-root', 'bp-prog-root', 'bp-school-root'];
    const walk = rules => [...rules].forEach(r => { if (r.cssRules && !r.selectorText) walk(r.cssRules); else if (r.selectorText) r.selectorText.split(',').forEach(s => { if (!roots.some(x => s.trim().startsWith('.' + x + '.' + x))) bad.push(s); }); });
    document.querySelectorAll('#c style').forEach(st => walk(st.sheet.cssRules)); return bad.length === 0;
  }));
  ok('нет w/ градиент, vh, fixed, storage в CSS блоков', blocks.every(b => !/gradient|100vh|\bvh\b|fixed|localStorage|sessionStorage/.test(b)));

  // 4. ссылки и текст
  const links = await pg.evaluate(() => [...document.querySelectorAll('#c a')].map(a => ({ href: a.getAttribute('href'), t: a.target, rel: a.rel, text: a.childNodes[0].textContent })));
  ok('ссылок ровно 11', links.length === 11);
  ok('URL совпадают с заданием (символ в символ)', links.every((l, i) => l.href === data[i].url));
  ok('target=_blank rel=noopener noreferrer', links.every(l => l.t === '_blank' && /noopener/.test(l.rel) && /noreferrer/.test(l.rel)));
  ok('текст ссылки = название', links.every((l, i) => l.text === data[i].title));
  ok('самопроверка: декодированный URL = название без скобок', links.every((l, i) => decodeURIComponent(l.href.split('/').pop().replace(/\+/g, ' ')) === data[i].title.replace(/[()]/g, '')));
  ok('одна ссылка на строку', await pg.evaluate(() => [...document.querySelectorAll('.bp-row')].every(r => r.querySelectorAll('a').length === 1)));
  const t = await pg.evaluate(() => ({
    h1: document.querySelector('h1').textContent, lead: document.querySelector('.bp-hero p').textContent,
    h2: [...document.querySelectorAll('h2.bp-h2')].map(e => e.textContent), sub: document.querySelector('.bp-small').textContent,
    rows: [...document.querySelectorAll('.bp-row')].map(r => ({ n: r.querySelector('.bp-n').textContent, d: r.querySelector('.bp-d').textContent, v: r.querySelector('.bp-v').textContent, l: r.querySelector('.bp-l').textContent })),
    nl: document.querySelector('.bp-note__l').textContent, nt: document.querySelector('.bp-note p').textContent, arrows: [...document.querySelectorAll('.bp-arr')].map(e => getComputedStyle(e, '::after').content)
  }));
  const diffs = [];
  const eq = (a, b, n) => { if (a !== b) diffs.push(`${n}: «${a}» ≠ «${b}»`); };
  eq(t.h1, 'Лучшие практики проектов', 'h1');
  eq(t.lead, 'Что сработало в проектах программы «Достичь большего вместе»: коротко о каждой практике, её результат и ссылка на полное описание.', 'лид');
  eq(t.h2[0], 'Программа ДБВ', 'h2 №2'); eq(t.h2[1], 'Практики школы заместителей начальников цехов БС', 'h2 №3');
  eq(t.sub, '11 практик проектов. Нажмите на название, чтобы открыть полное описание.', 'подпись');
  data.forEach((d, i) => { eq(t.rows[i].n, d.n, 'номер ' + d.n); eq(t.rows[i].d, d.digest, 'дайджест ' + d.n); eq(t.rows[i].v, d.value, 'цифра ' + d.n); eq(t.rows[i].l, d.label, 'подпись цифры ' + d.n); });
  eq(t.nl, 'В разработке', 'метка'); eq(t.nt, 'Раздел готовится. Практики школы появятся здесь.', 'текст плашки');
  ok('тексты побайтно совпадают с заданием (отличий ' + diffs.length + ')', diffs.length === 0, diffs.join(' | '));
  ok('порядок практик 01…11', t.rows.map(r => r.n).join() === '01,02,03,04,05,06,07,08,09,10,11');
  ok('стрелка → в каждой ссылке', t.arrows.length === 11 && t.arrows.every(a => a.includes('→')));
  // размеры шрифтов
  const fs_ = await pg.evaluate(() => { const f = s => { const e = document.querySelector(s), c = getComputedStyle(e); return c.fontSize + '/' + c.fontWeight; }; return { h1: f('h1'), h2: f('h2.bp-h2'), h3: f('h3'), d: f('.bp-d'), n: f('.bp-n'), v: f('.bp-v'), l: f('.bp-l'), s: f('.bp-small'), nl: f('.bp-note__l') }; });
  ok('типографика 1100: h1 26/800, h2 21/800, практика 18/700, текст 16, номер 14/700, цифра 26/800, подпись 14', JSON.stringify(fs_) === JSON.stringify({ h1: '26px/800', h2: '21px/800', h3: '18px/700', d: '16px/400', n: '14px/700', v: '26px/800', l: '14px/400', s: '14px/400', nl: '14px/700' }), JSON.stringify(fs_));

  // 5. клавиатура
  await pg.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
  let kb = [];
  for (let i = 0; i < 11; i++) { await pg.keyboard.press('Tab'); kb.push(await pg.evaluate(() => { const a = document.activeElement, s = getComputedStyle(a); return { idx: [...document.querySelectorAll('#c a')].indexOf(a), ow: s.outlineWidth, os: s.outlineStyle, vis: a.matches(':focus-visible') }; })); }
  ok('Tab проходит по 11 ссылкам по порядку', kb.every((k, i) => k.idx === i));
  ok('видимый :focus-visible (outline 3px solid)', kb.every(k => k.vis && k.ow === '3px' && k.os === 'solid'));
  await pg.keyboard.press('Tab'); ok('12-й Tab уходит за пределы блоков', await pg.evaluate(() => document.querySelectorAll('#c a:focus').length === 0));

  // 6. изоляция: жёсткие чужие стили
  const props = ['color', 'fontSize', 'fontWeight', 'textDecorationLine', 'marginTop', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingLeft', 'lineHeight', 'backgroundColor', 'textTransform', 'borderBottomWidth', 'listStyleType'];
  const snap = () => pg2.evaluate(ps => { const out = {}; const sel = { h1: 'h1', h2a: '.bp-prog-root h2', h2b: '.bp-school-root h2', h3: 'h3', p: '.bp-hero p', pd: '.bp-d', a: '.bp-row a', li: '.bp-row', ol: 'ol.bp-rows', n: '.bp-n', v: '.bp-v', l: '.bp-l', sm: '.bp-small', nl: '.bp-note__l', np: '.bp-note p' }; for (const k in sel) { const c = getComputedStyle(document.querySelector('#c ' + sel[k]) || document.querySelector(sel[k])); out[k] = ps.map(p => c[p]).join('|'); } return out; }, props);
  var pg2 = await mk(); await load(pg2, 1100, false); const clean = await snap();
  await load(pg2, 1100, true); const hostile = await snap();
  const bad = Object.keys(clean).filter(k => clean[k] !== hostile[k]);
  ok('изоляция: жёсткие стили a/h1/h2/h3/p/table/ol/li/.wiki-content не меняют блоки', bad.length === 0, bad.map(k => k + ' ' + clean[k] + ' → ' + hostile[k]).join(' ;; '));
  const geo = async h => { await load(pg2, 1100, h); return pg2.evaluate(() => { const r = document.querySelector('.bp-row').getBoundingClientRect(); return [Math.round(r.width), document.querySelector('.bp-row a').getBoundingClientRect().height > 0, getComputedStyle(document.querySelector('.bp-row')).gridTemplateColumns]; }); };
  const g1 = await geo(false), g2 = await geo(true); ok('изоляция: сетка строки при чужих стилях та же', JSON.stringify(g1) === JSON.stringify(g2), JSON.stringify(g1) + JSON.stringify(g2));
  // обратная изоляция: блоки не меняют чужие элементы
  const outer = async withBlocks => { await pg2.setContent(page(1100, false).replace(withBlocks ? '@@' : /<div id="c">[\s\S]*<\/div><\/body>/, withBlocks ? '' : '<div id="c"></div></body>')); return pg2.evaluate(() => ['out-h', 'out-p', 'out-a'].map(i => { const c = getComputedStyle(document.getElementById(i)); return [c.color, c.fontSize, c.margin, c.padding, c.textDecorationLine, c.fontFamily].join('|'); }).join('||')); };
  ok('блоки не влияют на чужие a/h2/p', (await outer(true)) === (await outer(false)));
  await pg2.context().close();

  // 7. reduced motion
  const pr = await mk({ rm: true }); await load(pr, 1100, false);
  ok('reduced-motion: анимаций/переходов нет', await pr.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches && [...document.querySelectorAll('#c *')].every(e => { const s = getComputedStyle(e); return parseFloat(s.transitionDuration) === 0 && parseFloat(s.animationDuration) === 0; })));
  await pr.context().close();

  ok('внешних запросов нет', ext.length === 0, ext.join(','));
  ok('ошибок консоли нет', consoleErr.length === 0, consoleErr.join(' | '));
  blocks.forEach((b, i) => { const kb = Buffer.byteLength(b) / 1024; ok(`размер ${NAMES[i]}: ${kb.toFixed(1)} КБ ≤ 38`, kb <= 38); });
  await browser.close();
  console.log(res.map(r => r.join('  ')).join('\n'));
  console.log(`\nИтого: ${res.filter(r => r[0] === 'OK ').length} OK, ${fail.length} FAIL`);
  process.exit(fail.length ? 1 : 0);
})();
