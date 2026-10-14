/* Здесь правятся встречи (название, длительность, кто организует и участвует) и вкладки демонстрационного дня. Меняйте только текст между кавычками; значение «—» у участников скрывает чип. */
var DATA = {
  title: 'Рабочий ритм проекта',
  week: { h: 'Каждую неделю', tag: 'В течение недели', days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'], fri: 'Каждую пятницу' },
  weekly: [
    { icon: 'users', title: 'Встреча проектной команды', dur: '1–1,5 часа', org: 'РП', who: 'Команда' },
    { icon: 'clip', title: 'Планёрка координатора проектного трека с РП', dur: '60 минут', org: 'Координатор', who: 'РП' },
    { icon: 'file', title: 'Обновление карточки в ПЗ и публикация отчёта о прогрессе', dur: 'Каждую пятницу', org: 'РП', who: '—', link: { id: 'dbv-report', label: 'Что должно быть в отчёте' } }
  ],
  rare: { h: 'Реже, чем раз в неделю' },
  monthly: [
    { icon: 'chat', title: 'Встреча команды с заказчиком проекта', meta: 'Не реже раза в 2 недели', org: 'РП', who: 'Команда, заказчик' },
    { icon: 'smile', title: 'Оценка вовлечённости участников команды', meta: 'Каждый месяц', org: 'РП', who: '—' },
    { icon: 'screen', title: 'Демонстрационный день', meta: 'Каждый месяц', org: 'ЦРБС', who: 'РП и заказчики проектов, ЛСП, ГД', link: { id: 'dbv-demo', label: 'Подробно' } }
  ],
  demo: {
    h: 'Демонстрационный день',
    tabs: [
      { t: 'Что это', p: 'Ежемесячное мероприятие программы, на котором проектные команды демонстрируют созданные активы и промежуточные результаты. Организует ЦРБС. Участвуют РП и заказчики проектов, ЛСП, ГД.' },
      { t: 'Цель', p: 'Контроль прогресса, обратная связь по проектам, корректировка хода проекта, приёмка активов заказчиком (КТ3). Итоговая приёмка результата проекта проводится на финальной защите.' },
      { t: 'Как проходит', p: 'РП демонстрирует проект в ПЗ со своего компьютера: карточку проекта, КР, исходные значения и созданные активы. Презентация в PowerPoint не готовится. Заказчик в ходе демонстрации устно сообщает, принимает ли он актив, и оценивает проект по шкале от 1 до 5; оценка фиксируется в светофоре проектов для истории и в интегральную оценку не входит. На демонстрационном дне представляется светофор проектов.' },
      { t: 'Подготовка и участие', p: 'К каждому демонстрационному дню все созданные активы зарегистрированы в ПЗ, карточка проекта актуальна. Показывается работающий актив, а не план мероприятий. Участие обязательно для РП и заказчика проекта независимо от степени готовности проекта.' }
    ],
    stop: 'Показывается работающий актив, а не план мероприятий.'
  },
  labels: { org: 'Организует:', who: 'Участвуют:' }
};
/*%%GLOSSARY%%*/
var IC = {
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.7-4.2 3.6-6.5 7.5-6.5s6.8 2.3 7.5 6.5"/>',
  clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>',
  file: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3.5 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 10.5h7M8.5 14h4"/>',
  smile: '<circle cx="12" cy="12" r="9.5"/><path d="M8 14.5c1 1.4 2.4 2 4 2s3-.6 4-2M9 9.5v.5M15 9.5v.5"/>',
  screen: '<rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M12 16.5V21M8 21h8M10.5 8.5l4 2-4 2z"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  warn: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 8v5M12 16v.5"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }

function init(root, uid) {
  var L = DATA.labels, cur = 0, lastW = -1;
  function chip(icon, lab, val) { return '<span class="dbv-chip">' + svg(icon) + '<span data-gl><b>' + esc(lab) + '</b> ' + esc(val) + '</span></span>'; }
  function link(l) { return l ? '<button type="button" class="dbv-lnk" data-jump="' + esc(l.id) + '">' + esc(l.label) + ' ' + svg('down') + '</button>' : ''; }
  function card(m, i, weekly) {
    return '<div class="dbv-mtg dbv-glass" style="--i:' + i + '"><div class="dbv-mtg__top"><span class="dbv-ico">' + svg(m.icon) + '</span></div><h3 class="dbv-h3 dbv-mtg__t" style="position:relative">' + esc(m.title) + '</h3>' +
      (weekly ? '<div class="dbv-mtg__dur">' + svg('clock') + '<span>' + esc(m.dur) + '</span></div>' : '<span class="dbv-mtg__meta">' + esc(m.meta) + '</span>') +
      '<div class="dbv-mtg__chips">' + chip('user', L.org, m.org) + (m.who && m.who !== '—' ? chip('users', L.who, m.who) : '') + '</div>' + link(m.link) + '</div>';
  }
  var W = DATA.week, D = DATA.demo;
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2>' +
    '<h3 class="dbv-h3 dbv-rit__h3" style="margin-top:14px !important">' + esc(W.h) + '</h3>' +
    '<div class="dbv-wk"><div class="dbv-wk__band"><span class="dbv-wk__tag">' + esc(W.tag) + '</span><div class="dbv-wk__evs">' +
    DATA.weekly.slice(0, 2).map(function (m) { return '<div class="dbv-wk__ev">' + svg(m.icon) + '<span>' + esc(m.title) + '</span></div>'; }).join('') + '</div></div>' +
    '<div class="dbv-wk__days" role="list" aria-label="Дни недели">' + W.days.map(function (d, i) { var f = i === 4; return '<div class="dbv-wk__d' + (f ? ' dbv-wk__d--fri' : '') + '" role="listitem">' + (f ? svg('file') : '') + esc(d) + '</div>'; }).join('') + '</div>' +
    '<div class="dbv-wk__cap"><span class="dbv-chip">' + svg('file') + '<span>' + esc(W.fri) + '</span></span></div></div>' +
    '<div class="dbv-mg" style="margin-top:18px">' + DATA.weekly.map(function (m, i) { return card(m, i, true); }).join('') + '</div>' +
    '<h3 class="dbv-h3 dbv-rit__h3">' + esc(DATA.rare.h) + '</h3><div class="dbv-mg">' + DATA.monthly.map(function (m, i) { return card(m, i, false); }).join('') + '</div>' +
    '<div class="dbv-demo" id="dbv-demo"><h3 class="dbv-h3 dbv-rit__h3">' + esc(D.h) + '</h3>' +
    '<div class="dbv-tb" role="tablist" aria-label="' + esc(D.h) + '">' + D.tabs.map(function (t, i) { return '<button type="button" class="dbv-tab" role="tab" id="' + uid + '-t' + i + '" data-i="' + i + '" aria-controls="' + uid + '-p" aria-selected="false" tabindex="-1">' + esc(t.t) + '</button>'; }).join('') + '</div>' +
    '<div class="dbv-tp" role="tabpanel" id="' + uid + '-p"><div class="dbv-tp__c" data-pc></div><div class="dbv-meas" aria-hidden="true" data-meas></div></div>' +
    '<div class="dbv-warn" role="note">' + svg('warn') + '<p class="dbv-body" data-gl>' + esc(D.stop) + '</p></div></div>';
  [].forEach.call(root.querySelectorAll('[data-jump]'), function (b) { if (!document.getElementById(b.getAttribute('data-jump'))) b.parentNode.removeChild(b); });
  var gl = dbvGlossary(root);
  gl.apply(root);
  var tabs = [].slice.call(root.querySelectorAll('.dbv-tab')), panel = root.querySelector('.dbv-tp'), pc = root.querySelector('[data-pc]'), meas = root.querySelector('[data-meas]');
  function para(t) { return '<p class="dbv-tp__p" data-gl>' + esc(t.p) + '</p>'; }
  function render(fade) {
    gl.hide();
    pc.innerHTML = para(D.tabs[cur]); gl.apply(pc);
    panel.setAttribute('aria-labelledby', tabs[cur].id);
    if (fade && !reduced()) { pc.classList.remove('is-new'); void pc.offsetWidth; pc.classList.add('is-new'); }
  }
  function paint() { tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === cur ? 'true' : 'false'); t.tabIndex = i === cur ? 0 : -1; }); }
  function select(i) { if (i === cur) return; cur = i; paint(); render(true); }
  function measure() {
    var cs = getComputedStyle(panel), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom), bw = parseFloat(cs.borderTopWidth) * 2;
    meas.style.left = pl + 'px'; meas.style.top = pt + 'px'; meas.style.width = (panel.clientWidth - pl - pr) + 'px';
    var max = 0;
    D.tabs.forEach(function (t) { meas.innerHTML = para(t); max = Math.max(max, meas.offsetHeight); });
    meas.innerHTML = '';
    panel.style.height = Math.ceil(max + pt + pb + bw + 4) + 'px';
  }
  var tb = root.querySelector('.dbv-tb');
  tb.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('.dbv-tab'); if (t) select(+t.getAttribute('data-i')); });
  tb.addEventListener('keydown', function (e) {
    var k = e.key, n = tabs.length, to = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = (cur + 1) % n; else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (cur + n - 1) % n; else if (k === 'Home') to = 0; else if (k === 'End') to = n - 1;
    if (to < 0) return;
    e.preventDefault(); select(to); tabs[to].focus();
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-jump]');
    if (!b) return;
    var el = document.getElementById(b.getAttribute('data-jump'));
    if (el) el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  });
  paint(); render(false); measure();
  function onSize() { var w = root.clientWidth; if (w === lastW) return; lastW = w; requestAnimationFrame(measure); }
  if (window.ResizeObserver) new ResizeObserver(onSize).observe(root); else window.addEventListener('resize', onSize);
  lastW = root.clientWidth;
}
function start() {
  [].forEach.call(document.querySelectorAll('.dbv-rit'), function (r, n) {
    if (r.getAttribute('data-dbv-init')) return;
    r.setAttribute('data-dbv-init', '1');
    init(r, 'dbv-rit' + n);
  });
}
/* ждём конец разбора страницы: цель прокрутки (блок 03) лежит ниже в документе */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
