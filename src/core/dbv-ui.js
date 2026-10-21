/* Общие помощники блоков ДБВ: экранирование, иконки (Feather/Lucide-стиль, stroke 1.8), таблица, вкладки-ссылки, аккордеон */
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
var IC = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  chk: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  hist: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 8v4l3 2"/>',
  env: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>'
};
function ico(n, cls) { return '<svg class="dbv-svg' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function dia() { return '<svg class="dbv-svg dbv-dia" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2 22 12 12 22 2 12z"/></svg>'; }
function reduced() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
/* таблица: head — массив подписей (или [html, подпись]), rows — массив массивов HTML-ячеек; опции: first ('th' — первая ячейка заголовок строки), cls — классы колонок */
function tbl(head, rows, o) {
  o = o || {};
  var cls = o.cls || [];
  function hl(h) { return typeof h === 'string' ? h : h[1]; }
  function hh(h) { return typeof h === 'string' ? esc(h) : h[0]; }
  function c(h, i, th) { return '<' + (th ? 'th scope="row" role="rowheader"' : 'td role="cell"') + ' data-label="' + esc(hl(head[i])) + '"' + (cls[i] ? ' class="' + cls[i] + '"' : '') + '>' + h + '</' + (th ? 'th' : 'td') + '>'; }
  return '<table class="dbv-tbl" role="table"' + (o.gl ? ' data-gl' : '') + '>' + (o.cap ? '<caption class="dbv-sr">' + esc(o.cap) + '</caption>' : '') +
    '<thead><tr role="row">' + head.map(function (h, i) { return '<th scope="col" role="columnheader"' + (cls[i] ? ' class="' + cls[i] + '"' : '') + '>' + hh(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    rows.map(function (r) { return '<tr role="row">' + r.map(function (h, i) { return c(h, i, o.first === 'th' && i === 0); }).join('') + '</tr>'; }).join('') + '</tbody></table>';
}
function list(items) { return '<ul class="dbv-list">' + items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; }
function flow(items) {
  var cap = items.every(function (t) { return typeof t !== 'string' && t[1]; });
  return '<ol class="dbv-flow' + (cap ? ' dbv-flow--cap' : '') + '">' + items.map(function (t, i) {
    var c = typeof t === 'string' ? null : t[1], name = typeof t === 'string' ? t : t[0];
    return (i ? '<li class="dbv-flow__a" aria-hidden="true">' + ico('arrow') + '</li>' : '') + '<li><span class="dbv-flow__t">' + esc(name) + '</span>' + (c ? '<span class="dbv-flow__c">' + esc(c) + '</span>' : '') + '</li>';
  }).join('') + '</ol>';
}
/* ссылка на другую страницу комплекса: DBV_PAGES.<ключ>.url + '#якорь'; пустой url — только текст */
function pageHref(key, hash) { var u = DBV_PAGES[key] && DBV_PAGES[key].url; return u ? u + (hash ? '#' + hash : '') : ''; }
function pageLink(key, hash, label) {
  var h = pageHref(key, hash);
  return h ? '<a href="' + esc(h) + '" rel="noopener">' + esc(label) + '</a>' : esc(label);
}
/* аккордеон: клик по строке раскрывает/сворачивает; несколько строк могут быть открыты */
function accToggle(b, on) {
  var open = on === undefined ? b.getAttribute('aria-expanded') !== 'true' : on;
  b.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.getElementById(b.getAttribute('aria-controls')).classList.toggle('is-open', open);
}
function scrollToId(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  return !!el;
}
