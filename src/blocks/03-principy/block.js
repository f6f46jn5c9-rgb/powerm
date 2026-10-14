/* Здесь правятся три принципа и красная плашка под ними. Меняйте только текст между кавычками; поле icon (key, ruler, star) не трогайте. */
var DATA = {
  title: 'Три принципа проектного трека',
  cards: [
    { icon: 'key', title: 'Результат — инструмент', variant: 'alt',
      text: 'Результатом проекта является инструмент, а не набор мероприятий. После завершения работы команды в подразделении остаётся то, что можно применять: регламент, СОП, модель, дашборд, обучающая программа, ЛНА.' },
    { icon: 'ruler', title: 'Эффект подтверждён замером', variant: 'alt',
      text: 'Эффект проекта подтверждается исходным замером. По каждому ключевому результату (КР) фиксируется исходное значение: число, период измерения, источник данных.' },
    { icon: 'star', title: 'Единый источник данных — ПЗ', variant: 'accent',
      text: 'Единственный источник данных о проектах — система «Полярная звезда» (ПЗ).' }
  ],
  stop: 'Информация, не зафиксированная в ПЗ, для жюри и организаторов программы не существует: при оценке состояния проекта она не учитывается.'
};
/*%%GLOSSARY%%*/
var ICONS = {
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 20 3M16 7l3 3M13.5 9.5l2.5 2.5"/>',
  ruler: '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 7v4M10 7v3M14 7v4M18 7v3"/>',
  star: '<path d="M12 2c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10 5.2-.6 9.4-4.8 10-10z"/>',
  diamond: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 8v5M12 16v.5"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICONS[n] + '</svg>'; }
function init(root) {
  root.innerHTML =
    '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2>' +
    '<div class="dbv-prin__grid">' + DATA.cards.map(function (c, i) {
      return '<div class="dbv-glass dbv-lift dbv-prin__card' + (c.variant === 'accent' ? ' dbv-glass--accent' : '') + '" style="--i:' + i + '">' +
        '<div class="dbv-prin__top"><span class="dbv-prin__num" aria-hidden="true">' + (i + 1) + '</span><span class="dbv-ico dbv-prin__ico">' + svg(c.icon) + '</span></div>' +
        '<h3 class="dbv-h3 dbv-prin__t">' + esc(c.title) + '</h3>' +
        '<p class="dbv-body dbv-prin__txt" data-gl>' + esc(c.text) + '</p></div>';
    }).join('') + '</div>' +
    '<div class="dbv-stop" role="note"><span aria-hidden="true">' + svg('diamond') + '</span><p class="dbv-body" data-gl>' + esc(DATA.stop) + '</p></div>';
  dbvGlossary(root).apply(root);
}
[].forEach.call(document.querySelectorAll('.dbv-prin'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
