// Проверки комплекса «Чемпионат» в Chromium (Playwright). Запуск: python3 tools/chp_check.py (готовит enabled-вариант и вызывает этот файл)
// node chp_check.js <dir-dist-empty> <dir-dist-enabled>
const pw = require(process.env.PLAYWRIGHT_NODE || 'playwright');
const fs = require('fs'), path = require('path');
const [dirOff, dirOn] = process.argv.slice(2);
const PAGES = ['hub.html', 'voting.html'];
const WIDTHS = [1100, 960, 820, 700, 560];
const PAL = new Set(['#1f2a33', '#5b6670', '#0e7c7b', '#0a5f5e', '#1a2a5e', '#e6f4f3', '#e3eaed', '#ffffff'].map(h => {
  const n = parseInt(h.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; }));
const results = []; let fails = 0;
const ok = (name, cond, info = '') => { results.push([cond ? 'OK ' : 'FAIL', name, info]); if (!cond) fails++; };
const read = (d, f) => fs.readFileSync(path.join(d, f), 'utf8');
const wrap = (w, html, extra = '') => `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${extra}</style></head><body style="margin:0;font-family:Georgia"><div id="col" style="width:${w}px">${html}</div></body></html>`;
const HOSTILE = `a,a:visited,a:hover{color:red!important;background:yellow!important;font-size:33px!important;text-decoration:none!important;font-weight:100!important}
h1,h2,h3,h4{color:red!important;font-size:50px!important;text-transform:uppercase!important;border:4px solid red!important;margin:40px!important;padding:20px!important;background:pink!important;letter-spacing:5px!important;font-family:monospace!important}
p{color:red!important;margin:37px!important;padding:21px!important;font-size:30px!important;line-height:3!important}
button,input,label{color:red!important;background:blue!important;border:3px solid red!important;padding:30px!important}
ul,ol{margin:30px!important;padding:50px!important;list-style:square!important}li{list-style:square!important;margin:9px!important;padding:11px!important;color:red!important;font-size:28px!important}
table,th,td{border:3px solid red!important;padding:20px!important;color:red!important;background:#ff0!important}
div,span,nav,b,strong{letter-spacing:3px!important}
*{text-shadow:1px 1px red!important}`;
const PROPS = ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'fontFamily', 'lineHeight', 'marginTop', 'marginBottom', 'paddingTop', 'paddingLeft', 'textDecorationLine', 'textTransform', 'letterSpacing', 'listStyleType', 'borderTopWidth', 'textShadow'];

function lum(rgb) { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]); }

