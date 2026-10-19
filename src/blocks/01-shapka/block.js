/* Здесь правятся тексты шапки: заголовок, подзаголовок, чипы, три блока «Для кого / Цель / Основание». Меняйте только текст между кавычками. */
var DATA = {
  eyebrow: 'СИЛОВЫЕ МАШИНЫ · ПРОГРАММА «ДОСТИЧЬ БОЛЬШЕГО ВМЕСТЕ»',
  titleStart: 'Инструкция по ',
  titleAccent: 'проектному треку',
  subtitle: 'Основная информация, этапы и контрольные точки, роли, критерии оценки',
  chips: [
    { icon: 'steps', text: '5 этапов' },
    { icon: 'diamond', text: '5 контрольных точек', red: true },
    { icon: 'star', text: '1 система — ПЗ' }
  ],
  info: [
    { h: 'Для кого', t: 'Участники программы — заказчики проектов, руководители проектов и члены проектных команд.' },
    { h: 'Цель', t: 'Единое понимание порядка работы по проектному треку и ожидаемых результатов.' },
    { h: 'Основание', t: 'СТО «Порядок реализации программы «Достичь большего вместе» (проект, ред. 1.0). При расхождении действует СТО. Страница описывает практический порядок работы и не заменяет текст стандарта.' }
  ]
};
/*%%GLOSSARY%%*/
var ICONS = {
  steps: '<path d="M12 3 2.5 8 12 13l9.5-5L12 3z"/><path d="M2.5 12 12 17l9.5-5"/><path d="M2.5 16 12 21l9.5-5"/>',
  diamond: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>',
  star: '<path d="M12 2c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10 5.2-.6 9.4-4.8 10-10z"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(name, label) {
  return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICONS[name] + '</svg>';
}
function init(root) {
  function f(n) { return root.querySelector('[data-f="' + n + '"]'); }
  f('eyebrow').textContent = DATA.eyebrow;
  f('title').innerHTML = esc(DATA.titleStart) + '<span class="dbv-hero__acc">' + esc(DATA.titleAccent) + '</span>';
  f('subtitle').textContent = DATA.subtitle;
  f('chips').innerHTML = DATA.chips.map(function (c) {
    return '<span class="dbv-chip' + (c.red ? ' dbv-chip--red' : '') + '" data-gl>' + svg(c.icon) + '<span>' + esc(c.text) + '</span></span>';
  }).join('');
  f('info').innerHTML = DATA.info.map(function (b, i) {
    return '<div class="dbv-hero__box" style="--i:' + i + '" data-gl><div class="dbv-hero__lab">' + esc(b.h) + '</div><p class="dbv-body dbv-hero__t">' + esc(b.t) + '</p></div>';
  }).join('');
  dbvGlossary(root).apply(root);
}
[].forEach.call(document.querySelectorAll('.dbv-hero'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
