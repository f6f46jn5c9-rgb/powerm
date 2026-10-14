/* Здесь правятся три недопустимые практики (practices) и десять частых ошибок (errors: t — название, bad — «как проявляется», ok — «как правильно»). Меняйте только текст между кавычками. */
var DATA = {
  title: 'Чего не делать',
  practices: [
    { t: 'Работа за заказчика', c: 'Команда сама обзванивает клиентов, проводит опросы, вычёркивает строки из списков. Проектная задача — создать инструмент: скрипт интервью, механизм обзвона, методику выбора.' },
    { t: 'Дублирование существующих решений', c: 'На этапе выбора и предложения темы проекта обязательно проверяется, какие готовые инструменты и цифровые решения уже есть в компании. Разработка того, что уже существует, результатом проекта не является.' },
    { t: 'Демонстрация планов вместо результата', c: 'На демонстрационных днях показывается работающая версия актива, а не планы и описания. Первая версия актива (даже простая и неполная) создаётся и вводится в использование как можно раньше, затем дорабатывается по результатам применения.' }
  ],
  title2: 'Десять частых ошибок',
  lead: 'Раскройте карточку: увидите, как ошибка проявляется и как действовать правильно.',
  labels: { bad: 'Как проявляется', ok: 'Как правильно', all: 'Раскрыть все', none: 'Свернуть все' },
  errors: [
    { t: 'Операционная деятельность вместо инструмента', bad: 'Команда сама проводит опросы, обзванивает клиентов, считает вручную.', ok: 'Создание инструмента: скрипт, механизм, методика. Критерий проверки: что остаётся в подразделении после ухода команды.' },
    { t: 'Нет исходного замера', bad: '«Показатели неудовлетворительные», «замер не проводился».', ok: 'Фиксация числа, периода и источника. При отсутствии данных — мероприятие по организации измерения.' },
    { t: 'КР описывает процесс', bad: '«Разработана методика», «проведены обучения».', ok: 'Формулировка результата как подтверждаемого состояния: «методика применена на…».' },
    { t: 'Нет владельца после проекта', bad: 'Указано подразделение или «будет определён».', ok: 'Назначение конкретного работника и получение его согласия до КТ2.' },
    { t: 'Избыточный объём', bad: 'Весь завод, несколько направлений сразу.', ok: 'Определение минимального объёма внедрения: одно подразделение, один процесс или одна группа номенклатуры.' },
    { t: 'Даты только у мероприятий', bad: 'У КР нет плановой даты.', ok: 'Плановая дата устанавливается каждому КР.' },
    { t: 'Несвоевременное информирование о проблемах', bad: 'О нехватке людей и выбывших участниках руководство узнаёт на демонстрационном дне.', ok: 'Сообщение о блокираторе координатору в течение 2 рабочих дней.' },
    { t: 'Результат принимает не заказчик проекта', bad: 'Итог презентуется руководителю, который не является заказчиком проекта.', ok: 'Согласование с заказчиком, кто принимает результат. Заказчика определяет ЛСП; при сомнениях вопрос направляется ему.' },
    { t: 'Отсутствие артефактов к демонстрационному дню', bad: 'Нет ни одного артефакта, который можно открыть и применить.', ok: 'Выпуск минимальной версии и доработка в процессе использования.' },
    { t: 'Отчёты без фактов', bad: '«Продвигаемся», одно и то же неделя за неделей.', ok: 'Отчёт содержит факты: что сделано, что мешает, что требуется от руководства.' }
  ]
};
/*%%GLOSSARY%%*/
var IC = {
  warn: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 8v5M12 16v.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chk: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chev: '<path d="M6 9l6 6 6-6"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function init(root, uid) {
  var L = DATA.labels;
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><div class="dbv-pr__g">' +
    DATA.practices.map(function (p) { return '<div class="dbv-pr"><span class="dbv-pr__i">' + svg('warn') + '</span><h3 class="dbv-h3">' + esc(p.t) + '</h3><p class="dbv-body dbv-pr__t" data-gl>' + esc(p.c) + '</p></div>'; }).join('') + '</div>' +
    '<h2 class="dbv-h2 dbv-err__h2b" id="dbv-err">' + esc(DATA.title2) + '</h2><p class="dbv-body dbv-err__lead">' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-err__bar"><button type="button" class="dbv-lnk" data-all="1">' + esc(L.all) + '</button><button type="button" class="dbv-lnk" data-all="0">' + esc(L.none) + '</button></div><div class="dbv-el">' +
    DATA.errors.map(function (e, i) {
      var id = uid + '-p' + i;
      return '<div class="dbv-e" data-i="' + i + '"><button type="button" class="dbv-e__b" aria-expanded="false" aria-controls="' + id + '"><span class="dbv-e__n" aria-hidden="true">' + (i + 1) + '</span><span class="dbv-e__t">' + esc(e.t) + '</span><span class="dbv-e__c">' + svg('chev') + '</span></button>' +
        '<div class="dbv-e__p" id="' + id + '"><div class="dbv-e__w"><div class="dbv-e__in"><div class="dbv-col dbv-col--bad"><div class="dbv-col__h"><span class="dbv-col__i" aria-hidden="true">' + svg('x') + '</span><span>' + esc(L.bad) + '</span></div><p class="dbv-col__t" data-gl>' + esc(e.bad) + '</p></div>' +
        '<div class="dbv-col dbv-col--ok"><div class="dbv-col__h"><span class="dbv-col__i" aria-hidden="true">' + svg('chk') + '</span><span>' + esc(L.ok) + '</span></div><p class="dbv-col__t" data-gl>' + esc(e.ok) + '</p></div></div></div></div></div>';
    }).join('') + '</div>';
  var gl = dbvGlossary(root);
  gl.apply(root);
  var cards = [].slice.call(root.querySelectorAll('.dbv-e'));
  function toggle(c, open) {
    var b = c.querySelector('.dbv-e__b');
    if (open === undefined) open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    c.classList.toggle('is-open', open);
    c.querySelector('.dbv-e__p').classList.toggle('is-open', open);
    if (!open) gl.hide();
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-e__b');
    if (b) { toggle(b.parentNode); return; }
    var a = e.target.closest && e.target.closest('[data-all]');
    if (a) cards.forEach(function (c) { toggle(c, a.getAttribute('data-all') === '1'); });
  });
  function fromHash() {
    try {
      var m = /^#err(10|[1-9])$/.exec(location.hash || '');
      if (m) toggle(cards[+m[1] - 1], true);
    } catch (e) {}
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
}
[].forEach.call(document.querySelectorAll('.dbv-err'), function (r, n) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r, 'dbv-err' + n);
});
