/* Страница, на которой стоит блок, и заголовок страницы. Меняйте только текст между кавычками. */
var CURRENT = 'assets';
var DATA = {
  titleStart: 'Активы, КР и ',
  titleAccent: 'частые ошибки',
  lead: 'Что считать результатом проекта, как его сформулировать и проверить, и каких ошибок команды совершают чаще всего.'
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
