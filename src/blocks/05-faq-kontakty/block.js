/* Вопросы и ответы правятся в списке faq: q — вопрос, a — ответ. Меняйте только текст между кавычками. */
var DATA = {
  faqTitle: 'Частые вопросы',
  contactsTitle: 'Ссылки и контакты',
  faq: [
    { q: 'Что считать проектом программы, а что нет?',
      a: 'Проект оставляет управленческий инструмент и измерим. Текущая операционная деятельность, разовая задача и актуализация документа не подходят (см. страницу «Этапы и контрольные точки», КТ1).' },
    { q: 'Что делать, если данных для исходного значения нет?',
      a: 'В требования добавляется мероприятие по организации измерения с ответственным и сроком. Без исходных значений проект КТ2 не проходит.' },
    { q: 'Можно изменить тему или цель проекта?',
      a: 'Только с согласия заказчика и ЛСП. Результаты несогласованного изменения к приёмке не принимаются.' },
    { q: 'Требуется ли презентация к демонстрационному дню?',
      a: 'Нет. РП и заказчик участвуют независимо от степени готовности проекта. РП демонстрирует результаты в ПЗ со своего компьютера: карточку проекта, исходные значения и работающие активы; презентация в PowerPoint не готовится. Четыре обязательных слайда требуются только для предзащиты и защиты (см. страницу «Оценка и защита»).' },
    { q: 'Что значит «заказано и сдано»?',
      a: 'Объём сданного равен объёму требований: без расширений и без недосдачи.' },
    { q: 'Кто принимает результат проекта?',
      a: 'Заказчик проекта — по критериям приёмки и с учётом оценки жюри.' },
    { q: 'Где хранить материалы проекта?',
      a: 'Файлы — в сетевой папке или облаке, в ПЗ — ссылка и карточка актива. Данные вне ПЗ при оценке не учитываются.' },
    { q: 'Где материалы обучения и календарь программы?',
      a: 'На портале программы dbv.power-m.ru. Инструкция по работе в ПЗ размещена в БУП.' }
  ]
};
/* Чтобы добавить ссылку или контакт — впишите в url или text нужного пункта; пока поле пустое, пункт на странице не показывается */
var CONTACTS = [
  { icon: 'globe', title: 'Портал программы', hint: 'Обучение и календарь', url: 'https://dbv.power-m.ru', text: '' },
  { icon: 'chat', title: 'Техподдержка ПЗ', hint: 'Чат «Полярная звезда Силовых машин» в Синапс', url: '', text: 'Чат «Полярная звезда Силовых машин» в Синапс' },
  { icon: 'star', title: 'Система «Полярная звезда»', hint: '', url: '', text: '' },
  { icon: 'book', title: 'Инструкция по работе в ПЗ', hint: 'Страница в БУП', url: '', text: '' },
  { icon: 'doc', title: 'СТО «Порядок реализации программы»', hint: '', url: '', text: '' },
  { icon: 'files', title: 'Шаблоны: требований, ключевого результата, структуры доклада', hint: '', url: '', text: '' },
  { icon: 'slides', title: 'Корпоративный шаблон презентации PPTX', hint: '', url: '', text: '' },
  { icon: 'user', title: 'Координатор проектного трека', hint: '', url: '', text: '' },
  { icon: 'user', title: 'Руководитель программы', hint: '', url: '', text: '' },
  { icon: 'cap', title: 'Академический трек (ДРП)', hint: '', url: '', text: '' }
];
/*%%GLOSSARY%%*/
var ICONS = {
  globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.7 3.9 5.9 3.9 9.5s-1.3 6.8-3.9 9.5c-2.6-2.7-3.9-5.9-3.9-9.5S9.4 5.2 12 2.5z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3.5 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 10.5h7M8.5 14h4"/>',
  star: '<path d="M12 2c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10 5.2-.6 9.4-4.8 10-10z"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19V4.5M8.5 7H16"/>',
  doc: '<path d="M14 2.5H6.5A2 2 0 0 0 4.5 4.5v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5"/>',
  files: '<rect x="8" y="3" width="12" height="15" rx="2"/><path d="M16 21H6.5A2.5 2.5 0 0 1 4 18.5V7M11.5 8h5M11.5 12h5"/>',
  slides: '<rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M12 16.5V21M8 21h8M7 12l3-3 2.5 2.5L17 8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.7-4.2 3.6-6.5 7.5-6.5s6.8 2.3 7.5 6.5"/>',
  cap: '<path d="M2 9.5 12 5l10 4.5-10 4.5z"/><path d="M6 11.7V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.3M22 9.5V15"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  go: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n, cls) { return '<svg class="dbv-svg' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICONS[n] + '</svg>'; }
function init(root) {
  var html = '<h2 class="dbv-h2">' + esc(DATA.faqTitle) + '</h2><div class="dbv-faq__list">' + DATA.faq.map(function (f, i) {
    return '<details class="dbv-q" style="--i:' + i + '"><summary><span class="dbv-q__t">' + esc(f.q) + '</span>' + svg('chev', 'dbv-q__chev') + '</summary>' +
      '<div class="dbv-q__a"><p class="dbv-body" data-gl>' + esc(f.a) + '</p></div></details>';
  }).join('') + '</div>';
  var shown = CONTACTS.filter(function (c) { return (c.url && c.url.trim()) || (c.text && c.text.trim()); });
  if (shown.length) {
    html += '<h2 class="dbv-h2 dbv-faq__h2b">' + esc(DATA.contactsTitle) + '</h2><div class="dbv-cc__grid">' + shown.map(function (c, i) {
      var link = c.url && c.url.trim();
      var sub = link ? c.hint : (c.text || c.hint);
      var body = '<span class="dbv-ico">' + svg(c.icon) + '</span><span class="dbv-cc__b"><span class="dbv-cc__t">' + esc(c.title) + '</span>' + (sub ? '<span class="dbv-cc__h">' + esc(sub) + '</span>' : '') + '</span>';
      return link
        ? '<a class="dbv-glass dbv-lift dbv-cc" style="--i:' + i + '" href="' + esc(c.url.trim()) + '" rel="noopener">' + body + '<span class="dbv-cc__go">' + svg('go') + '</span></a>'
        : '<div class="dbv-glass dbv-cc" style="--i:' + i + '">' + body + '</div>';
    }).join('') + '</div>';
  }
  root.innerHTML = html;
  dbvGlossary(root).apply(root);
}
[].forEach.call(document.querySelectorAll('.dbv-faq'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
