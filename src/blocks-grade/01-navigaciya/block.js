/* Страница, на которой стоит блок, заголовок, вводная строка и три точки линии-шкалы. Меняйте только текст между кавычками. */
var CURRENT = 'grade';
var DATA = {
  titleStart: 'Оценка и ',
  titleAccent: 'защита',
  lead: 'Оценка проводится по ходу цикла (светофор проектов, оценки участников) и по его завершении (приёмка и защита).',
  scale: [
    { t: 'Во время программы — динамичная оценка', s: 'светофор проектов, ежемесячно; оценка участников' },
    { t: 'Перед финальной защитой — итоговая оценка', s: 'приёмка результата заказчиком' },
    { t: 'Финальная защита', kt: true }
  ]
};
function init(root) {
  root.innerHTML = '<nav class="dbv-nav__bar"></nav><div class="dbv-nav__h"><h2 class="dbv-h2">' + esc(DATA.titleStart) + '<span class="dbv-acc-w">' + esc(DATA.titleAccent) + '</span></h2>' +
    '<p class="dbv-body dbv-nav__lead">' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-sc" role="list" aria-label="Две части оценки">' + DATA.scale.map(function (p, i) {
      return '<div class="dbv-sc__i" role="listitem"><div class="dbv-sc__m" aria-hidden="true">' + (p.kt ? dia() : '<span class="dbv-sc__d"></span><span class="dbv-sc__ln"></span>') + (p.kt ? '' : '') + '</div>' +
        '<span class="dbv-sc__t">' + esc(p.t) + '</span>' + (p.s ? '<span class="dbv-sc__s">' + esc(p.s) + '</span>' : '') + '</div>';
    }).join('') + '</div></div>';
  dbvNav(root.querySelector('.dbv-nav__bar'), CURRENT);
}
[].forEach.call(document.querySelectorAll('.dbv-nav'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
