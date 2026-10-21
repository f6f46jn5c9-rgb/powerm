/* Здесь правятся тексты шапки: заголовок, подзаголовок, строка-итог, два блока «Для кого / Цель». Меняйте только текст между кавычками. */
var CURRENT = 'hub';
var DATA = {
  eyebrow: 'СИЛОВЫЕ МАШИНЫ · ПРОГРАММА «ДОСТИЧЬ БОЛЬШЕГО ВМЕСТЕ»',
  titleStart: 'Инструкция по ',
  titleAccent: 'проектному треку',
  subtitle: 'Основная информация, этапы и контрольные точки, роли, критерии оценки',
  meta: '5 этапов · 5 контрольных точек · одна система — ПЗ',
  info: [
    { h: 'Для кого', t: 'Участники программы — заказчики проектов, руководители проектов и члены проектных команд.' },
    { h: 'Цель', t: 'Единое понимание порядка работы по проектному треку и ожидаемых результатов.' }
  ]
};
function init(root) {
  function f(n) { return root.querySelector('[data-f="' + n + '"]'); }
  dbvNav(f('nav'), CURRENT);
  f('eyebrow').textContent = DATA.eyebrow;
  f('title').innerHTML = esc(DATA.titleStart) + '<span class="dbv-acc-w">' + esc(DATA.titleAccent) + '</span>';
  f('subtitle').textContent = DATA.subtitle;
  f('meta').textContent = DATA.meta;
  f('info').innerHTML = DATA.info.map(function (b) {
    return '<div data-gl><div class="dbv-hero__lab">' + esc(b.h) + '</div><p class="dbv-body dbv-hero__t">' + esc(b.t) + '</p></div>';
  }).join('');
  dbvGlossary(root).apply(root);
}
[].forEach.call(document.querySelectorAll('.dbv-hero'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
