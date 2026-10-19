/* Здесь правятся пять критериев (title — название, d — описание, no — «проект не проходит, если»), правило из документа (rule) и тексты вердиктов (verdicts). Меняйте только текст между кавычками. */
var DATA = {
  title: 'Проверьте проект по пяти критериям',
  lead: 'Пять критериев включения проекта в портфель (КТ1). Те же критерии применяются повторно при любом изменении темы, цели и границ проекта. Отметьте, выполняется ли каждый критерий для вашего проекта: ниже появится вывод. Это самопроверка; решение принимает комиссия по портфелю.',
  criteria: [
    { title: 'Формат программы', d: 'Остаётся управленческий инструмент: процесс, оргмодель, инфраструктура, регламент, СОП, модель, дашборд.', no: 'проект — разовая задача, актуализация документа или мероприятие; это текущая операционная деятельность.' },
    { title: 'Измеримость', d: 'Есть показатель и его исходное значение (период, источник) либо способ его получить.', no: 'показателя нет; результат подтверждается только выпуском документов.' },
    { title: 'Реалистичный объём', d: 'Определён минимальный объём внедрения: одно подразделение, один процесс или одна группа номенклатуры.', no: 'несколько несвязанных направлений; минимальный объём не определён.' },
    { title: 'Устойчивость', d: 'Известно, кто примет результат после проекта.', no: 'владелец результата не определён или не подтвердил готовность.' },
    { title: 'Заказ подтверждён, дублей нет', d: 'Заказчик подтвердил проблему и цель, готов работать с командой.', no: 'заказчика нет или он не подтвердил формулировку; проект дублирует другой.' }
  ],
  labels: { no: 'Проект не проходит, если:', yes: 'Выполняется', not: 'Не выполняется', reset: 'Сбросить ответы', group: 'Критерий' },
  rule: 'Не выполнены не более двух критериев — проект вернут на переформулирование. Три и более либо критерий 1 — проект не включат.',
  verdicts: {
    ok: 'Все критерии выполняются: проект может быть включён в портфель (решение принимает комиссия по портфелю)',
    warn: 'Проект вернут на переформулирование',
    bad: 'Проект не включат'
  }
};
/*%%GLOSSARY%%*/
var IC = {
  chk: '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/>',
  warn: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 8v5M12 16v.5"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function init(root) {
  var C = DATA.criteria, L = DATA.labels, ans = C.map(function () { return null; });
  root.innerHTML = '<h2 class="dbv-h2" id="dbv-criteria">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-crit__lead" data-gl>' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-cl">' + C.map(function (c, i) {
      return '<div class="dbv-cc dbv-glass" style="--i:' + i + '"><div class="dbv-cc__top"><span class="dbv-cc__n" aria-hidden="true">' + (i + 1) + '</span><h3 class="dbv-h3">' + esc(c.title) + '</h3></div>' +
        '<p class="dbv-body dbv-cc__d" data-gl>' + esc(c.d) + '</p><p class="dbv-cq" data-gl><b>' + esc(L.no) + '</b>' + esc(c.no) + '</p>' +
        '<div class="dbv-rg" role="radiogroup" aria-label="' + esc(L.group + ' ' + (i + 1) + ': ' + c.title) + '" data-i="' + i + '">' +
        '<button type="button" class="dbv-rb dbv-rb--y" role="radio" aria-checked="false" data-v="1" tabindex="0">' + esc(L.yes) + '</button>' +
        '<button type="button" class="dbv-rb dbv-rb--n" role="radio" aria-checked="false" data-v="0" tabindex="-1">' + esc(L.not) + '</button></div></div>';
    }).join('') + '</div>' +
    '<div class="dbv-vd"><p class="dbv-small dbv-vd__rule" data-gl>' + esc(DATA.rule) + '</p>' +
    '<div class="dbv-vd__row"><div class="dbv-vd__cnt" data-cnt></div><button type="button" class="dbv-btn" data-reset>' + svg('reset') + esc(L.reset) + '</button></div>' +
    '<div class="dbv-vd__r" aria-live="polite" data-res></div></div>';
  dbvGlossary(root).apply(root);
  var groups = [].slice.call(root.querySelectorAll('.dbv-rg')), cnt = root.querySelector('[data-cnt]'), res = root.querySelector('[data-res]');

  function verdict() {
    var n = ans.filter(function (a) { return a !== null; }).length, m = ans.filter(function (a) { return a === false; }).length;
    cnt.textContent = 'Отмечено: ' + n + ' из ' + C.length + ' · не выполняется: ' + m;
    var cls = '', txt = '', ic = '';
    if (n === C.length) {
      if (m === 0) { cls = 'ok'; txt = DATA.verdicts.ok; ic = 'chk'; }
      else if (m >= 3 || ans[0] === false) { cls = 'bad'; txt = DATA.verdicts.bad; ic = 'warn'; }
      else { cls = 'warn'; txt = DATA.verdicts.warn; ic = 'warn'; }
    }
    res.innerHTML = cls ? '<div class="dbv-vd__m dbv-vd__m--' + cls + '">' + svg(ic) + '<span>' + esc(txt) + '</span></div>' : '';
    res.setAttribute('data-verdict', cls);
  }
  function paint() {
    groups.forEach(function (g, i) {
      var bs = g.querySelectorAll('.dbv-rb');
      [].forEach.call(bs, function (b, k) {
        var v = b.getAttribute('data-v') === '1', on = ans[i] === v;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = ans[i] === null ? (k === 0 ? 0 : -1) : (on ? 0 : -1);
      });
    });
    verdict();
  }
  function set(g, v, focus) {
    var i = +g.getAttribute('data-i');
    ans[i] = v;
    paint();
    if (focus) g.querySelector('[data-v="' + (v ? 1 : 0) + '"]').focus();
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-rb');
    if (b) { set(b.parentNode, b.getAttribute('data-v') === '1', false); return; }
    if (e.target.closest && e.target.closest('[data-reset]')) { ans = C.map(function () { return null; }); paint(); }
  });
  root.addEventListener('keydown', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-rb');
    if (!b) return;
    var v = b.getAttribute('data-v') === '1';
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); set(b.parentNode, !v, true); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); set(b.parentNode, v, false); }
  });
  paint();
}
[].forEach.call(document.querySelectorAll('.dbv-crit'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
