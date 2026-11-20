// Автопроверка вёрстки стартовой БУП «Кармин» в имитации Confluence/Refined (Playwright, Chromium).
// Запускается из tools/landing_check.py:  node tools/landing_check.js <outDir> [beforeResults.json]
// Пишет <outDir>/raw.json и скриншоты в <outDir>/img/.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HARN = path.join(ROOT, 'tools/landing_harness');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'reports/landing-check'));
const BEFORE = process.argv[3] && fs.existsSync(process.argv[3]) ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : null;
const IMG = path.join(OUT, 'img');
fs.mkdirSync(IMG, { recursive: true });
const BASE = 'http://harness.local/';
const VARIANTS = ['1K', '2K', '6K'];

// ---------- матрица ----------
const WIDTHS = [360, 390, 768, 1024, 1280, 1366, 1440, 1920];
const SCALES = [1, 1.25, 1.5];
function cfg(w, s, tree, extra) {
  const css = Math.round(w / s);
  return Object.assign({ w, s, css, h: Math.round(900 / s), tree, right: 0, theme: 1, rm: 0, fail: 0 }, extra || {});
}
function cid(c) {
  return `${c.w}@${Math.round(c.s * 100)}·tree${c.tree}${c.right ? '·right' : ''}${c.theme ? '' : '·notheme'}${c.rm ? '·reduced' : ''}${c.fail ? '·apifail' : ''}`;
}
const MATRIX = [];
for (const w of WIDTHS) for (const s of SCALES) {
  const css = Math.round(w / s);
  for (const t of (css >= 1000 ? [0, 280, 480] : [0])) MATRIX.push(cfg(w, s, t));
}
MATRIX.push(cfg(1920, 1, 0, { right: 1 }), cfg(1366, 1.25, 280, { right: 1 }));
MATRIX.push(cfg(1280, 1, 280, { rm: 1 }), cfg(1280, 1, 280, { fail: 1 }));
if (process.env.QUICK) MATRIX.splice(0, MATRIX.length, ...MATRIX.filter((_, i) => i % 7 === 0));
const THEME_CMP = [cfg(390, 1, 0), cfg(1280, 1, 280), cfg(1920, 1, 280)];
const GALLERY = [
  ['390@100', cfg(390, 1, 0)], ['768@100', cfg(768, 1, 0)], ['1280@100 · дерево 280', cfg(1280, 1, 280)],
  ['1366@125 · дерево 480 («худший ноутбук»)', cfg(1366, 1.25, 480)], ['1920@100 · дерево 0', cfg(1920, 1, 0)],
  ['1920@100 · правая панель', cfg(1920, 1, 0, { right: 1 })]
];
const SEARCH_CFG = [cfg(390, 1, 0), cfg(1280, 1, 280), cfg(1366, 1.25, 480)];

