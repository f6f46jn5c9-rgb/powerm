// Проверка хаба «Бизнес-система. СМ» в Chromium. Запуск: node tools/check_hub_bssm.js [--shot <png>]
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), cp = require('child_process');
const R = path.resolve(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, 'dist', f), 'utf8');
const P = ['hub-bssm-1-hub-bssm-shapka.html', 'hub-bssm-2-hub-bssm-razdely-programmy.html', 'hub-bssm-3a-hub-bssm-cbl-open.html', 'hub-bssm-3b-hub-bssm-cbl-close.html'];
const parts = P.map(rd); const page = parts.join('\n');
const live = page.replace(/URL_PLACEHOLDER_/g, 'https://example.com/#');
const lum = c => { c = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const hx = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const shotArg = process.argv.indexOf('--shot') > 0 ? process.argv[process.argv.indexOf('--shot') + 1] : null;
(async () => {
  const b = await chromium.launch(); const reqs = [], errs = [];
  async function open(w, vw, o = {}) {
    const ctx = await b.newContext({ viewport: { width: vw || w + 40, height: 900 }, reducedMotion: o.rm ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(String(e)));
    pg.on('request', r => { if (!/^(data|about):/.test(r.url())) reqs.push(r.url()); });
    const host = o.hostile ? '<style>#col p,#col a,#col h1,#col h2,#col h3,#col table,#col th,#col td,#col button,#col input,#col label,#col span,#col ul,#col li{font-size:41px;font-weight:300;color:#f00;margin:23px;padding:19px;line-height:3;text-transform:uppercase;letter-spacing:6px;text-decoration:underline;border:5px solid #0f0;background:#ff0;font-style:italic;text-align:right}</style>' : '';
    await pg.setContent('<!doctype html><meta charset=utf-8>' + host + '<body style="margin:0;background:#fff"><div id="col" style="width:' + w + 'px;max-width:100%;margin:0;font:16px Arial">' + (o.html || page) + '</div>');
    await pg.waitForTimeout(o.rm ? 100 : 300); return pg;
  }
  const measure = () => {
    const col = document.getElementById('col'), cw = col.getBoundingClientRect().width, vis = e => !!(e.offsetWidth || e.offsetHeight);
    const over = [], clip = [];
    col.querySelectorAll('*').forEach(e => { if (!vis(e) || e.closest('svg')) return; const b = e.getBoundingClientRect(); if (b.right > cw + .5 || b.left < -.5) over.push(e.className || e.tagName); });
    col.querySelectorAll('h1,h3,p,a.bssm-hero__back,.bssm-tile__name,.bssm-tile__cap,.bssm-tile__soon').forEach(e => { if (vis(e) && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) clip.push(e.className + ':' + e.textContent.slice(0, 20)); });
    const inside = [...col.querySelectorAll('.bssm-tile')].every(t => { const tb = t.getBoundingClientRect(); return [...t.querySelectorAll('.bssm-tile__txt,.bssm-tile__top')].every(n => { const r = n.getBoundingClientRect(); return r.bottom <= tb.bottom - 8 && r.right <= tb.right - 8 && r.left >= tb.left + 8; }); });
    const grids = [...col.querySelectorAll('.bssm-nav__grid')].map(g => getComputedStyle(g).gridTemplateColumns.split(' ').length);
    const tiles = [...col.querySelectorAll('.bssm-tile')].map(e => Math.round(e.getBoundingClientRect().height));
    return { sw: document.documentElement.scrollWidth, vw: innerWidth, over, clip, inside, grids, tiles };
  };
  // 1. геометрия
  for (const [w, vw, exp] of [[1100, 1300, [3, 2]], [960, 1300, [3, 2]], [820, 1300, [3, 2]], [700, 1300, [2, 2]], [560, 1300, [2, 2]], [375, 375, [1, 1]]]) {
    const pg = await open(w === 375 ? 375 : w, vw); const r = await pg.evaluate(measure);
    ok(r.sw <= r.vw && !r.over.length, `${w}px: нет горизонтального скролла (${r.sw}/${r.vw}) ${r.over.slice(0, 3)}`);
    ok(!r.clip.length && r.inside, `${w}px: текст не обрезан, содержимое внутри плашки ${r.clip.slice(0, 3)}`);
    ok(r.grids[0] === exp[0] && r.grids[1] === exp[1], `${w}px: колонок Разделы ${r.grids[0]} (нужно ${exp[0]}), Программы ${r.grids[1]} (нужно ${exp[1]}); высоты ${r.tiles}`);
    ok(r.tiles.slice(6).every(h => h === 110), `${w}px: плашки программ по 110 px`);
    await pg.context().close();
  }
  // 2. заглушки (URL_PLACEHOLDER) и неинтерактивные элементы
  let pg = await open(1100);
  const ph = await pg.evaluate(() => [...document.querySelectorAll('.bssm-tile')].map(t => { const c = getComputedStyle(t), s = t.querySelector('.bssm-tile__soon'); return { cur: c.cursor, op: c.opacity, tr: c.transform, sh: c.boxShadow, soon: getComputedStyle(s).display !== 'none' && s.textContent === 'Скоро', dis: t.getAttribute('aria-disabled'), ti: t.getAttribute('tabindex') }; }));
  ok(ph.length === 8 && ph.every(x => x.cur === 'default' && x.op === '0.6' && x.soon && x.dis === 'true'), `заглушки: 8 плашек, cursor:default, opacity 0.6, «Скоро», aria-disabled`);
  const tile0 = await pg.$('.bssm-tile'); await tile0.hover(); await pg.waitForTimeout(350);
  const hv = await pg.evaluate(() => { const c = getComputedStyle(document.querySelector('.bssm-tile')); return [c.transform, c.boxShadow, c.cursor]; });
  ok(hv[0] === 'none' && hv[1] === 'none' && hv[2] === 'default', `заглушка при наведении: transform ${hv[0]}, shadow ${hv[1]}, cursor ${hv[2]}`);
  const nonint = await pg.evaluate(() => { const bad = []; document.getElementById('col').querySelectorAll('*').forEach(e => { if (e.closest('a')) return; const c = getComputedStyle(e); if (c.boxShadow !== 'none' || c.transform !== 'none' || (c.transitionDuration !== '0s' && c.transitionProperty !== 'all')) bad.push(e.className || e.tagName); if (c.cursor === 'pointer') bad.push('cursor:' + e.className); }); return bad; });
  ok(!nonint.length, `неинтерактивные элементы: нет теней/transform/transition/pointer ${nonint.slice(0, 3)}`);
  await tile0.click({ force: true }); ok(pg.url() === 'about:blank', 'клик по заглушке не уводит со страницы');
  // 3. живые ссылки
  await pg.context().close();
  pg = await open(1100, 1300, { html: live });
  const lv = await pg.evaluate(() => [...document.querySelectorAll('.bssm-tile')].map(t => { const c = getComputedStyle(t); return { cur: c.cursor, op: c.opacity, soon: getComputedStyle(t.querySelector('.bssm-tile__soon')).display }; }));
  ok(lv.every(x => x.cur === 'pointer' && x.op === '1' && x.soon === 'none'), 'живые ссылки: cursor:pointer, opacity 1, «Скоро» скрыто');
  const lt = await pg.$('.bssm-tile'); await lt.hover(); await pg.waitForTimeout(350);
  const lhv = await pg.evaluate(() => getComputedStyle(document.querySelector('.bssm-tile')).transform);
  ok(lhv === 'matrix(1, 0, 0, 1, 0, -3)', `живая плашка при наведении: ${lhv} (translateY(-3px))`);
  const tr = await pg.evaluate(() => getComputedStyle(document.querySelector('.bssm-tile')).transitionDuration); ok(tr.replace(/ /g, '') === '0.2s,0.2s', `transition 200ms (${tr})`);
  // фокус
  await pg.keyboard.press('Tab'); await pg.keyboard.press('Tab');
  const fo = await pg.evaluate(() => { const e = document.activeElement, c = getComputedStyle(e); return [e.className, c.outlineStyle, c.outlineWidth]; });
  ok(fo[1] === 'solid' && parseFloat(fo[2]) >= 2, `:focus-visible виден (${fo})`);
  // 4. контраст по пикселям (живое состояние)
  async function pixContrast(pgx, sel, alpha) {
    await pgx.addStyleTag({ content: '#col .bssm-tile__name,#col .bssm-tile__cap,#col .bssm-tile__soon{color:transparent !important}' });
    await pgx.mouse.move(0, 0); await pgx.waitForTimeout(350);
    const rects = await pgx.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetWidth).map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, t: e.textContent }; }), sel);
    const tmp = path.join(R, 'tools/_bssm_c.png'); fs.writeFileSync(tmp, await pgx.screenshot({ fullPage: true }));
    const py = 'import sys,json\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nout=[]\nfor h in json.loads(sys.argv[2]):\n  for y in range(int(h["y"]),int(h["y"]+h["h"]),2):\n    for x in range(int(h["x"]),int(h["x"]+h["w"]),3):\n      out.append((im.getpixel((x,y)),h["t"]))\nprint(json.dumps(out))';
    const res = JSON.parse(cp.execFileSync('python3', ['-I', '-c', py, tmp, JSON.stringify(rects)], { maxBuffer: 1 << 28 }).toString()); fs.rmSync(tmp);
    let worst = 99, wt = ''; for (const [c, t] of res) { const fg = c.map(v => Math.round(255 * alpha + v * (1 - alpha))); const k = cr(fg, c); if (k < worst) { worst = k; wt = t + ' bg ' + c; } }
    return [worst, wt, rects.length];
  }
  for (const [w, vw] of [[1100, 1300], [343, 375]]) {
    const p2 = await open(w, vw, { html: live });
    let r = await pixContrast(p2, '.bssm-tile__name', 1); ok(r[0] >= 4.5, `${w}px: контраст названий плашек (белый), худший ${r[0].toFixed(2)}:1 (${r[1]}), n=${r[2]}`);
    p2.context().close();
    const p3 = await open(w, vw, { html: live });
    r = await pixContrast(p3, '.bssm-tile__cap', .75); ok(r[0] >= 4.5, `${w}px: контраст подписей (белый 75%), худший ${r[0].toFixed(2)}:1 (${r[1]}), n=${r[2]}`);
    p3.context().close();
  }
  const p4 = await open(1100); const r4 = await pixContrast(p4, '.bssm-tile__name,.bssm-tile__soon', 1);
  console.log(`INFO  заглушки (opacity .6, неактивные — вне требований WCAG 1.4.3): белый текст на фоне, худший ${r4[0].toFixed(2)}:1`);
  [['#5B6670', '#ffffff', 'крошка/подзаголовок/заголовки секций'], ['#1F2A33', '#ffffff', 'h1'], ['#5B6670', '#ffffff', 'заглушка CBL (текст)'], ['#2a5ca8', '#ffffff', 'кольцо/сетка иконки шапки на белом (графика ≥3:1)']]
    .forEach(([f, bg, n]) => { const k = cr(hx(f), hx(bg)); ok(k >= (n.includes('графика') ? 3 : 4.5), `контраст ${f} на ${bg} = ${k.toFixed(2)}:1 (${n})`); });
  // 5. reduced motion
  const pr = await open(1100, 1300, { rm: true, html: live }); const rm = await pr.evaluate(() => [...document.querySelectorAll('.bssm-tile,.bssm-hero__back')].map(e => getComputedStyle(e).transitionDuration));
  ok(rm.every(d => /^0s(,0s)*$/.test(d)) || rm.slice(1).every(d => d === '0s'), `prefers-reduced-motion: transition отключены на плашках (${[...new Set(rm)]})`);
  await (await pr.$('.bssm-tile')).hover(); await pr.waitForTimeout(150);
  ok(await pr.evaluate(() => getComputedStyle(document.querySelector('.bssm-tile')).transform) === 'none', 'prefers-reduced-motion: нет подъёма при наведении');
  // 6. изоляция
  const base = await open(820), hos = await open(820, 1300, { hostile: true });
  const snap = () => [...document.querySelectorAll('#col h1,#col h3,#col p,#col a,#col .bssm-tile__name,#col .bssm-tile__cap,#col .bssm-tile__soon,#col .bssm-hero__sub')].map(e => { const c = getComputedStyle(e), r = e.getBoundingClientRect(); return [e.className, c.fontSize, c.fontWeight, c.color, c.margin, c.padding, c.lineHeight, c.textTransform, c.letterSpacing, c.textDecorationLine, Math.round(r.width), Math.round(r.height)].join('|'); });
  const [s1, s2] = [await base.evaluate(snap), await hos.evaluate(snap)];
  const diff = s1.map((v, i) => v !== s2[i] ? v + '  <>  ' + s2[i] : null).filter(Boolean);
  ok(!diff.length, `изоляция: чужие стили p/a/h1–h3/span/table… не меняют блок (${diff.length} расхождений)`); diff.slice(0, 3).forEach(d => console.log('     ' + d));
  // 7. статический разбор
  const css = await base.evaluate(() => { const bad = []; const walk = rules => [...rules].forEach(r => { if (r.selectorText) { r.selectorText.split(/,(?![^(]*\))/).forEach(s => { if (!/^\s*\.bssm-/.test(s)) bad.push(s.trim()); }); } else if (r.cssRules && r.type !== 7) walk(r.cssRules); }); [...document.styleSheets].forEach(s => walk(s.cssRules)); return bad; });
  ok(!css.length, `все селекторы начинаются с .bssm- (${css.filter(s => !/^\.bssm-/.test(s)).slice(0, 5)})`);
  ok(!/https?:\/\/(?!kb\.severstal\.com)[^"' )]*\.(css|js|woff2?|png|jpe?g|svg)|@import|localStorage|sessionStorage|position:\s*fixed|100vh|<html|<body|<head|@font-face|<img|<link/i.test(page), 'нет внешних ресурсов, storage, fixed, 100vh, html/head/body');
  const scripts = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1].trim()); ok(scripts.length === 1 && scripts.every(s => /^\(function\s*\(\)\s*\{[\s\S]*\}\)\(\);?$/.test(s)), `JS: ${scripts.length} скрипт, обёрнут в IIFE`);
  ok(reqs.length === 0 && !errs.length, `внешних запросов ${reqs.length}, ошибок консоли ${errs.length} ${errs.slice(0, 2)}`);
  // 8. тексты
  const exp = { h1: ['Бизнес-система. СМ'], sub: ['Методы, программы и практики организационного развития'], back: ['← БУП'], h3: ['Разделы', 'Программы трансформации', 'Практики раздела'],
    names: ['Практики', 'УП / ДБВ', 'Agile', 'Устойчивость изменений', 'Школа / Мини-Т', 'Программы трансформации', 'СМ 2.0', 'СМ 3.0'],
    caps: ['Лучшие практики бизнес-системы', 'Управление проектами и программа ДБВ', 'Гибкие методы и спринтовый подход', 'Управление изменениями, модель ADKAR', 'Корпоративное обучение и развитие', 'СМ 2.0 и СМ 3.0'],
    hrefs: ['URL_PLACEHOLDER_HUB16', 'URL_PLACEHOLDER_HUB17', 'URL_PLACEHOLDER_HUB18', 'URL_PLACEHOLDER_HUB19', 'URL_PLACEHOLDER_HUB20', 'URL_PLACEHOLDER_HUB21', 'URL_PLACEHOLDER_HUB21', 'URL_PLACEHOLDER_HUB21'],
    stub: ['Content by Label | тег: раздел_бизнес_система | сортировка: по дате убывания'] };
  const got = await base.evaluate(() => { const t = s => [...document.querySelectorAll('#col ' + s)].map(e => e.textContent.trim()); return { h1: t('h1'), sub: t('.bssm-hero__sub'), back: t('.bssm-hero__back'), h3: t('h3'), names: t('.bssm-tile__name'), caps: t('.bssm-tile__cap'), hrefs: [...document.querySelectorAll('#col .bssm-tile')].map(e => e.getAttribute('href')), stub: t('.bssm-cbl__stub') }; });
  for (const k in exp) ok(JSON.stringify(exp[k]) === JSON.stringify(got[k]), `текст «${k}» символ в символ: ${JSON.stringify(got[k]) === JSON.stringify(exp[k]) ? 'совпал' : JSON.stringify(got[k])}`);
  const back = await base.evaluate(() => document.querySelector('.bssm-hero__back').getAttribute('href')); ok(back === 'https://kb.severstal.com/spaces/BSS/', 'крошка → https://kb.severstal.com/spaces/BSS/');
  ok(!/Добавить практику|Предложить практику|куратор|владелец/i.test(page), 'нет кнопок «Добавить/Предложить практику», владельцев/кураторов');
  // 9. размер
  P.forEach((f, i) => { const kb = fs.statSync(path.join(R, 'dist', f)).size / 1024; ok(kb <= 38, `${f}: ${kb.toFixed(1)} КБ ≤ 38`); });
  // снимок
  if (shotArg) { const ps = await open(1100, 1100); await ps.evaluate(() => scrollTo(0, 0)); await ps.locator('#col').screenshot({ path: shotArg }); const h = await ps.evaluate(() => document.getElementById('col').offsetHeight); console.log('SHOT ' + shotArg + ' высота ' + h); }
  await b.close(); console.log(fails ? `\nПРОВАЛЕНО: ${fails}` : '\nВСЁ ЗЕЛЁНОЕ'); process.exit(fails ? 1 : 0);
})();
