/* Страница, на которой стоит блок, и заголовок страницы. Меняйте только текст между кавычками. */
var CURRENT = 'stages';
var DATA = {
  titleStart: 'Этапы и ',
  titleAccent: 'контрольные точки',
  lead: 'По каждой контрольной точке (КТ) приведены состав работ, результат этапа, лицо, принимающее решение (ЛПР), срок и чек-лист готовности. Если КТ не пройдена, проект возвращается на доработку: порядок описан на странице «Рабочий ритм и особые случаи».'
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
