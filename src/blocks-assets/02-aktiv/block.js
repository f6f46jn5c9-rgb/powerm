/* Здесь правятся определение актива, пары «является / не является», тексты викторины, типы активов (t — название, ex — пример, sign — признак). Меняйте только текст между кавычками; icon не трогайте. */
var DATA = {
  title: 'Актив: что это и что нет',
  def: 'Актив — результат проекта, которым можно пользоваться после завершения работы проектной команды.',
  crit: 'Критерий проверки: что остаётся в подразделении после ухода команды.',
  modes: ['Сравнить', 'Проверить себя'],
  labels: { yes: 'Является активом', no: 'Не является активом' },
  pairs: [
    ['Шаблон отчёта', 'Заполненный отчёт по конкретному договору'],
    ['Дашборд', 'Протокол совещания'],
    ['СОП, регламент, методика, плейбук', 'Черновик рабочего документа'],
    ['Типовой шаблон договора', 'Договор с конкретным заказчиком'],
    ['Схема или настройка, загруженная в систему', 'План мероприятий текущего проекта'],
    ['Инструмент проведения опросов', 'Опрос, который команда провела сама']
  ],
  quiz: { n: 'Вопрос', of: 'из', yes: 'Актив', no: 'Не актив', ok: 'Верно', bad: 'Неверно', isY: 'Это актив', isN: 'Это не актив', next: 'Дальше', total: 'Верно:', again: 'Сначала' },
  note: 'Бенчмарки, обзоры практик и рабочие таблицы — материалы команды. В реестр активов в ПЗ они не загружаются: в реестре фиксируются только результаты, которые будут применяться другими работниками.',
  typesH: 'Основные типы активов',
  typesLead: 'Перечень не является закрытым: актив может иметь и другой формат. Примеры условные, по мотивам проектов ДБВ‑2026: они служат ориентиром, который помогает отличить актив от материала, активом не являющегося.',
  typeLabels: { ex: 'Пример', sign: 'Признак применимости актива' },
  types: [
    { icon: 'doc', t: 'Регламент', ex: 'Регламент блокировки несоответствий в SAP для цеха.', sign: 'Блокировки срабатывают по регламенту; назначен ответственный за реакцию.' },
    { icon: 'list', t: 'СОП или плейбук', ex: 'СОП безопасных работ на высоте; плейбук наставничества.', sign: 'Применён на пилотном участке, затем тиражирован без команды проекта.' },
    { icon: 'calc', t: 'Модель', ex: 'Расчётная модель целевой численности по функциональным направлениям.', sign: 'Применена в реальном решении, например при формировании бюджета; согласована с владельцем метрики.' },
    { icon: 'chart', t: 'Дашборд', ex: 'Дашборд обращений клиентов со сроком реакции.', sign: 'Определены: кто открывает дашборд, как часто, какое решение принимает и кто отвечает при отклонении показателей.' },
    { icon: 'cap', t: 'Обучающая программа', ex: 'Программа подготовки и аттестации наставников.', sign: 'Обучение прошли конкретные люди, наставники назначены.' },
    { icon: 'stamp', t: 'ЛНА', ex: 'Локальный нормативный акт, закрепляющий процесс и роли.', sign: 'Утверждён, на него ссылаются в работе подразделения.' }
  ]
};
/*%%GLOSSARY%%*/
var IC = {
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 20 3M16 7l3 3M13.5 9.5l2.5 2.5"/>',
  chk: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.5v.2"/>',
  target: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.4"/>',
  doc: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5"/>',
  list: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8l1.5 1.5L12 7M8 14l1.5 1.5L12 13M14.5 8.5H17M14.5 14.5H17"/>',
  calc: '<rect x="4.5" y="2.5" width="15" height="19" rx="2.5"/><path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  chart: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3"/>',
  cap: '<path d="M2 9.5 12 5l10 4.5-10 4.5z"/><path d="M6 11.7V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.3M22 9.5V15"/>',
  stamp: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><circle cx="12" cy="14" r="3"/><path d="M14 2.5V8h5.5"/>',
  arr: '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

function init(root, uid) {
  var Q = DATA.quiz, TY = DATA.types, mode = 0, tcur = 0, lastW = -1;
  var items = [];
  DATA.pairs.forEach(function (p) { items.push({ t: p[0], a: true }); items.push({ t: p[1], a: false }); });
  var order = [], qi = 0, score = 0, answered = false;

  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2>' +
    '<div class="dbv-def dbv-glass"><span class="dbv-ico">' + svg('key') + '</span><p class="dbv-body">' + esc(DATA.def) + '</p></div>' +
    '<div class="dbv-crit">' + svg('target') + '<p class="dbv-body" data-gl>' + esc(DATA.crit) + '</p></div>' +
    '<div class="dbv-tb" role="tablist" aria-label="Режим">' + DATA.modes.map(function (m, i) { return '<button type="button" class="dbv-tab" role="tab" id="' + uid + '-m' + i + '" data-i="' + i + '" aria-controls="' + uid + '-pn' + i + '" aria-selected="false" tabindex="-1">' + esc(m) + '</button>'; }).join('') + '</div>' +
    '<div class="dbv-pn" role="tabpanel" id="' + uid + '-pn0" aria-labelledby="' + uid + '-m0"><div class="dbv-cp">' +
    '<div class="dbv-cp__h"><div class="dbv-cp__hc dbv-cp__hc--y"><span class="dbv-mk dbv-mk--y">' + svg('chk') + '</span>' + esc(DATA.labels.yes) + '</div><div class="dbv-cp__hc dbv-cp__hc--n"><span class="dbv-mk dbv-mk--n">' + svg('x') + '</span>' + esc(DATA.labels.no) + '</div></div>' +
    DATA.pairs.map(function (p) { return '<div class="dbv-cp__r"><div class="dbv-cell dbv-cell--y"><span class="dbv-cell__l">' + esc(DATA.labels.yes) + '</span><span data-gl>' + esc(p[0]) + '</span></div><div class="dbv-cell dbv-cell--n"><span class="dbv-cell__l">' + esc(DATA.labels.no) + '</span><span data-gl>' + esc(p[1]) + '</span></div></div>'; }).join('') + '</div></div>' +
    '<div class="dbv-pn" role="tabpanel" id="' + uid + '-pn1" aria-labelledby="' + uid + '-m1" hidden><div class="dbv-qz" data-qz></div></div>' +
    '<div class="dbv-note" role="note">' + svg('info') + '<p class="dbv-body" data-gl>' + esc(DATA.note) + '</p></div>' +
    '<h3 class="dbv-h3 dbv-act__h3">' + esc(DATA.typesH) + '</h3><p class="dbv-small">' + esc(DATA.typesLead) + '</p>' +
    '<div class="dbv-ty__g" role="group" aria-label="' + esc(DATA.typesH) + '">' + TY.map(function (t, i) { return '<button type="button" class="dbv-ty" id="' + uid + '-ty' + i + '" data-i="' + i + '" aria-pressed="false" tabindex="-1"><span class="dbv-ico">' + svg(t.icon) + '</span><span class="dbv-ty__t">' + esc(t.t) + '</span></button>'; }).join('') + '</div>' +
    '<div class="dbv-typ" role="region"><div class="dbv-typ__c" data-tc></div><div class="dbv-meas dbv-typ__c" aria-hidden="true" data-meas></div></div>';
  var gl = dbvGlossary(root);
  gl.apply(root);
  var tabs = [].slice.call(root.querySelectorAll('.dbv-tab')), panes = [].slice.call(root.querySelectorAll('.dbv-pn')), qz = root.querySelector('[data-qz]');
  var tiles = [].slice.call(root.querySelectorAll('.dbv-ty')), typ = root.querySelector('.dbv-typ'), tc = root.querySelector('[data-tc]'), meas = root.querySelector('[data-meas]');

  function setMode(i, focus) {
    mode = i;
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; panes[k].hidden = k !== i; });
    gl.hide();
    if (i === 1) startQuiz();
    if (focus) tabs[i].focus();
  }
  function startQuiz() { order = shuffle(items); qi = 0; score = 0; answered = false; renderQ(); }
  function renderQ() {
    gl.hide();
    if (qi >= order.length) {
      qz.innerHTML = '<div class="dbv-qz__c dbv-glass"><div class="dbv-qz__sum" aria-live="polite">' + esc(Q.total) + ' ' + score + ' ' + esc(Q.of) + ' ' + order.length + '</div><div class="dbv-qz__n"><button type="button" class="dbv-lnk" data-again>' + esc(Q.again) + '</button></div></div>';
      qz.querySelector('[data-again]').focus();
      return;
    }
    answered = false;
    qz.innerHTML = '<div class="dbv-qz__p">' + esc(Q.n) + ' ' + (qi + 1) + ' ' + esc(Q.of) + ' ' + order.length + '</div><div class="dbv-qz__c dbv-glass"><div class="dbv-qz__t" data-gl>' + esc(order[qi].t) + '</div>' +
      '<div class="dbv-qz__b"><button type="button" class="dbv-ans dbv-ans--y" data-a="1">' + esc(Q.yes) + '</button><button type="button" class="dbv-ans dbv-ans--n" data-a="0">' + esc(Q.no) + '</button></div>' +
      '<div class="dbv-qz__r" aria-live="polite" data-res></div><div class="dbv-qz__n"><button type="button" class="dbv-lnk" data-next hidden>' + esc(Q.next) + ' ' + svg('arr') + '</button></div></div>';
    gl.apply(qz);
  }
  function answer(btn) {
    if (answered) return;
    answered = true;
    var v = btn.getAttribute('data-a') === '1', it = order[qi], ok = v === it.a;
    if (ok) score++;
    [].forEach.call(qz.querySelectorAll('.dbv-ans'), function (b) { b.setAttribute('aria-disabled', 'true'); });
    btn.classList.add('is-pick');
    qz.querySelector('[data-res]').innerHTML = '<div class="dbv-qs dbv-qs--' + (ok ? 'ok' : 'bad') + '"><span class="dbv-mk dbv-mk--' + (ok ? 'y' : 'n') + '">' + svg(ok ? 'chk' : 'x') + '</span><span>' + esc(ok ? Q.ok : Q.bad) + '</span></div><p class="dbv-qz__a">' + esc(it.a ? Q.isY : Q.isN) + '</p><p class="dbv-small">' + esc(DATA.crit) + '</p>';
    var nx = qz.querySelector('[data-next]'); nx.hidden = false; nx.focus();
  }
  qz.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.dbv-ans');
    if (a) { answer(a); return; }
    if (e.target.closest && e.target.closest('[data-next]')) { qi++; renderQ(); return; }
    if (e.target.closest && e.target.closest('[data-again]')) startQuiz();
  });
  root.querySelector('.dbv-tb').addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('.dbv-tab'); if (t) setMode(+t.getAttribute('data-i')); });
  root.querySelector('.dbv-tb').addEventListener('keydown', function (e) {
    var k = e.key, to = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = (mode + 1) % tabs.length; else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (mode + tabs.length - 1) % tabs.length; else if (k === 'Home') to = 0; else if (k === 'End') to = tabs.length - 1;
    if (to < 0) return;
    e.preventDefault(); setMode(to, true);
  });

  function tHtml(t) { return '<div><div class="dbv-typ__lab">' + esc(DATA.typeLabels.ex) + '</div><p class="dbv-typ__p" data-gl>' + esc(t.ex) + '</p></div><div><div class="dbv-typ__lab">' + esc(DATA.typeLabels.sign) + '</div><p class="dbv-typ__p" data-gl>' + esc(t.sign) + '</p></div>'; }
  function tRender(fade) {
    gl.hide(); tc.innerHTML = tHtml(TY[tcur]); gl.apply(tc);
    typ.setAttribute('aria-labelledby', tiles[tcur].id);
    if (fade && !reduced()) { tc.classList.remove('is-new'); void tc.offsetWidth; tc.classList.add('is-new'); }
  }
  function tPaint() { tiles.forEach(function (t, i) { t.setAttribute('aria-pressed', i === tcur ? 'true' : 'false'); t.tabIndex = i === tcur ? 0 : -1; }); }
  function tSelect(i, focus) { if (i !== tcur) { tcur = i; tPaint(); tRender(true); } if (focus) tiles[i].focus(); }
  function measure() {
    var cs = getComputedStyle(typ), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom), bw = parseFloat(cs.borderTopWidth) * 2;
    meas.style.left = pl + 'px'; meas.style.top = pt + 'px'; meas.style.width = (typ.clientWidth - pl - pr) + 'px';
    var max = 0; TY.forEach(function (t) { meas.innerHTML = tHtml(t); max = Math.max(max, meas.offsetHeight); });
    meas.innerHTML = ''; typ.style.height = Math.ceil(max + pt + pb + bw + 4) + 'px';
  }
  root.querySelector('.dbv-ty__g').addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('.dbv-ty'); if (t) tSelect(+t.getAttribute('data-i')); });
  root.querySelector('.dbv-ty__g').addEventListener('keydown', function (e) {
    var k = e.key, n = tiles.length, to = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = (tcur + 1) % n; else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (tcur + n - 1) % n; else if (k === 'Home') to = 0; else if (k === 'End') to = n - 1;
    if (to < 0) return;
    e.preventDefault(); tSelect(to, true);
  });
  setMode(0); tPaint(); tRender(false); measure();
  function onSize() { var w = root.clientWidth; if (w === lastW) return; lastW = w; requestAnimationFrame(measure); }
  if (window.ResizeObserver) new ResizeObserver(onSize).observe(root); else window.addEventListener('resize', onSize);
  lastW = root.clientWidth;
}
[].forEach.call(document.querySelectorAll('.dbv-act'), function (r, n) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r, 'dbv-act' + n);
});
