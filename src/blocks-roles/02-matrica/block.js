/* Здесь правятся действия матрицы (a — название; d, x, g, i — роли в столбцах «Решает и отвечает», «Выполняет», «Согласует, консультирует», «Получает информацию»; у роли может быть пометка n), подписи КТ и названия ролей. Меняйте только текст между кавычками. */
var DATA = {
  title: 'Матрица ролей',
  ktH: 'Кто принимает решение по контрольной точке',
  ktCap: 'Решение по каждой КТ принимает ЛПР.',
  kt: [['КТ1', 'Комиссия по портфелю (председатель — ГД)'], ['КТ2', 'Координатор проектного трека'], ['КТ3', 'Заказчик проекта'], ['КТ4', 'ЛСП по заключению координаторов'], ['КТ5', 'Заказчик проекта с учётом оценки жюри']],
  pickL: 'Выберите свою роль',
  roles: { customer: 'Заказчик проекта', rp: 'РП', team: 'Команда', coord: 'Координатор', lsp: 'ЛСП', owner: 'Владелец результата', dit: 'ДИТ и ДОБ' },
  chips: [['all', 'Все роли'], ['customer', 'Заказчик проекта'], ['rp', 'РП'], ['team', 'Член команды'], ['coord', 'Координатор'], ['lsp', 'ЛСП'], ['owner', 'Владелец результата'], ['dit', 'ДИТ и ДОБ']],
  cats: [
    { c: 'd', t: 'Решает и отвечает', s: 'решает', l: 'Решает и отвечает' },
    { c: 'x', t: 'Выполняет', s: 'выполняет', l: 'Выполняет' },
    { c: 'a', t: 'Согласует, консультирует', s: 'согласует', l: 'Согласует, консультирует' },
    { c: 'i', t: 'Получает информацию', s: 'получает информацию', l: 'Получает информацию' }
  ],
  rows: [
    { a: 'Формирование требований', d: [['customer']], x: [['rp']], g: [['lsp'], ['coord'], ['team']], i: [] },
    { a: 'Замер исходных значений', d: [['rp']], x: [['rp']], g: [['coord', 'проверяет'], ['team']], i: [['customer']] },
    { a: 'Ведение карточки и отчётов в ПЗ', d: [['rp']], x: [['rp']], g: [['coord', 'проверяет'], ['team']], i: [['customer'], ['lsp']] },
    { a: 'Создание активов', d: [['rp']], x: [['team']], g: [], i: [['customer'], ['owner']] },
    { a: 'Приёмка актива (КТ3)', d: [['customer']], x: [['customer']], g: [['rp']], i: [['team'], ['coord']] },
    { a: 'Назначение владельца результата', d: [['customer']], x: [['customer']], g: [['rp'], ['owner', 'даёт согласие']], i: [['coord'], ['lsp']] },
    { a: 'Изменение требований (тема, цель, КР, границы, даты)', d: [['customer'], ['lsp']], x: [['rp']], g: [], i: [['team'], ['coord']] },
    { a: 'Согласование цифрового решения', d: [['lsp']], x: [['rp']], g: [['customer'], ['team'], ['dit']], i: [['coord']] },
    { a: 'Допуск проекта к защите (КТ4)', d: [['lsp']], x: [['rp'], ['coord']], g: [['customer']], i: [['team'], ['owner']] },
    { a: 'Приёмка результата проекта (КТ5)', d: [['customer']], x: [['rp']], g: [['lsp', 'оценка жюри']], i: [['team'], ['coord'], ['owner']] },
    { a: 'Применение результата после проекта', d: [['owner']], x: [['owner']], g: [], i: [['customer'], ['lsp']] },
    { a: 'Оценка вовлечённости и компетенций команды', d: [['rp']], x: [['rp']], g: [['team']], i: [['coord']] }
  ],
  tableCap: 'Матрица ролей по основным действиям проектного трека',
  col0: 'Действие',
  joint: 'совместно',
  none: '—',
  sum: { none: 'Выберите роль, чтобы увидеть, какие действия её касаются.', pre: 'Для роли', only: 'Показывать только мои действия', more: 'Подробнее о роли' },
  jump: { customer: 'customer', rp: 'rp', coord: 'coord', lsp: 'lsp', owner: 'owner', dit: 'it' },
  note: 'Если в столбце «Решает и отвечает» указано несколько ролей, решение принимается совместно.'
};
/*%%GLOSSARY%%*/
var IC = {
  d: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>',
  x: '<circle cx="12" cy="12" r="8.5"/>',
  a: '<circle cx="12" cy="12" r="8"/>',
  i: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.5v.2"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function ic(c) { return '<svg class="dbv-svg dbv-ic dbv-ic--' + c + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[c] + '</svg>'; }
function init(root) {
  var R = DATA.roles, cats = DATA.cats, sel = 'all', only = false, S = DATA.sum, keys = ['d', 'x', 'g', 'i'];
  function chip(cat, r) { return '<span class="dbv-rc dbv-rc--' + cat + '" data-k="' + r[0] + '">' + ic(cat) + '<span>' + esc(R[r[0]]) + (r[1] ? ' (' + esc(r[1]) + ')' : '') + '</span></span>'; }
  var body = DATA.rows.map(function (w) {
    return '<tr><th scope="row">' + esc(w.a) + (w.d.length > 1 ? '<span class="dbv-tag">' + esc(DATA.joint) + '</span>' : '') + '</th>' +
      keys.map(function (k, c) { return '<td data-label="' + esc(cats[c].l) + '">' + (w[k].length ? '<div class="dbv-cell">' + w[k].map(function (r) { return chip(cats[c].c, r); }).join('') + '</div>' : '<span class="dbv-none">' + esc(DATA.none) + '</span>') + '</td>'; }).join('') + '</tr>';
  }).join('');
  root.innerHTML = '<h2 class="dbv-h2" id="dbv-matrix">' + esc(DATA.title) + '</h2>' +
    '<h3 class="dbv-h3 dbv-mx__h3" style="margin-top:6px !important">' + esc(DATA.ktH) + '</h3><p class="dbv-small dbv-mx__cap" data-gl>' + esc(DATA.ktCap) + '</p>' +
    '<div class="dbv-kt" role="list">' + DATA.kt.map(function (k) { return '<div class="dbv-kt__i" role="listitem"><span class="dbv-kt__d"><i aria-hidden="true"></i><b>' + esc(k[0]) + '</b></span><span class="dbv-kt__t" data-gl>' + esc(k[1]) + '</span></div>'; }).join('') + '</div>' +
    '<div class="dbv-pick"><p class="dbv-pick__l" id="dbv-mx-pl">' + esc(DATA.pickL) + '</p><div class="dbv-pick__g" role="radiogroup" aria-labelledby="dbv-mx-pl">' +
    DATA.chips.map(function (c, i) { return '<button type="button" class="dbv-rch" role="radio" data-k="' + c[0] + '" aria-checked="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? '-1' : '0') + '">' + esc(c[1]) + '</button>'; }).join('') + '</div></div>' +
    '<div class="dbv-leg" role="list" aria-label="Легенда">' + cats.map(function (c) { return '<span class="dbv-leg__i" role="listitem">' + ic(c.c) + esc(c.t) + '</span>'; }).join('') + '</div>' +
    '<div class="dbv-sum"><div class="dbv-sum__t" aria-live="polite" data-sum></div><div class="dbv-sum__c" data-ctl hidden><label class="dbv-only"><input type="checkbox" data-only>' + esc(S.only) + '</label><button type="button" class="dbv-lnk" data-more hidden>' + esc(S.more) + ' ↓</button></div></div>' +
    '<table class="dbv-t" data-gl><caption class="dbv-sr">' + esc(DATA.tableCap) + '</caption><thead><tr><th scope="col">' + esc(DATA.col0) + '</th>' + cats.map(function (c) { return '<th scope="col">' + esc(c.t) + '</th>'; }).join('') + '</tr></thead><tbody>' + body + '</tbody></table>' +
    '<div class="dbv-note" role="note"><svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC.info + '</svg><p class="dbv-body" data-gl>' + esc(DATA.note) + '</p></div>';
  dbvGlossary(root).apply(root);
  var chips = [].slice.call(root.querySelectorAll('.dbv-rch')), rows = [].slice.call(root.querySelectorAll('tbody tr')), sumEl = root.querySelector('[data-sum]'), ctl = root.querySelector('[data-ctl]'), more = root.querySelector('[data-more]'), chk = root.querySelector('[data-only]');
  function label(k) { return DATA.chips.filter(function (c) { return c[0] === k; })[0][1]; }
  function paint() {
    var cnt = [0, 0, 0, 0];
    rows.forEach(function (tr, ri) {
      var has = false;
      [].forEach.call(tr.querySelectorAll('.dbv-rc'), function (c) {
        var on = sel !== 'all' && c.getAttribute('data-k') === sel;
        c.classList.toggle('is-sel', on);
        if (on) { has = true; cnt[[].indexOf.call(tr.children, c.closest('td')) - 1]++; }
      });
      tr.classList.toggle('is-dim', sel !== 'all' && !has);
      tr.hidden = sel !== 'all' && only && !has;
    });
    chips.forEach(function (c) { var on = c.getAttribute('data-k') === sel; c.setAttribute('aria-checked', on ? 'true' : 'false'); c.tabIndex = on ? 0 : -1; });
    ctl.hidden = sel === 'all';
    sumEl.classList.toggle('is-on', sel !== 'all');
    if (sel === 'all') sumEl.textContent = S.none;
    else sumEl.textContent = S.pre + ' «' + label(sel) + '»: ' + cats.map(function (c, i) { return c.s + ' — ' + cnt[i]; }).join(', ');
    var jk = DATA.jump[sel];
    more.hidden = !(sel !== 'all' && jk && document.getElementById('dbv-role-' + jk));
    more.setAttribute('data-key', jk || '');
  }
  function pick(k, focus) { sel = k; if (k === 'all') { only = false; chk.checked = false; } paint(); if (focus) chips.filter(function (c) { return c.getAttribute('data-k') === k; })[0].focus(); }
  root.querySelector('.dbv-pick__g').addEventListener('click', function (e) { var c = e.target.closest && e.target.closest('.dbv-rch'); if (c) pick(c.getAttribute('data-k')); });
  root.querySelector('.dbv-pick__g').addEventListener('keydown', function (e) {
    var k = e.key, n = chips.length, i = chips.map(function (c) { return c.getAttribute('data-k'); }).indexOf(sel), to = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = (i + 1) % n; else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (i + n - 1) % n; else if (k === 'Home') to = 0; else if (k === 'End') to = n - 1;
    if (to < 0) return;
    e.preventDefault(); pick(chips[to].getAttribute('data-k'), true);
  });
  chk.addEventListener('change', function () { only = chk.checked; paint(); });
  more.addEventListener('click', function () { document.dispatchEvent(new CustomEvent('dbv:openrole', { detail: { key: more.getAttribute('data-key') } })); });
  paint();
}
function start() {
  [].forEach.call(document.querySelectorAll('.dbv-mx'), function (r) {
    if (r.getAttribute('data-dbv-init')) return;
    r.setAttribute('data-dbv-init', '1');
    init(r);
  });
}
/* ждём конец разбора страницы: карточки ролей (блок 03) лежат ниже в документе */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