// ---------- проверки в странице ----------
function pageChecks(o) {
  const issues = [];
  const de = document.documentElement;
  const sx = window.scrollX, sy = window.scrollY;
  function P(r) { return { x: Math.round(r.left + sx), y: Math.round(r.top + sy), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top) }; }
  function add(c, sev, mod, el, msg, r) {
    issues.push({ c, sev, mod, sel: el ? desc(el) : '', msg, rect: r ? P(r) : null });
  }
  function desc(el) {
    const parts = [];
    for (let e = el, i = 0; e && i < 3 && !e.hasAttribute('data-bupk'); e = e.parentElement, i++) {
      const cls = [...e.classList].filter(c => c.startsWith('k-') || c.startsWith('is-')).join('.');
      parts.unshift(e.tagName.toLowerCase() + (cls ? '.' + cls : ''));
    }
    return parts.join(' > ');
  }
  function visible(el) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function clipRect(el, root) {
    const b = el.getBoundingClientRect();
    let r = { left: b.left, top: b.top, right: b.right, bottom: b.bottom }, scroller = null;
    for (let a = el.parentElement; a && a !== root; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const ar = a.getBoundingClientRect();
        r = { left: Math.max(r.left, ar.left), top: Math.max(r.top, ar.top), right: Math.min(r.right, ar.right), bottom: Math.min(r.bottom, ar.bottom) };
        if (a.hasAttribute('data-k-scroll')) scroller = a;
      }
    }
    r.empty = r.right - r.left <= 0.5 || r.bottom - r.top <= 0.5;
    return { r, scroller };
  }
  function rgba(s) {
    const m = /rgba?\(([^)]+)\)/.exec(s);
    if (!m) return null;
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function lum(c) {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  }
  function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function bgOf(el) {
    for (let a = el; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.backdropFilter && cs.backdropFilter !== 'none') return { manual: 'стекло' };
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        const stops = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(rgba);
        if (stops.length && stops.every(s => s[3] === 1)) return { colors: stops };
        return { manual: 'градиент/фактура' };
      }
      const c = rgba(cs.backgroundColor);
      if (c && c[3] > 0) return c[3] >= 1 ? { colors: [c] } : { manual: 'полупрозрачный фон' };
    }
    return { colors: [[255, 255, 255, 1]] };
  }

  if (de.scrollWidth > de.clientWidth + 1) add('overflow', 'error', 'page', null, `страница: scrollWidth ${de.scrollWidth} > clientWidth ${de.clientWidth}`);
  const reds = [];
  const manual = [];
  for (const root of document.querySelectorAll('[data-bupk]')) {
    const mod = root.getAttribute('data-bupk');
    const rr = root.getBoundingClientRect();
    if (root.scrollWidth > root.clientWidth + 1) add('overflow', 'error', mod, root, `корень модуля: scrollWidth ${root.scrollWidth} > ${root.clientWidth}`, rr);
    const sec = root.closest('.rf-sec');
    if (sec && sec.scrollHeight > sec.clientHeight + 1) add('overflow', 'error', mod, root, 'модуль обрезан секцией с overflow:hidden', sec.getBoundingClientRect());
    const els = [...root.querySelectorAll('*')];
    const inter = [];
    for (const el of els) {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
      if (!visible(el)) continue;
      const { r, scroller } = clipRect(el, root);
      if (r.empty) continue;
      // 1. переполнение относительно корня
      if (r.left < rr.left - 1 || r.right > rr.right + 1 || r.top < rr.top - 1 || r.bottom > rr.bottom + 1)
        add('overflow', 'error', mod, el, `выходит за корень модуля на ${Math.round(Math.max(rr.left - r.left, r.right - rr.right, rr.top - r.top, r.bottom - rr.bottom))} px`, r);
      const cs = getComputedStyle(el);
      const tag = el.tagName.toLowerCase();
      const isInter = /^(a|button|input)$/.test(tag) || el.getAttribute('role') === 'tab' || el.getAttribute('role') === 'option';
      if (isInter) inter.push({ el, r, scroller });
      if (scroller && el !== scroller && !scroller.contains(el)) { /* n/a */ }
      // текстовые узлы
      const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (hasText && !el.closest('.k-vh')) {
        // 2. обрезанный текст
        if (cs.textOverflow === 'ellipsis') add('clip', 'error', mod, el, 'text-overflow: ellipsis', r);
        if (cs.display !== 'inline') {
          if ((cs.overflowX !== 'visible' || cs.overflowY !== 'visible') && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1))
            add('clip', 'error', mod, el, `текст обрезан: ${el.scrollWidth}×${el.scrollHeight} > ${el.clientWidth}×${el.clientHeight}`, r);
          else if (el.scrollWidth > el.clientWidth + 1 && tag !== 'input')
            add('clip', 'error', mod, el, `текст шире своего блока: ${el.scrollWidth} > ${el.clientWidth}`, r);
        }
        // 6. кегль
        const fsz = parseFloat(cs.fontSize);
        const caps = cs.textTransform === 'uppercase' && parseFloat(cs.letterSpacing) > 0;
        if (fsz < (caps ? 11 : 12) - 0.01) add('font', 'error', mod, el, `кегль ${fsz}px`, r);
        // 5. контраст
        const fg = rgba(cs.color);
        const bg = bgOf(el);
        const big = fsz >= 24 || (fsz >= 18.66 && +cs.fontWeight >= 700);
        if (bg.manual) manual.push({ mod, sel: desc(el), why: bg.manual, rect: P(r) });
        else if (fg) {
          const min = Math.min(...bg.colors.map(b => ratio(fg, b)));
          if (min < (big ? 3 : 4.5)) add('contrast', 'error', mod, el, `контраст ${min.toFixed(2)}:1 (нужно ≥ ${big ? 3 : 4.5})`, r);
        }
      }
      // 10. красное
      if (!el.hasAttribute('data-k-deco') && (/rgb\(196, 22, 28\)/.test(cs.backgroundColor) || /rgb\(209, 27, 34\)/.test(cs.backgroundImage)))
        reds.push({ mod, sel: desc(el), r: P(r) });
    }
    // 3. перекрытия
    for (let i = 0; i < inter.length; i++) for (let j = i + 1; j < inter.length; j++) {
      const a = inter[i], b = inter[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w > 2 && h > 2) add('overlap', 'error', mod, a.el, `перекрывается с ${desc(b.el)} (${Math.round(w)}×${Math.round(h)} px)`, a.r);
    }
    // 4. цели касания
    if (o.css <= 768) for (const it of inter) {
      if (it.el.getAttribute('role') === 'option' && it.el.closest('[hidden]')) continue;
      const b = it.el.getBoundingClientRect();
      if (b.width < 44 - 0.5 || b.height < 44 - 0.5) {
        const inline = getComputedStyle(it.el).display === 'inline';
        add('touch', inline ? 'warn' : 'error', mod, it.el, `цель касания ${Math.round(b.width)}×${Math.round(b.height)} px`, b);
      }
    }
  }
  // 10. одно красное на экран
  const vh = window.innerHeight, H = de.scrollHeight;
  const screens = [];
  for (let y = 0; y < H; y += vh) {
    const inScr = reds.filter(x => Math.min(x.r.y + x.r.h, y + vh) - Math.max(x.r.y, y) >= 24);
    if (inScr.length > 1) screens.push({ y, items: inScr });
  }
  for (const s of screens) add('red', 'warn', s.items.map(i => i.mod).join(' + '), null,
    `экран ${Math.round(s.y)}–${Math.round(s.y + vh)} px: красных элементов ${s.items.length} (${s.items.map(i => i.sel).join('; ')})`);
  const ms = {};
  document.querySelectorAll('[data-bupk]').forEach(r => { ms[r.getAttribute('data-bupk')] = +r.getAttribute('data-k-ms'); });
  return { issues, manual, ms, reds: reds.length, height: H };
}

