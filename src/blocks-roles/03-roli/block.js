/* Здесь правятся карточки ролей: key — ключ (id карточки dbv-role-ключ), t — название, who — «Кто это», q — вопросы (список) или p — вопросы (абзац). Меняйте только текст между кавычками; icon и red не трогайте. */
var DATA = {
  title: 'К кому обращаться',
  lead: 'Раскройте карточку роли, чтобы увидеть, по каким вопросам к ней обращаются.',
  label: 'Найти роль или вопрос',
  found: 'Найдено:', of: 'из', reset: 'Сбросить', all: 'Раскрыть все', none: 'Свернуть все',
  empty: 'Ничего не найдено. Попробуйте другое слово.',
  who: 'Кто это', ask: 'Вопросы, по которым обращаются',
  roles: [
    { key: 'customer', icon: 'userchk', t: 'Заказчик проекта', who: 'Руководитель, который ставит задачу и принимает результат. Встречается с командой не реже раза в 2 недели, решает вопросы за 5 рабочих дней.', q: ['Уточнить цель и границы', 'Принять актив', 'Назначить владельца результата', 'Решить вопрос по ресурсам и доступам'] },
    { key: 'rp', icon: 'flag', t: 'Руководитель проекта (РП)', who: 'Член команды, которого выбрала команда. Отвечает за результат в срок и в объёме.', p: 'Любые вопросы по ходу работы над проектом. О невозможности выполнить мероприятие член команды сообщает РП сразу.' },
    { key: 'coord', icon: 'compass', t: 'Координатор проектного трека', who: 'Сопровождает команды по методологии. Не принимает решений по содержанию проекта и не делает мероприятия за команду.', q: ['Как сформулировать КР и исходное значение', 'Как работать в ПЗ', 'Блокиратор', 'Готовность к КТ2 и предзащите'] },
    { key: 'lsp', icon: 'target', t: 'ЛСП', who: 'Руководитель, отвечающий за цели приоритета и проекты по нему.', q: ['Согласование требований и изменений', 'Решение, если проект не прошёл КТ', 'Допуск к защите'] },
    { key: 'bp', icon: 'link', t: 'БП', who: 'Связывает проекты приоритета с работой подразделений.', q: ['Как проект ляжет на работу подразделений', 'Кому в подразделении передавать результат'] },
    { key: 'owner', icon: 'key', t: 'Владелец результата', who: 'Конкретный работник с указанием должности. Принимает результат в работу и отвечает за его применение после программы. Подразделение владельцем быть не может.', p: 'В каком виде ему нужен актив и что он будет применять.' },
    { key: 'head', icon: 'users', t: 'Руководитель подразделения', who: 'Обеспечивает участие работника в мероприятиях программы.', p: 'Нагрузка: если участие затруднено текущей работой, он рассматривает обращение за 5 рабочих дней.' },
    { key: 'prog', icon: 'book', t: 'Руководитель программы', who: 'Отвечает за методологию и мероприятия программы, владелец ПЗ.', q: ['Спорные методологические вопросы', 'Доступ к ПЗ', 'Изменение порядка программы'] },
    { key: 'org', icon: 'cap', t: 'ЦРБС и ДРП', who: 'Организаторы программы: ЦРБС — проектный трек, ДРП — академический трек.', p: 'ЦРБС: методология проектного трека. ДРП: обучение, модули, сведения о прохождении.' },
    { key: 'it', icon: 'shield', t: 'ДИТ и ДОБ', who: 'Согласуют цифровые решения: ДИТ — реализуемость, ДОБ — обработку данных.', p: 'Любое цифровое решение — до начала разработки.' },
    { key: 'board', icon: 'award', red: true, t: 'Заказчик программы, комиссия по портфелю', who: 'Заказчик программы — ГД Подколзин А.С.; на защите присутствует как наблюдатель, в оценке не участвует. Комиссия утверждает портфель и его изменения.', p: 'Вопросы доходят до этого уровня по цепочке эскалации.' }
  ]
};
/*%%GLOSSARY%%*/
var IC = {
  userchk: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5 1.6 0 3 .5 4 1.4M15.5 17.5l2 2 4-4.5"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  compass: '<circle cx="12" cy="12" r="9.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  target: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 10 18.7l1-1"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 20 3M16 7l3 3M13.5 9.5l2.5 2.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19V4.5M8.5 7H16"/>',
  cap: '<path d="M2 9.5 12 5l10 4.5-10 4.5z"/><path d="M6 11.7V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.3M22 9.5V15"/>',
  shield: '<path d="M12 2.5 4 6v6c0 5 3.4 8.4 8 9.5 4.6-1.1 8-4.5 8-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14.5 7 21.5l5-3 5 3-1.5-7"/>',
  chev: '<path d="M6 9l6 6 6-6"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function norm(s) { return String(s).toLowerCase().replace(/ё/g, 'е'); }
function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }

function init(root, uid) {
  var R = DATA.roles, saved = null;
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-rl__lead">' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-bar"><div class="dbv-fld"><label for="' + uid + '-s">' + esc(DATA.label) + '</label><input type="search" id="' + uid + '-s" autocomplete="off"></div>' +
    '<div class="dbv-btns"><button type="button" class="dbv-lnk" data-reset hidden>' + esc(DATA.reset) + '</button><button type="button" class="dbv-lnk" data-all="1">' + esc(DATA.all) + '</button><button type="button" class="dbv-lnk" data-all="0">' + esc(DATA.none) + '</button></div></div>' +
    '<div class="dbv-cnt" aria-live="polite" data-cnt></div><div class="dbv-gr">' +
    R.map(function (r, i) {
      var id = uid + '-a' + i;
      return '<div class="dbv-card dbv-glass' + (r.red ? ' dbv-glass--accent' : '') + '" id="dbv-role-' + r.key + '" data-i="' + i + '" style="--i:' + i + '"><div class="dbv-card__h"><span class="dbv-ico">' + svg(r.icon) + '</span><h3 class="dbv-h3" tabindex="-1">' + esc(r.t) + '</h3></div>' +
        '<div class="dbv-card__w"><div class="dbv-card__lab">' + esc(DATA.who) + '</div><p class="dbv-card__p" data-gl>' + esc(r.who) + '</p></div>' +
        '<button type="button" class="dbv-q" aria-expanded="false" aria-controls="' + id + '"><span>' + esc(DATA.ask) + '</span>' + svg('chev') + '</button>' +
        '<div class="dbv-card__a" id="' + id + '"><div class="dbv-card__aw"><div class="dbv-card__ai" data-gl>' + (r.q ? '<ul class="dbv-list">' + r.q.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="dbv-card__p">' + esc(r.p) + '</p>') + '</div></div></div></div>';
    }).join('') + '</div><div class="dbv-emp" role="status" data-emp hidden>' + esc(DATA.empty) + '</div>';
  var gl = dbvGlossary(root);
  gl.apply(root);
  var cards = [].slice.call(root.querySelectorAll('.dbv-card')), inp = root.querySelector('input'), cnt = root.querySelector('[data-cnt]'), emp = root.querySelector('[data-emp]'), rs = root.querySelector('[data-reset]');
  var text = R.map(function (r) { return norm([r.t, r.who].concat(r.q || [r.p]).join(' ')); });
  function open(c, on) {
    var b = c.querySelector('.dbv-q');
    b.setAttribute('aria-expanded', on ? 'true' : 'false');
    c.querySelector('.dbv-card__a').classList.toggle('is-open', on);
    if (!on) gl.hide();
  }
  function isOpen(c) { return c.querySelector('.dbv-q').getAttribute('aria-expanded') === 'true'; }
  function search() {
    var q = norm(inp.value.trim()), n = 0;
    if (q && !saved) saved = cards.map(isOpen);
    cards.forEach(function (c, i) { var ok = !q || text[i].indexOf(q) > -1; c.hidden = !ok; if (ok) n++; if (q) open(c, ok); });
    if (!q && saved) { cards.forEach(function (c, i) { open(c, saved[i]); }); saved = null; }
    cnt.textContent = DATA.found + ' ' + n + ' ' + DATA.of + ' ' + R.length;
    emp.hidden = n > 0; rs.hidden = !q;
  }
  inp.addEventListener('input', search);
  rs.addEventListener('click', function () { inp.value = ''; search(); inp.focus(); });
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-q');
    if (b) { var c = b.closest('.dbv-card'); open(c, !isOpen(c)); return; }
    var a = e.target.closest && e.target.closest('[data-all]');
    if (a) cards.forEach(function (c) { if (!c.hidden) open(c, a.getAttribute('data-all') === '1'); });
  });
  document.addEventListener('dbv:openrole', function (e) {
    var k = e.detail && e.detail.key, c = root.querySelector('#dbv-role-' + k);
    if (!c) return;
    if (c.hidden) { inp.value = ''; search(); }
    open(c, true);
    var h = c.querySelector('h3'); h.focus({ preventScroll: true });
    c.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  });
  search();
}
[].forEach.call(document.querySelectorAll('.dbv-rl'), function (r, n) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r, 'dbv-rl' + n);
});
