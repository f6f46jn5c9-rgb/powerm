/* Здесь правятся карточки оценки участников и три пункта «Важно знать». Меняйте только текст между кавычками. */
var DATA = {
  title: 'Оценка участников',
  cards: [
    { t: 'Вовлечённость', ic: 'pulse', per: 'Каждый месяц', p1: 'Оценивает РП:', scale: [['3 — высокая', '#3DAA5C'], ['2 — стандартная', '#F2B01E'], ['1 — не проявляет активности', '#E01828']], p2: 'Это зелёная, жёлтая и красная зоны.' },
    { t: 'Компетенции', ic: 'badge', per: 'Дважды за цикл (в начале и в конце)', p1: 'Оценивает РП по шкале 0–4:', chips: ['надёжность', 'клиентоориентированность', 'аналитика', 'коммуникация', 'ответственность', 'адаптивность'] },
    { t: 'Оценка руководителя проекта', ic: 'user', per: 'Дважды: на экваторе цикла и по завершении', p1: 'Оценивает команда. Десять утверждений, шкала 1–5.' }
  ],
  kH: 'Важно знать',
  items: [
    { t: 'Пересдача не предусмотрена', p: 'Пересдача заключительного отчёта и повторная защита в рамках цикла не предусмотрены. Статус «Не принят» или оценка жюри ниже 3,0 фиксируется в ПЗ как факт завершения цикла. Дальше решает ЛСП: вывод в другой контур улучшений, закрытие проекта или новые требования на следующий цикл.' },
    { t: 'Данные об участии фиксируются и доступны руководству', p: 'Форма оценки участников (в том числе факт и основание выхода из программы) доступна руководителю и заказчику программы. Эта информация используется при последующих кадровых решениях — не только заказчиком программы, но и другими руководителями, которым открыт доступ к форме.' },
    { t: 'Нагрузка', p: 'Если участие в проекте затруднено текущей работой, участник обращается к своему руководителю (обращение рассматривается в течение 5 рабочих дней) и информирует РП.' }
  ]
};
/*%%GLOSSARY%%*/
var IC = {
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
  badge: '<circle cx="12" cy="9" r="5.5"/><path d="M9.5 9l1.8 1.8L14.7 7.5M8.5 14l-1.5 6.5 5-2.5 5 2.5-1.5-6.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.5v.2"/>',
  chev: '<path d="M6 9.5l6 6 6-6"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }

function init(root, uid) {
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><div class="dbv-pg">' + DATA.cards.map(function (c, i) {
    return '<div class="dbv-glass dbv-pc" style="--i:' + i + '"><div class="dbv-pc__h"><span class="dbv-ico">' + svg(c.ic) + '</span><h3 class="dbv-h3">' + esc(c.t) + '</h3></div><span class="dbv-per">' + esc(c.per) + '</span>' +
      '<p class="dbv-body" data-gl>' + esc(c.p1) + '</p>' +
      (c.scale ? '<div class="dbv-cs">' + c.scale.map(function (s) { return '<span class="dbv-cs__c"><span class="dbv-dot" style="background:' + s[1] + '"></span>' + esc(s[0]) + '</span>'; }).join('') + '</div>' : '') +
      (c.chips ? '<div class="dbv-cs">' + c.chips.map(function (s) { return '<span class="dbv-cs__c">' + esc(s) + '</span>'; }).join('') + '</div>' : '') +
      (c.p2 ? '<p class="dbv-body">' + esc(c.p2) + '</p>' : '') + '</div>';
  }).join('') + '</div>' +
    '<h2 class="dbv-h2 dbv-ppl__h2">' + esc(DATA.kH) + '</h2><div class="dbv-kn"><span class="dbv-kn__i">' + svg('info') + '</span><div class="dbv-kn__l">' + DATA.items.map(function (it, i) {
      var id = uid + '-p' + i;
      return '<div class="dbv-k is-open"><button type="button" class="dbv-k__b" aria-expanded="true" aria-controls="' + id + '"><span class="dbv-k__t">' + esc(it.t) + '</span><span class="dbv-k__c">' + svg('chev') + '</span></button>' +
        '<div class="dbv-k__p is-open" id="' + id + '"><div class="dbv-k__w"><p class="dbv-k__x" data-gl>' + esc(it.p) + '</p></div></div></div>';
    }).join('') + '</div></div>';
  var gl = dbvGlossary(root);
  gl.apply(root);
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-k__b');
    if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true', c = b.parentNode;
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    c.classList.toggle('is-open', open);
    c.querySelector('.dbv-k__p').classList.toggle('is-open', open);
    if (!open) gl.hide();
  });
}
[].forEach.call(document.querySelectorAll('.dbv-ppl'), function (r, n) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r, 'dbv-ppl' + n);
});
