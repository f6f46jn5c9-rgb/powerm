/* Здесь правятся тексты этапов: результат (result), кто решает (who), срок (term), состав работ (work: p — абзац, ul — список) и пункты чек-листов (check.items). Меняйте только текст между кавычками. В тексте {{rhythm}} и {{grade}} — названия страниц, подставляются ссылками. */
var DATA = {
  stages: [
    { n: 1, name: 'Подготовка программы', kt: 'Проект включён в портфель',
      work: [
        { p: 'К началу работы проектных команд этап завершён. Предложение по новому проекту может направить любой работник — ЛСП соответствующего приоритета.' },
        { p: 'На этапе выбора и предложения темы проекта обязательно проверяется, какие готовые инструменты и цифровые решения уже есть в компании.' }
      ],
      workJump: { id: 'dbv-criteria', label: 'Проверить проект по критериям включения' },
      result: 'Программа запущена, портфель проектов утверждён',
      who: 'Комиссия по портфелю программы (председатель — ГД)',
      term: 'Входной отсев — 5 рабочих дней после сбора предложений; решение комиссии — 3 рабочих дня.' },
    { n: 2, name: 'Запуск проектов', kt: 'Проект допущен к реализации',
      work: [
        { ul: ['Формирование требований заказчиком проекта (проектное задание)', 'Замер исходных значений руководителем проекта', 'Формулирование КР и мероприятий проектной командой', 'Создание карточки проекта в ПЗ, согласование требований с ЛСП'] }
      ],
      workJump: { id: 'dbv-first30', label: 'Подробно: первые 30 дней' },
      result: 'Проект в ПЗ в статусе реализации; согласованные требования; исходные значения по всем КР.',
      who: 'Координатор проектного трека',
      term: 'Требования — 10 рабочих дней с утверждения портфеля. Карточка в ПЗ — 5 рабочих дней после согласования требований с заказчиком.',
      check: { title: 'Чек-лист готовности к КТ2', ready: 'Все пункты отмечены: можно идти на КТ2', items: [
        'Требования заказчика (проектное задание) оформлены по форме: проблема, цель, ожидаемые результаты и инструменты, что входит и что не входит в объём, минимальный объём внедрения, владелец результата, команда, плановая дата завершения',
        'Требования согласованы с ЛСП',
        'Руководителя проекта выбрала команда, выбор указан в карточке',
        'Владелец результата назван поимённо (должность, ФИО) и согласен принять результат',
        'По каждому КР есть показатель, исходное значение с периодом и источником, целевое значение, плановая дата, работник, подтверждающий достижение',
        'Если исходное значение нельзя получить из действующих систем учёта, в требования внесено мероприятие по организации измерения (ответственный и срок)',
        'Каждому КР соответствуют мероприятия, каждое мероприятие даёт актив',
        'Карточка в ПЗ заполнена. Проект, не заведённый в ПЗ, считается не начатым'
      ] } },
    { n: 3, name: 'Реализация', kt: 'Активы проекта приняты',
      work: [
        { ul: ['Создание активов по плану КР; регистрация активов в ПЗ по мере создания, а не по завершении проекта', 'Ведение карточки проекта в ПЗ: еженедельное обновление прогресса, КР, активов и статусов', 'Еженедельная публикация отчёта о прогрессе в ПЗ', 'Ежемесячное участие в демонстрационных днях (см. страницу «{{rhythm}}»)', 'Еженедельные встречи команды и планёрки с координатором, работа с блокираторами'] }
      ],
      result: 'Активы проекта в ПЗ; приёмка активов заказчиком на демонстрационном дне.',
      who: 'Заказчик проекта',
      term: 'КТ3 проходится в ходе демонстрационных дней, которые проводятся ежемесячно: заказчик проекта на демонстрационном дне устно сообщает, принимает он актив или нет.',
      check: { title: 'Чек-лист готовности к КТ3', ready: 'Все пункты отмечены: можно идти на КТ3', items: [
        'Активы, предусмотренные КР, созданы и зарегистрированы в ПЗ: название, тип, ссылка, владелец',
        'Заказчик проекта на демонстрационном дне подтвердил приёмку актива (принимает или не принимает)',
        'Каждый актив — инструмент, который работает без команды, а не разово заполненный документ',
        'По каждому КР согласованы с заказчиком метрики: результативность, эффективность, надёжность',
        'Отклонения от плановых дат объяснены в отчёте'
      ] } },
    { n: 4, name: 'Подготовка к защите', kt: 'Проект допущен к финальной защите',
      work: [
        { ul: ['Подготовка презентации в формате PPTX по корпоративному шаблону', 'Актуализация карточки проекта в ПЗ', 'Публикация заключительного отчёта в ПЗ; заказчик проекта заполняет раздел «Обратная связь заказчика»', 'Подготовка устного доклада по структуре, описанной на странице «{{grade}}»', 'Предзащита у координаторов проектного трека: РП представляет проект с участием заказчика'] }
      ],
      result: 'Заключение координаторов и решение о допуске.',
      who: 'ЛСП по заключению координаторов проектного трека',
      term: 'Дата публикации заключительного отчёта устанавливается организаторами программы. Предзащита проводится по календарю цикла.',
      check: { title: 'Чек-лист: условия допуска к финальной защите', ready: 'Все условия выполнены: можно идти на КТ4', items: [
        '«Заказано и сдано»: объём сданного равен объёму требований — без расширений и без недосдачи',
        'Исходные значения зафиксированы по всем КР',
        'Владелец результата назначен поимённо, его согласие принять результат получено',
        'Заключительный отчёт опубликован, раздел «Обратная связь заказчика» заполнен — иначе отчёт к приёмке не принимается'
      ] } },
    { n: 5, name: 'Защита и приёмка', kt: 'Результат проекта принят',
      work: [
        { p: 'Проект защищается перед жюри. Докладывает РП.' }
      ],
      result: 'Решение о приёмке заказчиком проекта (статусы и баллы — на странице «{{grade}}»)',
      who: 'Заказчик проекта по баллам приёмки с учётом оценки жюри',
      term: 'Защита — один раз за цикл. Пересдачи и повторной защиты в рамках цикла нет.' }
  ],
  labels: { work: 'Состав работ', result: 'Результат этапа', who: 'Решает', term: 'Срок', reset: 'Сбросить', note: 'Отметки не сохраняются: это самопроверка.' }
};
/* Адреса страниц — DBV_PAGES (src/core/dbv-pages.js). */
function rich(t) {
  var s = esc(t);
  return s.replace(/\{\{(rhythm|grade)\}\}/g, function (m, k) { return pageLink(k, '', DBV_PAGES[k].title); });
}
function init(root, uid) {
  var S = DATA.stages, L = DATA.labels, cur = 0;
  var checks = S.map(function (s) { return s.check ? s.check.items.map(function () { return false; }) : null; });

  var tabsHtml = S.map(function (s, i) {
    return '<button type="button" role="tab" id="' + uid + '-t' + i + '" data-i="' + i + '" aria-controls="' + uid + '-p" aria-selected="false" tabindex="-1">' + dia() + '<span>Э' + s.n + ' · ' + esc(s.name) + '</span></button>';
  }).join('');
  root.innerHTML = '<div class="dbv-ut" role="tablist" aria-label="Этапы проекта">' + tabsHtml + '</div><div class="dbv-panel dbv-st" role="tabpanel" id="' + uid + '-p"></div>';
  var gl = dbvGlossary(root), panel = root.querySelector('.dbv-st'), tabs = [].slice.call(root.querySelectorAll('[role=tab]')), tablist = root.querySelector('[role=tablist]');

  function jumpLink(j) {
    if (!j || !document.getElementById(j.id)) return '';
    return '<p class="dbv-lnk"><a href="#' + esc(j.id) + '" data-jump="' + esc(j.id) + '">' + esc(j.label) + ico('down') + '</a></p>';
  }
  function workHtml(s) {
    return s.work.map(function (w) { return w.p ? '<p>' + rich(w.p) + '</p>' : list(w.ul.map(rich)); }).join('') + jumpLink(s.workJump);
  }
  function checkHtml() {
    var c = S[cur].check, id = uid + '-c';
    var items = c.items.map(function (t, k) {
      return '<label class="dbv-chk"><input type="checkbox" data-k="' + k + '"><span data-gl>' + esc(t) + '</span></label>';
    }).join('');
    var inner = '<div class="dbv-ck__top"><div class="dbv-prog" role="progressbar" aria-valuemin="0" aria-valuemax="' + c.items.length + '" aria-label="' + esc(c.title) + '"><i></i></div><button type="button" class="dbv-lnkb" data-reset>' + esc(L.reset) + '</button></div>' +
      '<p class="dbv-ready" aria-live="polite"></p><div class="dbv-ck__list">' + items + '</div><p class="dbv-small">' + esc(L.note) + '</p>';
    return '<div class="dbv-acc"><h3 class="dbv-h3 dbv-acc__h"><button type="button" class="dbv-acc__b" aria-expanded="false" aria-controls="' + id + '"><span>' + esc(c.title) + ' · <span class="dbv-cnt" data-cnt></span></span>' + ico('chev') + '</button></h3>' +
      '<div class="dbv-acc__p" id="' + id + '">' + inner + '</div></div>';
  }
  function updateCheck() {
    var c = S[cur].check;
    if (!c) return;
    var arr = checks[cur], n = arr.filter(Boolean).length, tot = arr.length;
    panel.querySelector('[data-cnt]').textContent = n + ' из ' + tot;
    var bar = panel.querySelector('.dbv-prog');
    bar.setAttribute('aria-valuenow', n);
    bar.firstChild.style.width = (100 * n / tot) + '%';
    panel.querySelector('.dbv-ready').textContent = n === tot ? c.ready : '';
    [].forEach.call(panel.querySelectorAll('.dbv-chk input'), function (el, k) { el.checked = arr[k]; });
  }
  function render() {
    gl.hide();
    var s = S[cur];
    var h = '<h3 class="dbv-h3 dbv-st__h"><span class="dbv-st__n">Э' + s.n + '</span> · ' + esc(s.name) + '</h3>' +
      '<p class="dbv-body dbv-st__kt" data-gl>' + dia() + '<b>КТ' + s.n + ' · ' + esc(s.kt) + '</b> · ' + esc(L.who) + ': ' + esc(s.who) + '</p>' +
      '<dl class="dbv-dl">' +
      '<div class="dbv-dl__r"><dt>' + esc(L.work) + '</dt><dd data-gl>' + workHtml(s) + '</dd></div>' +
      '<div class="dbv-dl__r"><dt>' + esc(L.result) + '</dt><dd data-gl>' + rich(s.result) + '</dd></div>' +
      '<div class="dbv-dl__r"><dt>' + esc(L.term) + '</dt><dd data-gl>' + esc(s.term) + '</dd></div></dl>';
    if (s.check) h += checkHtml();
    panel.innerHTML = h;
    panel.setAttribute('aria-labelledby', tabs[cur].id);
    gl.apply(panel);
    updateCheck();
  }
  function paint() {
    tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === cur ? 'true' : 'false'); t.tabIndex = i === cur ? 0 : -1; });
  }
  function select(i, noHash) {
    if (i === cur && panel.firstChild) return;
    cur = i; paint(); render();
    if (!noHash) { try { history.replaceState(null, '', '#e' + (i + 1)); } catch (e) {} }
  }
  function fromHash() { var m = /^#e([1-5])$/.exec(location.hash || ''); return m ? +m[1] - 1 : -1; }

  tablist.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-i]');
    if (t) select(+t.getAttribute('data-i'));
  });
  tablist.addEventListener('keydown', function (e) {
    var k = e.key, n = tabs.length, to = -1;
    if (k === 'ArrowRight') to = (cur + 1) % n;
    else if (k === 'ArrowLeft') to = (cur + n - 1) % n;
    else if (k === 'Home') to = 0;
    else if (k === 'End') to = n - 1;
    if (to < 0) return;
    e.preventDefault(); select(to); tabs[to].focus();
  });
  panel.addEventListener('click', function (e) {
    var t = e.target, b;
    if (t.closest('.dbv-ab') && t.closest('label')) { e.preventDefault(); return; }
    if ((b = t.closest('.dbv-acc__b'))) accToggle(b);
    else if (t.closest('[data-reset]')) { checks[cur] = checks[cur].map(function () { return false; }); updateCheck(); }
    else if ((b = t.closest('[data-jump]'))) { e.preventDefault(); scrollToId(b.getAttribute('data-jump')); }
  });
  panel.addEventListener('change', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-k');
    if (k === null || k === undefined) return;
    checks[cur][+k] = e.target.checked; updateCheck();
  });
  window.addEventListener('hashchange', function () { var h = fromHash(); if (h > -1) select(h, true); });

  var h0 = fromHash();
  cur = h0 > -1 ? h0 : 0;
  paint(); render();
}
function start() {
  [].forEach.call(document.querySelectorAll('.dbv-stg'), function (r, n) {
    if (r.getAttribute('data-dbv-init')) return;
    r.setAttribute('data-dbv-init', '1');
    init(r, 'dbv-stg' + n);
  });
}
/* ждём конец разбора страницы: цели прокрутки (блок 03) лежат ниже в документе */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
