/* Здесь правятся тексты шагов первого месяца (steps: title, what — что делать, who — кто, term — срок), подписи шкалы и блока «Как устроен проект в ПЗ». Меняйте только текст между кавычками. */
var DATA = {
  title: 'Первые 30 дней: от требований до карточки в ПЗ',
  lead: 'Цель первого месяца — прохождение КТ2. Порядок работы:',
  timeline: { from: 'Портфель утверждён', s1: '10 рабочих дней · требования', s2: '5 рабочих дней · карточка в ПЗ', kt: 'КТ2' },
  steps: [
    { title: 'Руководитель проекта', who: 'Команда', term: 'До КТ2',
      what: 'Команда выбирает РП из своего состава. Выбор фиксируется в карточке в ПЗ.' },
    { title: 'Требования', who: 'Заказчик при участии РП', term: '10 рабочих дней с утверждения портфеля',
      what: 'Заказчик проекта формулирует в ПЗ требования — проектное задание: какую проблему необходимо решить, какие инструменты и результаты должны быть получены к концу проекта, что входит в границы проекта, кто принимает результат. РП при участии заказчика уточняет сроки, объём работ и потребность в ресурсах.' },
    { title: 'Исходные значения', who: 'РП; проверяет координатор', term: 'До КТ2',
      what: 'По каждому КР фиксируются число, период измерения и источник данных. Если данных нет, добавляется мероприятие по организации измерения.',
      badge: 'Без этого КТ2 не пройти', quote: 'Без исходных значений проект КТ2 не проходит', required: true },
    { title: 'Ключевые результаты', who: 'РП с командой; КР принимает заказчик', term: 'До КТ2',
      what: 'КР формулируются по схеме: объект изменения → достигнутое состояние → показатель → целевое значение → плановая дата. К каждому КР — мероприятия, к каждому мероприятию — актив.' },
    { title: 'Согласование', who: 'Заказчик, ЛСП', term: 'До КТ2',
      what: 'Требования согласует ЛСП. Если в проекте есть цифровое решение, его обоснование согласуют с ДИТ и ДОБ до начала разработки.' },
    { title: 'Карточка в ПЗ', who: 'РП', term: '5 рабочих дней после согласования требований с заказчиком',
      what: 'Проект заводится в структуре: цели → КР → мероприятия. Указываются команда, роли, метрики.' }
  ],
  labels: { who: 'Кто:', term: 'Срок:', open: 'Что делать' },
  pz: {
    title: 'Как устроен проект в ПЗ',
    chain: [{ t: 'Проект' }, { t: 'Цели' }, { t: 'Ключевые результаты', c: 'описывает создаваемый инструмент' }, { t: 'Мероприятия', c: 'шаги по его созданию' }],
    metricsTitle: 'Метрики трёх типов по каждому КР',
    metrics: [{ t: 'Результативность', c: 'чего достигли' }, { t: 'Эффективность', c: 'какой ценой' }, { t: 'Надёжность', c: 'насколько стабильно' }],
    rule: 'Метрики согласует заказчик; несогласованная метрика к оценке КР не принимается.',
    warns: [
      'Мероприятия — шаги по созданию инструмента, а не регулярные операционные действия. Мероприятие «выполнить операционную задачу» в проект не включают.',
      'Выполнение KPI подразделения ключевым результатом проекта не является.'
    ]
  }
};
/*%%GLOSSARY%%*/
var IC = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.7-4.2 3.6-6.5 7.5-6.5s6.8 2.3 7.5 6.5"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 10h18M8 2.5v4M16 2.5v4"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  dia: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/>',
  warn: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 8v5M12 16v.5"/>',
  arr: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n, cls) { return '<svg class="dbv-svg' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function init(root, uid) {
  var T = DATA.timeline, L = DATA.labels, P = DATA.pz;
  var h = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-f30__lead" data-gl>' + esc(DATA.lead) + '</p>' +
    '<div class="dbv-tl"><div class="dbv-tl__from">' + esc(T.from) + '</div><div class="dbv-tl__bar"><div class="dbv-tl__s dbv-tl__s1">' + esc(T.s1) + '</div><div class="dbv-tl__s dbv-tl__s2"><span data-gl>' + esc(T.s2) + '</span></div>' +
    '<div class="dbv-tl__kt" role="img" aria-label="Контрольная точка ' + esc(T.kt) + '"><i></i><b>' + esc(T.kt) + '</b></div></div></div>' +
    '<ol class="dbv-path">' + DATA.steps.map(function (s, i) {
      var id = uid + '-s' + i;
      return '<li class="dbv-ps' + (s.required ? ' dbv-ps--req' : '') + '"><span class="dbv-ps__n" aria-hidden="true">' + (i + 1) + '</span><div class="dbv-ps__c dbv-glass" style="--i:' + i + '">' +
        '<div class="dbv-ps__h"><h3 class="dbv-h3">' + esc(s.title) + '</h3>' + (s.badge ? '<span class="dbv-ktb">' + svg('dia') + '<span>' + esc(s.badge) + '</span></span>' : '') + '</div>' +
        '<div class="dbv-ps__chips"><span class="dbv-chip">' + svg('user') + '<span data-gl><b>' + esc(L.who) + '</b>' + esc(s.who) + '</span></span><span class="dbv-chip">' + svg('cal') + '<span><b>' + esc(L.term) + '</b>' + esc(s.term) + '</span></span></div>' +
        (s.quote ? '<p class="dbv-quote" data-gl>' + esc(s.quote) + '</p>' : '') +
        '<button type="button" class="dbv-acc__b" aria-expanded="false" aria-controls="' + id + '"><span class="dbv-acc__t">' + esc(L.open) + '</span>' + svg('chev') + '</button>' +
        '<div class="dbv-acc__p" id="' + id + '"><div class="dbv-acc__w"><p class="dbv-acc__in" data-gl>' + esc(s.what) + '</p></div></div></div></li>';
    }).join('') + '</ol>' +
    '<h3 class="dbv-h3 dbv-f30__h3">' + esc(P.title) + '</h3><div class="dbv-ch">' +
    P.chain.map(function (c, i) {
      return (i ? '<span class="dbv-ch__a" aria-hidden="true">' + svg('arr') + '</span>' : '') + '<div class="dbv-ch__t dbv-glass" style="--i:' + i + '"><span class="dbv-ch__h">' + esc(c.t) + '</span>' + (c.c ? '<span class="dbv-ch__c">' + esc(c.c) + '</span>' : '') + '</div>';
    }).join('') + '</div>' +
    '<h3 class="dbv-h3 dbv-f30__h3">' + esc(P.metricsTitle) + '</h3><div class="dbv-mt">' +
    P.metrics.map(function (m) { return '<div class="dbv-mt__c"><div class="dbv-mt__h">' + esc(m.t) + '</div><div class="dbv-mt__t">' + esc(m.c) + '</div></div>'; }).join('') + '</div>' +
    '<p class="dbv-body dbv-f30__rule" data-gl>' + esc(P.rule) + '</p><div class="dbv-warns">' +
    P.warns.map(function (w) { return '<div class="dbv-warn" role="note">' + svg('warn') + '<p class="dbv-body" data-gl>' + esc(w) + '</p></div>'; }).join('') + '</div>';
  root.innerHTML = h;
  dbvGlossary(root).apply(root);
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-acc__b');
    if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.getElementById(b.getAttribute('aria-controls')).classList.toggle('is-open', open);
  });
}
[].forEach.call(document.querySelectorAll('.dbv-f30'), function (r, n) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r, 'dbv-f30-' + n);
});
