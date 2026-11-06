// Проверка хаба «Закупки» в Chromium.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const R = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(R, 'dist/zakupki-hub.html'), 'utf8');
const lum = c => { c = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const HOSTILE = '<style>.wiki-content *{color:red !important;font-size:40px !important;letter-spacing:5px !important;text-transform:none}a{color:red !important;text-decoration:underline !important}h1,h2{font-size:50px !important;color:red !important;border:5px solid red !important}.wiki-content div div,.wiki-content span{padding:30px !important;margin:30px !important}</style>';
(async () => {
  const b = await chromium.launch(); const reqs = [], errs = [];
  async function open(w, o = {}) {
    const ctx = await b.newContext({ viewport: { width: o.vw || w + 40, height: 900 }, reducedMotion: o.rm ? 'reduce' : 'no-preference' });
    const pg = await ctx.newPage();
    pg.on('console', m => m.type()==='error' && errs.push(m.text())); pg.on('pageerror', e => errs.push(String(e)));
    pg.on('request', r => { const u=r.url(); if (!u.startsWith('data:') && !u.startsWith('about:')) reqs.push(u); });
    await pg.setContent('<!doctype html><meta charset=utf-8><body style="margin:0;background:#fff"><div id="col" class="wiki-content" style="width:'+w+'px;max-width:100%;font:16px Arial">'+(o.hostile?HOSTILE:'')+html+'</div>');
    return pg;
  }
  for (const [w, vw] of [[1100],[960],[820],[700],[560],[375,375]]) {
    const pg = await open(w, { vw });
    const r = await pg.evaluate(() => {
      const root = document.querySelector('.zk-hub'), rb = root.getBoundingClientRect();
      const cols = new Set([...document.querySelectorAll('.zk-grid')].map(g => getComputedStyle(g).gridTemplateColumns.split(' ').length));
      const tiles = [...document.querySelectorAll('.zk-tile')];
      const clipped = tiles.filter(t => t.scrollWidth > t.clientWidth+1 || t.scrollHeight > t.clientHeight+1).length;
      const out = [...root.querySelectorAll('*')].filter(e => { const b=e.getBoundingClientRect(); return b.right>rb.right+1||b.left<rb.left-1; }).length;
      return { hs: document.documentElement.scrollWidth > innerWidth, clipped, out, cols: [...cols], n: tiles.length };
    });
    ok(!r.hs && r.out===0 && r.clipped===0, `w=${w}: без гор. скролла/обрезок; колонки сетки ${JSON.stringify(r.cols)}`);
    if (w===375) ok(r.cols.length===1 && r.cols[0]===1, '375: 1 столбец');
    if (w===1100) { ok(r.cols.sort().join()==='2,3,4', '1100: 3/2/4/2/2 колонок'); await pg.locator('#col').screenshot({ path: path.join(R, process.argv[2] || 'screens/zakupki-hub.png') }); }
    await pg.context().close();
  }
  const pg = await open(1100);
  const d = await pg.evaluate(() => {
    const h = document.querySelector('.zk-title'), back = document.querySelector('.zk-back'), cs = getComputedStyle(h);
    const soon = [...document.querySelectorAll('.zk-tile--soon')];
    const labels = [...document.querySelectorAll('.zk-label')].map(l => { const s=getComputedStyle(l); return { t:l.textContent, fs:s.fontSize, fw:s.fontWeight, c:s.color, bg:s.backgroundColor, bb:s.borderBottomWidth, up:s.textTransform }; });
    return { title: h.textContent, tag: h.tagName, color: cs.color, back: back.getAttribute('href'), backc: getComputedStyle(back).color, tiles: document.querySelectorAll('.zk-tile').length, soon: soon.length, soonLbl: soon.filter(s=>s.querySelector('.zk-soon')?.textContent==='Скоро').length, cursor: [...new Set(soon.map(s=>getComputedStyle(s).cursor))], links: document.querySelectorAll('.zk-tile[href]').length, labels, bgHero: getComputedStyle(document.querySelector('.zk-hero')).backgroundColor, scripts: document.querySelectorAll('.zk-hub script').length };
  });
  ok(d.title==='Закупки. Силовые машины' && d.color==='rgb(45, 106, 79)', 'заголовок и цвет #2d6a4f');
  ok(d.back==='https://kb.severstal.com/spaces/BSS/pages/161546386/', 'крошка → .../161546386/');
  ok(d.tiles===16 && d.soon===16 && d.soonLbl===16 && d.links===0 && d.cursor.join()==='default', '16 плашек «Скоро» с подписью, cursor:default');
  ok(d.labels.length===5 && d.labels.every(l=>l.fs==='11px'&&l.fw==='600'&&l.c==='rgb(91, 102, 112)'&&l.up==='uppercase'&&l.bg==='rgba(0, 0, 0, 0)'), '5 меток секций: стиль без заливки');
  // hover не поднимает «Скоро»
  const t0 = pg.locator('.zk-tile--soon').first(); await t0.hover(); await pg.waitForTimeout(300);
  ok(await t0.evaluate(e => getComputedStyle(e).transform==='none'), 'hover на «Скоро»: без подъёма');
  // контраст: фон плашек (текст скрыт) и крошка/метки на белом
  await pg.addStyleTag({ content: 'html body .zk-hub .zk-tile,html body .zk-hub .zk-tile .zk-soon{color:transparent !important}' });
  let worst = 99, worstSoon = 99;
  const tiles = await pg.locator('.zk-tile').all();
  const dec = await b.newPage();
  for (const t of tiles) {
    const b64 = (await t.screenshot()).toString('base64');
    const L = await dec.evaluate(async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im,0,0); const d = x.getImageData(0,0,c.width,c.height).data; let m = 0; for (let i=0;i<d.length;i+=4){ const px=i/4, X=px%c.width, Y=(px/c.width)|0; if(X<14||Y<14||X>c.width-14||Y>c.height-14) continue; const v=(d[i]+d[i+1]+d[i+2])/3; if(v>m)m=v; } return m; }, b64);
    const v = Math.round(L); const lightest = [v,v,v];
    worst = Math.min(worst, cr([255,255,255], lightest));
    const mix = 255; worstSoon = Math.min(worstSoon, cr([mix,mix,mix], lightest));
  }
  console.log(`  худший контраст: текст ${worst.toFixed(2)}, «Скоро» ${worstSoon.toFixed(2)}`);
  ok(worst>=4.5 && worstSoon>=4.5, 'контраст плашек ≥ 4.5 (по самому светлому пикселю фона)');
  ok(cr([91,102,112],[255,255,255])>=4.5, `метки ${cr([91,102,112],[255,255,255]).toFixed(2)}`);
  const A=.9, bc = 255 - A*(255-45), bg2 = 255 - A*(255-106), bb = 255 - A*(255-79);
  ok(cr([bc,bg2,bb],[255,255,255])>=4.5, `крошка ${cr([bc,bg2,bb],[255,255,255]).toFixed(2)}`);
  ok(cr([45,106,79],[255,255,255])>=4.5, `заголовок ${cr([45,106,79],[255,255,255]).toFixed(2)}`);
  await pg.context().close();
  // фокус на активной плашке (подставим ссылку)
  const f = await open(1100); await f.evaluate(() => { const s=document.querySelector('.zk-tile--soon'); const a=document.createElement('a'); a.className='zk-tile'; a.href='#x'; a.textContent='t'; s.replaceWith(a); });
  await f.keyboard.press('Tab'); await f.keyboard.press('Tab');
  ok(await f.evaluate(() => { const e=document.activeElement; return e.classList.contains('zk-tile') && getComputedStyle(e).outlineStyle==='solid'; }), ':focus-visible виден');
  const hv = f.locator('a.zk-tile'); await hv.hover(); await f.waitForTimeout(300);
  ok(await hv.evaluate(e => getComputedStyle(e).transform!=='none'), 'активная плашка: hover-подъём');
  await f.context().close();
  // изоляция
  const hs = await open(1100); const base = await open(1100, {});
  for (const w of [1100, 375]) {
    const h = await open(w, { hostile:true, vw: w===375?375:undefined }); const n = await open(w, { vw: w===375?375:undefined });
    const g = p => p.evaluate(() => ({ t: getComputedStyle(document.querySelector('.zk-title')).fontSize+getComputedStyle(document.querySelector('.zk-title')).color, l: getComputedStyle(document.querySelector('.zk-label')).fontSize+getComputedStyle(document.querySelector('.zk-label')).letterSpacing, c: getComputedStyle(document.querySelector('.zk-tile')).color, hs: document.documentElement.scrollWidth>innerWidth }));
    const a = await g(h), c = await g(n);
    if(a.t!==c.t||a.l!==c.l||a.c!==c.c||a.hs) console.log(JSON.stringify([a,c]));
    ok(a.t===c.t && a.l===c.l && a.c===c.c && !a.hs, `изоляция при чужих жёстких стилях (w=${w})`);
    if (w===1100) { await h.locator('#col').screenshot({ path: path.join(R, '.hostile.png') }); }
  }
  const rm = await open(1100, { rm:true });
  ok(await rm.evaluate(() => getComputedStyle(document.querySelector('.zk-tile')).transitionDuration), 'reduced-motion ok');
  ok(reqs.length===0, 'внешних запросов нет ' + JSON.stringify(reqs));
  ok(errs.length===0, 'ошибок консоли нет ' + JSON.stringify(errs));
  const kb = fs.statSync(path.join(R,'dist/zakupki-hub.html')).size/1024; ok(kb<=38, `размер ${kb.toFixed(1)} КБ`);
  ok(!/<(html|head|body)\b/i.test(html) && !/localStorage|sessionStorage|position:\s*fixed|100vh|https?:\/\/[^"']*\.(js|css|png|woff)/i.test(html), 'правила Confluence (нет html/body/storage/fixed/vh/внешних)');
  await b.close(); console.log(fails ? 'FAILS: '+fails : 'ВСЁ ЗЕЛЁНОЕ'); process.exit(fails?1:0);
})();
