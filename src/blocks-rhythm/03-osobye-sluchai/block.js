/* Здесь правятся семь особых случаев: название (t), порядок действий (steps — пункты списка; {{criteria}} — ссылка на критерии включения), кто решает (dec). Меняйте только текст между кавычками. */
var DATA = {
  title: 'Особые случаи',
  labels: { act: 'Порядок действий', dec: 'Решает:' },
  groups: [
    { h: 'Если что-то пошло не так', items: [
      { t: 'Проект не прошёл КТ', dec: 'Координатор, затем ЛСП',
        steps: ['Координатор возвращает проект РП на доработку с новым сроком.', 'Не помогло — передаёт ЛСП.', 'ЛСП в течение недели решает: дать новый срок, вывести проект в другой контур улучшений с сохранением активов или закрыть.', 'Вывод и закрытие рассматривает комиссия по портфелю.'] },
      { t: 'Нет доступа к ПЗ', dec: 'Руководитель программы',
        steps: ['Обращение направляется в чат «Полярная звезда Силовых машин» в Синапс или руководителю программы.'] },
      { t: 'Участник выходит из программы', dec: 'РП, организаторы, ЛСП',
        steps: ['При добровольном выходе участник сообщает РП и координатору.', 'Исключение возможно при невовлечённости: систематическое отсутствие на встречах, невыполнение задач, выпадение из контекста проекта (причина на факт исключения не влияет).', 'Участника исключают из списков проектного и академического трека.'] }
    ] },
    { h: 'Изменения в проекте', items: [
      { t: 'Изменение темы, цели, КР, границ или дат', dec: 'Заказчик и ЛСП',
        steps: ['Изменение согласуется с заказчиком проекта и ЛСП, вносится в требования в ПЗ, координатор уведомляется.', '{{criteria}}', 'Несогласованные изменения к приёмке не принимаются.'] },
      { t: 'Замена РП', dec: 'Команда',
        steps: ['Команда выбирает нового РП и сообщает координатору.', 'Замена фиксируется в ПЗ за 3 рабочих дня.', 'Прежний РП передаёт требования, активы и открытые вопросы, передачу подтверждает координатор.', 'Плановые даты КР при замене сами не сдвигаются.'] },
      { t: 'Изменение состава команды', dec: 'ЛСП (до КТ2), балансировочный комитет (при невовлечённости участника)',
        steps: ['До КТ2 изменение предлагает РП.', 'После КТ2 состав меняется только при выходе участника из программы.', 'Если участник не вовлечён, РП заявляет об этом на балансировочном комитете и запрашивает ресурс; участника исключают из программы.'] },
      { t: 'В проекте есть цифровое решение: дашборд, сервис, ИИ-инструмент', dec: 'ЛСП, ДИТ, ДОБ', digital: true,
        paras: ['До начала разработки РП готовит обоснование: назначение, стоимость внедрения и ожидаемый эффект, используемые данные, кто и в каком подразделении поддерживает решение после проекта.'],
        route: ['Порядок согласования:', 'заказчик проекта → ЛСП → ДИТ и ДОБ'],
        paras2: ['Решение, проверенное только на тестовых данных, — прототип, а не КР.'],
        qLead: 'Обоснование должно отвечать на три вопроса:', qs: ['окупаемость', 'сопровождение после проекта', 'безопасность данных'] }
    ] }
  ],
  criteria: 'Критерии включения'
};
/* Адрес ссылки «Критерии включения →» — DBV_PAGES.stages.url + '#dbv-criteria'. Хэши #oops1…#oops7 раскрывают соответствующую строку. */
function init(root, uid) {
  var L = DATA.labels, n = 0, all = [];
  function step(t) {
    return t === '{{criteria}}' ? (pageHref('stages', 'dbv-criteria') ? '<a href="' + esc(pageHref('stages', 'dbv-criteria')) + '" rel="noopener">' + esc(DATA.criteria) + ico('arrow') + '</a>' : esc(DATA.criteria)) : esc(t);
  }
  function body(it) {
    var h = '<p class="dbv-oops__l">' + esc(L.act) + '</p>';
    if (it.steps) h += list(it.steps.map(step));
    else {
      h += '<div class="dbv-stack dbv-oops__p">' + it.paras.map(function (p) { return '<p class="dbv-body">' + esc(p) + '</p>'; }).join('') +
        '<p class="dbv-body"><b>' + esc(it.route[0]) + '</b> ' + esc(it.route[1]) + '</p>' +
        it.paras2.map(function (p) { return '<p class="dbv-body">' + esc(p) + '</p>'; }).join('') +
        '<p class="dbv-body">' + esc(it.qLead) + '</p>' + list(it.qs.map(esc)) + '</div>';
    }
    return h + '<p class="dbv-small dbv-oops__d">' + esc(L.dec) + ' ' + esc(it.dec) + '</p>';
  }
  var html = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2>' + DATA.groups.map(function (g, gi) {
    return '<section class="dbv-sec dbv-oops__g"><h3 class="dbv-h3">' + esc(g.h) + '</h3>' + g.items.map(function (it) {
      n++; all.push(it);
      var id = uid + '-a' + n;
      return '<div class="dbv-acc" id="oops' + n + '"><h4 class="dbv-acc__h" style="margin:0;font-size:inherit">' +
        '<button type="button" class="dbv-acc__b" aria-expanded="false" aria-controls="' + id + '"><span><span class="dbv-acc__n">' + n + '</span>' + esc(it.t) + '</span>' + ico('chev') + '</button></h4>' +
        '<div class="dbv-acc__p" id="' + id + '"><div class="dbv-stack" data-gl>' + body(it) + '</div></div></div>';
    }).join('') + '</section>';
  }).join('');
  root.insertAdjacentHTML('beforeend', html);
  dbvGlossary(root).apply(root);
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-acc__b');
    if (b) accToggle(b);
  });
  function fromHash() {
    var m = /^#oops([1-7])$/.exec(location.hash || '');
    if (!m) return;
    var row = document.getElementById('oops' + m[1]);
    if (!row || !root.contains(row)) return;
    accToggle(row.querySelector('.dbv-acc__b'), true);
    row.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
}
function start() {
  [].forEach.call(document.querySelectorAll('.dbv-oops'), function (r, n) {
    if (r.getAttribute('data-dbv-init')) return;
    r.setAttribute('data-dbv-init', '1');
    init(r, 'dbv-oops' + n);
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
