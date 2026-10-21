/* Общая навигация ДБВ: шесть позиций в одной полосе. Адреса берутся из DBV_PAGES; текущая страница (CURRENT) — плашка teal, не ссылка. */
var NAV_ITEMS = [
  ['hub', 'Проектный трек ДБВ'],
  ['stages', 'Этапы и КТ'],
  ['rhythm', 'Рабочий ритм и особые случаи'],
  ['assets', 'Активы, КР и ошибки'],
  ['roles', 'Роли'],
  ['grade', 'Оценка и защита']
];
function dbvNav(host, current) {
  host.setAttribute('aria-label', 'Разделы инструкции');
  host.innerHTML = NAV_ITEMS.map(function (n) {
    var p = DBV_PAGES[n[0]], t = esc(n[1]);
    if (n[0] === current) return '<span class="dbv-nav__i dbv-nav__cur" aria-current="page">' + t + '</span>';
    if (!p || !p.url) return '<span class="dbv-nav__i">' + t + '</span>';
    return '<a class="dbv-nav__i" href="' + esc(p.url) + '" rel="noopener">' + t + '</a>';
  }).join('');
}
