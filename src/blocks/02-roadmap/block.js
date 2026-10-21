/* Здесь правятся тексты этапов (what — ключевые действия, kt, who, term — срок) и подпись второй дорожки. Меняйте только текст между кавычками. */
var DATA = {
  title: 'Путь проекта: 5 этапов и 5 контрольных точек',
  lead: 'Каждый этап заканчивается контрольной точкой (КТ): без положительного решения проект на следующий этап не переходит. Решение по каждой КТ принимает ЛПР.',
  stages: [
    { n: 1, name: 'Подготовка программы',
      what: 'Запуск, сбор предложений, входной отсев, утверждение портфеля проектов. Роль, календарь и правила направляются участнику не позднее чем через 3 рабочих дня после утверждения состава участников.',
      kt: 'Проект включён в портфель', who: 'комиссия по портфелю',
      term: 'До первого модуля академического трека' },
    { n: 2, name: 'Запуск проектов',
      what: 'Формирование требований заказчиком проекта; замер исходных значений руководителем проекта; формулирование КР; создание карточки проекта в ПЗ; согласование требований с ЛСП.',
      kt: 'Проект допущен к реализации', who: 'координатор проектного трека',
      term: 'Около 3 недель (10 + 5 рабочих дней) после утверждения портфеля' },
    { n: 3, name: 'Реализация',
      what: 'Создание активов; ведение карточки проекта в ПЗ; еженедельная публикация отчётов; еженедельные встречи команды и планёрки с координатором; ежемесячные демонстрационные дни.',
      kt: 'Активы проекта приняты', who: 'заказчик проекта',
      term: 'Основная часть цикла' },
    { n: 4, name: 'Подготовка к защите',
      what: 'Презентация PPTX по корпоративному шаблону; актуализация карточки проекта в ПЗ; публикация заключительного отчёта; подготовка устного доклада; предзащита у координаторов.',
      kt: 'Проект допущен к финальной защите', who: 'ЛСП по заключению координаторов',
      term: 'Перед защитой' },
    { n: 5, name: 'Защита и приёмка',
      what: 'Защита проекта перед жюри; приёмка результата заказчиком проекта.',
      kt: 'Результат проекта принят', who: 'заказчик проекта с учётом оценки жюри',
      term: 'Завершает цикл' }
  ],
  after: { name: 'После цикла', what: 'Ретроспектива: опрос участников, встречи с командами, отчёт.' },
  labels: { what: 'Ключевые действия', who: 'Решает', term: 'Срок', go: 'Подробно про этап' },
  lane: 'Параллельно проекту: академический трек — 5 модулей по развитию управленческих компетенций (организует ДРП); обучение управлению проектами — вебинары и практикумы по работе в ПЗ (организует ЦРБС)'
};
/* адрес кнопки «Подробно про этап» — DBV_PAGES.stages.url (src/core/dbv-pages.js) + '#e' + номер; пустой адрес — кнопка не выводится */
function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function init(root, uid) {
  var items = DATA.stages.concat([{ n: 0, name: DATA.after.name, what: DATA.after.what }]);
  var L = DATA.labels, cur = 0, lastW = -1;
  var DIAM = '<path d="M22 1 43 22 22 43 1 22z" fill="#E01828"/>';

  function cardHtml(it) {
    var row = function (k, v) { return '<div class="dbv-dl__r"><dt>' + k + '</dt><dd data-gl>' + v + '</dd></div>'; };
    var head = '<div class="dbv-pc__h"><h3 class="dbv-h3">' + (it.n ? '<span class="dbv-pc__n">Э' + it.n + '</span> · ' : '') + esc(it.name) + '</h3>' +
      (it.n && DBV_PAGES.stages.url ? '<a class="dbv-btn" href="' + esc(DBV_PAGES.stages.url + '#e' + it.n) + '" rel="noopener">' + esc(L.go) + ico('arrow') + '</a>' : '') + '</div>';
    var dl = row(L.what, esc(it.what));
    if (it.kt) dl += row(L.who, '<p>' + esc(cap1(it.who)) + '</p><p class="dbv-small">' + dia() + 'КТ' + it.n + ' · ' + esc(it.kt) + '</p>') + row(L.term, esc(it.term));
    return head + '<dl class="dbv-dl dbv-dl--v">' + dl + '</dl>';
  }

  var tabsHtml = items.map(function (it, i) {
    var id = uid + '-t' + i;
    if (!it.n) {
      return '<div class="dbv-after" role="presentation"><button type="button" class="dbv-node" role="tab" id="' + id + '" data-i="' + i + '" aria-controls="' + uid + '-p" aria-selected="false" tabindex="-1">' +
        '<span class="dbv-node__c">' + ico('hist') + '</span><span class="dbv-node__t">' + esc(it.name) + '</span></button></div>';
    }
    return '<div class="dbv-col" role="presentation"><button type="button" class="dbv-node" role="tab" id="' + id + '" data-i="' + i + '" aria-controls="' + uid + '-p" aria-selected="false" tabindex="-1">' +
      '<span class="dbv-node__c">Э' + it.n + '</span><span class="dbv-node__t">' + esc(it.name) + '</span></button>' +
      '<span class="dbv-kt" data-i="' + i + '" aria-hidden="true"><svg viewBox="0 0 44 44" focusable="false">' + DIAM + '<text x="22" y="26.5" text-anchor="middle">КТ' + it.n + '</text></svg><span class="dbv-kt__n">' + esc(it.kt) + '</span></span></div>';
  }).join('');

  root.innerHTML =
    '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2>' +
    '<p class="dbv-body dbv-road__lead" data-gl>' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-map"><div class="dbv-line" aria-hidden="true"></div><div class="dbv-nodes" role="tablist" aria-label="Этапы проекта">' + tabsHtml + '</div></div>' +
    '<div class="dbv-panel dbv-road__p" role="tabpanel" id="' + uid + '-p"><div class="dbv-pc" data-pc></div><div class="dbv-meas dbv-pc" aria-hidden="true" data-meas></div></div>' +
    '<p class="dbv-small dbv-lane" data-gl>' + esc(DATA.lane) + '</p>';

  var gl = dbvGlossary(root);
  gl.apply(root);
  var tabs = [].slice.call(root.querySelectorAll('.dbv-node'));
  var cols = tabs.map(function (t) { return t.parentNode; });
  var tablist = root.querySelector('.dbv-nodes');
  var panel = root.querySelector('.dbv-panel');
  var pc = root.querySelector('[data-pc]'), meas = root.querySelector('[data-meas]');

  function isVert() { return root.clientWidth < 760; }
  function renderCard(fade) {
    gl.hide();
    pc.innerHTML = cardHtml(items[cur]);
    gl.apply(pc);
    panel.setAttribute('aria-labelledby', tabs[cur].id);
    if (fade && !reduced()) { pc.classList.remove('is-new'); void pc.offsetWidth; pc.classList.add('is-new'); }
  }
  function paint() {
    tabs.forEach(function (t, i) {
      var on = i === cur;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      cols[i].classList.toggle('is-sel', on);
    });
  }
  function select(i) {
    if (i === cur) return;
    cur = i; paint(); renderCard(true);
  }
  function measure() {
    var cs = getComputedStyle(panel);
    var pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom);
    var bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    meas.style.left = pl + 'px'; meas.style.top = pt + 'px';
    meas.style.width = (panel.clientWidth - pl - pr) + 'px';
    var max = 0;
    items.forEach(function (it) { meas.innerHTML = cardHtml(it); max = Math.max(max, meas.offsetHeight); });
    meas.innerHTML = '';
    panel.style.height = Math.ceil(max + pt + pb + bw + 2) + 'px';
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
    if (isVert()) panel.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
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
  paint(); renderCard(false); measure();
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
