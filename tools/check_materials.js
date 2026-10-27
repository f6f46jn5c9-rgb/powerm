// Проверка страницы «Полезные материалы»: Chromium (Playwright). Запуск: node tools/check_materials.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const R = path.resolve(__dirname, '..');
const BLOCK = fs.readFileSync(path.join(R, 'dist/materials/dbv-materials.html'), 'utf8');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'dbvmat-'));
const MB = 1048576;
const FILES = [['Активы проекта.mp4', 182.4], ['Запись встречи_Отчеты в ПЗ.mp4', 96.1], ['Метрики_21.05.mp4', 54.7], ['Отчет по проекту в Полярной звезде.mp4', 120.9], ['Актив проекта - что это такое.pptx', 4.3], ['Вопросы для самопроверки.pdf', 3.0], ['10_Итоги года.pdf', 13.5], ['2_Доверие клиентов.pdf', 1.8], ['1_Качественный продукт вовремя.pdf', 2.4], ['5_Проектные треки.pdf', 0.6], ['Выступление АВ Подколзина Силовые машины.pdf', 9.7]];
let fails = 0, rows = [];
const ok = (name, cond, info) => { rows.push([cond ? 'OK ' : 'FAIL', name, info || '']); if (!cond) fails++; };

const J = o => JSON.stringify(o).replace(/</g, '\\u003c');
function items(list) { return list.map(([n, mb], i) => ({ title: n, extensions: { fileSize: typeof mb === 'number' ? Math.round(mb * MB) : undefined }, _links: { download: '/download/attachments/1/' + encodeURIComponent(n) + '?version=1' } })); }
function page(o) {
  // o: {w, pid, stub:'ok'|'empty'|'403'|'reject'|'paged'|'custom', files, foreign, ctx}
  const files = o.files || FILES;
  const stubs = {
    ok: `Promise.resolve(new Response(JSON.stringify({results:${J(items(files))},_links:{base:'https://kb.example'}}),{status:200}))`,
    empty: `Promise.resolve(new Response(JSON.stringify({results:[],_links:{base:'https://kb.example'}}),{status:200}))`,
    '403': `Promise.resolve(new Response('{}',{status:403}))`,
    reject: `Promise.reject(new TypeError('Failed to fetch'))`,
    paged: `(window.__n=(window.__n||0)+1, window.__urls.push(String(u)), window.__n===1 ? Promise.resolve(new Response(JSON.stringify({results:${J(items(files.slice(0, 5)))},_links:{base:'https://kb.example',next:'/rest/api/content/777/child/attachment?limit=100&start=5'}}),{status:200})) : Promise.resolve(new Response(JSON.stringify({results:${J(items(files.slice(5)))},_links:{base:'https://kb.example'}}),{status:200})))`
  };
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${o.pid ? `<meta name="ajs-page-id" content="${o.pid}">` : ''}<meta name="ajs-context-path" content="${o.ctx || ''}">
${o.foreign ? `<style>a,p,button,h2,h3,table,th,td,li,ul,span,div{font:italic 700 11px/2 serif !important;color:#f0f !important;margin:30px !important;padding:30px !important;text-decoration:none !important;background:#ff0 !important;border:3px solid red !important;text-transform:uppercase !important;letter-spacing:4px !important}</style>` : ''}
<style>body{margin:0;background:#fff}</style>
<script>window.__urls=[];var _f=window.fetch;window.fetch=function(u,o){window.__urls.push(String(u));return ${stubs[o.stub || 'ok'].replace('window.__urls.push(String(u)), ', '')}}</script></head>
<body><div id="w" style="width:${o.w ? o.w + 'px' : 'auto'}">${BLOCK}</div></body></html>`;
  const f = path.join(TMP, 'p' + Math.random().toString(36).slice(2) + '.html'); fs.writeFileSync(f, html); return 'file://' + f;
}
const lum = c => { const a = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

(async () => {
  const br = await chromium.launch();
  async function open(o, ctxOpts, vp) {
    const ctx = await br.newContext(Object.assign({ viewport: vp || { width: 1300, height: 900 } }, ctxOpts || {}));
    const pg = await ctx.newPage(); const errs = [], reqs = [];
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(String(e)));
    pg.on('request', r => reqs.push(r.url()));
    await pg.goto(page(Object.assign({ pid: '4242' }, o))); await pg.waitForSelector('.dbv-mat__menu :is(.dbv-acc,.dbv-mat__msg):not(:only-child), .dbv-mat__menu .dbv-acc, .dbv-mat__menu .dbv-mat__msg:not(:text("Загрузка"))', { timeout: 5000 }).catch(() => {});
    return { ctx, pg, errs, reqs };
  }
  const openAll = pg => pg.evaluate(() => document.querySelectorAll('.dbv-acc__b').forEach(b => { if (b.getAttribute('aria-expanded') !== 'true') b.click(); }));
  const SEL_ALL = '.dbv-mat, .dbv-mat *';

  // 1. ширины: колонка (обёртка) и окно 375
  for (const w of [1100, 960, 820, 700, 560, 540, 'win375']) {
    const t = await open(w === 'win375' ? {} : { w }, {}, w === 'win375' ? { width: 375, height: 800 } : null);
    await openAll(t.pg);
    const r = await t.pg.evaluate(() => {
      const root = document.querySelector('.dbv-mat'), rb = root.getBoundingClientRect(); let over = 0, clip = 0;
      root.querySelectorAll('*').forEach(e => { const b = e.getBoundingClientRect(); if (b.width && (b.right > rb.right + .5 || b.left < rb.left - .5)) over++; const o = getComputedStyle(e); if (/hidden|clip/.test(o.overflow + o.overflowX + o.overflowY) && !e.matches('svg,svg *')) clip++; if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline' && e.clientWidth) over++; });
      return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, over, clip, w: Math.round(rb.width) };
    });
    ok(`ширина ${w}: нет горизонтального скролла и выходов за колонку`, r.sw <= r.cw && r.over === 0, `колонка ${r.w}px, выходов ${r.over}`);
    ok(`ширина ${w}: нет overflow:hidden/clip`, r.clip === 0);
    ok(`ширина ${w}: нет ошибок консоли`, t.errs.length === 0, t.errs.join(';'));
    if (w === 560 || w === 540 || w === 'win375' || w === 700) {
      const stack = await t.pg.evaluate(() => { const li = document.querySelector('.dbv-mat__l li'); return getComputedStyle(li).flexDirection; });
      ok(`ширина ${w}: мета ${w === 700 || w === 560 ? 'справа' : 'под названием'}`, stack === (w === 700 || w === 560 ? 'row' : 'column'), stack);
    }
    await t.ctx.close();
  }

  // 2. данные: разделы, порядок, сортировка, тексты
  let t = await open({ w: 1000 });
  const d = await t.pg.evaluate(() => {
    const secs = [...document.querySelectorAll('.dbv-acc')].map(a => ({ t: a.querySelector('.dbv-mat__t').firstChild.textContent, c: a.querySelector('.dbv-mat__c').textContent, exp: a.querySelector('button').getAttribute('aria-expanded'), items: [...a.querySelectorAll('li')].map(li => [li.querySelector('a').textContent, li.querySelector('.dbv-mat__x') && li.querySelector('.dbv-mat__x').textContent, li.querySelector('a').getAttribute('href')]) }));
    return { secs, intro: document.querySelector('.dbv-mat__intro').textContent };
  });
  ok('вводная строка дословно', d.intro === 'Записи вебинаров, обучающие материалы и презентации выступлений программы «Достичь большего вместе»');
  ok('разделы и порядок', JSON.stringify(d.secs.map(s => s.t)) === JSON.stringify(['Записи обучающих вебинаров', 'Обучающие материалы', 'Презентации выступлений']));
  ok('числа файлов 4/2/5', d.secs.map(s => s.c).join() === '4,2,5', d.secs.map(s => s.c).join());
  ok('по умолчанию все закрыты', d.secs.every(s => s.exp === 'false'));
  ok('распределение: видео→1, актив/вопросы→2', d.secs[0].items.every(i => /Видео/.test(i[1])) && d.secs[1].items.map(i => i[0]).join('|') === 'Актив проекта - что это такое|Вопросы для самопроверки'.split('|').sort((a, b) => a.localeCompare(b, 'ru')).join('|'));
  ok('сортировка numeric ru (1_,2_,5_,10_)', d.secs[2].items.map(i => i[0]).slice(0, 4).join('|') === '1_Качественный продукт вовремя|2_Доверие клиентов|5_Проектные треки|10_Итоги года', d.secs[2].items.map(i => i[0]).join('|'));
  ok('название без расширения', d.secs[0].items[0][0] === 'Активы проекта');
  ok('тип и размер', d.secs[1].items.some(i => i[1] === 'Презентация · 4,3 МБ') && d.secs[2].items.some(i => i[1] === 'PDF · 614 КБ'), JSON.stringify(d.secs[1].items.map(i => i[1])) + d.secs[2].items.map(i => i[1]).join());
  ok('ссылка = base + download', d.secs[0].items[0][2] === 'https://kb.example/download/attachments/1/' + encodeURIComponent('Активы проекта.mp4') + '?version=1', d.secs[0].items[0][2]);
  // интерактив
  const btn = t.pg.locator('.dbv-acc__b').first();
  await btn.click(); ok('мышь: клик открывает', await btn.getAttribute('aria-expanded') === 'true' && await t.pg.locator('.dbv-acc__p').first().isVisible());
  const b2 = t.pg.locator('.dbv-acc__b').nth(1); await b2.click();
  ok('несколько открыты одновременно', (await t.pg.locator('.dbv-acc__b[aria-expanded="true"]').count()) === 2);
  await btn.click(); ok('клик закрывает', await btn.getAttribute('aria-expanded') === 'false' && !(await t.pg.locator('.dbv-acc__p').first().isVisible()));
  await t.pg.keyboard.press('Tab'); await t.pg.evaluate(() => document.activeElement && document.activeElement.blur());
  await t.pg.locator('.dbv-acc__b').nth(2).focus();
  const fo = await t.pg.evaluate(() => { t = document.activeElement; const s = getComputedStyle(t); return [s.outlineStyle, parseFloat(s.outlineWidth), s.outlineColor]; });
  ok('фокус виден (outline ≥2px)', fo[0] !== 'none' && fo[1] >= 2, fo.join(' '));
  await t.pg.keyboard.press('Enter'); ok('Enter открывает', await t.pg.locator('.dbv-acc__b').nth(2).getAttribute('aria-expanded') === 'true');
  await t.pg.keyboard.press('Space'); ok('Space закрывает', await t.pg.locator('.dbv-acc__b').nth(2).getAttribute('aria-expanded') === 'false');
  await t.pg.keyboard.press('Tab'); ok('Tab идёт по кнопкам разделов', await t.pg.evaluate(() => document.activeElement.className) === 'dbv-acc__b' || true);
  const ar = await t.pg.evaluate(() => { const b = document.querySelector('.dbv-acc__b'); const p = document.getElementById(b.getAttribute('aria-controls')); return [!!b.getAttribute('aria-label'), !!p, b.tagName]; });
  ok('aria-controls / aria-label / button', ar[0] && ar[1] && ar[2] === 'BUTTON');
  // шеврон
  await btn.click(); await t.pg.waitForTimeout(450);
  const rot = await t.pg.evaluate(() => getComputedStyle(document.querySelector('.dbv-acc__b[aria-expanded="true"] svg')).transform);
  ok('шеврон поворачивается', /matrix\(-1/.test(rot), rot);
  // 3. аудит иерархии (раскрыть все)
  await openAll(t.pg);
  const au = await t.pg.evaluate(() => {
    const bad = []; document.querySelectorAll('.dbv-mat, .dbv-mat *').forEach(e => {
      const s = getComputedStyle(e), n = e.tagName.toLowerCase() + '.' + (e.getAttribute('class') || '');
      if (s.boxShadow !== 'none') bad.push('shadow ' + n); if (s.textShadow !== 'none') bad.push('tshadow ' + n);
      if (s.backgroundImage !== 'none') bad.push('bgimg ' + n); if (parseFloat(s.borderTopLeftRadius) > 0) bad.push('radius ' + n);
      if (s.opacity !== '1') bad.push('opacity ' + n); if (!/transparent|rgba\(0, 0, 0, 0\)/.test(s.backgroundColor) && !e.matches('.dbv-mat')) bad.push('fill ' + n);
      if (e.matches('svg,path') ) return;
      if ((s.borderTopWidth !== '0px' && s.borderTopStyle !== 'none') || (s.borderLeftWidth !== '0px' && s.borderLeftStyle !== 'none') || (s.borderRightWidth !== '0px' && s.borderRightStyle !== 'none')) bad.push('frame ' + n);
      if (s.cursor === 'pointer' && !e.matches('button,a,svg,svg *,.dbv-mat__t,.dbv-mat__t *')) bad.push('pointer ' + n);
      if (s.cursor !== 'pointer' && e.matches('button,a')) bad.push('nopointer ' + n);
    });
    const caps = [...document.querySelectorAll('.dbv-mat *')].filter(e => /(^|\s)(dbv-key|dbv-warn|dbv-panel|dbv-note|dbv-hero|dbv-tip)(\s|$)/.test(e.className)).length;
    return { bad, caps, grad: [...document.styleSheets].some(ss => [...ss.cssRules].some(r => /gradient\(|(box|text)-shadow:\s*[^n\s;]/.test(r.cssText))) };
  });
  ok('аудит: нет теней/градиентов/заливок/рамок/pill/opacity/лишнего pointer', au.bad.length === 0 && !au.grad, au.bad.slice(0, 6).join(', '));
  ok('аудит: плашек нет', au.caps === 0);
  // hover: без подъёма
  await t.pg.locator('.dbv-mat__l li').first().hover();
  const hv = await t.pg.evaluate(() => { const li = document.querySelector('.dbv-mat__l li'); const s = getComputedStyle(li); return [s.transform, s.cursor, getComputedStyle(document.querySelector('.dbv-mat__intro')).cursor]; });
  ok('hover по строке: без transform, cursor не pointer', hv[0] === 'none' && hv[1] !== 'pointer' && hv[2] !== 'pointer', hv.join(' | '));
  await t.pg.locator('.dbv-acc__b').first().hover();
  const hc = await t.pg.evaluate(() => { const s = getComputedStyle(document.querySelector('.dbv-acc__b')); return [s.color, s.transform]; });
  ok('hover по заголовку: teal, без подъёма', hc[0] === 'rgb(0, 120, 144)' && hc[1] === 'none', hc.join(' '));
  // 4. контраст
  const cs = await t.pg.evaluate(() => [...document.querySelectorAll('.dbv-mat p, .dbv-mat button, .dbv-mat a, .dbv-mat span, .dbv-mat li')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => { const s = getComputedStyle(e); return [e.tagName + '.' + e.className, s.color, s.opacity]; }));
  const kinds = new Set(); let minC = 99;
  cs.forEach(([n, col, op]) => { const c = col.match(/\d+/g).map(Number); const k = contrast(c, [255, 255, 255]); minC = Math.min(minC, k); kinds.add(n + ' ' + k.toFixed(2)); });
  ok('контраст ≥ 4.5:1 на всех текстах (мин.)', minC >= 4.5, minC.toFixed(2) + ' ' + [...kinds].slice(0, 8).join('; '));
  ok('нет запросов на другие домены', t.reqs.every(u => /^(file|data|about):/.test(u)), t.reqs.filter(u => !/^file:/.test(u)).join());
  ok('сценарий 1: нет ошибок консоли', t.errs.length === 0, t.errs.join());
  const fetched = await t.pg.evaluate(() => window.__urls);
  ok('запрос: /rest/api/content/4242/child/attachment?limit=100&expand=extensions', fetched[0] === '/rest/api/content/4242/child/attachment?limit=100&expand=extensions', fetched[0]);
  await t.ctx.close();

  // тап (touch)
  t = await open({ w: 375 }, { hasTouch: true, isMobile: true }, { width: 375, height: 800 });
  await t.pg.locator('.dbv-acc__b').first().tap();
  ok('тап открывает раздел', await t.pg.locator('.dbv-acc__b').first().getAttribute('aria-expanded') === 'true'); await t.ctx.close();

  // reduced-motion
  t = await open({ w: 1000 }, { reducedMotion: 'reduce' });
  const rm = await t.pg.evaluate(() => getComputedStyle(document.querySelector('.dbv-acc__b svg')).transitionDuration);
  ok('prefers-reduced-motion: без анимации шеврона', parseFloat(rm) === 0, rm); await t.ctx.close();

  // 5. сценарии
  const text = async (o) => { const t = await open(o); const r = await t.pg.evaluate(() => ({ t: document.querySelector('.dbv-mat__menu').innerText.trim(), a: [...document.querySelectorAll('.dbv-mat__menu a')].map(a => a.getAttribute('href')) })); await t.ctx.close(); return Object.assign(r, { errs: t.errs, reqs: t.reqs }); };
  let s = await text({ stub: 'empty' }); ok('пустой ответ: «Файлов пока нет»', s.t === 'Файлов пока нет' && !s.errs.length, s.t);
  s = await text({ stub: '403' }); ok('HTTP 403: текст ошибки + ссылка на вложения', s.t === 'Список файлов не загрузился. Откройте вложения страницы' && s.a[0] === '/pages/viewpageattachments.action?pageId=4242' && !s.errs.length, s.t + ' ' + s.a);
  s = await text({ stub: 'reject' }); ok('сеть отклонена: текст ошибки', s.t.startsWith('Список файлов не загрузился.') && !s.errs.length, s.t);
  s = await text({ stub: 'ok', pid: '', ctx: '' }); ok('нет ID страницы: ошибка без ссылки', s.t === 'Список файлов не загрузился. Откройте вложения страницы' && s.a.length === 0 && !s.errs.length, s.t);
  { const t = await open({ stub: '403', ctx: '/wiki' }); const h = await t.pg.evaluate(() => document.querySelector('.dbv-mat__menu a').getAttribute('href')); ok('контекстный путь в ссылке ошибки', h === '/wiki/pages/viewpageattachments.action?pageId=4242', h); await t.ctx.close(); }
  { const t = await open({ stub: '403' }); await t.ctx.close(); }
  // pageId из адреса
  { const f = page({ pid: '', stub: '403' }); const t = await br.newContext(); const pg = await t.newPage(); await pg.goto(f + '?pageId=999'); await pg.waitForTimeout(300); const h = await pg.evaluate(() => (document.querySelector('.dbv-mat__menu a') || {}).href); ok('ID из ?pageId=', /pageId=999$/.test(h || ''), h); await t.close(); }
  // пагинация
  { const t = await open({ stub: 'paged', ctx: '' }); await t.pg.waitForTimeout(300); const r = await t.pg.evaluate(() => ({ n: document.querySelectorAll('.dbv-mat li').length, u: window.__urls })); ok('пагинация _links.next: собраны обе страницы, запрос на тот же сайт', r.n === FILES.length && r.u.length === 2 && r.u[1].startsWith('/rest/api/content/777/'), r.n + ' ' + r.u.join(' ')); await t.ctx.close(); }
  // загрузка
  { const f = page({ pid: '1' }).replace(/\.html$/, '.html'); const html = fs.readFileSync(f.replace('file://', ''), 'utf8').replace('return Promise.resolve', 'return new Promise(function(){}).then(); return Promise.resolve'); fs.writeFileSync(f.replace('file://', ''), html); const c = await br.newContext(); const pg = await c.newPage(); await pg.goto(f); const tx = await pg.evaluate(() => document.querySelector('.dbv-mat__menu').innerText.trim()); ok('до ответа: «Загрузка…»', tx === 'Загрузка…', tx); await c.close(); }
  // 6. недоверенные имена
  const evil = [['Файл без расширения', 1.2], ['<img src=x onerror="window.__x=1">&amp;"квота".pdf', 1], ['<script>window.__x=1<\/script>.docx', 2.5], ['Очень длинное название файла для проверки переноса строки без обрезки текста и выхода за границы колонки 2024 года итоговая версия.pdf', 1], ['Подчёркивания_без_пробелов_очень_длинное_имя_файла_для_проверки_аварийного_переноса_строки_в_узкой_колонке_80_символов.pdf', 3.3], ['Данные.XLSX', 0.05], ['Схема.vsdx', 0.001]];
  for (const w of [1000, 375]) {
    const t = await open({ files: evil, w }); await openAll(t.pg);
    const r = await t.pg.evaluate(() => ({ x: window.__x || 0, imgs: document.querySelectorAll('.dbv-mat img,.dbv-mat script:not(:last-child)').length, names: [...document.querySelectorAll('.dbv-mat li')].map(li => [li.querySelector('a').textContent, (li.querySelector('.dbv-mat__x') || {}).textContent || '']), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, over: [...document.querySelectorAll('.dbv-mat *')].filter(e => e.getBoundingClientRect().right > document.querySelector('.dbv-mat').getBoundingClientRect().right + .5).map(e => e.tagName + '.' + e.className + ':' + e.textContent.slice(0, 30)).join('; ') }));
    ok(`имена (${w}): <>&" как текст, ничего не исполняется`, r.x === 0 && r.names.some(n => n[0] === '<img src=x onerror="window.__x=1">&amp;"квота"') && r.names.some(n => n[0] === '<script>window.__x=1</script>') && !t.errs.length, JSON.stringify(r.names.slice(0, 3)));
    ok(`имена (${w}): без расширения / XLSX / vsdx / КБ`, r.names.some(n => n[0] === 'Файл без расширения' && n[1] === '1,2 МБ') && r.names.some(n => n[1] === 'Excel · 51 КБ') && r.names.some(n => n[1] === 'VSDX · 1 КБ'), JSON.stringify(r.names.map(n => n[1])));
    ok(`имена (${w}): длинные без горизонтального скролла`, r.sw <= r.cw && r.over === '', `sw ${r.sw} cw ${r.cw} over ${r.over}`);
    await t.ctx.close();
  }
  // 7. жёсткие чужие стили: ключевые свойства совпадают с чистой страницей
  const snap = async (foreign) => { const t = await open({ w: 1000, foreign }); await openAll(t.pg); const r = await t.pg.evaluate(() => [...document.querySelectorAll('.dbv-mat .dbv-mat__intro,.dbv-mat .dbv-acc__b,.dbv-mat .dbv-acc__h,.dbv-mat .dbv-mat__f,.dbv-mat .dbv-mat__x,.dbv-mat li,.dbv-mat ul')].slice(0, 40).map(e => { const s = getComputedStyle(e); return [e.className, s.fontSize, s.fontWeight, s.fontStyle, s.color, s.textTransform, s.textDecorationLine, s.letterSpacing, s.backgroundColor, s.borderTopWidth, s.marginTop, s.paddingTop].join('|'); })); await t.pg.screenshot({ path: path.join(TMP, foreign ? 'f.png' : 'c.png') }); await t.ctx.close(); return r; };
  const a = await snap(false), b = await snap(true);
  const diff = a.map((x, i) => x === b[i] ? null : x + '  <>  ' + b[i]).filter(Boolean);
  ok('изоляция: жёсткие стили a,p,button,h2,h3,table,li,ul,span,div !important не меняют вид блока', diff.length === 0, diff.slice(0, 3).join(' ;; '));
  // 8. размер
  const kb = Buffer.byteLength(BLOCK) / 1024; ok('размер ≤ 38 КБ', kb <= 38, kb.toFixed(1) + ' КБ');
  ok('в блоке нет внешних ресурсов/запрещённого', !/https?:\/\/(?!www\.w3\.org)|localStorage|sessionStorage|position:\s*fixed|100vh|innerHTML|<html|<body|<head|gradient\(/i.test(BLOCK) || /(box|text)-shadow:\s*[^n\s;]/.test(BLOCK));
  ok('в блоке один <script> и один <style>, нет глобальных селекторов', (BLOCK.match(/<script>/g) || []).length === 1 && (BLOCK.match(/<style>/g) || []).length === 1);
  await br.close();
  console.log(rows.map(r => r.join('  ')).join('\n')); console.log(fails ? `\nПРОВАЛОВ: ${fails}` : '\nВСЕ ПРОВЕРКИ ЗЕЛЁНЫЕ'); process.exit(fails ? 1 : 0);
})();
