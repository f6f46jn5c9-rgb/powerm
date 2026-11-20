/* «Кармин» — данные и рендер. Инлайнится сборкой в IIFE каждого модуля (после CONFIG).
   Блоки «/*@ имя *\/» попадают в модуль, только если модуль их использует.
   Весь вывод данных — через узлы и textContent, без innerHTML. */

/*@ base */
var MOCK = window.__BUP_MOCK__ || null;
var SVGNS = "http://www.w3.org/2000/svg";
var MON = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
var ICONS = {
  ar: "M5 12h14M13 6l6 6-6 6",
  al: "M19 12H5M11 6l-6 6 6 6",
  se: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM20 20l-4.6-4.6",
  sp: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  dc: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  pl: "M12 5v14M5 12h14"
};
var TODOS = [];
function ok(u) {
  u = typeof u === "string" ? u.trim() : "";
  return u && !/^TODO/i.test(u) && !/^\[.*\]$/.test(u) ? u : null;
}
function lab(v) { return ok(v) || ""; }
function todo(name) { if (TODOS.indexOf(name) < 0) TODOS.push(name); }
function ic(n, cls) {
  var s = document.createElementNS(SVGNS, "svg"), p = document.createElementNS(SVGNS, "path");
  s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("class", "k-ic" + (cls ? " " + cls : ""));
  s.setAttribute("aria-hidden", "true");
  s.setAttribute("focusable", "false");
  p.setAttribute("d", ICONS[n]);
  s.appendChild(p);
  return s;
}
function add(e, kids) {
  [].concat(kids == null ? [] : kids).forEach(function (c) {
    if (c == null || c === false || c === "") return;
    e.appendChild(typeof c === "object" ? c : document.createTextNode(String(c)));
  });
  return e;
}
function h(tag, cls, kids, attrs) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  return add(e, kids);
}
function A(url, cls, kids, blank) {
  return h("a", cls, kids, { href: url, target: blank ? "_blank" : null, rel: blank ? "noopener" : null });
}
function fill(e, kids) { while (e.firstChild) e.removeChild(e.firstChild); return add(e, kids); }
function $(root, name) { return root.querySelector('[data-k="' + name + '"]'); }
function sub(cql) {
  return cql.replace(/\{practiceLabel\}/g, lab(CONFIG.practiceLabel)).replace(/\{replicatedLabel\}/g, lab(CONFIG.replicatedLabel));
}
function clean(s) { return String(s || "").replace(/@@@(end)?hl@@@/g, "").trim(); }
function dt(iso) {
  var d = new Date(iso);
  return isNaN(d) ? null : { d: d.getDate(), m: MON[d.getMonth()], s: d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear() };
}
function linkOf(c, base) {
  var w = (c._links && c._links.webui) || c.url || "";
  if (!w) return null;
  if (/^[a-z]+:/i.test(w)) return w;
  return (base || "") + (w.charAt(0) === "/" ? "" : "/") + w;
}
function companyOf(c) {
  var an = c.ancestors || [], i, j;
  for (i = 0; i < an.length; i++)
    for (j = 0; j < CONFIG.companies.length; j++)
      if (String(an[i].id) === String(CONFIG.companies[j].pageId)) return CONFIG.companies[j].name;
  return "";
}
function lim(p) { return +((/limit=(\d+)/.exec(p) || [])[1] || 10); }
function mockRoute(p) {
  var M = MOCK, m = /\/rest\/api\/content\/(\d+)\?/.exec(p), cql, q, pr, list, anc;
  if (M.fail) throw new Error("mock fail");
  if (m) return { id: m[1], body: { view: { value: (M.bodies || {})[m[1]] || "" } } };
  cql = decodeURIComponent((/cql=([^&]*)/.exec(p) || [])[1] || "");
  if (/siteSearch/.test(cql)) {
    q = ((/siteSearch ~ "([^"*]*)/.exec(cql) || [])[1] || "").toLowerCase();
    pr = /label = /.test(cql);
    list = M.search.filter(function (x) {
      return clean(x.content.title).toLowerCase().indexOf(q) >= 0 && (!pr || x.practice);
    });
    return { results: list.slice(0, lim(p)), totalSize: list.length };
  }
  if (/\/rest\/api\/search/.test(p)) return { results: [], totalSize: /created >=/.test(cql) ? M.counts.week : M.counts.practices };
  if (/blogpost/.test(cql)) return { results: M.news.slice(0, lim(p)), _links: M.links };
  anc = (/ancestor = (\d+)/.exec(cql) || [])[1];
  list = /label = ""/.test(cql) ? [] : M.practices.filter(function (x) {
    return !anc || x.ancestors.some(function (a) { return String(a.id) === anc; });
  });
  return { results: list.slice(0, lim(p)), _links: M.links };
}
function api(path, ctl) {
  if (MOCK) return new Promise(function (res, rej) {
    setTimeout(function () { try { res(mockRoute(path)); } catch (e) { rej(e); } }, MOCK.delay == null ? 120 : MOCK.delay);
  });
  ctl = ctl || (window.AbortController ? new AbortController() : null);
  var t = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
  return fetch(path, { credentials: "same-origin", headers: { Accept: "application/json" }, signal: ctl ? ctl.signal : undefined })
    .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); },
          function (e) { clearTimeout(t); throw e; });
}
function pages(cql, n, expand) {
  return api("/rest/api/content/search?cql=" + encodeURIComponent(sub(cql)) + "&limit=" + n + "&expand=" + expand).then(function (r) {
    var base = r._links && r._links.base;
    return (r.results || []).map(function (c) {
      return { id: c.id, t: clean(c.title), u: linkOf(c, base), d: dt(c.history && c.history.createdDate), co: companyOf(c) };
    }).filter(function (x) { return x.t && x.u; });
  });
}
function count(cql) {
  return api("/rest/api/search?cql=" + encodeURIComponent(sub(cql)) + "&limit=1").then(function (r) {
    if (typeof r.totalSize !== "number") throw new Error("no totalSize");
    return r.totalSize;
  });
}
function skel(n) {
  var out = [];
  for (var i = 0; i < n; i++) out.push(h("span", "k-sk" + (i % 2 ? " k-sk-w" : ""), null, { "aria-hidden": "true" }));
  return out;
}
function allPractices() {
  var m = CONFIG.links && CONFIG.links.more && ok(CONFIG.links.more[0] && CONFIG.links.more[0].url);
  return m || "/label/" + encodeURIComponent(CONFIG.spaceKey) + "/" + encodeURIComponent(lab(CONFIG.practiceLabel));
}
function searchUrl(q) { return (ok(CONFIG.searchPageUrl) || "/dosearchsite.action?queryString=") + encodeURIComponent(q || ""); }
function newsUrl() { return "/pages/viewrecentblogposts.action?key=" + encodeURIComponent(CONFIG.spaceKey); }
function fallback(el, text, links) {
  fill(el, h("div", "k-msg", [h("p", null, text)].concat(links.map(function (l, i) {
    return A(l[1], "k-btn " + (i ? "k-btn-light" : "k-btn-dark"), l[0]);
  })), { role: "status" }));
}
function boot(cls, inits) {
  function run() {
    [].forEach.call(document.querySelectorAll("." + cls + ":not([data-k-ok])"), function (root) {
      var t0 = window.performance ? performance.now() : 0;
      root.setAttribute("data-k-ok", "");
      inits.forEach(function (f) {
        try { f(root); } catch (e) { if (window.console) console.warn("[БУП] " + cls + ":", e); }
      });
      root.setAttribute("data-k-ms", ((window.performance ? performance.now() : 0) - t0).toFixed(1));
      if (TODOS.length && window.console) console.info("[БУП] " + cls + ": не заполнено в CONFIG — " + TODOS.join("; "));
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
}

/*@ hero */
function initHero(root) {
  var b = $(root, "add"), u = ok(CONFIG.addPracticeUrl);
  if (b) { if (u) b.setAttribute("href", u); else { b.hidden = true; todo("addPracticeUrl"); } }
}

/*@ kpi */
function initKpi(root) {
  var box = $(root, "kpi");
  if (!box) return;
  var tiles = [
    { l: "Опубликованных практик", p: count('type = page AND label = "{practiceLabel}"').catch(function () { return CONFIG.stats.practicesManual; }) },
    { l: "Активных пользователей", p: Promise.resolve(CONFIG.stats.activeUsers) },
    { l: "Новых за неделю", p: count('type = page AND label = "{practiceLabel}" AND created >= now("-7d")').catch(function () { return null; }), dark: 1 },
    { l: "Компаний группы", p: Promise.resolve(CONFIG.companies.length) }
  ];
  Promise.all(tiles.map(function (t) { return t.p; })).then(function (v) {
    var out = [];
    tiles.forEach(function (t, i) {
      if (typeof v[i] !== "number" || !isFinite(v[i])) return;
      out.push(h("div", "k-kpi" + (t.dark ? " is-dark" : ""), [
        h("span", "k-kpi-n", Math.round(v[i]).toLocaleString("ru-RU")), h("span", "k-kpi-l", t.l)]));
    });
    box.style.setProperty("--n", out.length || 1);
    fill(box, out);
    box.removeAttribute("aria-busy");
  });
}

/*@ companies */
function initCompanies(root) {
  var box = $(root, "cos"), cat = $(root, "cat"), u = ok(CONFIG.categoriesUrl);
  if (cat) { if (u) cat.setAttribute("href", u); else cat.hidden = true; }
  if (!box) return;
  fill(box, CONFIG.companies.map(function (c, i) {
    var kids = [h("span", "k-co-n", (i < 9 ? "0" : "") + (i + 1)), h("span", "k-co-t", c.name),
      h("span", "k-co-s", ["практики компании", ic("ar")])];
    return ok(c.url) ? A(c.url, "k-co", kids) : h("div", "k-co", kids);
  }));
}

/*@ practices */
function pItem(x, noCo) {
  return A(x.u, "k-pi", [
    h("span", "k-pd", x.d ? [h("span", "k-pd-d", x.d.d), h("span", "k-pd-m", x.d.m)] : null, { "aria-hidden": "true" }),
    h("span", null, [h("span", "k-pi-t", x.t), noCo || !x.co ? null : h("span", "k-pi-c", x.co),
      x.d ? h("span", "k-vh", ", " + x.d.s) : null])
  ]);
}
function initPractices(root) {
  var list = $(root, "pl"), tabs = $(root, "tabs"), title = $(root, "pl-title"), more = $(root, "pl-more");
  if (!list) return;
  var rep = lab(CONFIG.replicatedLabel), uid = root.className.split(" ")[0];
  var defs = [{ n: "Новые", cql: 'type = page AND label = "{practiceLabel}" ORDER BY created DESC' }];
  if (rep) defs.push({ n: "Тиражируемые", cql: 'type = page AND label = "{replicatedLabel}" ORDER BY created DESC' });
  else todo("replicatedLabel");
  if (more) more.setAttribute("href", allPractices());
  function load(i) {
    list.setAttribute("aria-busy", "true");
    fill(list, skel(6));
    pages(defs[i].cql, 6, "ancestors,history").then(function (r) {
      if (!r.length) throw new Error("empty");
      fill(list, r.map(function (x) { return pItem(x); }));
    }).catch(function () {
      fallback(list, "Не удалось загрузить список практик.", [["Все практики", allPractices()], ["Поиск по базе", searchUrl("")]]);
    }).then(function () { list.removeAttribute("aria-busy"); });
  }
  if (defs.length > 1 && tabs) {
    if (title) title.textContent = "Практики";
    list.setAttribute("role", "tabpanel");
    list.id = uid + "-pl";
    var btns = defs.map(function (d, i) {
      return h("button", "k-tab", d.n, { type: "button", role: "tab", id: uid + "-t" + i, "aria-controls": list.id,
        "aria-selected": i ? "false" : "true", tabindex: i ? "-1" : "0" });
    });
    function sel(i, focus) {
      btns.forEach(function (b, j) { b.setAttribute("aria-selected", i === j ? "true" : "false"); b.tabIndex = i === j ? 0 : -1; });
      list.setAttribute("aria-labelledby", btns[i].id);
      if (focus) btns[i].focus();
      load(i);
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { if (b.getAttribute("aria-selected") !== "true") sel(i); });
      b.addEventListener("keydown", function (e) {
        var k = e.key, n = btns.length;
        if (k === "ArrowRight" || k === "ArrowLeft" || k === "Home" || k === "End") {
          e.preventDefault();
          sel(k === "Home" ? 0 : k === "End" ? n - 1 : (i + (k === "ArrowRight" ? 1 : n - 1)) % n, true);
        }
      });
    });
    fill(tabs, btns);
    tabs.hidden = false;
    list.setAttribute("aria-labelledby", btns[0].id);
  }
  load(0);
}

/*@ news */
function initNews(root) {
  var box = $(root, "news"), fts = $(root, "fts"), more = $(root, "news-more");
  if (more) more.setAttribute("href", newsUrl());
  if (fts) {
    var n = 0;
    fill(fts, CONFIG.featured.map(function (f) {
      if (!ok(f.url)) { todo("featured: " + f.name); return null; }
      return A(f.url, "k-ft" + (n++ % 3 === 0 ? " is-dark" : ""), [h("span", "k-ft-t", f.name), ic("ar")]);
    }));
  }
  if (!box) return;
  fill(box, skel(5));
  pages(CONFIG.newsCql, 5, "history").then(function (r) {
    if (!r.length) throw new Error("empty");
    fill(box, r.map(function (x) {
      return A(x.u, "k-ni", [x.d ? h("span", "k-ni-d", x.d.s) : null, h("span", "k-ni-t", x.t)]);
    }));
  }).catch(function () {
    fallback(box, "Не удалось загрузить новости.", [["Все новости", newsUrl()], ["Поиск по базе", searchUrl("")]]);
  }).then(function () { box.removeAttribute("aria-busy"); });
}

/*@ cta */
function initCta(root) {
  [].forEach.call(root.querySelectorAll('[data-k="cta-add"]'), function (a) {
    var u = ok(CONFIG.addPracticeUrl);
    if (u) a.setAttribute("href", u); else a.hidden = true;
  });
}

/*@ sections */
function initSections(root) {
  var box = $(root, "sx");
  if (box) fill(box, CONFIG.sections.map(function (s) {
    return ok(s.url) ? A(s.url, "k-sx", [h("span", null, s.name), ic("ar")]) : h("span", "k-sx", s.name);
  }));
}

/*@ links */
function initLinks(root) {
  var acts = $(root, "acts"), ml = $(root, "ml"), L = CONFIG.links || {};
  if (acts) {
    var n = 0;
    fill(acts, (L.actions || []).map(function (a) {
      if (!ok(a.url)) { todo("links.actions: " + a.name); return null; }
      return A(a.url, "k-btn " + (n++ ? "k-btn-light" : "k-btn-dark"), a.name, /^[a-z]+:/i.test(a.url) && a.url.indexOf(location.host) < 0);
    }));
  }
  if (ml) fill(ml, (L.more || []).map(function (a) {
    if (ok(a.url)) return A(a.url, "k-mi", [h("span", null, a.name), ic("ar")]);
    todo("links.more: " + a.name);
    return h("span", "k-mi k-mi-x", [h("span", null, a.name), h("small", null, "ссылка уточняется")]);
  }));
}

/*@ nav */
function initNav(root) {
  var big = $(root, "nav-cos"), tiles = $(root, "nav-tiles"), u = ok(CONFIG.categoriesUrl);
  if (big) fill(big, CONFIG.companies.map(function (c) {
    return ok(c.url) ? A(c.url, "k-bco", [h("span", null, c.name), ic("ar")]) : h("span", "k-bco", c.name);
  }));
  if (!tiles) return;
  var out = [], n = 0;
  if (u) out.push(A(u, "k-bt", [ic("se"), h("span", "k-bt-t", "Поиск по категориям"), h("span", "k-bt-go", ["Перейти", ic("ar")])]));
  CONFIG.featured.forEach(function (f) {
    if (n >= 3 || !ok(f.url)) return;
    n++;
    out.push(A(f.url, "k-bt", [h("span", "k-bt-n", "0" + n), h("span", "k-bt-t", f.name), h("span", "k-bt-go", ["Перейти", ic("ar")])]));
  });
  out.forEach(function (t) { tiles.parentNode.insertBefore(t, tiles); });
  tiles.parentNode.removeChild(tiles);
}

/*@ shelves */
var FX = /было\s*:?\s*([^→\n<]{1,40}?)\s*(?:→|->|—>)\s*стало\s*:?\s*([^\n<.;]{1,40})/i;
function initShelves(root) {
  var host = $(root, "shelves");
  if (!host) return;
  var tpl = host.firstElementChild, fx = CONFIG.effectFromExcerpt || (MOCK && MOCK.forceEffect);
  host.removeChild(tpl);
  CONFIG.shelves.forEach(function (s, si) {
    var rep = s.cql.indexOf("{replicatedLabel}") >= 0, anc = (/ancestor = (\d+)/.exec(s.cql) || [])[1], co = null;
    if (!s.enabled && !(rep && lab(CONFIG.replicatedLabel))) return;
    if (rep && !lab(CONFIG.replicatedLabel)) return;
    if (anc) CONFIG.companies.forEach(function (c) { if (String(c.pageId) === anc) co = c; });
    var el = tpl.cloneNode(true), row = $(el, "row"), all = $(el, "all"), prev = $(el, "prev"), next = $(el, "next");
    $(el, "kick").textContent = s.kicker;
    $(el, "title").textContent = s.title;
    $(el, "title").id = root.className.split(" ")[0] + "-s" + si;
    row.setAttribute("aria-labelledby", $(el, "title").id);
    all.setAttribute("href", co && ok(co.url) ? co.url : allPractices());
    all.setAttribute("aria-label", "Все: " + s.title);
    fill(row, [0, 1, 2, 3].map(function () { return h("div", "k-sc", skel(3), { "aria-hidden": "true" }); }));
    function upd() {
      prev.disabled = row.scrollLeft <= 2;
      next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 2;
    }
    function go(d) { row.scrollBy({ left: d * Math.max(row.clientWidth * 0.8, 200), behavior: "smooth" }); }
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    row.addEventListener("scroll", upd, { passive: true });
    host.appendChild(el);
    function load() {
      pages(s.cql, 10, "ancestors,history").then(function (r) {
        if (!r.length) throw new Error("empty");
        fill(row, r.map(function (x, i) {
          var c = h("a", "k-sc" + (rep && i === 0 ? " is-lead" : ""), [
            anc || !x.co ? null : h("span", "k-sc-c", x.co), h("span", "k-sc-t", x.t), x.d ? h("span", "k-sc-d", x.d.s) : null], { href: x.u });
          if (fx) api("/rest/api/content/" + encodeURIComponent(x.id) + "?expand=body.view").then(function (b) {
            var m = FX.exec(String(b.body && b.body.view && b.body.view.value || "").replace(/<[^>]*>/g, " ")
              .replace(/&nbsp;/g, " ").replace(/&rarr;/g, "→").replace(/&gt;/g, ">"));
            if (m) c.appendChild(h("span", "k-fx", [h("s", null, "было " + m[1].trim()), h("span", "k-fx-n", m[2].trim())]));
          }).catch(function () {});
          return c;
        }));
      }).catch(function () {
        fill(row, h("div", "k-sc", h("div", "k-msg", [h("p", null, "Не удалось загрузить полку."), A(searchUrl(""), "k-btn k-btn-light", "Поиск по базе")])));
      }).then(upd);
    }
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (en) {
        if (en.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); }
      }, { rootMargin: "300px 0px" });
      io.observe(el);
    } else load();
  });
}