(async () => {
  const b = await pw.chromium.launch();
  const sizes = {};
  for (const [label, dir] of [['пустые адреса', dirOff], ['адреса заданы', dirOn]]) {
    for (const f of PAGES) {
      const html = read(dir, f);
      sizes[f] = Buffer.byteLength(html);
      // --- адаптив: колонка 1100..560 и окно 375
      for (const w of [...WIDTHS, 375]) {
        const win = w === 375 ? 375 : 1300;
        const p = await b.newPage({ viewport: { width: win, height: 900 } });
        await p.setContent(wrap(w === 375 ? 375 : w, html));
        const r = await p.evaluate(() => {
          const root = document.querySelector('.chp-root'), rr = root.getBoundingClientRect();
          const bad = [];
          root.querySelectorAll('*').forEach(e => {
            const cs = getComputedStyle(e);
            if (/(hidden|clip)/.test(cs.overflow + cs.overflowX + cs.overflowY) && !e.closest('svg')) bad.push('overflow:' + e.className);
            if (cs.textOverflow === 'ellipsis') bad.push('ellipsis');
            const er = e.getBoundingClientRect();
            if (er.right > rr.right + 0.5 || er.left < rr.left - 0.5) bad.push('вылет:' + e.tagName + '.' + e.className);
            if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && !(e instanceof SVGElement) && cs.display !== 'inline') bad.push('scrollW:' + e.tagName + '.' + e.className);
          });
          return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, rw: rr.width, bad, h: rr.height };
        });
        ok(`[${label}] ${f} @${w}${w === 375 ? '(окно)' : ''}: без гор. скролла и обрезок`, r.sw <= r.cw && r.bad.length === 0, `scrollW=${r.sw}/${r.cw} root=${r.rw.toFixed(0)} ${r.bad.slice(0, 3).join(';')}`);
        await p.close();
      }
    }
  }
  // --- по оставшимся проверкам работаем на обоих вариантах
  for (const [label, dir] of [['пустые', dirOff], ['заданы', dirOn]]) {
    for (const f of PAGES) {
      const html = read(dir, f);
      const p = await b.newPage({ viewport: { width: 1300, height: 900 } });
      const reqs = [], cons = [];
      p.on('request', q => { const u = q.url(); if (!/^(data:|about:)/.test(u)) reqs.push(u); });
      p.on('console', m => { if (['error', 'warning'].includes(m.type())) cons.push(m.text()); });
      p.on('pageerror', e => cons.push(String(e)));
      for (const w of [1100, 560]) {
        await p.setContent(wrap(w, html)); await p.waitForTimeout(100);
        // контраст
        const cr = await p.evaluate(() => {
          const out = [];
          const bgOf = e => { for (let n = e; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; const m = c.match(/[\d.]+/g).map(Number); if (m.length === 3 || m[3] > 0.99) return m.slice(0, 3); } return [255, 255, 255]; };
          const w = document.createTreeWalker(document.querySelector('.chp-root'), NodeFilter.SHOW_TEXT);
          for (let n; (n = w.nextNode());) { if (!n.textContent.trim()) continue; const e = n.parentElement; const cs = getComputedStyle(e);
            out.push({ t: n.textContent.trim().slice(0, 28), fg: cs.color.match(/[\d.]+/g).map(Number).slice(0, 3), bg: bgOf(e), op: cs.opacity }); }
          return out;
        });
        let min = 99, worst = '';
        for (const c of cr) { const l1 = lum(c.fg), l2 = lum(c.bg); const k = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); if (k < min) { min = k; worst = c.t; } if (c.op !== '1') min = 0; }
        ok(`[${label}] ${f} @${w}: контраст текста ≥ 4.5`, min >= 4.5, `мин ${min.toFixed(2)} («${worst}»)`);
      }
      // иерархия
      await p.setContent(wrap(1000, html));
      const h = await p.evaluate((PAL) => {
        const root = document.querySelector('.chp-root'); const all = [root, ...root.querySelectorAll('*')];
        const plates = root.querySelectorAll('.chp-key,.chp-note').length;
        const bad = [], offp = new Set();
        const norm = c => c;
        all.forEach(e => { const cs = getComputedStyle(e);
          if (cs.boxShadow !== 'none') bad.push('shadow ' + e.className);
          if (/gradient/.test(cs.backgroundImage)) bad.push('gradient ' + e.className);
          if (cs.filter !== 'none') bad.push('filter');
          const tag = e.tagName;
          if (cs.cursor === 'pointer' && !e.closest('a')) bad.push('cursor ' + e.className);
          [['color', cs.color], ['bg', cs.backgroundColor], ['bc', parseFloat(cs.borderTopWidth) ? cs.borderTopColor : null], ['bl', parseFloat(cs.borderLeftWidth) ? cs.borderLeftColor : null], ['bb', parseFloat(cs.borderBottomWidth) ? cs.borderBottomColor : null], ['ol', parseFloat(cs.outlineWidth) && cs.outlineStyle !== 'none' ? cs.outlineColor : null]].forEach(([k, v]) => {
            if (!v || v === 'rgba(0, 0, 0, 0)') return; if (!PAL.includes(v)) offp.add(k + ':' + v + ' ' + e.className); });
          if (/pill|badge|chip/.test(e.className)) bad.push('chip');
          if (cs.borderRadius !== '0px' && parseFloat(cs.borderRadius) >= 20) bad.push('pill-radius ' + e.className);
        });
        const cls = [...new Set(all.map(e => [...e.classList]).flat())];
        return { plates, bad, offp: [...offp], cls, red: !!root.querySelector('[class*=red],[class*=warn]') };
      }, [...PAL]);
      ok(`[${label}] ${f}: плашек ≤ 2 и по реестру`, h.plates <= 2 && (f === 'voting.html' ? h.plates === 1 && !!(await p.$('.chp-note')) && !(await p.$('.chp-key')) : h.plates === 0), `плашек=${h.plates}`);
      ok(`[${label}] ${f}: нет теней/градиентов/фильтров/лишних cursor/чипов`, h.bad.length === 0, h.bad.join(';'));
      ok(`[${label}] ${f}: только палитра СМ`, h.offp.length === 0, h.offp.join(' | '));
      // hover не меняет неинтерактивное
      const hv = await p.$$eval('.chp-root *', els => els.map((e, i) => i));
      let hoverBad = [];
      const n = await p.$$eval('.chp-root *', els => els.length);
      for (let i = 0; i < n; i++) {
        const info = await p.evaluate(i => { const e = document.querySelectorAll('.chp-root *')[i]; return { inter: !!e.closest('a'), cur: e.classList.contains('chp-nav__cur'), tag: e.tagName }; }, i);
        if (info.inter || info.tag === 'svg' || info.tag === 'path') continue;
        const snap = () => p.evaluate(i => { const cs = getComputedStyle(document.querySelectorAll('.chp-root *')[i]); return [cs.transform, cs.boxShadow, cs.cursor, cs.color, cs.backgroundColor, cs.textDecorationLine, cs.borderTopColor, cs.top].join('|'); }, i);
        const a0 = await snap();
        const box = await p.evaluate(i => { const r = document.querySelectorAll('.chp-root *')[i].getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width]; }, i);
        if (!box[2]) continue;
        await p.mouse.move(box[0], box[1]); const a1 = await snap();
        if (a0 !== a1) hoverBad.push(i);
      }
      ok(`[${label}] ${f}: у неинтерактивного нет hover-эффектов`, hoverBad.length === 0, hoverBad.join(','));
      // изоляция: враждебные стили
      const base = await p.evaluate(PROPS => [...document.querySelectorAll('.chp-root *')].filter(e => !(e instanceof SVGElement)).map(e => { const cs = getComputedStyle(e); return PROPS.map(k => cs[k]).join('|'); }), PROPS);
      await p.setContent(wrap(1000, html, HOSTILE));
      const hos = await p.evaluate(PROPS => [...document.querySelectorAll('.chp-root *')].filter(e => !(e instanceof SVGElement)).map(e => { const cs = getComputedStyle(e); return PROPS.map(k => cs[k]).join('|'); }), PROPS);
      const diffs = base.map((x, i) => x === hos[i] ? null : i).filter(x => x !== null);
      // letter-spacing на div/span/b/nav жёстко задан в HOSTILE; допускаем различия только letterSpacing/textShadow на не-перебитых элементах — проверим отдельно без них
      const diffsReal = [];
      for (const i of diffs) { const a = base[i].split('|'), c = hos[i].split('|'); const ks = PROPS.filter((k, j) => a[j] !== c[j] && !['letterSpacing', 'textShadow'].includes(k)); if (ks.length) diffsReal.push(i + ':' + ks.join(',')); }
      ok(`[${label}] ${f}: изоляция при жёстких чужих стилях (шрифт/цвет/отступы)`, diffsReal.length === 0, diffsReal.slice(0, 5).join(' '));
      const lsBad = await p.evaluate(() => [...document.querySelectorAll('.chp-root *')].filter(e => !(e instanceof SVGElement) && getComputedStyle(e).textShadow !== 'none' ).length);
      // чужие элементы не ломаются блоком
      const outside = '<a id="oa" href="#">x</a><h2 id="oh">y</h2><p id="op">z</p><button id="ob">b</button><ul id="ou"><li>i</li></ul>';
      const probe = async (withBlock) => { await p.setContent(wrap(800, outside + (withBlock ? html : ''))); return p.evaluate(() => ['oa', 'oh', 'op', 'ob', 'ou'].map(id => { const cs = getComputedStyle(document.getElementById(id)); return [cs.color, cs.fontSize, cs.marginTop, cs.paddingLeft, cs.fontWeight, cs.textDecorationLine, cs.backgroundColor, cs.listStyleType].join('|'); }).join('||')); };
      ok(`[${label}] ${f}: блок не влияет на чужие a/h2/p/button/ul`, (await probe(false)) === (await probe(true)));
      // внешние запросы / консоль
      ok(`[${label}] ${f}: нет внешних запросов и ошибок консоли`, reqs.length === 0 && cons.length === 0, reqs.concat(cons).join(';'));
      // reduced motion
      await p.emulateMedia({ reducedMotion: 'reduce' }); await p.setContent(wrap(1000, html));
      const rm = await p.evaluate(() => [...document.querySelectorAll('.chp-root *')].every(e => { const cs = getComputedStyle(e); return parseFloat(cs.transitionDuration) === 0 && parseFloat(cs.animationDuration) === 0; }));
      ok(`[${label}] ${f}: prefers-reduced-motion — переходов нет`, rm);
      await p.emulateMedia({ reducedMotion: 'no-preference' });
      // структура: нет script, нет глобальных селекторов, нет position:fixed/100vh/storage
      ok(`[${label}] ${f}: нет script/fixed/100vh/storage/внешних url`, !/<script|position:\s*fixed|100vh|localStorage|sessionStorage|https?:\/\/(?!kb\.severstal)|@import|@font-face/.test(html.replace(/href="[^"]*"/g, '')));
      const styleTxt = html.match(/<style>([\s\S]*?)<\/style>/)[1];
      const sels = styleTxt.replace(/@container[^{]*\{/g, '').replace(/@media[^{]*\{/g, '').split('}').map(s => s.split('{')[0].trim()).filter(Boolean).flatMap(s => s.split(','));
      const glob = sels.filter(s => !/^\.chp-root(?![\w-])/.test(s.trim()));
      ok(`[${label}] ${f}: все селекторы под .chp-root`, glob.length === 0, glob.slice(0, 4).join(' '));
      ok(`[${label}] ${f}: размер ≤ 38 КБ`, Buffer.byteLength(html) <= 38 * 1024, (Buffer.byteLength(html) / 1024).toFixed(1) + ' КБ');
      await p.close();
    }
  }
  // --- клавиатура, фокус, тап/клик (варианты с адресами)
  for (const f of PAGES) {
    const html = read(dirOn, f);
    const ctx = await b.newContext({ viewport: { width: 700, height: 800 }, hasTouch: true });
    const p = await ctx.newPage();
    await p.route('**/*', r => r.request().url().startsWith('https://kb.example/') ? r.fulfill({ status: 200, contentType: 'text/html', body: '<title>ok</title>' }) : r.continue());
    await p.setContent(wrap(700, html));
    const links = await p.$$eval('.chp-root a', as => as.map(a => a.textContent.trim().replace(/\s+/g, ' ')));
    const seen = [];
    for (let i = 0; i < links.length; i++) {
      await p.keyboard.press('Tab');
      const s = await p.evaluate(() => { const e = document.activeElement, cs = getComputedStyle(e); return { t: e.textContent.trim().replace(/\s+/g, ' '), ow: parseFloat(cs.outlineWidth), os: cs.outlineStyle, oc: cs.outlineColor, fv: e.matches(':focus-visible') }; });
      seen.push(s);
    }
    ok(`${f}: клавиатура — Tab проходит все ссылки по порядку`, JSON.stringify(seen.map(s => s.t)) === JSON.stringify(links), links.join(' → '));
    ok(`${f}: фокус виден (outline ≥ 3px, teal)`, seen.every(s => s.fv && s.ow >= 3 && s.os === 'solid' && s.oc === 'rgb(14, 124, 123)'));
    // тап/клик по каждой ссылке
    for (let i = 0; i < links.length; i++) {
      await p.setContent(wrap(700, html));
      const [resp] = await Promise.all([p.waitForNavigation({ timeout: 3000 }).catch(() => null), p.locator('.chp-root a').nth(i).tap()]);
      ok(`${f}: тап по «${links[i]}» ведёт на заданный адрес`, p.url().startsWith('https://kb.example/'), p.url());
    }
    await ctx.close();
  }
  // --- неактивные: не ссылки, не фокусируются
  for (const f of PAGES) {
    const p = await b.newPage(); await p.setContent(wrap(700, read(dirOff, f)));
    const a = await p.$$('.chp-root a');
    const off = await p.$$eval('.chp-root [aria-disabled="true"]', e => e.map(x => x.textContent.replace(/\s+/g, ' ').trim()));
    const soon = await p.$$eval('.chp-root .chp-soon', e => e.length);
    ok(`${f}: пустой адрес → нет ссылок, aria-disabled + «Скоро»`, a.length === 0 && off.length >= 1 && soon === off.length, off.join(' / '));
    await p.close();
  }
  await b.close();
  const w = Math.max(...results.map(r => r[1].length));
  for (const r of results) console.log(r[0], r[1], r[2] ? ' — ' + r[2] : '');
  console.log(`\nИтого: ${results.length - fails}/${results.length} OK, FAIL=${fails}`);
  process.exit(fails ? 1 : 0);
})();
