/* Здесь правятся тексты этапов, сроки (поля term: «typ» — типовой цикл, «y26» — ДБВ‑2026), подписи второй дорожки и сноска. Меняйте только текст между кавычками. */
var DATA = {
  title: 'Путь проекта: 5 этапов и 5 контрольных точек',
  lead: 'Каждый этап заканчивается контрольной точкой (КТ): без положительного решения проект на следующий этап не переходит. Решение по каждой КТ принимает ЛПР.',
  modes: [{ id: 'typ', label: 'Типовой цикл' }, { id: 'y26', label: 'ДБВ‑2026' }],
  defaultMode: 'y26',
  stages: [
    { n: 1, name: 'Подготовка программы',
      what: 'Приказ о запуске, сбор предложений, входной отсев, утверждение портфеля проектов. Роль, календарь и правила направляются участнику не позднее чем через 3 рабочих дня после утверждения состава участников.',
      kt: 'Проект включён в портфель', who: 'комиссия по портфелю',
      term: { typ: 'до первого модуля академического трека', y26: 'март' } },
    { n: 2, name: 'Запуск проектов',
      what: 'Формирование требований заказчиком проекта; замер исходных значений руководителем проекта; формулирование КР; создание карточки проекта в ПЗ; согласование требований с ЛСП.',
      kt: 'Проект допущен к реализации', who: 'координатор проектного трека',
      term: { typ: 'около 3 недель (10 + 5 рабочих дней) после утверждения портфеля', y26: 'март–апрель' } },
    { n: 3, name: 'Реализация',
      what: 'Создание активов; ведение карточки проекта в ПЗ; еженедельная публикация отчётов; еженедельные встречи команды и планёрки с координатором; ежемесячные демонстрационные дни.',
      kt: 'Активы проекта приняты', who: 'заказчик проекта',
      term: { typ: 'основная часть цикла', y26: 'апрель–июль' } },
    { n: 4, name: 'Подготовка к защите',
      what: 'Презентация PPTX по корпоративному шаблону; актуализация карточки проекта в ПЗ; публикация заключительного отчёта; подготовка устного доклада; предзащита у координаторов.',
      kt: 'Проект допущен к финальной защите', who: 'ЛСП по заключению координаторов',
      term: { typ: 'перед защитой', y26: 'август' } },
    { n: 5, name: 'Защита и приёмка',
      what: 'Защита проекта перед жюри; приёмка результата заказчиком проекта.',
      kt: 'Результат проекта принят', who: 'заказчик проекта с учётом оценки жюри',
      term: { typ: 'завершает цикл', y26: 'сентябрь' } }
  ],
  after: { n: 0, name: 'После цикла',
    what: 'Ретроспектива: опрос участников, встречи с командами, отчёт.',
    term: { y26: 'сентябрь–октябрь' } },
  laneLabel: 'Параллельно',
  lane: [
    { from: 1, to: 1,
      typ: { t: 'Академический трек (5 модулей, организует ДРП)' },
      y26: { t: 'Академический трек: модуль 1', m: 'март' } },
    { from: 2, to: 3,
      typ: { t: 'Обучение управлению проектами (организует ЦРБС): два вебинара и практикумы по работе в ПЗ' },
      y26: { t: 'Вебинары и практикумы по управлению проектами', m: 'апрель' } },
    { from: 5, to: 5,
      typ: null,
      y26: { t: 'Модуль 5 вместе с защитой', m: 'сентябрь' } }
  ],
  note: 'Месяцы 2026 года — пример. Даты каждого цикла устанавливает приказ о запуске; порядок и правила остаются прежними.'
};
/* Адрес для кнопки «Подробно про этап» берётся из общего файла ссылок src/core/dbv-pages.js (DBV_PAGES.stages.url); пока пусто — кнопка не показывается. */
/*%%PAGES%%*/
/*%%GLOSSARY%%*/
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
var SVGO = '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">';
var ICON_DIA = SVGO + '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/></svg>';
var ICON_ARROW = SVGO + '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';
var ICON_AFTER = SVGO + '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 8v4l3 2"/></svg>';

