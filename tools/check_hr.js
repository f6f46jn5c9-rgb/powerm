// Проверка хаба «HR / Команда» (Chromium). Запуск: node tools/check_hr.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), crypto = require('crypto');
const R = path.resolve(__dirname, '..'), P = 'file://' + path.join(R, 'hr-final/preview/hr-preview.html');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const blend = (fg, a, bg) => fg.map((v, i) => v * a + bg[i] * (1 - a));
const src = f => fs.readFileSync(path.join(R, 'src/hr', f), 'utf8');
(async () => {
  const b = await chromium.launch(); const reqs = [], errs = [];
  const mk = async (vw) => { const pg = await b.newPage({ viewport: { width: vw, height: 900 } });
    pg.on('request', r => { if (!/^(file|data|about):/.test(r.url())) reqs.push(r.url()); });
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(String(e)));
    await pg.goto(P); return pg; };
  // размеры
  for (const f of ['1-hr-hero.html', '2-hr-cbl-open.html', '3-hr-cbl-close.html']) { const n = Buffer.byteLength(src(f)); ok(n <= 38 * 1024, `${f}: ${(n / 1024).toFixed(2)} КБ ≤ 38`); }
  // раскладка
  const widths = [[1100, 1400], [960, 1400], [820, 1400], [700, 1400], [560, 1400], [375, 375]];
  for (const [w, vw] of widths) {
    const pg = await mk(vw); await pg.click(`button[data-w="${w === 375 && vw === 375 ? 375 : w}"]`).catch(() => {});
    if (vw === 375) await pg.addStyleTag({ content: '#pv-col{width:auto !important;padding:0 !important}.pv-body{padding:0 !important}' });
    await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => { const col = document.getElementById('pv-col'); const bad = [];
      col.querySelectorAll('.hr-in *,.hr-mission *,.hr-seclabel,.hr-cbylabel li,.hr-cbylabel a').forEach(e => { if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) bad.push(e.className || e.tagName); });
      return { hs: document.documentElement.scrollWidth - document.documentElement.clientWidth, colHs: col.scrollWidth - col.clientWidth, colW: col.clientWidth, bad,
        heroH: document.querySelector('.hr-top').getBoundingClientRect().height, txtR: Math.max(...[...document.querySelectorAll('.hr-in > *, .hr-lead, .hr-list li')].map(e => e.getBoundingClientRect().right)) - col.getBoundingClientRect().right }; });
    ok(r.hs <= 0 && r.colHs <= 0, `ширина ${w}${vw === 375 ? ' (окно 375)' : ''}: колонка ${r.colW}px, нет горизонтального скролла`);
    ok(r.bad.length === 0 && r.txtR <= 1, `ширина ${w}: текст не обрезан/не вылезает ${r.bad.join(',')}`);
    ok(r.heroH >= 160, `ширина ${w}: hero ${Math.round(r.heroH)}px ≥ 160`);
    await pg.close();
  }
  // стили, контраст, hover, блобы
  const pg = await mk(1400); await pg.click('button[data-w="1100"]'); await pg.waitForTimeout(150);
  const g = await pg.evaluate(() => { const q = s => document.querySelector(s), cs = e => getComputedStyle(e);
    const rect = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
    const top = q('.hr-top'), b1 = q('.hr-b1'), b2 = q('.hr-b2'), t = q('.hr-title');
    return { b1: [cs(b1).width, cs(b1).top, cs(b1).right, cs(b1).backgroundImage], b2: [cs(b2).width, cs(b2).bottom, cs(b2).left, cs(b2).backgroundImage], nb: document.querySelectorAll('.hr-fx > span').length,
      title: [cs(t).fontSize, cs(t).fontWeight, cs(t).color], sub: [cs(q('.hr-sub')).fontSize, cs(q('.hr-sub')).color], crumb: [cs(q('.hr-crumb a')).fontSize, cs(q('.hr-crumb a')).color, q('.hr-crumb a').textContent],
      topBg: cs(top).backgroundImage, ico: !!q('.hr-hero [class*=ico]'), line: !!q('.hr-hero [class*=line]'),
      m: [cs(q('.hr-mission')).backgroundColor, cs(q('.hr-mission')).paddingTop, cs(q('.hr-mission')).fontSize, cs(q('.hr-mission')).color, cs(q('.hr-mission')).borderBottom, cs(q('.hr-mission')).boxShadow, cs(q('.hr-mission')).borderTopWidth],
      lead: [cs(q('.hr-lead')).fontWeight, q('.hr-lead').textContent], li: [...document.querySelectorAll('.hr-list li')].map(e => e.textContent), liw: cs(q('.hr-list li')).fontWeight,
      dot: getComputedStyle(q('.hr-list li'), '::before').backgroundColor, lab: [cs(q('.hr-seclabel')).fontSize, cs(q('.hr-seclabel')).fontWeight, cs(q('.hr-seclabel')).color, cs(q('.hr-seclabel')).letterSpacing, cs(q('.hr-seclabel')).borderBottom, cs(q('.hr-seclabel')).marginBottom, q('.hr-seclabel').textContent],
      cbl: [cs(q('.hr-cbylabel a')).color, cs(q('.hr-cbylabel a')).fontSize, cs(q('.hr-cbylabel a')).textDecorationLine, cs(q('.hr-cbylabel li')).borderBottom, cs(q('.hr-cbylabel li')).paddingTop, cs(q('.hr-cbylabel ul')).listStyleType],
      hyph: cs(q('.hr-hero')).hyphens, ct: cs(q('.hr-hero')).containerType, wb: cs(q('.hr-hero')).wordBreak,
      shadows: [...document.querySelectorAll('.hr-hero *, .hr-cbylabel *')].filter(e => cs(e).boxShadow !== 'none' || cs(e).transform !== 'none' || cs(e).position === 'fixed').map(e => e.className) };
  });
  const s = JSON.stringify;
  ok(g.nb === 2, 'ровно 2 blob'); ok(g.b1[0] === '196px' && g.b1[1] === '-35px' && g.b1[2] === '-28px' && g.b1[3].includes('rgba(255, 140, 180, 0.85)'), 'Blob-1 ' + s(g.b1));
  ok(g.b2[0] === '140px' && g.b2[1] === '-21px' && g.b2[2] === '14px' && g.b2[3].includes('rgba(160, 48, 96, 0.5)'), 'Blob-2 ' + s(g.b2));
  ok(g.topBg.includes('rgb(13, 3, 8) 0%') && g.topBg.includes('rgb(160, 48, 96) 100%') && g.topBg.includes('140deg'), 'фон hero: линейный 140deg');
  ok(g.title[0] === '26px' && g.title[1] === '800' && g.title[2] === 'rgb(255, 255, 255)', 'заголовок 26/800 белый'); ok(g.sub[0] === '15px' && g.sub[1] === 'rgba(255, 255, 255, 0.75)', 'подзаголовок 15px .75');
  ok(g.crumb[0] === '13px' && g.crumb[1] === 'rgba(255, 255, 255, 0.75)' && g.crumb[2] === '← БУП', 'крошка ← БУП 13px .75'); ok(!g.ico && !g.line, 'нет ring-icon и нижней линии');
  ok(g.m[0] === 'rgb(255, 255, 255)' && g.m[1] === '20px' && g.m[2] === '16px' && g.m[3] === 'rgb(31, 42, 51)' && g.m[4].startsWith('1px solid rgb(227, 234, 237)') && g.m[5] === 'none', 'миссия: белый, 20px, 16px, #1F2A33, граница #E3EAED, без тени');
  ok(g.lead[0] === '700' && g.lead[1] === 'Ключевая задача службы HR — совместно с руководителями подразделений создать условия, в которых сотрудники компании:', 'первый абзац жирный, текст 1:1');
  const exp = ['соответствуют ценностям компании;', 'вовлечены в достижение целей компании и показывают высокие результаты;', 'обладают требуемой квалификацией;', 'обеспечивают кадровый резерв нужного количества и качества;', 'показывают высокую производительность.'];
  ok(s(g.li) === s(exp), 'пять пунктов списка 1:1'); ok(g.liw === '400' && g.dot === 'rgb(160, 48, 96)', 'маркер-точка цвета акцента (см. допущение про #0e7c7b)');
  ok(g.lab[0] === '11px' && g.lab[1] === '600' && g.lab[2] === 'rgb(91, 102, 112)' && g.lab[3] === '0.88px' && g.lab[4].startsWith('1px solid rgb(227, 234, 237)') && g.lab[5] === '12px' && g.lab[6] === 'Практики', 'метка «Практики» 11/600 #5B6670 ls .08em, border, mb 12'+s(g.lab));
  ok(g.cbl[0] === 'rgb(160, 48, 96)' && g.cbl[1] === '15px' && g.cbl[2] === 'none' && g.cbl[3].startsWith('1px solid rgb(227, 234, 237)') && g.cbl[4] === '10px' && g.cbl[5] === 'none', 'CBL: ссылки/строки/список ' + s(g.cbl));
  ok(g.hyph === 'manual' && g.ct === 'inline-size' && g.wb === 'normal', 'hyphens manual, container-type, word-break normal'); ok(g.shadows.length === 0, 'нет теней/transform/fixed: ' + g.shadows);
  // hover без подъёма
  await pg.hover('.hr-crumb a'); const tr = await pg.evaluate(() => getComputedStyle(document.querySelector('.hr-crumb a')).transform); ok(tr === 'none', 'hover крошки без transform');
  // контраст: пиксели под текстом hero
  for (const w of [1100, 820, 560, 375]) { await pg.setViewportSize({ width: w === 375 ? 375 : 1400, height: 900 }); if (w !== 375) await pg.click(`button[data-w="${w}"]`); else await pg.addStyleTag({ content: '#pv-col{width:auto !important;padding:0 !important}.pv-body{padding:0 !important}' });
    await pg.waitForTimeout(150);
    await pg.addStyleTag({ content: '.hr-in{visibility:hidden !important}' }); const bg = await pg.locator('.hr-top').screenshot();
    const boxes = await pg.evaluate(() => ['.hr-crumb a', '.hr-title', '.hr-sub'].map(s => { const e = document.querySelector(s); const r = document.createRange(); r.selectNodeContents(e); const b = r.getBoundingClientRect(), t = document.querySelector('.hr-top').getBoundingClientRect(); return { s, x: b.x - t.x, y: b.y - t.y, w: b.width, h: b.height }; }));
    const pgi = await b.newPage(); await pgi.setContent(`<canvas id=c></canvas>`); const res = await pgi.evaluate(async ({ d, boxes }) => { const im = new Image(); im.src = 'data:image/png;base64,' + d; await im.decode(); const c = document.getElementById('c'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const sc = im.width / document.querySelector('canvas').width; return boxes.map(b => { const px = x.getImageData(Math.round(b.x), Math.round(b.y), Math.max(1, Math.round(b.w)), Math.max(1, Math.round(b.h))).data; let mx = 0, my = 0, mz = 0, best = null; const L = (r, g, bl) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(bl); }; let maxL = -1; for (let i = 0; i < px.length; i += 4) { const l = L(px[i], px[i + 1], px[i + 2]); if (l > maxL) { maxL = l; best = [px[i], px[i + 1], px[i + 2]]; } } return { s: b.s, bright: best }; }); }, { d: bg.toString('base64'), boxes });
    for (const r of res) { const a = r.s === '.hr-title' ? 1 : .75; const fg = blend([255, 255, 255], a, r.bright); const c = cr(fg, r.bright); ok(c >= 4.5, `контраст ${r.s} при ${w}: худший фон rgb(${r.bright.map(Math.round)}) → ${c.toFixed(2)}:1`); }
    await pgi.close(); await pg.reload(); await pg.click('button[data-w="1100"]'); await pg.setViewportSize({ width: 1400, height: 900 }); }
  ok(cr([255, 255, 255], [160, 48, 96]) >= 4.5, `белый на #a03060: ${cr([255, 255, 255], [160, 48, 96]).toFixed(2)}:1`);
  ok(cr([31, 42, 51], [255, 255, 255]) >= 4.5, `список #1F2A33 на белом: ${cr([31, 42, 51], [255, 255, 255]).toFixed(2)}:1`);
  ok(cr([160, 48, 96], [255, 255, 255]) >= 4.5, `ссылки CBL #a03060 на белом: ${cr([160, 48, 96], [255, 255, 255]).toFixed(2)}:1`);
  ok(cr([91, 102, 112], [255, 255, 255]) >= 4.5, `метка #5B6670 на белом: ${cr([91, 102, 112], [255, 255, 255]).toFixed(2)}:1`);
  // изоляция
  const base = await pg.evaluate(() => [...document.querySelectorAll('.hr-hero *, .hr-seclabel, .hr-cbylabel *')].map(e => { const c = getComputedStyle(e); return [c.fontSize, c.color, c.fontWeight, c.margin, c.padding, c.textDecorationLine].join('|'); }).join('\n'));
  await pg.addStyleTag({ content: 'body{font-size:12px!important;color:red} h2{font-size:50px!important;color:red!important;margin:40px!important} p,li{font-size:30px!important;color:lime!important;margin:20px!important} a{color:red!important;font-size:30px!important;text-decoration:underline!important} ul{padding-left:80px!important;list-style:square!important} div{letter-spacing:5px!important}' });
  const hostile = await pg.evaluate(() => [...document.querySelectorAll('.hr-hero *, .hr-seclabel, .hr-cbylabel *')].map(e => { const c = getComputedStyle(e); return [c.fontSize, c.color, c.fontWeight, c.margin, c.padding, c.textDecorationLine].join('|'); }).join('\n'));
  const bl = base.split('\n'), hl = hostile.split('\n'); const diff = bl.map((x, i) => x === hl[i] ? null : i).filter(x => x !== null);
  ok(diff.length === 0, `изоляция от чужих !important-стилей: расхождений ${diff.length}`); if (diff.length) console.log(diff.slice(0, 5).map(i => bl[i] + ' => ' + hl[i]).join('\n'));
  await pg.close();
  // аудит палитры по исходникам
  const all = ['1-hr-hero.html', '2-hr-cbl-open.html', '3-hr-cbl-close.html'].map(src).join('\n');
  const hexes = [...new Set((all.match(/#[0-9a-fA-F]{3,8}\b/g) || []).map(x => x.toLowerCase()))];
  const rgbas = [...new Set((all.match(/rgba?\([^)]*\)/g) || []).map(x => x.replace(/\s/g, '')))];
  const allowH = ['#a03060', '#0d0308', '#200818', '#3a1030', '#ffffff', '#1f2a33', '#5b6670', '#e3eaed'], allowR = ['rgba(255,255,255,0.75)', 'rgba(255,140,180,.85)', 'rgba(160,48,96,.50)'];
  ok(hexes.every(h => allowH.includes(h)), 'палитра (hex): ' + hexes.join(' ') + ' — посторонних ' + hexes.filter(h => !allowH.includes(h)).join(',')); ok(rgbas.every(h => allowR.includes(h)), 'палитра (rgba): ' + rgbas.join(' '));
  ok(!/<link|<img|src=|@import|url\(|https?:\/\/|localStorage|sessionStorage|position:\s*fixed|100vh|<html|<head|<body/i.test(all), 'нет внешних ресурсов/запрещённых конструкций'); ok(!/(^|[}\s,])(\*|body|html|a|h2|p|ul|li)\s*[{,]/.test(all.replace(/\.hr-[\w-]+[^{]*\{/g, '{x')) || true, 'глобальные селекторы (см. ниже)');
  const css = [...all.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1].replace(/\/\*[\s\S]*?\*\//g, '')).join('\n'); const sels = [...css.matchAll(/(?:^|[}{])\s*([^{}@]+)\{/g)].map(m => m[1].trim()).filter(x => x && !/^(from|to|\d)/.test(x)); const badSel = sels.flatMap(s => s.split(',')).map(s => s.trim()).filter(s => s && !/^\.hr-/.test(s) && !/^(\.hr|:root)/.test(s));
  ok(badSel.length === 0, 'все селекторы начинаются с .hr-: ' + badSel.join(' | '));
  ok(reqs.length === 0, 'внешние запросы: ' + reqs.length); ok(errs.length === 0, 'ошибки консоли: ' + errs.length + ' ' + errs.join(';'));
  // sha
  for (const f of ['1-hr-hero.html', '2-hr-cbl-open.html', '3-hr-cbl-close.html']) { const h = x => crypto.createHash('sha256').update(fs.readFileSync(x)).digest('hex'); ok(h(path.join(R, 'src/hr', f)) === h(path.join(R, 'hr-final', f)), 'sha256 src == hr-final: ' + f); }
  await b.close(); console.log(fails ? `\nПРОВАЛОВ: ${fails}` : '\nВСЁ ЗЕЛЁНОЕ'); process.exit(fails ? 1 : 0);
})();
