/* Здесь правятся тексты этапов: результат (result), кто решает (who), срок (term), состав работ (work: p — абзац, ul — список) и пункты чек-листов (check.items). Меняйте только текст между кавычками. */
var DATA = {
  title: 'Выберите этап',
  stages: [
    { n: 1, name: 'Подготовка программы', kt: 'Проект включён в портфель',
      work: [
        { p: 'К началу работы проектных команд этап завершён. Предложение по новому проекту может направить любой работник — ЛСП соответствующего приоритета.' },
        { p: 'Те же пять критериев применяются повторно при любом изменении темы, цели и границ проекта (см. страницу «Рабочий ритм и нештатные ситуации»).' },
        { p: 'На этапе выбора и предложения темы проекта обязательно проверяется, какие готовые инструменты и цифровые решения уже есть в компании.' }
      ],
      result: 'Протокол об утверждении портфеля программы.',
      who: 'Комиссия по портфелю программы (председатель — ГД).',
      term: 'Входной отсев — 5 рабочих дней после сбора предложений; решение комиссии — 3 рабочих дня.',
      jump: { id: 'dbv-criteria', label: 'Проверить проект по пяти критериям включения' } },
    { n: 2, name: 'Запуск проектов', kt: 'Проект допущен к реализации',
      work: [
        { ul: ['Формирование требований заказчиком проекта (проектное задание)', 'Замер исходных значений руководителем проекта', 'Формулирование КР и мероприятий проектной командой', 'Создание карточки проекта в ПЗ, согласование требований с ЛСП'] }
      ],
      workJump: { id: 'dbv-first30', label: 'Подробно: первые 30 дней' },
      result: 'Проект в ПЗ в статусе реализации; согласованные требования; исходные значения по всем КР.',
      who: 'Координатор проектного трека.',
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
        { ul: ['Создание активов по плану КР; регистрация активов в ПЗ по мере создания, а не по завершении проекта', 'Ведение карточки проекта в ПЗ: еженедельное обновление прогресса, КР, активов и статусов', 'Еженедельная публикация отчёта о прогрессе в ПЗ', 'Ежемесячное участие в демонстрационных днях (см. страницу «Рабочий ритм и нештатные ситуации»)', 'Еженедельные встречи команды и планёрки с координатором, работа с блокираторами'] }
      ],
      result: 'Активы проекта в ПЗ; приёмка активов заказчиком на демонстрационном дне.',
      who: 'Заказчик проекта.',
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
        { ul: ['Подготовка презентации в формате PPTX по корпоративному шаблону', 'Актуализация карточки проекта в ПЗ', 'Публикация заключительного отчёта в ПЗ; заказчик проекта заполняет раздел «Обратная связь заказчика»', 'Подготовка устного доклада по структуре, описанной на странице «Оценка и защита»', 'Предзащита у координаторов проектного трека: РП представляет проект с участием заказчика'] }
      ],
      result: 'Заключение координаторов и решение о допуске.',
      who: 'ЛСП по заключению координаторов проектного трека.',
      term: 'Дата публикации заключительного отчёта устанавливается организаторами программы. Предзащита проводится по календарю цикла (ДБВ‑2026: август).',
      check: { title: 'Чек-лист: условия допуска к финальной защите', ready: 'Все условия выполнены: можно идти на КТ4', items: [
        '«Заказано и сдано»: объём сданного равен объёму требований — без расширений и без недосдачи',
        'Исходные значения зафиксированы по всем КР',
        'Владелец результата назначен поимённо, его согласие принять результат получено',
        'Заключительный отчёт опубликован, раздел «Обратная связь заказчика» заполнен — иначе отчёт к приёмке не принимается'
      ] } },
    { n: 5, name: 'Защита и приёмка', kt: 'Результат проекта принят',
      work: [
        { p: 'Проект защищается перед жюри: 10 минут (6 — доклад, 2 — вопросы, 2 — обратная связь). Докладывает РП.' }
      ],
      result: 'Решение о приёмке: «Принят», «Принят с замечаниями», «Отправлен на доработку» или «Не принят» (см. страницу «Оценка и защита»).',
      who: 'Заказчик проекта по баллам приёмки с учётом оценки жюри.',
      term: 'Защита — один раз за цикл (ДБВ‑2026: сентябрь). Пересдачи и повторной защиты в рамках цикла нет.',
      gradeLink: 'Как проходит защита и приёмка' }
  ],
  labels: { work: 'Состав работ', result: 'Результат этапа', who: 'Решает', term: 'Срок', hint: 'Отмечайте пункты по мере готовности', reset: 'Сбросить', prev: 'Предыдущий этап', next: 'Следующий этап',
    note: 'Отметки не сохраняются: это самопроверка. После обновления страницы они сбрасываются.' }
};
/*%%PAGES%%*/
/*%%GLOSSARY%%*/
var IC = {
  doc: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.7-4.2 3.6-6.5 7.5-6.5s6.8 2.3 7.5 6.5"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 10h18M8 2.5v4M16 2.5v4"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  dia: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>',
  chk: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n, cls) { return '<svg class="dbv-svg' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }

