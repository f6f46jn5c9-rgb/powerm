/* Страница, на которой стоит блок. На других дочерних страницах меняется только CURRENT (stages, rhythm, assets, roles, grade), а также заголовок и вводный текст в DATA. */
var CURRENT = 'grade';
/* Заголовок и вводный абзац. Меняйте только текст между кавычками. */
var DATA = {
  titleStart: 'Оценка и ',
  titleAccent: 'защита',
  lead: 'Оценка проводится по ходу цикла (светофор проектов, оценки участников) и по его завершении (приёмка и защита).'
};
/*%%PAGES%%*/
/*%%GLOSSARY%%*/
/*%%NAV%%*/
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function init(root) {
  root.innerHTML = '<div class="dbv-nav__bar"></div>' +
    '<div class="dbv-nav__head"><div class="dbv-nav__clip" aria-hidden="true"><svg class="dbv-nav__orb" viewBox="0 0 240 180" preserveAspectRatio="xMaxYMin meet" focusable="false">' +
    '<ellipse cx="150" cy="90" rx="118" ry="44" transform="rotate(-24 150 90)" fill="none" stroke="#007890" stroke-width="1.5" opacity=".35"/>' +
    '<ellipse cx="160" cy="96" rx="96" ry="34" transform="rotate(18 160 96)" fill="none" stroke="#E01828" stroke-width="1.5" opacity=".3"/></svg></div>' +
    '<div class="dbv-nav__txt"><h2 class="dbv-h2 dbv-nav__h2">' + esc(DATA.titleStart) + '<span class="dbv-nav__acc">' + esc(DATA.titleAccent) + '</span></h2>' +
    '<p class="dbv-body dbv-nav__lead" data-gl>' + esc(DATA.lead) + '</p></div></div>';
  dbvNav(root.querySelector('.dbv-nav__bar'), CURRENT);
  dbvGlossary(root).apply(root);
}
[].forEach.call(document.querySelectorAll('.dbv-nav'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