function init(root, uid) {
  var items = DATA.stages.concat([DATA.after]);
  var mode = DATA.defaultMode, cur = 0, lastW = -1;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function cardHtml(it) {
    var h = '<h3 class="dbv-h3 dbv-pc__h">' + (it.n ? '<span class="dbv-pc__n">Э' + it.n + '</span>' : '') + esc(it.name) + '</h3>';
    h += '<div class="dbv-pc__main" data-gl><div class="dbv-pc__lab">Что делаем</div><p class="dbv-pc__row">' + esc(it.what) + '</p></div>';
    h += '<div class="dbv-pc__side">';
    if (it.kt) h += '<div class="dbv-ktb">' + ICON_DIA + '<span>КТ' + it.n + ' · ' + esc(it.kt) + '</span></div>';
    if (it.who) h += '<p class="dbv-pc__row" data-gl><b>Решает:</b>' + esc(it.who) + '</p>';
    if (it.term && it.term[mode]) h += '<p class="dbv-pc__row"><b>Срок:</b>' + esc(it.term[mode]) + '</p>';
    if (it.n && DBV_PAGES.stages.url) h += '<a class="dbv-go" href="' + esc(DBV_PAGES.stages.url + '#e' + it.n) + '">Подробно про этап ' + ICON_ARROW + '</a>';
    return h + '</div>';
  }

  var tabsHtml = items.map(function (it, i) {
    var id = uid + '-t' + i;
    if (!it.n) {
      return '<div class="dbv-after" role="presentation"><button type="button" class="dbv-node" role="tab" id="' + id + '" data-i="' + i + '" aria-controls="' + uid + '-p" aria-selected="false" tabindex="-1">' +
        '<span class="dbv-node__c">' + ICON_AFTER + '</span><span class="dbv-node__t">' + esc(it.name) + '</span></button></div>';
    }
    return '<div class="dbv-col" role="presentation"><button type="button" class="dbv-node" role="tab" id="' + id + '" data-i="' + i + '" aria-controls="' + uid + '-p" aria-selected="false" tabindex="-1">' +
      '<span class="dbv-node__c">Э' + it.n + '</span><span class="dbv-node__t">' + esc(it.name) + '</span></button>' +
      '<span class="dbv-kt" data-i="' + i + '" aria-hidden="true"><span class="dbv-kt__box"><span class="dbv-kt__d"></span><span class="dbv-kt__l">КТ' + it.n + '</span></span><span class="dbv-kt__n">' + esc(it.kt) + '</span></span></div>';
  }).join('');

  root.innerHTML =
    '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2>' +
    '<p class="dbv-body dbv-road__lead" data-gl>' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-seg-row"><span class="dbv-seg-lab">Сроки:</span><div class="dbv-seg" role="radiogroup" aria-label="Календарь сроков">' +
    DATA.modes.map(function (m) { return '<button type="button" class="dbv-seg__b" role="radio" data-m="' + m.id + '" aria-checked="false" tabindex="-1">' + esc(m.label) + '</button>'; }).join('') +
    '</div></div>' +
    '<div class="dbv-road__body">' +
      '<div class="dbv-map">' +
        '<svg class="dbv-orbs" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
        '<ellipse cx="500" cy="50" rx="490" ry="40" transform="rotate(-1.5 500 50)" fill="none" stroke="#007890" stroke-width="1.5" opacity=".35" vector-effect="non-scaling-stroke"/>' +
        '<ellipse cx="520" cy="50" rx="400" ry="30" transform="rotate(2 520 50)" fill="none" stroke="#E01828" stroke-width="1.5" opacity=".3" vector-effect="non-scaling-stroke"/></svg>' +
        '<div class="dbv-line" aria-hidden="true"></div>' +
        '<div class="dbv-tabs" role="tablist" aria-label="Этапы проекта">' + tabsHtml + '</div>' +
      '</div>' +
      '<div class="dbv-lane" role="group" aria-label="' + esc(DATA.laneLabel) + '"><div class="dbv-lane__lab">' + esc(DATA.laneLabel) + '</div><div class="dbv-lane__row"><div class="dbv-lane__line" aria-hidden="true"></div><div data-lane style="display:contents"></div></div></div>' +
      '<div class="dbv-panel" role="tabpanel" id="' + uid + '-p"><div class="dbv-pc" data-pc></div><div class="dbv-meas dbv-pc" aria-hidden="true" data-meas></div></div>' +
    '</div>' +
    '<p class="dbv-small dbv-road__note">' + esc(DATA.note) + '</p>';

  var gl = dbvGlossary(root);
  gl.apply(root);
  var tabs = [].slice.call(root.querySelectorAll('.dbv-node'));
  var cols = tabs.map(function (t) { return t.parentNode; });
  var radios = [].slice.call(root.querySelectorAll('.dbv-seg__b'));
  var tablist = root.querySelector('.dbv-tabs');
  var panel = root.querySelector('.dbv-panel');
  var pc = root.querySelector('[data-pc]'), meas = root.querySelector('[data-meas]'), laneEl = root.querySelector('[data-lane]');

  function isVert() { return root.clientWidth < 760; }

  function renderLane() {
    laneEl.innerHTML = DATA.lane.map(function (l) {
      var v = l[mode];
      if (!v) return '';
      return '<div class="dbv-lane__i" style="grid-column:' + l.from + ' / ' + (l.to + 1) + '" data-gl>' + esc(v.t) + (v.m ? '<span class="dbv-lane__m">' + esc(v.m) + '</span>' : '') + '</div>';
    }).join('');
    gl.apply(laneEl);
  }
  function renderCard(fade) {
    gl.hide();
    pc.innerHTML = cardHtml(items[cur]);
    gl.apply(pc);
    panel.setAttribute('aria-labelledby', tabs[cur].id);
    if (fade && !reduce) { pc.classList.remove('is-new'); void pc.offsetWidth; pc.classList.add('is-new'); }
  }
  function notch() {
    var r = tabs[cur].getBoundingClientRect(), p = panel.getBoundingClientRect();
    var node = tabs[cur].querySelector('.dbv-node__c').getBoundingClientRect();
    panel.style.setProperty('--nx', Math.round(node.left + node.width / 2 - p.left) + 'px');
  }
  function paint() {
    tabs.forEach(function (t, i) {
      var on = i === cur;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      cols[i].classList.toggle('is-sel', on);
    });
    notch();
  }
  function select(i) {
    if (i === cur) return;
    cur = i; paint(); renderCard(true);
  }
  function setMode(m) {
    mode = m;
    radios.forEach(function (r) { var on = r.getAttribute('data-m') === m; r.setAttribute('aria-checked', on ? 'true' : 'false'); r.tabIndex = on ? 0 : -1; });
    renderLane(); renderCard(false);
  }
  function measure() {
    var cs = getComputedStyle(panel);
    var pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom);
    var bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    meas.style.left = pl + 'px'; meas.style.top = pt + 'px';
    meas.style.width = (panel.clientWidth - pl - pr) + 'px';
    var max = 0;
    DATA.modes.forEach(function (m) {
      var keep = mode; mode = m.id;
      items.forEach(function (it) { meas.innerHTML = cardHtml(it); max = Math.max(max, meas.offsetHeight); });
      mode = keep;
    });
    meas.innerHTML = '';
    panel.style.height = Math.ceil(max + pt + pb + bw + 6) + 'px';
    notch();
  }

  tablist.setAttribute('aria-orientation', isVert() ? 'vertical' : 'horizontal');
  tablist.addEventListener('pointerover', function (e) {
    var t = e.target.closest && e.target.closest('[data-i]');
    if (t && e.pointerType === 'mouse') select(+t.getAttribute('data-i'));
  });
  tablist.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-i]');
    if (!t) return;
    select(+t.getAttribute('data-i'));
    if (isVert()) panel.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  });
  tablist.addEventListener('focusin', function (e) {
    var t = e.target.closest && e.target.closest('.dbv-node');
    if (t) select(+t.getAttribute('data-i'));
  });
  tablist.addEventListener('keydown', function (e) {
    var v = isVert(), k = e.key, n = tabs.length, to = -1;
    if (k === 'ArrowRight' || (v && k === 'ArrowDown')) to = (cur + 1) % n;
    else if (k === 'ArrowLeft' || (v && k === 'ArrowUp')) to = (cur + n - 1) % n;
    else if (k === 'Home') to = 0;
    else if (k === 'End') to = n - 1;
    if (to < 0) return;
    e.preventDefault(); select(to); tabs[to].focus();
  });
  radios.forEach(function (r, i) {
    r.addEventListener('click', function () { setMode(r.getAttribute('data-m')); });
    r.addEventListener('keydown', function (e) {
      var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var nx = radios[(i + d + radios.length) % radios.length];
      setMode(nx.getAttribute('data-m')); nx.focus();
    });
  });

  setMode(mode); paint(); renderCard(false); measure();
  function onSize() {
    var w = root.clientWidth;
    if (w === lastW) return;
    lastW = w;
    requestAnimationFrame(function () { tablist.setAttribute('aria-orientation', isVert() ? 'vertical' : 'horizontal'); measure(); });
  }
  if (window.ResizeObserver) new ResizeObserver(onSize).observe(root); else window.addEventListener('resize', onSize);
  lastW = root.clientWidth;
}
[].forEach.call(document.querySelectorAll('.dbv-road'), function (r, n) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r, 'dbv-road' + n);
});
