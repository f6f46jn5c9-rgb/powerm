/* Здесь правятся состав отчёта, примеры «не надо / надо» (bad и ok), определение блокиратора, ступени эскалации и красные плашки. Меняйте только текст между кавычками. */
var DATA = {
  title: 'Пятничный отчёт',
  lead: 'Отчёт содержит:',
  items: [
    { icon: 'target', t: 'достигнутые КР и созданные активы' },
    { icon: 'cal', t: 'отклонения от плановых дат с причинами' },
    { icon: 'stop', t: 'блокираторы' },
    { icon: 'send', t: 'потребность в решениях и ресурсах с указанием адресата' }
  ],
  sw: { label: 'Вариант записи в отчёте', bad: 'Так не надо', ok: 'Так надо', badH: 'Некорректная запись', okH: 'Корректная запись' },
  pairs: [
    { bad: '«Продвигаемся», «Ведётся работа»', ok: '«Разработан шаблон отчёта. Проведено интервью с заказчиком. На следующей неделе — пилот на участке 2»' },
    { bad: 'Блокиратор: «Низкая вовлечённость команды»', ok: 'Блокиратор: «Нет доступа к данным в SAP — без них не рассчитать исходное значение. Прошу заказчика решить вопрос до 20.05»' },
    { bad: 'Повторение одного и того же текста из недели в неделю.', ok: 'В каждом отчёте отражено изменение: что сделано, что мешает, что требуется от руководства.' }
  ],
  blocker: {
    h: 'Блокиратор: порядок эскалации',
    def: 'Блокиратор — обстоятельство, которое мешает выполнить мероприятие и которое команда не может устранить сама, в том числе нехватка людей и недоступность участника.',
    rules: ['РП сообщает координатору о блокираторе в течение 2 рабочих дней с момента выявления и фиксирует его в ПЗ', 'На каждом уровне на решение — не более 5 рабочих дней'],
    steps: [
      { t: 'РП', c: 'сообщить за 2 рабочих дня' },
      { t: 'Координатор', c: 'до 5 рабочих дней на решение' },
      { t: 'Организаторы программы', c: 'до 5 рабочих дней на решение', esc: true },
      { t: 'Заказчик проекта', c: 'до 5 рабочих дней на решение', esc: true },
      { t: 'ЛСП', c: 'до 5 рабочих дней на решение', esc: true }
    ],
    warn: 'О проблемах, известных заранее (нехватка ресурсов, выбытие участников, недоступность данных), сообщается в момент выявления, а не на демонстрационном дне.'
  }
};
/*%%GLOSSARY%%*/
var IC = {
  target: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.4"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 10h18M8 2.5v4M16 2.5v4M12 13v3.5M12 19v.2"/>',
  stop: '<path d="M8 2.5h8L21.5 8v8L16 21.5H8L2.5 16V8z"/><path d="M12 8v5M12 16v.5"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chk: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  warn: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 8v5M12 16v.5"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.7-4.2 3.6-6.5 7.5-6.5s6.8 2.3 7.5 6.5"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function init(root) {
  var S = DATA.sw, B = DATA.blocker, v = 'bad';
  function card(kind, t, i) { return '<div class="dbv-cd dbv-cd--' + kind + '" style="--i:' + i + '"><div class="dbv-cd__h"><span class="dbv-cd__i" aria-hidden="true">' + svg(kind === 'bad' ? 'x' : 'chk') + '</span><span>' + esc(kind === 'bad' ? S.badH : S.okH) + '</span></div><p class="dbv-cd__t" data-gl>' + esc(t) + '</p></div>'; }
  root.innerHTML = '<h2 class="dbv-h2" id="dbv-report">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-rep__lead">' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-ci__g">' + DATA.items.map(function (c, i) { return '<div class="dbv-ci dbv-glass" style="--i:' + i + '"><span class="dbv-ico">' + svg(c.icon) + '</span><span class="dbv-ci__t" data-gl>' + esc(c.t) + '</span></div>'; }).join('') + '</div>' +
    '<div class="dbv-cmp" data-v="bad"><div class="dbv-sw" role="radiogroup" aria-label="' + esc(S.label) + '"><button type="button" class="dbv-sw__b" role="radio" aria-checked="true" data-v="bad" tabindex="0">' + esc(S.bad) + '</button><button type="button" class="dbv-sw__b" role="radio" aria-checked="false" data-v="ok" tabindex="-1">' + esc(S.ok) + '</button></div>' +
    DATA.pairs.map(function (p, i) { return '<div class="dbv-cmp__r">' + card('bad', p.bad, i) + card('ok', p.ok, i) + '</div>'; }).join('') + '</div>' +
    '<h3 class="dbv-h3 dbv-rep__h3">' + esc(B.h) + '</h3>' +
    '<div class="dbv-def dbv-glass"><span class="dbv-ico">' + svg('warn') + '</span><p class="dbv-body" data-gl>' + esc(B.def) + '</p></div>' +
    '<div class="dbv-rules">' + [['clock', B.rules[0]], ['clock', B.rules[1]]].map(function (r) { return '<span class="dbv-chip">' + svg(r[0]) + '<span data-gl>' + esc(r[1]) + '</span></span>'; }).join('') + '</div>' +
    '<ol class="dbv-lad" aria-label="Порядок эскалации">' + B.steps.map(function (s, i) { return '<li class="dbv-st' + (s.esc ? ' dbv-st--esc' : '') + '" style="--n:' + i + '"><span class="dbv-st__n" aria-hidden="true">' + (i + 1) + '</span><span class="dbv-st__t" data-gl>' + esc(s.t) + '</span><span class="dbv-st__c">' + esc(s.c) + '</span>' + (i < B.steps.length - 1 ? '<span class="dbv-st__a" aria-hidden="true">' + svg('down') + '</span>' : '') + '</li>'; }).join('') + '</ol>' +
    '<div class="dbv-warn" role="note">' + svg('warn') + '<p class="dbv-body" data-gl>' + esc(B.warn) + '</p></div>';
  dbvGlossary(root).apply(root);
  var cmp = root.querySelector('.dbv-cmp'), bs = [].slice.call(root.querySelectorAll('.dbv-sw__b'));
  function set(x, focus) {
    v = x; cmp.setAttribute('data-v', x);
    bs.forEach(function (b) { var on = b.getAttribute('data-v') === x; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
  }
  bs.forEach(function (b) {
    b.addEventListener('click', function () { set(b.getAttribute('data-v')); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); set(v === 'bad' ? 'ok' : 'bad', true); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); set(b.getAttribute('data-v')); }
    });
  });
}
[].forEach.call(document.querySelectorAll('.dbv-rep'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
