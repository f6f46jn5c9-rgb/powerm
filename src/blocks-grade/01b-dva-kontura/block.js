/* Здесь правятся тексты ленты «Две части оценки»: метка (lab), заголовок (t), подпись (s) и пункты (items) каждой из трёх зон. Меняйте только текст между кавычками. */
var DATA = {
  title: 'Две части оценки',
  zones: [
    { lab: 'Во время программы', t: 'Динамичная оценка', s: 'Регулярная оценка по ходу цикла: меняется вместе с проектом.',
      items: ['Светофор проектов — ежемесячно, по данным ПЗ', 'Оценка участников — вовлечённость каждый месяц, компетенции дважды за цикл'] },
    { lab: 'Перед финальной защитой', t: 'Итоговая оценка результата', s: 'Заказчик оценивает заключительный отчёт.',
      items: ['Приёмка результата заказчиком — семь критериев, баллы из 100'] },
    { t: 'Финальная защита', s: 'Перед жюри, 10 минут' }
  ]
};
/*%%GLOSSARY%%*/
var ARROW = '<path d="M5 12h14M13 6l6 6-6 6"/>';
var DIA = '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>';
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(p) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>'; }
function init(root) {
  var Z = DATA.zones;
  function zone(z, i) {
    if (i === 2) return '<div class="dbv-fin" style="--i:2"><span class="dbv-fin__d" aria-hidden="true">' + svg(DIA) + '</span><h3 class="dbv-h3">' + esc(z.t) + '</h3><p class="dbv-fin__s" data-gl>' + esc(z.s) + '</p></div>';
    return '<div class="dbv-glass dbv-two__z' + (i === 1 ? ' dbv-glass--accent' : '') + '" style="--i:' + i + '"><span class="dbv-two__lab">' + esc(z.lab) + '</span><h3 class="dbv-h3">' + esc(z.t) + '</h3>' +
      '<p class="dbv-body" data-gl>' + esc(z.s) + '</p><ul class="dbv-list">' + z.items.map(function (x) { return '<li data-gl>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
  }
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><div class="dbv-two__row">' +
    zone(Z[0], 0) + '<span class="dbv-two__a" aria-hidden="true">' + svg(ARROW) + '</span>' + zone(Z[1], 1) + '<span class="dbv-two__a" aria-hidden="true">' + svg(ARROW) + '</span>' + zone(Z[2], 2) + '</div>';
  dbvGlossary(root).apply(root);
}
[].forEach.call(document.querySelectorAll('.dbv-two'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
