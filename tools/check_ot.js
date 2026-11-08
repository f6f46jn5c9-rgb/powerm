// Проверка «Охрана труда» в Chromium: node tools/check_ot.js
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const R = path.resolve(__dirname, '..'); const rd = n => fs.readFileSync(path.join(R, 'dist', n), 'utf8');
const H = rd('ot-hub-1-hero.html'), O = rd('ot-hub-2-cbl-open.html'), C = rd('ot-hub-3-cbl-close.html');
const lum = c => { c = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const LI = '<ul><li><a href="#">Практика один</a></li><li><a href="#">Практика два</a></li></ul>';
const HOSTILE = '<style>body{color:red;background:black}.wiki-content *{color:red !important;font-size:40px !important}a{color:red !important}h1,h2{font-size:50px !important;color:red !important}</style>';
(async () => {
  const b = await chromium.launch(); const reqs = [], errs = [];
  async function open(w, o = {}) {
    const ctx = await b.newContext({ viewport: { width: o.vw || w + 40, height: 900 }, reducedMotion: o.rm ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    pg.on('console', m => m.type()==='error' && errs.push(m.text())); pg.on('pageerror', e => errs.push(String(e)));
    pg.on('request', r => { const u=r.url(); if (!u.startsWith('data:') && !u.startsWith('about:')) reqs.push(u); });
    await pg.setContent('<!doctype html><meta charset=utf-8><body style="margin:0;background:#fff"><div id="col" class="wiki-content" style="width:'+w+'px;max-width:100%;font:16px Arial">'+(o.hostile?HOSTILE:'')+H+O+LI+C+'</div>');
    return pg;
  }
  for (const [w, vw] of [[1100],[960],[820],[700],[560],[375,375]]) {
    const pg = await open(w, { vw });
    const r = await pg.evaluate(() => { const root = document.querySelector('.ot-hub'), rb = root.getBoundingClientRect();
      const out = [...root.querySelectorAll('*')].filter(e => { const b=e.getBoundingClientRect(); return b.right>rb.right+1||b.left<rb.left-1; }).length;
      const t = document.querySelector('.ot-title'); return { hs: document.documentElement.scrollWidth > innerWidth, out, clip: t.scrollWidth > t.clientWidth+1, wrap: document.querySelectorAll('.ot-cbl-wrap li').length === 2 && document.querySelector('.ot-cbl-wrap').nextElementSibling === null }; });
    ok(!r.hs && r.out===0 && !r.clip, `w=${w}: без гор. скролла/обрезок`);
    ok(r.wrap, `w=${w}: обёртка CBL открыта/закрыта, li внутри`);
    if (w===1100) await pg.locator('#col').screenshot({ path: path.join(R, 'ot-final/screens/ot-hub-1100.png') });
    await pg.context().close();
  }
  const pg = await open(1100);
  const d = await pg.evaluate(() => { const h = document.querySelector('.ot-title'), bk = document.querySelector('.ot-back'), i = document.querySelector('.ot-ico'), a = document.querySelector('.ot-cbl-wrap a'), li = document.querySelector('.ot-cbl-wrap li');
    return { h: h.tagName+h.textContent, hc: getComputedStyle(h).color, hf: getComputedStyle(h).fontSize+getComputedStyle(h).fontWeight, href: bk.getAttribute('href'), bc: getComputedStyle(bk).color, bg: getComputedStyle(document.querySelector('.ot-hero')).backgroundColor, ic: getComputedStyle(i).backgroundColor, iw: i.offsetWidth, lc: getComputedStyle(a).color, lb: getComputedStyle(li).borderBottomColor, ln: getComputedStyle(document.querySelector('.ot-line')).backgroundImage, bad: document.querySelectorAll('.ot-hub script,.ot-hub [style]').length, bf: [...document.querySelectorAll('.ot-hub *')].some(e=>getComputedStyle(e).backdropFilter!=='none'&&getComputedStyle(e).backdropFilter!==undefined) }; });
  ok(d.h==='H1Охрана труда. Силовые машины' && d.hc==='rgb(74, 118, 40)' && d.hf==='26px800', 'h1 текст/цвет #4a7628/26px/800');
  ok(d.href==='https://kb.severstal.com/spaces/BSS/pages/161546386/', 'крошка → БУП');
  ok(d.bg==='rgb(255, 255, 255)' && d.ic==='rgb(74, 118, 40)' && d.iw===56 && d.ln.includes('linear-gradient') && !d.bf, 'белый hero, кружок 56px, градиентная линия, без backdrop-filter');
  ok(d.lc==='rgb(74, 118, 40)', 'ссылки CBL #4a7628');
  const h1c = cr([74,118,40],[255,255,255]); ok(h1c>=4.5, `h1 контраст ${h1c.toFixed(2)}`);
  const a75 = cr([255-.75*181,255-.75*137,255-.75*215],[255,255,255]), a90 = cr([255-.9*181,255-.9*137,255-.9*215],[255,255,255]);
  console.log(`  крошка α=0.75: ${a75.toFixed(2)}, α=0.9: ${a90.toFixed(2)}`); ok(h1c>=4.5, 'крошка сплошной #4a7628 (α0.75=3.25, α0.9=4.37 не проходят)');
  ok(d.bc==='rgb(74, 118, 40)', 'цвет крошки rgb(74,118,40)');
  await pg.keyboard.press('Tab'); ok(await pg.evaluate(() => getComputedStyle(document.activeElement).outlineStyle==='solid' && document.activeElement.classList.contains('ot-back')), ':focus-visible виден');
  await pg.context().close();
  for (const w of [1100, 375]) {
    const h = await open(w, { hostile:true, vw: w===375?375:undefined }), n = await open(w, { vw: w===375?375:undefined });
    const g = p => p.evaluate(() => { const t=document.querySelector('.ot-title'), c=getComputedStyle(t); return { t:c.fontSize+c.color+c.fontWeight, i:getComputedStyle(document.querySelector('.ot-ico')).backgroundColor, hs: document.documentElement.scrollWidth>innerWidth }; });
    const a = await g(h), c = await g(n);
    ok(a.t===c.t && a.i===c.i && !a.hs, `изоляция при body{color:red;background:black} (w=${w})`);
  }
  const rm = await open(1100, { rm:true });
  ok(await rm.evaluate(() => getComputedStyle(document.querySelector('.ot-back')).transitionDuration)==='0s', 'reduced-motion: transitions выключены');
  ok(reqs.length===0, 'внешних запросов нет'); ok(errs.length===0, 'ошибок консоли нет');
  for (const n of ['ot-hub-1-hero.html','ot-hub-2-cbl-open.html','ot-hub-3-cbl-close.html']) ok(fs.statSync(path.join(R,'dist',n)).size/1024<=38, n+' ≤ 38 КБ');
  ok(!/<(html|head|body)\b/i.test(H+O+C) && !/localStorage|sessionStorage|position:\s*fixed|100vh|https?:\/\/[^"']*\.(js|css|png|woff)/i.test(H+O+C), 'правила Confluence');
  ok(C.trim()==='</div>' && O.trimEnd().endsWith('<div class="ot-cbl-wrap">'), 'CBL: open оканчивается незакрытым div, close = </div>');
  await b.close(); console.log(fails ? 'FAILS: '+fails : 'ВСЁ ЗЕЛЁНОЕ'); process.exit(fails?1:0);
})();