function init(root, uid) {
  var S = DATA.stages, L = DATA.labels, cur = 0, gid = 0;
  var checks = S.map(function (s) { return s.check ? s.check.items.map(function () { return false; }) : null; });

  var selHtml = S.map(function (s, i) {
    return '<div class="dbv-sc" role="presentation"><button type="button" class="dbv-sn" role="tab" id="' + uid + '-t' + i + '" data-i="' + i + '" aria-controls="' + uid + '-p" aria-selected="false" tabindex="-1">' +
      '<span class="dbv-sn__c">Э' + s.n + '</span><span class="dbv-sn__t">' + esc(s.name) + '</span></button>' +
      '<span class="dbv-sk" data-i="' + i + '" aria-hidden="true"><span class="dbv-sk__d"></span><span class="dbv-sk__l">КТ' + s.n + '</span></span></div>';
  }).join('');
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2>' +
    '<div class="dbv-sel"><div class="dbv-sline" aria-hidden="true"></div><div style="display:contents" role="tablist" aria-label="Этапы проекта">' + selHtml + '</div></div>' +
    '<div class="dbv-st dbv-glass" role="tabpanel" id="' + uid + '-p"></div>';
  var gl = dbvGlossary(root), panel = root.querySelector('.dbv-st'), tabs = [].slice.call(root.querySelectorAll('.dbv-sn')), tablist = root.querySelector('[role=tablist]');

  function jumpBtn(j) {
    if (!j || !document.getElementById(j.id)) return '';
    return '<button type="button" class="dbv-jump" data-jump="' + esc(j.id) + '"><span class="dbv-acc__t">' + esc(j.label) + '</span>' + svg('down') + '</button>';
  }
  function gradeBtn(label) {
    var u = DBV_PAGES.grade.url;
    return u ? '<a class="dbv-jump" href="' + esc(u) + '" rel="noopener"><span class="dbv-acc__t">' + esc(label) + '</span>' + svg('right') + '</a>'
      : '<span class="dbv-jump dbv-jump--off" aria-disabled="true"><span class="dbv-acc__t">' + esc(label) + '</span>' + svg('right') + '</span>';
  }
  function workHtml(s) {
    var h = s.work.map(function (w) {
      return w.p ? '<p class="dbv-acc__row">' + esc(w.p) + '</p>' : '<ul class="dbv-list">' + w.ul.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
    }).join('');
    return h + jumpBtn(s.workJump);
  }
  function acc(id, label, inner, extra) {
    return '<div><button type="button" class="dbv-acc__b" aria-expanded="false" aria-controls="' + id + '">' + '<span class="dbv-acc__t">' + label + '</span>' + svg('chev', 'dbv-chev') + '</button>' +
      '<div class="dbv-acc__p" id="' + id + '"><div class="dbv-acc__w"><div class="dbv-acc__in"' + (extra || '') + '>' + inner + '</div></div></div></div>';
  }
  function checkHtml(i) {
    var c = S[i].check, id = uid + '-c';
    var items = c.items.map(function (t, k) {
      return '<label class="dbv-chk' + (checks[i][k] ? ' is-on' : '') + '"><input type="checkbox" data-k="' + k + '"' + (checks[i][k] ? ' checked' : '') + '><span class="dbv-chk__b">' + svg('chk') + '</span><span class="dbv-chk__t" data-gl>' + esc(t) + '</span></label>';
    }).join('');
    var inner = '<div class="dbv-ck__top"><div class="dbv-ring"><svg viewBox="0 0 72 72" aria-hidden="true" focusable="false"><defs><linearGradient id="' + uid + '-g' + (++gid) + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#007890"/><stop offset="1" stop-color="#00A8C0"/></linearGradient></defs>' +
      '<circle cx="36" cy="36" r="30" fill="none" stroke="rgba(0,120,144,.15)" stroke-width="8"/><circle class="dbv-ring__p" cx="36" cy="36" r="30" fill="none" stroke="url(#' + uid + '-g' + gid + ')" stroke-width="8" stroke-linecap="round" stroke-dasharray="188.5" stroke-dashoffset="188.5"/></svg><div class="dbv-ring__c"></div></div>' +
      '<div class="dbv-ck__side"><div class="dbv-ck__hint">' + esc(L.hint) + '</div><p class="dbv-ready" aria-live="polite"></p><button type="button" class="dbv-btn" data-reset>' + svg('reset') + esc(L.reset) + '</button></div></div>' +
      '<div class="dbv-ck__list">' + items + '</div><p class="dbv-small dbv-ck__note">' + esc(L.note) + '</p>';
    return acc(id, esc(c.title) + ' · <span class="dbv-cnt" data-cnt></span>', inner);
  }
  function updateCheck() {
    var c = S[cur].check;
    if (!c) return;
    var arr = checks[cur], n = arr.filter(Boolean).length, tot = arr.length;
    var cnt = panel.querySelector('[data-cnt]'); cnt.textContent = n + ' из ' + tot;
    panel.querySelector('.dbv-ring__p').setAttribute('stroke-dashoffset', (188.5 * (1 - n / tot)).toFixed(1));
    panel.querySelector('.dbv-ring__c').innerHTML = n === tot ? svg('chk') : n + '/' + tot;
    panel.querySelector('.dbv-ready').textContent = n === tot ? c.ready : '';
    [].forEach.call(panel.querySelectorAll('.dbv-chk'), function (l, k) { l.classList.toggle('is-on', arr[k]); l.firstChild.checked = arr[k]; });
  }
  function render(fade) {
    gl.hide();
    var s = S[cur], i = cur;
    var h = '<div class="dbv-st__head"><h3 class="dbv-h3"><span class="dbv-st__n">Э' + s.n + '</span> · ' + esc(s.name) + '</h3><div class="dbv-ktb">' + svg('dia') + '<span>КТ' + s.n + ' · ' + esc(s.kt) + '</span></div></div>' +
      '<div class="dbv-mcs">' +
      [['doc', L.result, s.result], ['user', L.who, s.who], ['cal', L.term, s.term]].map(function (m) {
        return '<div class="dbv-mc"><div class="dbv-mc__h"><span class="dbv-ico">' + svg(m[0]) + '</span><span>' + esc(m[1]) + '</span></div><p class="dbv-body dbv-mc__t" data-gl>' + esc(m[2]) + '</p></div>';
      }).join('') + '</div><div class="dbv-accs">' +
      acc(uid + '-w', esc(L.work), workHtml(s), ' data-gl');
    if (s.check) h += checkHtml(i);
    else if (s.jump) h += jumpBtn(s.jump);
    if (s.gradeLink) h += gradeBtn(s.gradeLink);
    h += '</div><div class="dbv-pn">' + (i > 0 ? '<button type="button" class="dbv-btn" data-go="' + (i - 1) + '">' + svg('left') + esc(L.prev) + '</button>' : '') +
      (i < S.length - 1 ? '<button type="button" class="dbv-btn is-next" data-go="' + (i + 1) + '">' + esc(L.next) + svg('right') + '</button>' : '') + '</div>';
    panel.innerHTML = h;
    panel.setAttribute('aria-labelledby', tabs[cur].id);
    gl.apply(panel);
    updateCheck();
    if (fade && !reduced()) { panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = ''; }
  }
  function paint() {
    tabs.forEach(function (t, i) {
      t.setAttribute('aria-selected', i === cur ? 'true' : 'false');
      t.tabIndex = i === cur ? 0 : -1;
      t.parentNode.classList.toggle('is-sel', i === cur);
    });
  }
  function select(i, noHash) {
    if (i === cur && panel.firstChild) return;
    cur = i; paint(); render(true);
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
    var t = e.target;
    if (t.closest('.dbv-ab') && t.closest('label')) { e.preventDefault(); return; }
    var b;
    if ((b = t.closest('.dbv-acc__b'))) {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.getElementById(b.getAttribute('aria-controls')).classList.toggle('is-open', open);
    } else if ((b = t.closest('[data-go]'))) {
      select(+b.getAttribute('data-go')); tabs[cur].focus({ preventScroll: true });
    } else if (t.closest('[data-reset]')) {
      checks[cur] = checks[cur].map(function () { return false; }); updateCheck();
    } else if ((b = t.closest('[data-jump]'))) {
      var el = document.getElementById(b.getAttribute('data-jump'));
      if (el) el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    }
  });
  panel.addEventListener('change', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-k');
    if (k === null || k === undefined) return;
    checks[cur][+k] = e.target.checked; updateCheck();
  });
  window.addEventListener('hashchange', function () { var h = fromHash(); if (h > -1) select(h, true); });

  var h0 = fromHash();
  cur = h0 > -1 ? h0 : 0;
  paint(); render(false);
}
function start() {
  [].forEach.call(document.querySelectorAll('.dbv-stg'), function (r, n) {
    if (r.getAttribute('data-dbv-init')) return;
    r.setAttribute('data-dbv-init', '1');
    init(r, 'dbv-stg' + n);
  });
}
/* ждём конец разбора страницы: цели прокрутки (блоки 03 и 04) лежат ниже в документе */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
