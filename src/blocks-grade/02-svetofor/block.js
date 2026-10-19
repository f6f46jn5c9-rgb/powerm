/* Здесь правятся критерии светофора (t — название, w — вес в %, d — что оценивается) и зоны (границы в «lo» — в десятых долях балла, текст). Меняйте только текст между кавычками; цвета и числа весов трогать только если меняется методика. */
var DATA = {
  title: 'Светофор проектов',
  lead: 'Светофор формируется ежемесячно и представляется на демонстрационном дне. Оценку от 1 до 5 по каждому критерию выставляют координатор проектного трека и руководитель программы по данным ПЗ.',
  wH: 'Из чего складывается оценка',
  weight: 'Вес', what: 'Что оценивается:',
  crit: [
    { t: 'Продукт и активы', w: 30, d: 'Есть ли работающие активы и пользуются ли ими.' },
    { t: 'Устойчивость', w: 30, d: 'Владелец закреплён, регламенты разработаны, передача знаний завершена.' },
    { t: 'Эффект и метрики', w: 20, d: 'Зафиксированы исходные значения и метрики; эффект подтверждён данными.' },
    { t: 'Темп', w: 15, d: 'Прогресс по карточке и соблюдение сроков.' },
    { t: 'Команда', w: 5, d: 'Оценки РП по участникам, полнота и стабильность состава.' }
  ],
  zH: 'Зоны светофора',
  zones: [
    { n: 'Красная', r: 'Менее 1,7', lo: 0, c: '#E01828', m: 'Проект не рекомендован к финальной защите; вопрос передаётся ЛСП.' },
    { n: 'Жёлтая', r: 'От 1,7 до 2,7', lo: 170, c: '#F2B01E', m: 'Проект продолжается при поддержке координатора.' },
    { n: 'Жёлто-зелёная', r: 'От 2,7 до 3,8', lo: 270, c: '#A8C93A', m: 'Результат достижим, проект продолжается при контроле.' },
    { n: 'Топ-проект', r: 'От 3,8', lo: 380, c: '#007890', m: 'Рекомендован к защите как образцовый.' }
  ],
  ticks: ['1,7', '2,7', '3,8'],
  zNote: 'Красная зона сама по себе не выводит проект из программы: решение принимает ЛСП.',
  calcH: 'Попробуйте рассчитать',
  cnt: 'Оценено:', of: 'из', total: 'Итоговая оценка:', reset: 'Сбросить',
  hint: 'Это ориентировочный расчёт. Оценки по критериям выставляют координатор проектного трека и руководитель программы.'
};
/*%%GLOSSARY%%*/
var IC = { info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.5v.2"/>' };
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
function fmt10(t) { return Math.floor(t / 10) + ',' + (t % 10); }

function init(root, uid) {
  var C = DATA.crit, Z = DATA.zones, cur = 0, lastW = -1, sc = C.map(function () { return 0; });
  var maxW = Math.max.apply(null, C.map(function (c) { return c.w; }));
  function zone(t100) { var z = Z[0]; Z.forEach(function (x) { if (t100 >= x.lo) z = x; }); return z; }
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-svf__lead" data-gl>' + esc(DATA.lead) + '</p>' +
    '<h3 class="dbv-h3 dbv-svf__h3" style="margin-top:26px !important">' + esc(DATA.wH) + '</h3>' +
    '<div class="dbv-wt" role="tablist" aria-label="' + esc(DATA.wH) + '" style="grid-template-columns:' + C.map(function (c) { return c.w + 'fr'; }).join(' ') + '">' +
    C.map(function (c, i) { return '<button type="button" class="dbv-sg" role="tab" id="' + uid + '-t' + i + '" data-i="' + i + '" aria-controls="' + uid + '-p" aria-selected="false" tabindex="-1" style="--f:' + Math.round(c.w / maxW * 100) + '%"><span class="dbv-sg__bar"></span><span class="dbv-sg__w">' + c.w + ' %</span><span class="dbv-sg__n">' + esc(c.t) + '</span></button>'; }).join('') + '</div>' +
    '<div class="dbv-wp" role="tabpanel" id="' + uid + '-p"><div class="dbv-wp__c" data-pc></div><div class="dbv-meas dbv-wp__c" aria-hidden="true" data-meas></div></div>' +
    '<h3 class="dbv-h3 dbv-svf__h3">' + esc(DATA.zH) + '</h3><div class="dbv-zs">' +
    DATA.ticks.map(function (t, i) { return '<span class="dbv-zt" aria-hidden="true" style="left:' + (25 * (i + 1)) + '%">' + esc(t) + '</span>'; }).join('') +
    Z.map(function (z) { return '<div class="dbv-z"><span class="dbv-z__bar" style="background:' + z.c + '"></span><div class="dbv-z__n"><span class="dbv-dot" style="background:' + z.c + '"></span>' + esc(z.n) + '</div><div class="dbv-z__r">' + esc(z.r) + '</div><p class="dbv-z__m" data-gl>' + esc(z.m) + '</p></div>'; }).join('') + '</div>' +
    '<div class="dbv-note" role="note">' + svg('info') + '<p class="dbv-body" data-gl>' + esc(DATA.zNote) + '</p></div>' +
    '<h3 class="dbv-h3 dbv-svf__h3">' + esc(DATA.calcH) + '</h3><div class="dbv-cl">' +
    C.map(function (c, i) { return '<div class="dbv-cr"><span class="dbv-cr__t">' + esc(c.t) + '<span class="dbv-cr__w">' + esc(DATA.weight) + ' ' + c.w + ' %</span></span><div class="dbv-rg" role="radiogroup" aria-label="' + esc(c.t) + ', ' + c.w + ' %" data-i="' + i + '">' +
      [1, 2, 3, 4, 5].map(function (v) { return '<button type="button" class="dbv-rb" role="radio" aria-checked="false" data-v="' + v + '" tabindex="' + (v === 1 ? 0 : -1) + '">' + v + '</button>'; }).join('') + '</div></div>'; }).join('') + '</div>' +
    '<div class="dbv-cnt" data-cnt></div><div class="dbv-res" aria-live="polite" data-res></div><button type="button" class="dbv-lnk" data-reset>' + esc(DATA.reset) + '</button>' +
    '<p class="dbv-small dbv-svf__hint">' + esc(DATA.hint) + '</p>';
  var gl = dbvGlossary(root);
  gl.apply(root);
  var tabs = [].slice.call(root.querySelectorAll('.dbv-sg')), panel = root.querySelector('.dbv-wp'), pc = root.querySelector('[data-pc]'), meas = root.querySelector('[data-meas]');
  function ph(c) { return '<div class="dbv-wp__h"><h3 class="dbv-h3">' + esc(c.t) + '</h3><span class="dbv-wchip">' + esc(DATA.weight) + ' ' + c.w + ' %</span></div><p class="dbv-wp__p"><b>' + esc(DATA.what) + '</b> ' + esc(c.d) + '</p>'; }
  function render(fade) { gl.hide(); pc.innerHTML = ph(C[cur]); panel.setAttribute('aria-labelledby', tabs[cur].id); if (fade && !reduced()) { pc.classList.remove('is-new'); void pc.offsetWidth; pc.classList.add('is-new'); } }
  function paint() { tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === cur ? 'true' : 'false'); t.tabIndex = i === cur ? 0 : -1; }); }
  function select(i) { if (i === cur) return; cur = i; paint(); render(true); }
  function measure() {
    var cs = getComputedStyle(panel), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom), bw = parseFloat(cs.borderTopWidth) * 2;
    meas.style.left = pl + 'px'; meas.style.top = pt + 'px'; meas.style.width = (panel.clientWidth - pl - pr) + 'px';
    var max = 0; C.forEach(function (c) { meas.innerHTML = ph(c); max = Math.max(max, meas.offsetHeight); });
    meas.innerHTML = ''; panel.style.height = Math.ceil(max + pt + pb + bw + 4) + 'px';
  }
  var tl = root.querySelector('.dbv-wt');
  tl.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('.dbv-sg'); if (t) select(+t.getAttribute('data-i')); });
  tl.addEventListener('keydown', function (e) {
    var k = e.key, n = tabs.length, to = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = (cur + 1) % n; else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (cur + n - 1) % n; else if (k === 'Home') to = 0; else if (k === 'End') to = n - 1;
    if (to < 0) return;
    e.preventDefault(); select(to); tabs[to].focus();
  });
  // калькулятор
  var cnt = root.querySelector('[data-cnt]'), res = root.querySelector('[data-res]'), groups = [].slice.call(root.querySelectorAll('.dbv-rg'));
  function calc() {
    var n = sc.filter(Boolean).length;
    cnt.textContent = DATA.cnt + ' ' + n + ' ' + DATA.of + ' ' + C.length;
    groups.forEach(function (g, i) { [].forEach.call(g.querySelectorAll('.dbv-rb'), function (b) { var v = +b.getAttribute('data-v'); b.setAttribute('aria-checked', sc[i] === v ? 'true' : 'false'); b.tabIndex = sc[i] ? (sc[i] === v ? 0 : -1) : (v === 1 ? 0 : -1); }); });
    if (n < C.length) { res.innerHTML = ''; return; }
    var s100 = 0; C.forEach(function (c, i) { s100 += sc[i] * c.w; });
    var z = zone(s100), t10 = Math.floor(s100 / 10);
    res.innerHTML = '<div class="dbv-resc" style="border-color:' + z.c + '"><div class="dbv-resc__s">' + esc(DATA.total) + ' ' + fmt10(t10) + '</div><div class="dbv-resc__z"><span class="dbv-dot" style="background:' + z.c + '"></span><span>' + esc(z.n) + '</span></div><p class="dbv-resc__m">' + esc(z.m) + '</p></div>';
    res.setAttribute('data-zone', z.n);
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-rb');
    if (b) { sc[+b.parentNode.getAttribute('data-i')] = +b.getAttribute('data-v'); calc(); return; }
    if (e.target.closest && e.target.closest('[data-reset]')) { sc = C.map(function () { return 0; }); calc(); }
  });
  root.addEventListener('keydown', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-rb');
    if (!b) return;
    var k = e.key, v = +b.getAttribute('data-v'), to = 0;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = v % 5 + 1; else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (v + 3) % 5 + 1; else if (k === 'Home') to = 1; else if (k === 'End') to = 5; else if (k === ' ' || k === 'Enter') { e.preventDefault(); b.click(); return; }
    if (!to) return;
    e.preventDefault(); sc[+b.parentNode.getAttribute('data-i')] = to; calc(); b.parentNode.querySelector('[data-v="' + to + '"]').focus();
  });
  paint(); render(false); measure(); calc();
  function onSize() { var w = root.clientWidth; if (w === lastW) return; lastW = w; requestAnimationFrame(measure); }
  if (window.ResizeObserver) new ResizeObserver(onSize).observe(root); else window.addEventListener('resize', onSize);
  lastW = root.clientWidth;
}
[].forEach.call(document.querySelectorAll('.dbv-svf'), function (r, n) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r, 'dbv-svf' + n);
});
