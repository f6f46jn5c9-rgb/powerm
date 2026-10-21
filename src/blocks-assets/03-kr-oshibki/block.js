/* Здесь правятся схема формулировки КР, предупреждение, четыре пары примеров и 11 частых ошибок (t — название, bad — как проявляется, ok — как правильно; link — куда ведёт «Где разобрано»: страница и якорь). Меняйте только текст между кавычками. */
var DATA = {
  title: 'Как формулировать КР и исходное значение',
  lead: 'Схема формулировки КР:',
  scheme: ['Объект изменения', 'Достигнутое состояние', 'Показатель', 'Целевое значение', 'Плановая дата'],
  okPl: 'Критерий проверки: достижение результата можно однозначно подтвердить.',
  noPl: 'Формулировки вида «создана культура», «обеспечена прозрачность», «повышена вовлечённость» не принимаются.',
  head: [['Как не надо (<span class="dbv-xr">×</span>)', 'Как не надо'], ['Как надо (<span class="dbv-ok">✓</span>)', 'Как надо'], 'Замечание'],
  pairs: [
    ['КР: «Создана культура наставничества»', 'КР: «Доля новых сотрудников с назначенным наставником выросла с 40 % до 100 % к 15.08. Подтверждает начальник отдела» (условный пример)', 'Нельзя однозначно проверить, достигнут результат или нет.'],
    ['КР: «Разработана драйверная модель»', 'КР: «Модель применена при формировании бюджета двух функциональных направлений, согласование владельца метрики получено к 01.07»', 'Описана работа, а не доказательство, что модель работает.'],
    ['КР: «Проведены круглые столы по адаптации»', 'КР: «Чек-лист первого дня сотрудника внедрён на участке; по нему прошли 100 % новых сотрудников» (условный пример)', 'Диагностика и обсуждения не меняют ситуацию; нет целевого состояния.'],
    ['Исходное значение: «Рекламаций по поставщикам слишком много»', 'Исходное значение: «59 рекламаций с отметкой «брак поставщика» за 2025 год; источник — система учёта рекламаций» (из портфеля ДБВ‑2026)', 'Нет числа, периода и источника: эффект подтвердить невозможно.']
  ],
  errTitle: 'Частые ошибки',
  errHead: ['№', 'Типичная ошибка', 'Как правильно'],
  where: 'Где разобрано',
  errors: [
    { t: 'Операционная деятельность вместо инструмента (работа за заказчика)', bad: 'Команда сама проводит опросы, обзванивает клиентов, вычёркивает строки из списков, считает вручную.', ok: 'Проектная задача — создать инструмент: скрипт интервью, механизм обзвона, методику выбора.' },
    { t: 'Нет исходного замера', link: ['stages', 'e2'] },
    { t: 'КР описывает процесс', link: [null, 'dbv-kr'] },
    { t: 'Нет владельца после проекта', link: ['stages', 'e2'] },
    { t: 'Избыточный объём', link: ['stages', 'dbv-criteria'] },
    { t: 'Даты только у мероприятий', link: [null, 'dbv-kr'] },
    { t: 'Несвоевременное информирование о проблемах', link: ['rhythm', 'dbv-blockers'] },
    { t: 'Результат принимает не заказчик проекта', link: ['roles', 'dbv-role-customer'] },
    { t: 'Отсутствие артефактов к демонстрационному дню', link: ['rhythm', 'dbv-demo'] },
    { t: 'Отчёты без фактов', link: ['rhythm', 'dbv-report'] },
    { t: 'Дублирование существующих решений', ok: 'Разработка того, что уже существует, результатом проекта не является.', link: ['stages', 'e1'] }
  ]
};
function init(root) {
  function where(l) {
    var inner = esc(DATA.where) + ico('arrow');
    if (!l[0]) return '<a class="dbv-where" href="#' + l[1] + '" data-jump="' + l[1] + '">' + inner + '</a>';
    var h = pageHref(l[0], l[1]);
    return h ? '<a class="dbv-where" href="' + esc(h) + '" rel="noopener">' + inner + '</a>' : esc(DATA.where);
  }
  var pairs = tbl(DATA.head, DATA.pairs.map(function (p) { return [esc(p[0]), esc(p[1]), '<span class="dbv-rem">' + esc(p[2]) + '</span>']; }), { gl: 1, cap: DATA.title, cls: ['dbv-w1', 'dbv-w2', ''] });
  var errs = tbl(DATA.errHead, DATA.errors.map(function (e, i) {
    var what = '<b>' + esc(e.t) + '</b>' + (e.bad ? '<br>' + esc(e.bad) : '');
    var right = (e.ok ? esc(e.ok) : '') + (e.ok && e.link ? '<br>' : '') + (e.link ? where(e.link) : '');
    return [String(i + 1), what, right];
  }), { gl: 1, cap: DATA.errTitle, cls: ['dbv-n dbv-wn', '', 'dbv-we'] });
  root.innerHTML =
    '<section class="dbv-sec dbv-stack" id="dbv-kr"><h2 class="dbv-h2">' + esc(DATA.title) + '</h2><p class="dbv-body">' + esc(DATA.lead) + '</p>' + flow(DATA.scheme) +
    '<p class="dbv-body" data-gl><b>' + esc(DATA.okPl) + '</b></p>' + pairs +
    '<div class="dbv-warn" role="note"><p>' + esc(DATA.noPl) + '</p></div></section>' +
    '<section class="dbv-sec dbv-stack" id="dbv-errors"><h2 class="dbv-h2">' + esc(DATA.errTitle) + '</h2>' + errs + '</section>';
  dbvGlossary(root).apply(root);
  root.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-jump]');
    if (a) { e.preventDefault(); scrollToId(a.getAttribute('data-jump')); }
  });
}
[].forEach.call(document.querySelectorAll('.dbv-krb'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
