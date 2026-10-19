/* Здесь правятся семь ситуаций: название (t), кто решает (who), порядок действий (steps — пункты списка) и вывод «Решение принимает» (dec). Меняйте только текст между кавычками; icon не трогайте. */
var DATA = {
  title: 'Если что-то пошло не так',
  lead: 'Семь ситуаций: что делать и кто принимает решение.',
  labels: { act: 'Порядок действий', who: 'Решает:', dec: 'Решение принимает:' },
  items: [
    { icon: 'flag', t: 'Проект не прошёл КТ', who: 'Координатор, затем ЛСП', dec: 'Координатор, затем ЛСП',
      steps: ['Координатор возвращает проект РП на доработку с новым сроком.', 'Не помогло — передаёт ЛСП.', 'ЛСП в течение недели решает: дать новый срок, вывести проект в другой контур улучшений с сохранением активов или закрыть.', 'Вывод и закрытие рассматривает комиссия по портфелю.'] },
    { icon: 'edit', t: 'Изменение темы, цели, КР, границ или дат', who: 'Заказчик и ЛСП', dec: 'Заказчик и ЛСП',
      steps: ['Изменение согласуется с заказчиком проекта и ЛСП, вносится в требования в ПЗ, координатор уведомляется.', 'При смене темы, цели или границ руководитель программы проверяет проект по пяти критериям.', 'Несогласованные изменения к приёмке не принимаются.'] },
    { icon: 'swap', t: 'Замена РП', who: 'Команда', dec: 'Команда',
      steps: ['Команда выбирает нового РП и сообщает координатору.', 'Замена фиксируется в ПЗ за 3 рабочих дня.', 'Прежний РП передаёт требования, активы и открытые вопросы, передачу подтверждает координатор.', 'Плановые даты КР при замене сами не сдвигаются.'] },
    { icon: 'users', t: 'Изменение состава команды', who: 'ЛСП, балансировочный комитет', dec: 'ЛСП (до КТ2), балансировочный комитет (при невовлечённости участника)',
      steps: ['До КТ2 изменение предлагает РП.', 'После КТ2 состав меняется только при выходе участника из программы.', 'Если участник не вовлечён, РП заявляет об этом на балансировочном комитете и запрашивает ресурс; участника исключают из программы.'] },
    { icon: 'cpu', t: 'В проекте есть цифровое решение: дашборд, сервис, ИИ-инструмент', who: 'ЛСП, ДИТ, ДОБ', dec: 'ЛСП, ДИТ, ДОБ', digital: true,
      paras: ['До начала разработки РП готовит обоснование: назначение, стоимость внедрения и ожидаемый эффект, используемые данные, кто и в каком подразделении поддерживает решение после проекта.', 'Порядок согласования: заказчик проекта → ЛСП → ДИТ и ДОБ.', 'Решение, проверенное только на тестовых данных, — прототип, а не КР.', 'Обоснование должно отвечать на три вопроса: окупаемость, сопровождение после проекта, безопасность данных.'],
      chain: ['Заказчик проекта', 'ЛСП', 'ДИТ и ДОБ'], chainCap: 'Порядок согласования', qs: ['окупаемость', 'сопровождение после проекта', 'безопасность данных'] },
    { icon: 'lock', t: 'Нет доступа к ПЗ', who: 'Руководитель программы', dec: 'Руководитель программы',
      steps: ['Обращение направляется в чат «Полярная звезда Силовых машин» в Синапс или руководителю программы.'] },
    { icon: 'exit', t: 'Участник выходит из программы', who: 'РП, организаторы, ЛСП', dec: 'РП, организаторы, ЛСП',
      steps: ['При добровольном выходе участник сообщает РП и координатору.', 'Исключение возможно при невовлечённости: систематическое отсутствие на встречах, невыполнение задач, выпадение из контекста проекта (причина на факт исключения не влияет).', 'Участника исключают из списков проектного и академического трека.'] }
  ],
  foot: 'Вопросы по методологии, блокираторам и готовности к КТ2 и предзащите — к координатору проектного трека.'
};
/*%%GLOSSARY%%*/
var IC = {
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  swap: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="M14 7h6M17 4l3 3-3 3M10 17H4M7 14l-3 3 3 3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 15v2"/>',
  exit: '<path d="M10 3.5H6.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2H10M16 8l4 4-4 4M20 12H9"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  dia: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>',
  arr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.5v.2"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function init(root, uid) {
  var L = DATA.labels;
  function body(it) {
    var h = '<div class="dbv-o__lab">' + esc(L.act) + '</div>';
    if (it.steps) h += '<ul class="dbv-list" data-gl>' + it.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    else h += it.paras.map(function (p, i) {
      if (i === 1) return '<p class="dbv-sr">' + esc(p) + '</p><div aria-hidden="true"><div class="dbv-ch__cap">' + esc(it.chainCap) + '</div><div class="dbv-ch">' +
        it.chain.map(function (c, k) { return (k ? '<span class="dbv-ch__a">' + svg('arr') + '</span>' : '') + '<span class="dbv-ch__t">' + esc(c) + '</span>'; }).join('') + '</div></div>';
      return '<p class="dbv-o__row" data-gl>' + esc(p) + '</p>' + (i === 3 ? '<div class="dbv-qs" aria-hidden="true">' + it.qs.map(function (q) { return '<span class="dbv-chip">' + esc(q) + '</span>'; }).join('') + '</div>' : '');
    }).join('');
    return h + '<span class="dbv-o__d" data-gl>' + svg('dia') + '<span>' + esc(L.dec) + ' ' + esc(it.dec) + '</span></span>';
  }
  root.innerHTML = '<h2 class="dbv-h2" id="dbv-oops">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-oops__lead">' + esc(DATA.lead) + '</p><div class="dbv-ol">' +
    DATA.items.map(function (it, i) {
      var id = uid + '-p' + i;
      return '<div class="dbv-o" data-i="' + i + '"><button type="button" class="dbv-o__b" aria-expanded="false" aria-controls="' + id + '"><span class="dbv-o__i">' + svg(it.icon) + '</span>' +
        '<span class="dbv-o__m"><span class="dbv-o__t">' + esc(it.t) + '</span><span class="dbv-o__who">' + esc(L.who) + ' ' + esc(it.who) + '</span></span><span class="dbv-o__c">' + svg('chev') + '</span></button>' +
        '<div class="dbv-o__p" id="' + id + '"><div class="dbv-o__w"><div class="dbv-o__in">' + body(it) + '</div></div></div></div>';
    }).join('') + '</div><div class="dbv-foot" role="note">' + svg('info') + '<p class="dbv-body" data-gl>' + esc(DATA.foot) + '</p></div>';
  var gl = dbvGlossary(root);
  gl.apply(root);
  var cards = [].slice.call(root.querySelectorAll('.dbv-o'));
  function toggle(c, open) {
    var b = c.querySelector('.dbv-o__b');
    if (open === undefined) open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    c.classList.toggle('is-open', open);
    c.querySelector('.dbv-o__p').classList.toggle('is-open', open);
    if (!open) gl.hide();
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-o__b');
    if (b) toggle(b.parentNode);
  });
  function fromHash() {
    try {
      var m = /^#oops([1-7])$/.exec(location.hash || '');
      if (m) toggle(cards[+m[1] - 1], true);
    } catch (e) {}
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);
}
[].forEach.call(document.querySelectorAll('.dbv-oops'), function (r, n) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r, 'dbv-oops' + n);
});
