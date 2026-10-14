/* Здесь правятся схема формулировки КР, две плашки и четыре пары примеров (bad — как не надо, ok — как надо, note — замечание, tag — метка над парой). Меняйте только текст между кавычками. */
var DATA = {
  title: 'Как формулировать КР и исходное значение',
  lead: 'Схема формулировки КР:',
  scheme: ['Объект изменения', 'Достигнутое состояние', 'Показатель', 'Целевое значение', 'Плановая дата'],
  okPl: 'Критерий проверки: достижение результата можно однозначно подтвердить.',
  noPl: 'Формулировки вида «создана культура», «обеспечена прозрачность», «повышена вовлечённость» не принимаются.',
  sw: { label: 'Вариант формулировки', bad: 'Как не надо', ok: 'Как надо', badH: 'Некорректная формулировка', okH: 'Корректная формулировка', rem: 'Замечание:' },
  pairs: [
    { tag: 'КР', bad: 'КР: «Создана культура наставничества»', ok: 'КР: «Доля новых сотрудников с назначенным наставником выросла с 40 % до 100 % к 15.08. Подтверждает начальник отдела» (условный пример)', note: 'Нельзя однозначно проверить, достигнут результат или нет.' },
    { tag: 'КР', bad: 'КР: «Разработана драйверная модель»', ok: 'КР: «Модель применена при формировании бюджета двух функциональных направлений, согласование владельца метрики получено к 01.07»', note: 'Описана работа, а не доказательство, что модель работает.' },
    { tag: 'КР', bad: 'КР: «Проведены круглые столы по адаптации»', ok: 'КР: «Чек-лист первого дня сотрудника внедрён на участке; по нему прошли 100 % новых сотрудников» (условный пример)', note: 'Диагностика и обсуждения не меняют ситуацию; нет целевого состояния.' },
    { tag: 'Исходное значение', bad: 'Исходное значение: «Рекламаций по поставщикам слишком много»', ok: 'Исходное значение: «59 рекламаций с отметкой «брак поставщика» за 2025 год; источник — система учёта рекламаций» (из портфеля ДБВ‑2026)', note: 'Нет числа, периода и источника: эффект подтвердить невозможно.' }
  ]
};
/*%%GLOSSARY%%*/
var IC = {
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chk: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  ok: '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/>',
  warn: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 8v5M12 16v.5"/>',
  arr: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function init(root) {
  var S = DATA.sw, v = 'bad';
  function card(kind, t, i) { return '<div class="dbv-cd dbv-cd--' + kind + '" style="animation-delay:' + (i * 60) + 'ms"><div class="dbv-cd__h"><span class="dbv-cd__i" aria-hidden="true">' + svg(kind === 'bad' ? 'x' : 'chk') + '</span><span>' + esc(kind === 'bad' ? S.badH : S.okH) + '</span></div><p class="dbv-cd__t" data-gl>' + esc(t) + '</p></div>'; }
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-kr__lead" data-gl>' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-sch" role="list" aria-label="' + esc(DATA.lead) + '">' + DATA.scheme.map(function (s, i) { return (i ? '<span class="dbv-sch__a" aria-hidden="true">' + svg('arr') + '</span>' : '') + '<div class="dbv-sch__t" role="listitem"><span class="dbv-sch__n" aria-hidden="true">' + (i + 1) + '</span><span>' + esc(s) + '</span></div>'; }).join('') + '</div>' +
    '<div class="dbv-pl dbv-pl--ok">' + svg('ok') + '<p class="dbv-body" data-gl>' + esc(DATA.okPl) + '</p></div>' +
    '<div class="dbv-pl dbv-pl--no" role="note">' + svg('warn') + '<p class="dbv-body" data-gl>' + esc(DATA.noPl) + '</p></div>' +
    '<div class="dbv-cmp" data-v="bad"><div class="dbv-sw" role="radiogroup" aria-label="' + esc(S.label) + '"><button type="button" class="dbv-sw__b" role="radio" aria-checked="true" data-v="bad" tabindex="0">' + esc(S.bad) + '</button><button type="button" class="dbv-sw__b" role="radio" aria-checked="false" data-v="ok" tabindex="-1">' + esc(S.ok) + '</button></div>' +
    DATA.pairs.map(function (p, i) { return '<div class="dbv-cmp__r"><span class="dbv-chip dbv-cmp__tag">' + esc(p.tag) + '</span>' + card('bad', p.bad, i) + card('ok', p.ok, i) + '<p class="dbv-rem" data-gl><b>' + esc(S.rem) + '</b> ' + esc(p.note) + '</p></div>'; }).join('') + '</div>';
  dbvGlossary(root).apply(root);
  var cmp = root.querySelector('.dbv-cmp'), bs = [].slice.call(root.querySelectorAll('.dbv-sw__b'));
  function set(x, focus) {
    v = x; cmp.setAttribute('data-v', x);
    bs.forEach(function (b) { var on = b.getAttribute('data-v') === x; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
  }
  bs.forEach(function (b) {
    b.addEventListener('click', function () { set(b.getAttribute('data-v')); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); set(v === 'bad' ? 'ok' : 'bad', true); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); set(b.getAttribute('data-v')); }
    });
  });
}
[].forEach.call(document.querySelectorAll('.dbv-kr'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