// ---------- helpers ----------
async function newPage(browser, c, file) {
  const ctx = await browser.newContext({
    viewport: { width: c.css, height: c.h }, deviceScaleFactor: c.s, reducedMotion: c.rm ? 'reduce' : 'no-preference'
  });
  const page = await ctx.newPage();
  const log = { errors: [], warns: [], nav: [] };
  page.on('pageerror', e => log.errors.push('pageerror: ' + e.message));
  page.on('console', m => {
    if (m.type() === 'error') log.errors.push('console.error: ' + m.text());
    if (m.type() === 'warning') log.warns.push(m.text());
  });
  await page.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith(BASE)) {
      const p = path.join(HARN, decodeURIComponent(new URL(u).pathname.slice(1)));
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return route.fulfill({ path: p, contentType: 'text/html; charset=utf-8' });
    }
    if (route.request().isNavigationRequest()) { log.nav.push(u); return route.fulfill({ body: '<!doctype html><title>nav</title>ok', contentType: 'text/html' }); }
    return route.abort();
  });
  const q = `?tree=${c.tree}&right=${c.right}&theme=${c.theme}&fail=${c.fail}`;
  await page.goto(BASE + file + q);
  await page.mouse.move(0, 0);
  return { ctx, page, log };
}
async function settle(page) {
  // прокрутка вниз — чтобы ленивые полки загрузились, затем ожидание исчезновения скелетонов
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => innerHeight);
  for (let y = 0; y < H; y += vh) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(60); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => !document.querySelector('[data-bupk] .k-sk'), null, { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(450);
}
function slug(s) { return s.replace(/[^\w@-]+/g, '_'); }

async function cropShot(page, rect, file, c) {
  const pad = 40;
  const dims = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
  const x = Math.max(0, rect.x - pad), y = Math.max(0, rect.y - pad);
  const clip = { x, y, width: Math.max(10, Math.min(dims.w - x, rect.w + pad * 2)), height: Math.max(10, Math.min(dims.h - y, Math.min(rect.h, 700) + pad * 2)) };
  await page.screenshot({ path: path.join(IMG, file), clip, fullPage: true });
  return { file: 'img/' + file, clip };
}

