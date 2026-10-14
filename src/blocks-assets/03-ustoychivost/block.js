/* Здесь правятся три опоры (t — название, c — подпись) и три уровня изменения. Меняйте только текст между кавычками; icon не трогайте. */
var DATA = {
  title: 'Что делает результат устойчивым',
  lead: 'Устойчивость результата обеспечивается тремя компонентами. При отсутствии любого из них результат остаётся документом, который не применяется.',
  pillarsH: 'Три опоры',
  platform: 'Устойчивый результат',
  pillars: [
    { icon: 'flow', t: 'Процесс', c: 'Карта процесса или плейбук — шаги, входы и выходы, точки контроля.' },
    { icon: 'users', t: 'Роли', c: 'Матрица ролей, описание функций, владелец результата после проекта.' },
    { icon: 'server', t: 'Инфраструктура', c: 'Система, дашборд, шаблоны, доступы.' }
  ],
  state: { on: 'на месте', off: 'убрана' },
  alert: 'Нет опоры — результат остаётся документом, который не применяется.',
  restore: 'Вернуть все опоры',
  levelsH: 'Три уровня изменения',
  levelsCap: 'Изменение проходит три уровня:',
  levels: [
    { t: 'Принятие', c: 'Работники понимают смысл изменения.' },
    { t: 'Применение', c: 'Инструмент используется без напоминаний.' },
    { t: 'Закрепление', c: 'Изменение встроено в регламенты, метрики и оценку.' }
  ],
  fin: 'В проекте предусматриваются мероприятия по каждому уровню.'
};
var IC = {
  flow: '<rect x="3" y="3.5" width="7" height="5.5" rx="1.5"/><rect x="14" y="15" width="7" height="5.5" rx="1.5"/><path d="M6.5 9v3.5a2 2 0 0 0 2 2H14M12 11.8l2.5 2.7-2.5 2.7"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
  server: '<rect x="3" y="4" width="18" height="6.5" rx="2"/><rect x="3" y="13.5" width="18" height="6.5" rx="2"/><path d="M7 7.2h.01M7 16.8h.01"/>',
  warn: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="M12 8v5M12 16v.5"/>',
  arr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chk: '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'
};
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function svg(n) { return '<svg class="dbv-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }
function init(root) {
  var P = DATA.pillars, S = DATA.state, on = P.map(function () { return true; });
  root.innerHTML = '<h2 class="dbv-h2">' + esc(DATA.title) + '</h2><p class="dbv-body dbv-sus__lead">' + esc(DATA.lead) + '</p>' +
    '<h3 class="dbv-h3 dbv-sus__h3">' + esc(DATA.pillarsH) + '</h3><div class="dbv-tbl"><div class="dbv-plat" data-plat>' + esc(DATA.platform) + '</div><div class="dbv-legs">' +
    P.map(function (p, i) { return '<div class="dbv-leg"><button type="button" class="dbv-leg__b" data-i="' + i + '" aria-pressed="true">' + svg(p.icon) + '<span>' + esc(p.t) + '</span><span class="dbv-leg__s" data-st>' + esc(S.on) + '</span></button><p class="dbv-leg__c">' + esc(p.c) + '</p></div>'; }).join('') +
    '</div></div><div class="dbv-alert" aria-live="polite" data-alert></div><button type="button" class="dbv-btn" data-restore hidden>' + svg('reset') + esc(DATA.restore) + '</button>' +
    '<h3 class="dbv-h3 dbv-sus__h3">' + esc(DATA.levelsH) + '</h3><p class="dbv-body dbv-sus__cap">' + esc(DATA.levelsCap) + '</p><div class="dbv-lad">' +
    DATA.levels.map(function (l, i) { return (i ? '<span class="dbv-lad__a" aria-hidden="true">' + svg('arr') + '</span>' : '') + '<div class="dbv-stp dbv-stp--' + (i + 1) + '"><span class="dbv-stp__n" aria-hidden="true">' + (i + 1) + '</span><span class="dbv-stp__t">' + esc(l.t) + '</span><span class="dbv-stp__c">' + esc(l.c) + '</span></div>'; }).join('') +
    '</div><div class="dbv-fin">' + svg('chk') + '<p class="dbv-body">' + esc(DATA.fin) + '</p></div>';
  var plat = root.querySelector('[data-plat]'), bs = [].slice.call(root.querySelectorAll('.dbv-leg__b')), al = root.querySelector('[data-alert]'), rs = root.querySelector('[data-restore]');
  function paint() {
    var off = on.filter(function (x) { return !x; }).length;
    bs.forEach(function (b, i) { b.setAttribute('aria-pressed', on[i] ? 'true' : 'false'); b.querySelector('[data-st]').textContent = on[i] ? S.on : S.off; });
    var tilt = (on[2] ? 0 : 3) - (on[0] ? 0 : 3);
    plat.classList.toggle('is-weak', off > 0);
    plat.style.transform = tilt ? 'rotate(' + tilt + 'deg)' : '';
    plat.setAttribute('data-tilt', tilt);
    al.innerHTML = off ? '<div class="dbv-stop">' + svg('warn') + '<p class="dbv-body">' + esc(DATA.alert) + '</p></div>' : '';
    rs.hidden = !off;
  }
  bs.forEach(function (b, i) { b.addEventListener('click', function () { on[i] = !on[i]; paint(); }); });
  rs.addEventListener('click', function () { on = P.map(function () { return true; }); paint(); bs[0].focus(); });
  paint();
}
[].forEach.call(document.querySelectorAll('.dbv-sus'), function (r) {
  if (r.getAttribute('data-dbv-init')) return;
  r.setAttribute('data-dbv-init', '1');
  init(r);
});
