/* Здесь правятся три принципа, предупреждение под ними, подписи разделов (hint) и блок «Где что искать». Названия и адреса страниц берутся из src/core/dbv-pages.js; адрес кнопки «Открыть инструкцию по работе в ПЗ» — DBV_PAGES.pz.url (пустой адрес — кнопка не выводится). Меняйте только текст между кавычками. */
var DATA = {
  title: 'Три принципа проектного трека',
  cards: [
    { title: 'Результат — инструмент',
      text: 'Результатом проекта является инструмент, а не набор мероприятий. После завершения работы команды в подразделении остаётся то, что можно применять: регламент, СОП, модель, дашборд, обучающая программа, ЛНА.' },
    { title: 'Эффект подтверждён замером',
      text: 'Эффект проекта подтверждается исходным замером. По каждому ключевому результату (КР) фиксируется исходное значение: число, период измерения, источник данных.' },
    { title: 'Единый источник данных — ПЗ',
      text: 'Единственный источник данных о проектах — система «Полярная звезда» (ПЗ).' }
  ],
  stopLead: 'Информация, не зафиксированная в ПЗ, для жюри и организаторов программы не существует',
  stopRest: ': при оценке состояния проекта она не учитывается.',
  sectionsTitle: 'Разделы инструкции',
  sections: [
    { k: 'stages', hint: 'Что делать на каждом этапе, чек-листы готовности и первые 30 дней' },
    { k: 'rhythm', hint: 'Встречи, отчёты, блокираторы и что делать, если что-то пошло не так' },
    { k: 'assets', hint: 'Что считать результатом проекта и как его сформулировать' },
    { k: 'roles', hint: 'Матрица ролей и к кому обратиться по каким вопросам' },
    { k: 'grade', hint: 'Как оценивают проекты и участников и как проходит защита' }
  ],
  whereTitle: 'Где что искать',
  where: [
    { q: 'Где хранить материалы проекта', a: 'Файлы — в сетевой папке или облаке, в ПЗ — ссылка и карточка актива.' },
    { q: 'Где материалы обучения и календарь программы', a: 'На портале программы dbv.power-m.ru. Инструкция по работе в ПЗ размещена в БУП.', btn: 'Открыть инструкцию по работе в ПЗ' }
  ]
};
function init(root) {
  var pz = DBV_PAGES.pz.url;
  root.innerHTML =
    '<section class="dbv-sec"><h2 class="dbv-h2">' + esc(DATA.title) + '</h2><div class="dbv-pr3" data-gl>' +
    DATA.cards.map(function (c, i) {
      return '<div><h3 class="dbv-h3"><span class="dbv-pr__n">' + (i + 1) + '</span>' + esc(c.title) + '</h3><p class="dbv-body">' + esc(c.text) + '</p></div>';
    }).join('') + '</div>' +
    '<div class="dbv-warn" role="note" data-gl><p><b>' + esc(DATA.stopLead) + '</b>' + esc(DATA.stopRest) + '</p></div></section>' +
    '<section class="dbv-sec"><h2 class="dbv-h2">' + esc(DATA.sectionsTitle) + '</h2><ul class="dbv-list dbv-sect">' +
    DATA.sections.map(function (s) {
      var p = DBV_PAGES[s.k];
      return '<li>' + (p.url ? '<a href="' + esc(p.url) + '" rel="noopener">' + esc(p.title) + ico('arrow') + '</a>' : '<span>' + esc(p.title) + '</span>') + '<span class="dbv-small">' + esc(s.hint) + '</span></li>';
    }).join('') + '</ul></section>' +
    '<section class="dbv-sec"><h2 class="dbv-h2">' + esc(DATA.whereTitle) + '</h2><dl class="dbv-dl">' +
    DATA.where.map(function (w) {
      return '<div class="dbv-dl__r"><dt>' + esc(w.q) + '</dt><dd data-gl><p>' + esc(w.a) + '</p>' +
        (w.btn && pz ? '<p class="dbv-ctl"><a class="dbv-btn" href="' + esc(pz) + '" rel="noopener">' + esc(w.btn) + ico('arrow') + '</a></p>' : '') + '</dd></div>';
    }).join('') + '</dl></section>';
  dbvGlossary(root).apply(root);
}
[].forEach.call(document.querySelectorAll('.dbv-prin'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
