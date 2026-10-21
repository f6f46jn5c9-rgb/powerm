/* Модуль подсказок-аббревиатур (общий, копируется в каждый блок, где есть data-gl). Словарь — GLOSSARY. */
var GLOSSARY = {
  'КТ': 'контрольная точка: момент, когда принимается решение, можно ли проекту переходить на следующий этап.',
  'ЛПР': 'лицо, принимающее решение по контрольной точке: комиссия по портфелю, координатор проектного трека, заказчик проекта или ЛСП.',
  'СОП': 'стандартная операционная процедура.',
  'ЛНА': 'локальный нормативный акт.',
  'КР': 'ключевой результат: проверяемое состояние, по которому видно, что цель проекта достигнута. У каждого КР есть показатель, исходное и целевое значение, плановая дата.',
  'ПЗ': 'система управления проектами «Полярная звезда».',
  'РП': 'руководитель проекта: член проектной команды, которого выбрала команда.',
  'ЛСП': 'лидер стратегического приоритета: руководитель, отвечающий за цели приоритета и проекты программы по нему.',
  'ДРП': 'Дирекция по работе с персоналом; организатор академического трека.',
  'ЦРБС': 'Центр развития бизнес-системы; организатор проектного трека.',
  'ГД': 'генеральный директор «Силовых машин».',
  'ДИТ': 'Дирекция по информационным технологиям.',
  'ДОБ': 'Дирекция по обеспечению безопасности.',
  'БП': 'бизнес-партнёр стратегического приоритета.'
};

/* Оборачивает первое вхождение каждой аббревиатуры в каждом [data-gl] и показывает подсказку. Возвращает {apply, hide}. */
function dbvGlossary(root) {
  var tip = document.createElement('div');
  tip.className = 'dbv-tip';
  tip.id = 'dbv-tip-' + root.className.split(' ')[0];
  tip.setAttribute('role', 'tooltip');
  var tT = document.createElement('div'), tD = document.createElement('div');
  tT.className = 'dbv-tip__t'; tD.className = 'dbv-tip__d';
  tip.appendChild(tT); tip.appendChild(tD);
  root.appendChild(tip);
  var cur = null, lastType = 'mouse';
  var SKIP = 'button,summary,a,h1,h2,h3,h4,[role=tab],.dbv-ab,script,style';

  function apply(scope) {
    var list = [].slice.call(scope.querySelectorAll('[data-gl]'));
    if (scope.hasAttribute && scope.hasAttribute('data-gl')) list.unshift(scope);
    list.forEach(function (el) {
      if (el.parentElement && el.parentElement.closest('[data-gl]') && list.indexOf(el.parentElement.closest('[data-gl]')) > -1) return;
      var seen = {}, nodes = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) {
        if (n.parentElement && !n.parentElement.closest(SKIP)) nodes.push(n);
      }
      nodes.forEach(function (tn) {
        var s = tn.nodeValue, re = /[A-Za-zА-яЁё]+\d*/g, m, last = 0, frag = null;
        while ((m = re.exec(s))) {
          var key = m[0].replace(/\d+$/, '');
          if (!Object.prototype.hasOwnProperty.call(GLOSSARY, key) || seen[key]) continue;
          seen[key] = 1;
          if (!frag) frag = document.createDocumentFragment();
          if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
          var sp = document.createElement('span');
          sp.className = 'dbv-ab';
          sp.setAttribute('tabindex', '0');
          sp.setAttribute('role', 'button');
          sp.setAttribute('aria-describedby', tip.id);
          sp.setAttribute('aria-expanded', 'false');
          sp.setAttribute('data-k', key);
          sp.textContent = m[0];
          frag.appendChild(sp);
          last = m.index + m[0].length;
        }
        if (frag) {
          if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
          tn.parentNode.replaceChild(frag, tn);
        }
      });
    });
  }

  function hide() {
    if (cur) cur.setAttribute('aria-expanded', 'false');
    cur = null;
    tip.classList.remove('is-open');
  }

  function show(el) {
    if (cur && cur !== el) cur.setAttribute('aria-expanded', 'false');
    cur = el;
    var k = el.getAttribute('data-k');
    tT.textContent = k;
    tD.textContent = GLOSSARY[k];
    el.setAttribute('aria-expanded', 'true');
    var rr = root.getBoundingClientRect(), r = el.getBoundingClientRect();
    tip.style.maxWidth = Math.max(120, Math.min(300, rr.width - 16)) + 'px';
    tip.style.left = '0px'; tip.style.top = '0px';
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var cx = r.left + r.width / 2 - rr.left - root.clientLeft;
    var left = Math.max(8, Math.min(cx - tw / 2, rr.width - tw - 8));
    var top = r.top - rr.top - root.clientTop - th - 10, below = false;
    if (top < 0) { below = true; top = r.bottom - rr.top - root.clientTop + 10; }
    tip.style.left = Math.round(left) + 'px';
    tip.style.top = Math.round(top) + 'px';
    tip.style.setProperty('--ax', Math.round(Math.max(14, Math.min(cx - left, tw - 14))) + 'px');
    tip.classList.toggle('is-below', below);
    tip.classList.add('is-open');
  }

  function ab(t) { return t && t.closest ? t.closest('.dbv-ab') : null; }
  root.addEventListener('pointerdown', function (e) { lastType = e.pointerType || 'mouse'; }, true);
  root.addEventListener('keydown', function (e) {
    lastType = 'key';
    var a = ab(e.target);
    if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); cur === a ? hide() : show(a); }
  }, true);
  root.addEventListener('pointerover', function (e) {
    var a = ab(e.target);
    if (a && e.pointerType === 'mouse') show(a);
  });
  root.addEventListener('pointerout', function (e) {
    var a = ab(e.target);
    if (a && e.pointerType === 'mouse' && !(e.relatedTarget && a.contains(e.relatedTarget))) hide();
  });
  root.addEventListener('click', function (e) {
    var a = ab(e.target);
    if (!a) return;
    if (lastType === 'touch' || lastType === 'pen') cur === a ? hide() : show(a);
    else if (cur !== a) show(a);
  });
  root.addEventListener('focusin', function (e) {
    var a = ab(e.target);
    if (a && lastType === 'key') show(a);
  });
  root.addEventListener('focusout', function (e) {
    var a = ab(e.target);
    if (a && a === cur) hide();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  document.addEventListener('pointerdown', function (e) { if (!ab(e.target)) hide(); });
  window.addEventListener('resize', hide);
  return { apply: apply, hide: hide };
}
