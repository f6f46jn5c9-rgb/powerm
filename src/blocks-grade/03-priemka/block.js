/* Здесь правятся критерии приёмки (t — название, w — вес в баллах, сумма 100), статусы (границы lo — в десятых долях балла) и текст критического нарушения. Меняйте только текст между кавычками. */
var DATA = {
  title: 'Приёмка результата заказчиком',
  lead: 'Заказчик оценивает заключительный отчёт по семи критериям, каждый по шкале 0–5. Итог — сумма взвешенных оценок из 100 возможных.',
  cH: 'Критерии и веса', pts: 'баллов',
  crit: [
    { t: 'Результат — инструмент, который работает без команды (актив в ПЗ)', w: 25 },
    { t: 'Измеримый эффект: исходное значение, фактическое значение, методика расчёта', w: 25 },
    { t: 'Соответствие требованиям и объёму работ («заказано и сдано»)', w: 20 },
    { t: 'Владелец результата назначен и подтвердил готовность принять результат', w: 10 },
    { t: 'Подтверждающие материалы в ПЗ', w: 10 },
    { t: 'Сопоставление плана и факта по КР и срокам', w: 5 },
    { t: 'Качество управленческого резюме', w: 5 }
  ],
  sH: 'Шкала статусов',
  statuses: [
    { n: 'Не принят', r: 'Менее 47', lo: 0, c: '#E01828' },
    { n: 'Отправлен на доработку', r: 'От 47 до 69', lo: 470, c: '#F2B01E' },
    { n: 'Принят с замечаниями', r: 'От 69 до 85', lo: 690, c: '#A8C93A' },
    { n: 'Принят', r: '85 и более', lo: 850, c: '#007890' }
  ],
  ticks: [0, 47, 69, 85, 100],
  critical: 'Критическое нарушение — нет исходных значений или методики расчёта эффекта, нет подтверждающих материалов, нет владельца результата, ответственных или сроков, незавершённые действия выданы за достижения — ограничивает статус уровнем «Принят с замечаниями».',
  calcH: 'Рассчитайте баллы приёмки',
  jury: 'Средняя оценка жюри (от 1 до 5)', juryErr: 'Введите число от 1 до 5',
  viol: 'Есть критическое нарушение',
  cnt: 'Оценено критериев:', of: 'из', total: 'Баллы приёмки:', of100: 'из 100', reset: 'Сбросить',
  capPre: 'Статус ограничен уровнем «Принят с замечаниями»:', capV: 'критическое нарушение.', capJ: 'средняя оценка жюри ниже 3,0.',
  hint: 'Это ориентировочный расчёт. Баллы приёмки выставляет заказчик проекта с учётом оценки жюри.'
};
/*%%GLOSSARY%%*/
var IC = { warn: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 8v5M12 16v.5"/>', info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5M12 7.5v.2"/>' };
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function fmt10(t) { return Math.floor(t / 10) + ',' + (t % 10); }

function init(root) {
  var C = DATA.crit, S = DATA.statuses, sc = C.map(function () { return -1; });
  function status(p10) { var z = S[0]; S.forEach(function (x) { if (p10 >= x.lo) z = x; }); return z; }
  var segW = [47, 22, 16, 15];
  root.innerHTML = '<h2 class="dbv-h2" id="dbv-accept">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-acc__lead" data-gl>' + esc(DATA.lead) + '</p>' +
    '<h3 class="dbv-h3 dbv-acc__h3" style="margin-top:26px !important">' + esc(DATA.cH) + '</h3>' +
    '<div class="dbv-sb" aria-hidden="true">' + C.map(function (c, i) { return '<span class="dbv-sb__s" style="flex:' + c.w + ' 1 0">' + (i + 1) + '</span>'; }).join('') + '</div>' +
    '<div class="dbv-sl" role="list">' + C.map(function (c, i) { return '<div class="dbv-sr" role="listitem"><span class="dbv-sr__n" aria-hidden="true">' + (i + 1) + '</span><span class="dbv-sr__t" data-gl>' + esc(c.t) + '</span><span class="dbv-chip">' + c.w + ' ' + esc(DATA.pts) + '</span></div>'; }).join('') + '</div>' +
    '<h3 class="dbv-h3 dbv-acc__h3">' + esc(DATA.sH) + '</h3><div class="dbv-ss" style="grid-template-columns:' + segW.map(function (w) { return w + 'fr'; }).join(' ') + '">' +
    DATA.ticks.map(function (t) { return '<span class="dbv-st dbv-st--' + t + '" aria-hidden="true" style="left:' + t + '%">' + t + '</span>'; }).join('') +
    S.map(function (s) { return '<div class="dbv-sc"><span class="dbv-sc__bar" style="background:' + s.c + '"></span><div class="dbv-sc__n"><span class="dbv-dot" style="background:' + s.c + '"></span><span>' + esc(s.n) + '</span></div><div class="dbv-sc__r">' + esc(s.r) + '</div></div>'; }).join('') + '</div>' +
    '<div class="dbv-crit" role="note">' + svg('warn') + '<p class="dbv-body" data-gl>' + esc(DATA.critical) + '</p></div>' +
    '<h3 class="dbv-h3 dbv-acc__h3">' + esc(DATA.calcH) + '</h3><div class="dbv-cl">' +
    C.map(function (c, i) { return '<div class="dbv-cr"><span class="dbv-cr__t" data-gl>' + esc(c.t) + '</span><div class="dbv-rg" role="radiogroup" aria-label="' + esc(c.t) + '" data-i="' + i + '">' +
      [0, 1, 2, 3, 4, 5].map(function (v) { return '<button type="button" class="dbv-rb" role="radio" aria-checked="false" data-v="' + v + '" tabindex="' + (v === 0 ? 0 : -1) + '">' + v + '</button>'; }).join('') + '</div></div>'; }).join('') + '</div>' +
    '<div class="dbv-opt"><div class="dbv-fld"><label for="dbv-acc-j">' + esc(DATA.jury) + '</label><input type="number" id="dbv-acc-j" min="1" max="5" step="0.1" inputmode="decimal" aria-describedby="dbv-acc-e"><p class="dbv-err" id="dbv-acc-e" data-err></p></div></div>' +
    '<label class="dbv-chkl"><input type="checkbox" data-viol>' + esc(DATA.viol) + '</label>' +
    '<div class="dbv-cnt" data-cnt></div><div class="dbv-res" aria-live="polite" data-res></div><button type="button" class="dbv-lnk" data-reset>' + esc(DATA.reset) + '</button>' +
    '<p class="dbv-small dbv-acc__hint">' + esc(DATA.hint) + '</p>';
  dbvGlossary(root).apply(root);
  var groups = [].slice.call(root.querySelectorAll('.dbv-rg')), inp = root.querySelector('input[type=number]'), viol = root.querySelector('[data-viol]'), err = root.querySelector('[data-err]'), cnt = root.querySelector('[data-cnt]'), res = root.querySelector('[data-res]');
  function jury() {
    var raw = inp.value.trim();
    if (raw === '') { err.textContent = ''; inp.classList.remove('is-bad'); inp.removeAttribute('aria-invalid'); return null; }
    var v = Number(raw.replace(',', '.'));
    if (!(v >= 1 && v <= 5)) { err.textContent = DATA.juryErr; inp.classList.add('is-bad'); inp.setAttribute('aria-invalid', 'true'); return null; }
    err.textContent = ''; inp.classList.remove('is-bad'); inp.removeAttribute('aria-invalid'); return v;
  }
  function calc() {
    var n = sc.filter(function (v) { return v >= 0; }).length, j = jury();
    cnt.textContent = DATA.cnt + ' ' + n + ' ' + DATA.of + ' ' + C.length;
    groups.forEach(function (g, i) { [].forEach.call(g.querySelectorAll('.dbv-rb'), function (b) { var v = +b.getAttribute('data-v'); b.setAttribute('aria-checked', sc[i] === v ? 'true' : 'false'); b.tabIndex = sc[i] >= 0 ? (sc[i] === v ? 0 : -1) : (v === 0 ? 0 : -1); }); });
    if (n < C.length) { res.innerHTML = ''; return; }
    var sum = 0; C.forEach(function (c, i) { sum += sc[i] * c.w; });
    var p10 = 2 * sum, base = status(p10), fin = base, why = [];
    if (base === S[3]) {
      if (viol.checked) why.push(DATA.capV);
      if (j !== null && j < 3) why.push(DATA.capJ);
      if (why.length) fin = S[2];
    }
    var pc = p10 / 10;
    res.innerHTML = '<div class="dbv-resc" style="border-color:' + fin.c + '"><div class="dbv-resc__s">' + esc(DATA.total) + ' ' + fmt10(p10) + ' ' + esc(DATA.of100) + '</div>' +
      '<div class="dbv-mk">' + segW.map(function (w, i) { return '<span class="dbv-mk__s" style="flex:' + w + ' 1 0;background:' + S[i].c + '"></span>'; }).join('') + '<span class="dbv-mk__m" style="left:' + pc + '%"></span></div>' +
      '<div class="dbv-resc__z"><span class="dbv-dot" style="background:' + fin.c + '"></span><span>' + esc(fin.n) + '</span></div>' +
      why.map(function (w) { return '<div class="dbv-rs">' + svg('info') + '<span>' + esc(DATA.capPre + ' ' + w) + '</span></div>'; }).join('') + '</div>';
    res.setAttribute('data-status', fin.n); res.setAttribute('data-points', fmt10(p10));
  }
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-rb');
    if (b) { sc[+b.parentNode.getAttribute('data-i')] = +b.getAttribute('data-v'); calc(); return; }
    if (e.target.closest && e.target.closest('[data-reset]')) { sc = C.map(function () { return -1; }); inp.value = ''; viol.checked = false; calc(); }
  });
  root.addEventListener('keydown', function (e) {
    var b = e.target.closest && e.target.closest('.dbv-rb');
    if (!b) return;
    var k = e.key, v = +b.getAttribute('data-v'), to = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') to = (v + 1) % 6; else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (v + 5) % 6; else if (k === 'Home') to = 0; else if (k === 'End') to = 5; else if (k === ' ' || k === 'Enter') { e.preventDefault(); b.click(); return; }
    if (to < 0) return;
    e.preventDefault(); sc[+b.parentNode.getAttribute('data-i')] = to; calc(); b.parentNode.querySelector('[data-v="' + to + '"]').focus();
  });
  inp.addEventListener('input', calc); viol.addEventListener('change', calc);
  calc();
}
[].forEach.call(document.querySelectorAll('.dbv-acc'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
