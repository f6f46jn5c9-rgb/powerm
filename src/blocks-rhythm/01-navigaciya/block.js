/* Страница, на которой стоит блок, и заголовок страницы. Меняйте только текст между кавычками. */
var CURRENT = 'rhythm';
var DATA = {
  titleStart: 'Рабочий ритм и ',
  titleAccent: 'особые случаи',
  lead: 'Как устроены неделя и месяц проекта, что должно быть в пятничном отчёте, как действовать при блокираторе и что делать в особых случаях.'
};
function init(root) {
  root.innerHTML = '<nav class="dbv-nav__bar"></nav><div class="dbv-nav__h"><h2 class="dbv-h2">' + esc(DATA.titleStart) + '<span class="dbv-acc-w">' + esc(DATA.titleAccent) + '</span></h2>' +
    '<p class="dbv-body dbv-nav__lead" data-gl>' + esc(DATA.lead) + '</p></div>';
  dbvNav(root.querySelector('.dbv-nav__bar'), CURRENT);
  dbvGlossary(root).apply(root);
}
[].forEach.call(document.querySelectorAll('.dbv-nav'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