(async () => {
  const browser = await chromium.launch();
  const res = { configs: [], theme: [], neighbor: {}, search: [], shelf: [], gallery: [], before_after: [], manual: [] };
  const seenCrop = new Set();

  // соседи: стили элементов Confluence без модулей
  const NB = () => {
    const pick = el => { const cs = getComputedStyle(el); return ['color', 'fontFamily', 'fontSize', 'lineHeight', 'margin', 'padding', 'textDecorationLine', 'boxSizing', 'display', 'width', 'height'].map(k => k + ':' + cs[k]).join('|'); };
    return { p: pick(document.querySelector('#neighbor p')), a: pick(document.querySelector('#neighbor .aui-button')) };
  };
  async function runVariant(v) {
    // базовые стили соседей
    for (const c of THEME_CMP) {
      const e = await newPage(browser, c, 'empty.html'); const base = await e.page.evaluate(NB); await e.ctx.close();
      const m = await newPage(browser, c, `page-${v}.html`); await settle(m.page); const got = await m.page.evaluate(NB); await m.ctx.close();
      res.neighbor[`${v} ${cid(c)}`] = { same: base.p === got.p && base.a === got.a, base, got };
    }
    // матрица
    for (const c of MATRIX) {
      const t0 = Date.now();
      const { ctx, page, log } = await newPage(browser, c, `page-${v}.html`);
      await settle(page);
      const r = await page.evaluate(pageChecks, c);
      const entry = { v, id: cid(c), cfg: c, issues: r.issues, ms: r.ms, height: r.height, errors: log.errors, warns: log.warns, t: Date.now() - t0 };
      for (const x of r.manual) {
        const k = v + x.mod + x.sel;
        if (!res.manual.find(m => m.k === k)) res.manual.push(Object.assign({ k, v, cfg: entry.id }, x));
      }
      for (const is of r.issues) {
        const k = [v, is.c, is.mod, is.sel].join('|');
        if (is.rect && !seenCrop.has(k) && seenCrop.size < 400) {
          seenCrop.add(k);
          is.crop = await cropShot(page, is.rect, `issue-${slug(v + '-' + entry.id + '-' + is.c + '-' + seenCrop.size)}.png`, c);
        }
      }
      if (log.errors.length) entry.issues.push({ c: 'js', sev: 'error', mod: '', sel: '', msg: log.errors.join(' / ') });
      if (c.rm) entry.reducedMotion = await page.evaluate(() => {
        const b = document.querySelector('[data-bupk] .k-btn');
        return b ? getComputedStyle(b).transitionDuration : 'n/a';
      });
      res.configs.push(entry);
      await ctx.close();
    }
    // контрольные кадры «до/после» для конфигураций с проблемами в первом прогоне
    if (BEFORE) for (const b of BEFORE.configs.filter(x => x.v === v)) {
      for (const is of b.issues.filter(i => i.crop && i.sev === 'error')) {
        const { ctx, page } = await newPage(browser, b.cfg, `page-${v}.html`);
        await settle(page);
        const file = `after-${slug(path.basename(is.crop.file, '.png'))}.png`;
        await page.screenshot({ path: path.join(IMG, file), clip: is.crop.clip, fullPage: true }).catch(() => {});
        res.before_after.push({ v, cfg: b.id, c: is.c, mod: is.mod, sel: is.sel, msg: is.msg, before: 'before/' + is.crop.file, after: 'img/' + file });
        await ctx.close();
      }
    }
    // изоляция: с «агрессивной темой» и без
    for (const c of THEME_CMP) {
      const shots = {};
      for (const th of [1, 0]) {
        const { ctx, page } = await newPage(browser, Object.assign({}, c, { theme: th }), `page-${v}.html`);
        await settle(page);
        for (const mod of await page.$$eval('[data-bupk]', a => a.map(x => x.getAttribute('data-bupk')))) {
          const f = `theme-${slug(v + '-' + cid(c) + '-' + mod)}-${th ? 'aggr' : 'clean'}.png`;
          await page.locator(`[data-bupk="${mod}"]`).screenshot({ path: path.join(IMG, f), animations: 'disabled' });
          (shots[mod] = shots[mod] || {})[th ? 'aggr' : 'clean'] = 'img/' + f;
        }
        await ctx.close();
      }
      for (const mod in shots) res.theme.push({ v, cfg: cid(c), mod, aggr: shots[mod].aggr, clean: shots[mod].clean });
    }
    // поиск
    for (const c of SEARCH_CFG) {
      const { ctx, page, log } = await newPage(browser, c, `page-${v}.html`);
      await settle(page);
      const s = { v, cfg: cid(c), ok: true, notes: [] };
      const inp = page.locator('[data-bupk] .k-q').first();
      await page.keyboard.press('/');
      s.slashFocus = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('k-q'));
      if (!s.slashFocus) { s.ok = false; s.notes.push('клавиша «/» не поставила фокус в поиск'); }
      await inp.type('сварк', { delay: 30 });
      await page.waitForSelector('[data-bupk] [role=option]', { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(300);
      const info = await page.evaluate(() => {
        const root = document.querySelector('[data-bupk] .k-q').closest('[data-bupk]');
        const lb = root.querySelector('.k-lb'), sec = root.closest('.rf-sec');
        const r = lb.getBoundingClientRect(), rr = root.getBoundingClientRect(), sr = sec.getBoundingClientRect();
        return { opts: root.querySelectorAll('[role=option]').length, groups: [...root.querySelectorAll('.k-lb-g')].map(g => g.textContent),
          marks: root.querySelectorAll('.k-lb mark').length, insideRoot: r.left >= rr.left - 1 && r.right <= rr.right + 1 && r.bottom <= rr.bottom + 1,
          notClipped: r.bottom <= sr.bottom + 1, expanded: document.querySelector('[data-bupk] .k-q').getAttribute('aria-expanded') };
      });
      Object.assign(s, info);
      if (!info.opts || !info.insideRoot || !info.notClipped || info.expanded !== 'true') { s.ok = false; s.notes.push('список не открылся или выходит за модуль/секцию'); }
      const hero = page.locator('[data-bupk]').first();
      const f = `search-${slug(v + '-' + cid(c))}.png`;
      await hero.screenshot({ path: path.join(IMG, f) });
      s.shot = 'img/' + f;
      await page.keyboard.press('ArrowDown');
      s.activedescendant = await inp.getAttribute('aria-activedescendant');
      const expect = await page.evaluate(id => { const o = document.getElementById(id); return o && o.href; }, s.activedescendant);
      await Promise.all([page.waitForEvent('framenavigated', { timeout: 4000 }).catch(() => {}), page.keyboard.press('Enter')]);
      await page.waitForTimeout(300);
      s.navigated = log.nav[log.nav.length - 1] || null;
      s.expected = expect;
      if (!s.navigated || s.navigated !== expect) { s.ok = false; s.notes.push('Enter по пункту не привёл к переходу на его адрес'); }
      // Enter без выбранного пункта → полная страница поиска
      const p2 = await newPage(browser, c, `page-${v}.html`);
      await settle(p2.page);
      const inp2 = p2.page.locator('[data-bupk] .k-q').first();
      await inp2.click();
      await inp2.type('сварк');
      await Promise.all([p2.page.waitForEvent('framenavigated', { timeout: 4000 }).catch(() => {}), p2.page.keyboard.press('Enter')]);
      await p2.page.waitForTimeout(300);
      s.enterFull = p2.log.nav[p2.log.nav.length - 1] || null;
      if (!s.enterFull || !/dosearchsite\.action\?queryString=%D1%81%D0%B2%D0%B0%D1%80%D0%BA/.test(s.enterFull)) { s.ok = false; s.notes.push('Enter без пункта не открыл полную страницу поиска'); }
      await p2.ctx.close();
      s.errors = log.errors;
      if (log.errors.length) s.ok = false;
      res.search.push(s);
      await ctx.close();
    }
    // 6К: полка листается стрелкой
    if (v === '6K') for (const c of [cfg(390, 1, 0), cfg(1280, 1, 280)]) {
      const { ctx, page } = await newPage(browser, c, `page-${v}.html`);
      await settle(page);
      const row = page.locator('[data-bupk] .k-row').first();
      await row.scrollIntoViewIfNeeded();
      const before = await row.evaluate(r => r.scrollLeft);
      await page.locator('[data-bupk] [data-k=next]').first().click();
      await page.waitForTimeout(900);
      const after = await row.evaluate(r => r.scrollLeft);
      const f = `shelf-${slug(cid(c))}.png`;
      await page.locator('[data-bupk] .k-shelf').first().screenshot({ path: path.join(IMG, f) });
      res.shelf.push({ cfg: cid(c), before, after, ok: after > before, shot: 'img/' + f });
      await ctx.close();
    }
    // галерея
    for (const [label, c] of GALLERY) {
      const { ctx, page } = await newPage(browser, c, `page-${v}.html`);
      await settle(page);
      const f = `gallery-${slug(v + '-' + cid(c))}.jpg`;
      await page.screenshot({ path: path.join(IMG, f), fullPage: true, type: 'jpeg', quality: 82 });
      res.gallery.push({ v, label, cfg: cid(c), shot: 'img/' + f });
      await ctx.close();
    }
  }
  await Promise.all(VARIANTS.map(runVariant));
  await browser.close();
  res.matrixSize = MATRIX.length;
  fs.writeFileSync(path.join(OUT, 'raw.json'), JSON.stringify(res, null, 1));
  const errs = res.configs.reduce((n, c) => n + c.issues.filter(i => i.sev === 'error').length, 0);
  console.log(`конфигураций: ${res.configs.length}, ошибок: ${errs}, поиск ok: ${res.search.filter(s => s.ok).length}/${res.search.length}`);
})().catch(e => { console.error(e); process.exit(1); });
