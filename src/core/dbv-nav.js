/* Общая навигация дочерних страниц ДБВ: «← Проектный трек ДБВ» и пять разделов. Адреса берутся из DBV_PAGES; пустой url — пилюля неактивна. */
var NAV_ITEMS = [
  ['stages', 'Этапы и КТ'],
  ['rhythm', 'Рабочий ритм и нештатные ситуации'],
  ['assets', 'Активы, КР и ошибки'],
  ['roles', 'Роли'],
  ['grade', 'Оценка и защита']
];
function dbvNav(host, current) {
  function e(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function pill(key, label, icon) {
    var p = DBV_PAGES[key], inner = (icon ? '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>' : '') + '<span>' + e(label) + '</span>';
    if (key === current) return '<span class="dbv-pill dbv-pill--cur" aria-current="page">' + inner + '</span>';
    if (!p.url) return '<span class="dbv-pill dbv-pill--off" aria-disabled="true">' + inner + '</span>';
    return '<a class="dbv-pill" href="' + e(p.url) + '" rel="noopener">' + inner + '</a>';
  }
  host.innerHTML = pill('hub', DBV_PAGES.hub.title, true) + '<span class="dbv-nav__sep" aria-hidden="true"></span>' +
    NAV_ITEMS.map(function (n) { return pill(n[0], n[1]); }).join('');
}
