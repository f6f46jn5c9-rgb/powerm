(function () {
  "use strict";

  /* ============================================================
     НАСТРОЙКИ КАТАЛОГА (здесь добавляются плитки и инструменты)
     ============================================================ */

  // true — показать ещё и скрытые плитки со значком «Скоро» (для просмотра полной раскладки)
  var SHOW_HIDDEN = false;

  // size: 'l' — большая, 'm' — средняя, 's' — малая, 'w' — на всю ширину
  // hidden: true — плитка не показывается; false — показывается
  // links: список инструментов плитки. Одна строка = один инструмент:
  //        {name:'Название инструмента', url:'https://...'}
  var GROUPS = [
    { id: 'support', title: 'Обеспечивающие функции', cls: 'support', tiles: [
      { id: 'ot', title: 'Охрана труда', icon: 'shield', size: 'l', hidden: false, links: [
        { name: 'Интерактивная карта цеха по зонам и опасным факторам', url: 'https://kb.severstal.com/spaces/BSS/pages/575668860/%D0%9A%D0%B0%D1%80%D1%82%D0%B0+%D0%B1%D0%B5%D0%B7%D0%BE%D0%BF%D0%B0%D1%81%D0%BD%D0%BE%D1%81%D1%82%D0%B8+%D1%83%D1%87%D0%B0%D1%81%D1%82%D0%BA%D0%B0' }
      ] },
      { id: 'zakupki', title: 'Закупки, логистика, склад', icon: 'cart',  size: 's', hidden: true, links: [] },
      { id: 'sbyt',    title: 'Сбыт',                      icon: 'trend', size: 's', hidden: true, links: [] },
      { id: 'it',      title: 'IT',                        icon: 'code',  size: 's', hidden: true, links: [] },
      { id: 'hr',      title: 'HR и обучение',             icon: 'users', size: 's', hidden: true, links: [] },
      { id: 'fin',     title: 'Финансы и экономика',       icon: 'coins', size: 'w', hidden: true, links: [] }
    ] }
  ];

  /* ============================================================
     Ниже менять ничего не нужно
     ============================================================ */

  var ICONS = {
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H6"/>',
    code: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M9.5 8.5L7 10.5l2.5 2M14.5 8.5l2.5 2-2.5 2"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    trend: '<polyline points="3 17 9 11 13 15 21 5"/><polyline points="14 5 21 5 21 12"/>',
    coins: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9a3 3 0 0 0-5 1.5c0 3 5 2 5 5a3 3 0 0 1-5 1.5M12 6.5v1.5M12 16v1.5"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    chevron: '<polyline points="6 9 12 15 18 9"/>',
    arrow: '<path d="M4 12h15"/><path d="M14 7l5 5-5 5"/>'
  };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var SIZES = { l: 1, m: 1, s: 1, w: 1 };

  function svg(key, size, cls) {
    var s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('width', size);
    s.setAttribute('height', size);
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.8');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (cls) { s.setAttribute('class', cls); }
    s.innerHTML = ICONS[key] || '';
    return s;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text != null) { e.textContent = text; }
    return e;
  }

  function isVisible(t) { return SHOW_HIDDEN || !t.hidden; }
  function isSoon(t) { return t.hidden || !t.links || !t.links.length; }

  function buildTile(t, idx, solo, reg) {
    var size = SIZES[t.size] ? t.size : 's';
    var tile = el('article', 'sm-tools__tile is-' + size + (solo ? ' is-solo' : ''));
    tile.style.setProperty('--i', idx);
    tile.setAttribute('data-id', t.id);
    var fx = el('span', 'sm-tools__fx');
    fx.setAttribute('aria-hidden', 'true');
    tile.appendChild(fx);

    var icon = el('span', 'sm-tools__icon');
    icon.appendChild(svg(t.icon, 26));

    if (isSoon(t)) {
      tile.className += ' is-soon';
      tile.setAttribute('aria-disabled', 'true');
      var sh = el('div', 'sm-tools__soon-head');
      var sb = el('span', 'sm-tools__body');
      sb.appendChild(el('span', 'sm-tools__name', t.title));
      sh.appendChild(icon);
      sh.appendChild(sb);
      sh.appendChild(el('span', 'sm-tools__badge', 'Скоро'));
      tile.appendChild(sh);
      return tile;
    }

    var pid = 'sm-tools-panel-' + t.id;
    var btn = el('button', 'sm-tools__head');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', pid);
    var body = el('span', 'sm-tools__body');
    body.appendChild(el('span', 'sm-tools__name', t.title));
    body.appendChild(el('span', 'sm-tools__hint', 'Инструментов: ' + t.links.length));
    var chev = el('span', 'sm-tools__chev');
    chev.setAttribute('aria-hidden', 'true');
    chev.appendChild(svg('chevron', 22));
    btn.appendChild(icon);
    btn.appendChild(body);
    btn.appendChild(chev);
    tile.appendChild(btn);

    var panel = el('div', 'sm-tools__panel');
    panel.id = pid;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Инструменты: ' + t.title);
    var inner = el('div', 'sm-tools__panel-in');
    var ul = el('ul', 'sm-tools__list');
    t.links.forEach(function (l) {
      var li = el('li');
      var a = el('a', 'sm-tools__link');
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', l.name + ', откроется в новой вкладке');
      a.appendChild(svg('map', 20, 'sm-tools__ic-map'));
      a.appendChild(el('span', null, l.name));
      a.appendChild(svg('arrow', 18, 'sm-tools__ic-arrow'));
      li.appendChild(a);
      ul.appendChild(li);
    });
    inner.appendChild(ul);
    panel.appendChild(inner);
    tile.appendChild(panel);
    reg.push({ tile: tile, btn: btn });
    return tile;
  }

  function init(root) {
    var mount = root.querySelector('[data-sm-tools-mount]');
    if (!mount || mount.getAttribute('data-ready')) { return; }
    mount.setAttribute('data-ready', '1');
    var reg = [];
    var shown = 0;

    GROUPS.forEach(function (g) {
      var vis = g.tiles.filter(isVisible);
      if (!vis.length) { return; }
      shown++;
      var group = el('section', 'sm-tools__group sm-tools__group--' + g.cls);
      var hid = 'sm-tools-group-' + g.id;
      var h3 = el('h3', 'sm-tools__sub', g.title);
      h3.id = hid;
      group.setAttribute('aria-labelledby', hid);
      group.appendChild(h3);
      var grid = el('div', 'sm-tools__grid');
      vis.forEach(function (t, i) { grid.appendChild(buildTile(t, i, vis.length === 1, reg)); });
      group.appendChild(grid);
      mount.appendChild(group);
    });

    if (!shown) {
      mount.appendChild(el('p', 'sm-tools__empty', 'Инструменты скоро появятся'));
      return;
    }

    var hoverMq = window.matchMedia ? window.matchMedia('(hover:hover) and (pointer:fine)') : null;
    function canHover() { return !!(hoverMq && hoverMq.matches); }

    function setOpen(r, on) {
      if (r.tile.classList.contains('is-open') === on) { return; }
      r.tile.classList.toggle('is-open', on);
      r.btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    }

    reg.forEach(function (r) {
      r.btn.addEventListener('click', function () {
        // мышь: плитка уже раскрыта наведением — первый клик её закрепляет, а не закрывает
        if (r.byHover) { r.byHover = false; setOpen(r, true); return; }
        setOpen(r, !r.tile.classList.contains('is-open'));
      });
      r.tile.addEventListener('mouseenter', function () {
        if (!canHover()) { return; }
        if (!r.tile.classList.contains('is-open')) { r.byHover = true; }
        setOpen(r, true);
      });
      r.tile.addEventListener('mouseleave', function () {
        r.byHover = false;
        if (canHover() && !r.tile.contains(document.activeElement)) { setOpen(r, false); }
      });
      r.tile.addEventListener('focusout', function (e) {
        var to = e.relatedTarget;
        if (to && r.tile.contains(to)) { return; }
        if (canHover() && r.tile.matches(':hover')) { return; }
        setOpen(r, false);
      });
    });

    document.addEventListener('click', function (e) {
      reg.forEach(function (r) {
        if (!r.tile.contains(e.target)) { setOpen(r, false); }
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') { return; }
      reg.forEach(function (r) {
        if (!r.tile.classList.contains('is-open')) { return; }
        if (r.tile.contains(document.activeElement)) { r.btn.focus(); }
        setOpen(r, false);
      });
    });
  }

  var roots = document.querySelectorAll('[data-sm-tools]');
  for (var i = 0; i < roots.length; i++) { init(roots[i]); }
})();
