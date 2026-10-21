/* Здесь правятся действия матрицы (a — название; d, x, g, i — роли в столбцах «Решает и отвечает», «Выполняет», «Согласует, консультирует», «Получает информацию»; у роли может быть пометка), названия ролей и переходы к справочнику ролей (jump). Меняйте только текст между кавычками. */
var DATA = {
  title: 'Матрица ролей',
  pickL: 'Выберите свою роль',
  roles: { customer: 'Заказчик проекта', rp: 'РП', team: 'Команда', coord: 'Координатор', lsp: 'ЛСП', owner: 'Владелец результата', dit: 'ДИТ и ДОБ' },
  chips: [['all', 'Все роли'], ['customer', 'Заказчик проекта'], ['rp', 'РП'], ['team', 'Член команды'], ['coord', 'Координатор'], ['lsp', 'ЛСП'], ['owner', 'Владелец результата'], ['dit', 'ДИТ и ДОБ']],
  cats: [
    { c: 'd', t: 'Решает и отвечает', s: 'решает' },
    { c: 'x', t: 'Выполняет', s: 'выполняет' },
    { c: 'a', t: 'Согласует, консультирует', s: 'согласует' },
    { c: 'i', t: 'Получает информацию', s: 'получает информацию' }
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
  col0: 'Действие',
  joint: 'совместно',
  none: '—',
  sum: { none: 'Выберите роль, чтобы увидеть, какие действия её касаются.', pre: 'Для роли', only: 'Только мои действия', more: 'Подробнее о роли' },
  jump: { customer: 'customer', rp: 'rp', coord: 'coord', lsp: 'lsp', owner: 'owner', dit: 'it' },
  note: 'Если в столбце «Решает и отвечает» указано несколько ролей, решение принимается совместно.'
};
var MK = {
  d: '<svg class="dbv-svg dbv-mk dbv-mk--d" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 22 12 12 22 2 12z"/></svg>',
  x: '<svg class="dbv-svg dbv-mk dbv-mk--x" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/></svg>',
  a: '<svg class="dbv-svg dbv-mk dbv-mk--a" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8"/></svg>',
  g: '<svg class="dbv-svg dbv-mk dbv-mk--a" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8"/></svg>',
  i: '<svg class="dbv-svg dbv-mk dbv-mk--i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>'
};
function init(root) {
  var R = DATA.roles, cats = DATA.cats, sel = 'all', only = false, S = DATA.sum, keys = ['d', 'x', 'g', 'i'];
  var head = [DATA.col0].concat(cats.map(function (c) { return c.t; }));
  var rows = DATA.rows.map(function (w) {
    var first = esc(w.a) + (w.d.length > 1 ? '<span class="dbv-joint">' + esc(DATA.joint) + '</span>' : '');
    return [first].concat(keys.map(function (k, c) {
      return w[k].length ? w[k].map(function (r) {
        return '<span class="dbv-r" data-k="' + r[0] + '">' + MK[k] + esc(R[r[0]]) + (r[1] ? ' (' + esc(r[1]) + ')' : '') + '</span>';
      }).join('') : '<span class="dbv-no">' + esc(DATA.none) + '</span>';
    }));
  });
  root.innerHTML = '<h2 class="dbv-h2" id="dbv-matrix">' + esc(DATA.title) + '</h2>' +
    '<div class="dbv-stack">' +
    '<div><p class="dbv-small dbv-pick__l" id="dbv-mx-pl">' + esc(DATA.pickL) + '</p><div class="dbv-ut" role="radiogroup" aria-labelledby="dbv-mx-pl" data-pick>' +
    DATA.chips.map(function (c, i) { return '<button type="button" role="radio" data-k="' + c[0] + '" aria-checked="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? '-1' : '0') + '">' + esc(c[1]) + '</button>'; }).join('') + '</div></div>' +
    '<div class="dbv-leg" role="list" aria-label="Обозначения">' + cats.map(function (c) { return '<span class="dbv-leg__i" role="listitem">' + MK[c.c] + esc(c.t) + '</span>'; }).join('') + '</div>' +
    '<div class="dbv-sum__row"><div class="dbv-sum__t" aria-live="polite" data-sum></div><label class="dbv-only" data-ctl hidden><input type="checkbox" data-only>' + esc(S.only) + '</label><button type="button" class="dbv-btn" data-more hidden>' + esc(S.more) + ico('down') + '</button></div>' +
    tbl(head, rows, { first: 'th', gl: 1, cap: DATA.title, cls: ['dbv-wa', '', '', '', ''] }) +
    '<p class="dbv-small" data-gl>' + esc(DATA.note) + '</p></div>';
  dbvGlossary(root).apply(root);
  var chips = [].slice.call(root.querySelectorAll('[data-pick] button')), trs = [].slice.call(root.querySelectorAll('tbody tr')), sumEl = root.querySelector('[data-sum]'), ctl = root.querySelector('[data-ctl]'), more = root.querySelector('[data-more]'), chk = root.querySelector('[data-only]');
  function label(k) { return DATA.chips.filter(function (c) { return c[0] === k; })[0][1]; }
  function paint() {
    var cnt = [0, 0, 0, 0];
    trs.forEach(function (tr) {
      var has = false;
      [].forEach.call(tr.querySelectorAll('.dbv-r'), function (c) {
        var on = sel !== 'all' && c.getAttribute('data-k') === sel;
        c.classList.toggle('is-sel', on);
        if (on) { has = true; cnt[[].indexOf.call(tr.children, c.closest('td')) - 1]++; }
      });
      tr.classList.toggle('is-on', has);
      tr.hidden = sel !== 'all' && only && !has;
    });
    chips.forEach(function (c) { var on = c.getAttribute('data-k') === sel; c.setAttribute('aria-checked', on ? 'true' : 'false'); c.tabIndex = on ? 0 : -1; });
    ctl.hidden = sel === 'all';
    sumEl.classList.toggle('is-on', sel !== 'all');
    sumEl.textContent = sel === 'all' ? S.none : S.pre + ' «' + label(sel) + '»: ' + cats.map(function (c, i) { return c.s + ' — ' + cnt[i]; }).join(', ');
    var jk = DATA.jump[sel];
    more.hidden = !(sel !== 'all' && jk && document.getElementById('dbv-role-' + jk));
    more.setAttribute('data-key', jk || '');
  }
  function pick(k, focus) { sel = k; if (k === 'all') { only = false; chk.checked = false; } paint(); if (focus) chips.filter(function (c) { return c.getAttribute('data-k') === k; })[0].focus(); }
  var grp = root.querySelector('[data-pick]');
  grp.addEventListener('click', function (e) { var c = e.target.closest && e.target.closest('button'); if (c) pick(c.getAttribute('data-k')); });
  grp.addEventListener('keydown', function (e) {
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
/* ждём конец разбора страницы: справочник ролей (блок 03) лежит ниже в документе */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
