/* Здесь правятся тексты защиты: вводная, этапы таймлайна (m — минуты, их доли задают ширину сегментов), четыре слайда (t — заголовок, a и b — текст панели «Что показать»), карточки жюри. Меняйте только текст между кавычками. */
var DATA = {
  title: 'Защита проекта',
  lead: 'На проект — 10 минут: 6 минут доклад, 2 минуты вопросы жюри, 2 минуты обратная связь. Докладывает РП, заказчик включается в диалог по необходимости. Презентация — в PowerPoint по корпоративному шаблону.',
  steps: [
    { m: 6, t: 'Доклад — 6 минут', c: '#007890' },
    { m: 2, t: 'Вопросы жюри — 2 минуты', c: '#00A8C0' },
    { m: 2, t: 'Обратная связь — 2 минуты', c: '#5B6670' }
  ],
  ticks: ['0', '6', '8', '10 мин'],
  tlLabel: 'Регламент защиты: 10 минут',
  sH: 'Четыре обязательных слайда',
  show: 'Что показать',
  slides: [
    { t: 'Что заказано и что сдано', ic: 'clip', a: 'Требования заказчика на старте и факт.', b: 'Объём сдачи равен объёму требований — без расширений и без недосдачи.' },
    { t: 'Результат проекта', ic: 'cube', a: 'Конкретный артефакт, который работает без команды.', b: 'Связка: проблема была в X, артефакт Y устраняет её через механизм Z.' },
    { t: 'Эффект', ic: 'trend', a: 'Было → стало, с числом.', b: 'Причинная цепочка: артефакт устраняет причину, из-за этого метрика меняется с исходного значения на целевое.' },
    { t: 'Устойчивость результата', ic: 'shield', a: 'Кто отвечает за результат после защиты — поимённо.', b: 'Что встроено в регламент, процесс или метрику, чтобы результат не откатился.' }
  ],
  jH: 'Жюри',
  sostav: { t: 'Состав', ic: 'users', p: 'Жюри — ЛСП; организаторы могут пригласить экспертов. Заказчик программы присутствует как наблюдатель и в оценке не участвует.' },
  kriter: { t: 'Критерии жюри (шкала 1–5)', ic: 'list', items: ['соответствие требованиям и объёму;', 'результат проекта, а не операционка;', 'измеримый эффект.'], note: 'Среднее ниже 3,0 — приёмка не выше «Принят с замечаниями».' },
  nomin: { t: 'Номинации и награды', ic: 'trophy', p1: 'Номинации (голосуют участники программы):', chips: ['Надёжность', 'Движение вперёд', 'Клиенты'], p2: 'Награждают шесть проектов: три с лучшей оценкой жюри и три победителя номинаций.' }
};
/*%%GLOSSARY%%*/
var IC = {
  clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 13l2.5 2.5L15.5 11"/>',
  cube: '<path d="M12 3 20 7.5v9L12 21 4 16.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
  trend: '<path d="M3.5 19.5h17M5 15l4.5-4.5 3.5 3L19 7"/><path d="M15 7h4v4"/>',
  shield: '<path d="M12 3 19.5 6v6c0 4.5-3.2 7.5-7.5 9-4.3-1.5-7.5-4.5-7.5-9V6z"/><path d="M8.5 12l2.5 2.5L15.5 9.5"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.3c2 .8 3.5 2.6 3.5 5.7"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><path d="M3.5 6.5l1.2 1.2 2-2.4M3.5 12l1.2 1.2 2-2.4M3.5 17.5l1.2 1.2 2-2.4"/>',
  trophy: '<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.5v1.5a3 3 0 0 0 3 3M16.5 6h3v1.5a3 3 0 0 1-3 3M12 13.5V17M8.5 20h7M10 17h4"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }

function init(root, uid) {
  var P = DATA.steps, SL = DATA.slides, cur = 0, lastW = -1, tot = P.reduce(function (s, x) { return s + x.m; }, 0);
  var J = DATA.sostav, K = DATA.kriter, N = DATA.nomin;
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-def__lead" data-gl>' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-tl" role="img" aria-label="' + esc(DATA.tlLabel) + '">' +
    '<div class="dbv-tl__bar">' + P.map(function (x) { return '<span class="dbv-tl__s" data-m="' + x.m + '" style="flex:' + x.m + ' 1 0;background:' + x.c + '"></span>'; }).join('') + '</div>' +
    '<div class="dbv-tl__sc" aria-hidden="true">' + DATA.ticks.map(function (t, i) { var at = [0, 6, 8, 10][i] / tot * 100; return '<span class="dbv-tl__t dbv-tl__t--' + i + '" style="left:' + at + '%">' + esc(t) + '</span>'; }).join('') + '</div>' +
    '<div class="dbv-tl__lg" style="--cols:' + P.map(function (x) { return x.m + 'fr'; }).join(' ') + '">' + P.map(function (x) { return '<div class="dbv-tl__l"><span class="dbv-dot" style="background:' + x.c + '"></span><span>' + esc(x.t) + '</span></div>'; }).join('') + '</div></div>' +
    '<h3 class="dbv-h3 dbv-def__h3">' + esc(DATA.sH) + '</h3>' +
    '<div class="dbv-sg" role="tablist" aria-label="' + esc(DATA.sH) + '">' + SL.map(function (s, i) {
      return '<button type="button" class="dbv-sd" role="tab" id="' + uid + '-t' + i + '" data-i="' + i + '" aria-controls="' + uid + '-p" aria-selected="false" tabindex="-1"><span class="dbv-sd__n">' + (i + 1) + '</span><span class="dbv-sd__i">' + svg(s.ic) + '</span><span class="dbv-sd__t">' + esc(s.t) + '</span></button>'; }).join('') + '</div>' +
    '<div class="dbv-sp" role="tabpanel" id="' + uid + '-p"><div class="dbv-sp__c" data-pc></div><div class="dbv-meas dbv-sp__c" aria-hidden="true" data-meas></div></div>' +
    '<h3 class="dbv-h3 dbv-def__h3">' + esc(DATA.jH) + '</h3><div class="dbv-jg">' +
    '<div class="dbv-glass dbv-jc" style="--i:0"><div class="dbv-jc__h"><span class="dbv-ico">' + svg(J.ic) + '</span><h3 class="dbv-h3">' + esc(J.t) + '</h3></div><p class="dbv-body" data-gl>' + esc(J.p) + '</p></div>' +
    '<div class="dbv-glass dbv-jc" style="--i:1"><div class="dbv-jc__h"><span class="dbv-ico">' + svg(K.ic) + '</span><h3 class="dbv-h3">' + esc(K.t) + '</h3></div><ul class="dbv-list">' + K.items.map(function (x) { return '<li data-gl>' + esc(x) + '</li>'; }).join('') + '</ul><p class="dbv-jc__note" data-gl>' + esc(K.note) + '</p></div>' +
    '<div class="dbv-glass dbv-jc" style="--i:2"><div class="dbv-jc__h"><span class="dbv-ico">' + svg(N.ic) + '</span><h3 class="dbv-h3">' + esc(N.t) + '</h3></div><p class="dbv-body" data-gl>' + esc(N.p1) + '</p><div class="dbv-nm">' + N.chips.map(function (x) { return '<span class="dbv-nm__c">' + esc(x) + '</span>'; }).join('') + '</div><p class="dbv-body" data-gl>' + esc(N.p2) + '</p></div></div>';
  var gl = dbvGlossary(root);
  gl.apply(root);
  var tabs = [].slice.call(root.querySelectorAll('.dbv-sd')), panel = root.querySelector('.dbv-sp'), pc = root.querySelector('[data-pc]'), meas = root.querySelector('[data-meas]');
  function ph(s, i) { return '<div class="dbv-sp__k">' + esc(DATA.show) + '</div><h3 class="dbv-h3">' + (i + 1) + '. ' + esc(s.t) + '</h3><p class="dbv-body">' + esc(s.a) + '</p><p class="dbv-body">' + esc(s.b) + '</p>'; }
  function render(fade) { pc.innerHTML = ph(SL[cur], cur); panel.setAttribute('aria-labelledby', tabs[cur].id); if (fade && !reduced()) { pc.classList.remove('is-new'); void pc.offsetWidth; pc.classList.add('is-new'); } }
  function paint() { tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === cur ? 'true' : 'false'); t.tabIndex = i === cur ? 0 : -1; }); }
  function select(i) { if (i === cur) return; cur = i; paint(); render(true); }
  function measure() {
    var cs = getComputedStyle(panel), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom), bw = parseFloat(cs.borderTopWidth) * 2;
    meas.style.left = pl + 'px'; meas.style.top = pt + 'px'; meas.style.width = (panel.clientWidth - pl - pr) + 'px';
    var max = 0; SL.forEach(function (s, i) { meas.innerHTML = ph(s, i); max = Math.max(max, meas.offsetHeight); });
    meas.innerHTML = ''; panel.style.height = Math.ceil(max + pt + pb + bw + 4) + 'px';
  }
  var tl = root.querySelector('.dbv-sg');
  tl.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('.dbv-sd'); if (t) select(+t.getAttribute('data-i')); });
  tl.addEventListener('keydown', function (e) {
    var k = e.key, n = tabs.length, to = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = (cur + 1) % n; else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (cur + n - 1) % n; else if (k === 'Home') to = 0; else if (k === 'End') to = n - 1;
    if (to < 0) return;
    e.preventDefault(); select(to); tabs[to].focus();
  });
  paint(); render(false); measure();
  function onSize() { var w = root.clientWidth; if (w === lastW) return; lastW = w; requestAnimationFrame(measure); }
  if (window.ResizeObserver) new ResizeObserver(onSize).observe(root); else window.addEventListener('resize', onSize);
  lastW = root.clientWidth;
}
[].forEach.call(document.querySelectorAll('.dbv-def'), function (r, n) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r, 'dbv-def' + n);
});
