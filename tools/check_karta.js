// Проверка блока «Карта проектов» в Chromium. node tools/check_karta.js [--shot путь.png]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'..');const blk=fs.readFileSync(R+'/dist/karta-proektov.html','utf8');
const lum=c=>{const v=c.map(x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*v[0]+.7152*v[1]+.0722*v[2]};
const rgb=s=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
(async()=>{const b=await chromium.launch();let fail=0;const bad=m=>{fail++;console.log('FAIL',m)};
const shot=process.argv.indexOf('--shot')>0?process.argv[process.argv.indexOf('--shot')+1]:null;
for(const iso of [0,1]){for(const w of [1100,960,820,700,560,480,375]){
 const pg=await b.newPage({viewport:{width:1300,height:900},deviceScaleFactor:shot&&w==1100&&!iso?2:1});
 const errs=[],reqs=[];pg.on('console',m=>m.type()=='error'&&errs.push(m.text()));pg.on('pageerror',e=>errs.push(String(e)));
 pg.on('request',r=>{if(/^https?:/.test(r.url()))reqs.push(r.url())});
 const css=iso?'<style>*{color:red !important;font-size:48px !important}</style>':'';
 await pg.setContent(`<!doctype html><meta charset=utf-8>${css}<body style="margin:0"><div id=col style="width:${w}px;background:#fff;padding:0">${blk}</div>`);
 const r=await pg.evaluate(()=>{const col=document.getElementById('col'),o=[];
  col.querySelectorAll('.bssm-karta *').forEach(e=>{if(e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).display!='inline'&&!e.closest('svg')&&getComputedStyle(e).overflow!='visible')o.push('clip:'+e.className+' '+e.textContent.slice(0,20))});
  const txt=[];col.querySelectorAll('.bk-num,.bk-cap,.bk-h,.bk-lab>span,.bk-yr,.bk-li>span:last-child,.bk-note,.bk-link span').forEach(e=>{if(e.textContent.trim())txt.push([getComputedStyle(e).color,e.textContent.slice(0,15)])});
  return{sw:col.scrollWidth,cw:col.clientWidth,o,txt,rows:col.querySelectorAll('.bk-row').length,h:document.documentElement.scrollWidth}});
 if(r.sw>r.cw)bad(`hscroll iso${iso} w${w}`);
 if(r.rows!=7)bad('rows '+r.rows);
 if(!iso&&w>=560&&r.o.length)bad(`clip w${w} `+r.o.join('|'));
 if(!iso)for(const [c,t] of r.txt){const dark=/^(9|200\+|5|6\+|Лет|Запущ|Произв|Программ тр)/.test(t),L=lum(rgb(c)),cr=dark?(L+.05)/(lum([42,92,168])+.05):1.05/(L+.05);if(cr<4.5)bad(`contrast ${t} ${cr.toFixed(2)}`)}
 if(iso){const fs=await pg.evaluate(()=>getComputedStyle(document.querySelector('.bk-num')).fontSize+'|'+getComputedStyle(document.querySelector('.bk-cap')).color);if(w==1100)console.log('isolation num/cap:',fs)}
 if(errs.length)bad('console '+errs);if(reqs.length)bad('http '+reqs);
 if(shot&&w==1100&&!iso){await pg.locator('#col').screenshot({path:shot})}
 await pg.close()}}
console.log(fail?'FAILED '+fail:'ALL GREEN');await b.close();process.exit(fail?1:0)})();
