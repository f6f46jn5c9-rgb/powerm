
  /* ============================================================
     ЛОГИКА (обычно не требует правок)
     ============================================================ */
  var ICONS = {
    cycle: '<path d="M20 12a8 8 0 0 0-13.7-5.6L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 12a8 8 0 0 0 13.7 5.6L20 15.5"/><path d="M20 20v-4.5h-4.5"/>',
    checklist: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    book: '<path d="M2 3h7a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-7a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h8z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h6"/>',
    out: '<path d="M7 17L17 7"/><path d="M8 7h9v9"/>'
  };
  var NARROW_BELOW = 760; // ширина контейнера, ниже которой разделы раскрываются аккордеоном

  function svg(p, w) {
    return '<svg width="' + w + '" height="' + w + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function norm(s) {
    return String(s).toLowerCase().replace(/ё/g, 'е').replace(/^\s+|\s+$/g, '');
  }
  function plural(n) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return 'документ';
    if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return 'документа';
    return 'документов';
  }

  function init(root) {
    var menu = root.querySelector('[data-menu]');
    var main = root.querySelector('[data-main]');
    var panel = root.querySelector('[data-panel]');
    var results = root.querySelector('[data-results]');
    var input = root.querySelector('[data-input]');
    var clearBtn = root.querySelector('[data-clear]');
    var countEl = root.querySelector('[data-count]');
    if (!menu || !main || !panel || !results || !input) return;

    var total = 0;
    SECTIONS.forEach(function (s) { total += s.docs.length; });

    var state = { active: 0, open: true, narrow: false };
    var buttons = [];

    // --- Меню разделов (строится один раз, чтобы не терять фокус) ---
    menu.innerHTML = SECTIONS.map(function (s, i) {
      return '<button type="button" class="sm-docs__sec" data-i="' + i + '" aria-expanded="false" aria-controls="' + esc(panel.id) + '">' +
        '<span class="sm-docs__sec-ic" aria-hidden="true">' + svg(ICONS[s.icon] || ICONS.file, 20) + '</span>' +
        '<span class="sm-docs__sec-name">' + esc(s.title) + '</span>' +
        '<span class="sm-docs__sec-num">' + s.docs.length + '</span></button>';
    }).join('');
    buttons = Array.prototype.slice.call(menu.querySelectorAll('button.sm-docs__sec'));

    function docRow(s, d, withSection) {
      var chip = d[0] ? '<span class="sm-docs__chip">' + esc(d[0]) + '</span>' : '';
      var sec = withSection ? '<span class="sm-docs__doc-sec">Раздел: ' + esc(s.title) + '</span>' : '';
      return '<li><a class="sm-docs__doc" href="' + esc(d[2]) + '" target="_blank" rel="noopener">' +
        '<span class="sm-docs__doc-body">' + chip + '<span class="sm-docs__doc-name">' + esc(d[1]) + '</span>' + sec + '</span>' +
        '<span class="sm-docs__go" aria-hidden="true">' + svg(ICONS.out, 18) + '</span></a></li>';
    }

    function animate(list) {
      if (!list) return;
      list.classList.remove('is-anim');
      void list.offsetWidth;
      list.classList.add('is-anim');
    }

    function renderPanel() {
      var s = SECTIONS[state.active];
      var n = s.docs.length;
      var html = '<h3 class="sm-docs__card-title" id="sm-docs-panel-title">' + esc(s.title) + '</h3>' +
        '<p class="sm-docs__card-sub">' + n + ' ' + plural(n) + '</p>';
      if (n) {
        html += '<ul class="sm-docs__list">' + s.docs.map(function (d) { return docRow(s, d, false); }).join('') + '</ul>';
      } else {
        html += '<p class="sm-docs__empty">Документы скоро появятся</p>';
      }
      panel.innerHTML = html;
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', 'sm-docs-panel-title');
      animate(panel.querySelector('.sm-docs__list'));
    }

    function place() {
      if (state.narrow) {
        if (state.open) {
          menu.insertBefore(panel, buttons[state.active].nextSibling);
          panel.hidden = false;
        } else {
          panel.hidden = true;
        }
      } else {
        if (panel.parentNode !== main) main.appendChild(panel);
        panel.hidden = false;
      }
    }

    function updateButtons() {
      buttons.forEach(function (b, i) {
        var on = i === state.active && (!state.narrow || state.open);
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    }

    function select(i) {
      var btn = buttons[i];
      var before = btn.getBoundingClientRect().top;
      if (state.narrow) {
        if (i === state.active && state.open) {
          state.open = false;
        } else {
          var changed = i !== state.active || !state.open;
          state.active = i;
          state.open = true;
          if (changed) renderPanel();
        }
      } else {
        if (i === state.active) return;
        state.active = i;
        renderPanel();
      }
      place();
      updateButtons();
      // кнопка остаётся на месте экрана, даже если закрылась панель выше неё
      var delta = btn.getBoundingClientRect().top - before;
      if (state.narrow && delta) window.scrollBy(0, delta);
    }

    function setWidth(w) {
      if (!w) return;
      var narrow = w < NARROW_BELOW;
      if (narrow === state.narrow) return;
      state.narrow = narrow;
      place();
      updateButtons();
    }

    // --- Поиск ---
    function search(q) {
      var words = q.split(/\s+/);
      var found = [];
      SECTIONS.forEach(function (s) {
        s.docs.forEach(function (d) {
          var hay = norm(d[0] + ' ' + d[1] + ' ' + s.title);
          for (var k = 0; k < words.length; k++) { if (hay.indexOf(words[k]) === -1) return; }
          found.push({ s: s, d: d });
        });
      });
      return found;
    }

    function update() {
      var raw = input.value;
      var q = norm(raw);
      clearBtn.hidden = !raw;
      if (!q) {
        results.hidden = true;
        main.hidden = false;
        countEl.textContent = 'Всего документов: ' + total;
        return;
      }
      var found = search(q);
      main.hidden = true;
      results.hidden = false;
      countEl.textContent = 'Найдено: ' + found.length;
      var html = '<h3 class="sm-docs__card-title">Результаты поиска</h3>';
      if (found.length) {
        html += '<p class="sm-docs__card-sub">' + found.length + ' ' + plural(found.length) + '</p>' +
          '<ul class="sm-docs__list">' + found.map(function (f) { return docRow(f.s, f.d, true); }).join('') + '</ul>';
      } else {
        html += '<p class="sm-docs__card-sub">&nbsp;</p><p class="sm-docs__empty">Ничего не найдено. Проверьте написание или введите часть номера</p>' +
          '<button type="button" class="sm-docs__reset" data-reset>Сбросить поиск</button>';
      }
      results.innerHTML = html;
      animate(results.querySelector('.sm-docs__list'));
    }

    function reset() {
      input.value = '';
      update();
      input.focus();
    }

    // --- События ---
    menu.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button.sm-docs__sec') : null;
      if (b && menu.contains(b)) select(+b.getAttribute('data-i'));
    });
    menu.addEventListener('keydown', function (e) {
      var b = e.target.closest ? e.target.closest('button.sm-docs__sec') : null;
      if (!b) return;
      var i = buttons.indexOf(b), t = -1;
      if (e.key === 'ArrowDown') t = Math.min(i + 1, buttons.length - 1);
      else if (e.key === 'ArrowUp') t = Math.max(i - 1, 0);
      else if (e.key === 'Home') t = 0;
      else if (e.key === 'End') t = buttons.length - 1;
      if (t < 0) return;
      e.preventDefault();
      buttons[t].focus();
    });
    input.addEventListener('input', update);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; update(); }
    });
    clearBtn.addEventListener('click', reset);
    results.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-reset]')) reset();
    });

    // --- Старт ---
    renderPanel();
    countEl.textContent = 'Всего документов: ' + total;
    setWidth(root.getBoundingClientRect().width);
    place();
    updateButtons();

    var pending = 0;
    function onSize(w) {
      if (pending) cancelAnimationFrame(pending);
      pending = requestAnimationFrame(function () { pending = 0; setWidth(w); });
    }
    if (window.ResizeObserver) {
      new ResizeObserver(function (entries) {
        onSize(entries[0].contentRect.width);
      }).observe(root);
    } else {
      window.addEventListener('resize', function () { onSize(root.getBoundingClientRect().width); });
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('.sm-docs[data-sm-docs]'), function (r) {
    if (r.getAttribute('data-ready')) return;
    r.setAttribute('data-ready', '1');
    init(r);
  });
