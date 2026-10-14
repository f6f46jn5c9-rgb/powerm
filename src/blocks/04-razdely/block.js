/* Здесь правятся подписи плиток (hint). Названия и адреса страниц берутся из общего файла src/core/dbv-pages.js; пока url пустой, плитка показывается с меткой «Скоро» и не является ссылкой. variant не трогайте. */
var DATA = {
  title: 'Выберите раздел',
  soon: 'Скоро'
};
/*%%PAGES%%*/
var PAGES = {
  stages: { hint: 'Что делать на каждом этапе, чек-листы готовности и первые 30 дней', variant: 'accent' },
  rhythm: { hint: 'Встречи, отчёты, блокираторы и что делать, если что-то пошло не так', variant: 'alt' },
  assets: { hint: 'Что считать результатом проекта и как его сформулировать', variant: 'alt' },
  roles: { hint: 'Матрица ролей и к кому обратиться по каким вопросам', variant: 'alt' },
  grade: { hint: 'Как оценивают проекты и участников и как проходит защита', variant: 'accent' }
};
var ICONS = {
  stages: '<path d="M2 12h20"/><path d="M12 4.5 17.5 12 12 19.5 6.5 12z"/>',
  rhythm: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 10h18M8 2.5v4M16 2.5v4"/>',
  assets: '<path d="M12 3 3 7.5l9 4.5 9-4.5L12 3z"/><path d="M3 12l9 4.5 9-4.5"/><path d="M3 16.5 12 21l9-4.5"/>',
  roles: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
  grade: '<rect x="8" y="2.5" width="8" height="19" rx="4"/><circle cx="12" cy="7" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="17" r="1.3"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(p) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + '</svg>'; }
var ARROW = svg('<path d="M5 12h14M13 6l6 6-6 6"/>');
function init(root) {
  var html = Object.keys(PAGES).map(function (k, i) {
    var p = { title: DBV_PAGES[k].title, url: DBV_PAGES[k].url, hint: PAGES[k].hint, variant: PAGES[k].variant }, on = !!p.url;
    var cls = 'dbv-glass dbv-tile' + (p.variant === 'accent' ? ' dbv-glass--accent' : '') + (on ? ' dbv-lift' : ' dbv-tile--off');
    var inner = '<span class="dbv-ico">' + svg(ICONS[k]) + '</span>' +
      '<span class="dbv-tile__body"><span class="dbv-tile__t">' + esc(p.title) + '</span>' + (p.hint ? '<span class="dbv-tile__h">' + esc(p.hint) + '</span>' : '') + '</span>' +
      (on ? '<span class="dbv-tile__arr">' + ARROW + '</span>' : '<span class="dbv-soon">' + esc(DATA.soon) + '</span>');
    return on
      ? '<a class="' + cls + '" style="--i:' + i + '" href="' + esc(p.url) + '" rel="noopener">' + inner + '</a>'
      : '<div class="' + cls + '" style="--i:' + i + '" aria-disabled="true">' + inner + '</div>';
  }).join('');
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><div class="dbv-next__grid">' + html + '</div>';
}
[].forEach.call(document.querySelectorAll('.dbv-next'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
