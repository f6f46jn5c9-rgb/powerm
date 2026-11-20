/* «Кармин» — умный поиск (combobox). Один исходник, инлайнится сборкой в каждый hero.
   Использует функции из data.js (base): h, A, ic, fill, add, api, clean, linkOf, ok, lab, searchUrl, $. */

/*@ search */
var SQN = 0;
function marks(text, q) {
  var words = q.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 1; }), out = [], low = text.toLowerCase(), i = 0;
  while (i < text.length) {
    var best = -1, len = 0;
    words.forEach(function (w) {
      var j = low.indexOf(w, i);
      if (j >= 0 && (best < 0 || j < best)) { best = j; len = w.length; }
    });
    if (best < 0) { out.push(text.slice(i)); break; }
    if (best > i) out.push(text.slice(i, best));
    out.push(h("mark", null, text.slice(best, best + len)));
    i = best + len;
  }
  return out;
}
function initSearch(root) {
  var box = $(root, "search");
  if (!box) return;
  var inp = $(box, "q"), pop = $(root, "pop"), drop = $(box, "drop"), lb = $(box, "lb"), st = $(box, "st"), lbl = box.querySelector("label");
  var uid = root.className.split(" ")[0] + "-" + (++SQN) + Math.random().toString(36).slice(2, 6);
  var timer = 0, ctl = null, seq = 0, opts = [], act = -1, last = "";
  inp.id = uid + "-q";
  if (lbl) lbl.setAttribute("for", inp.id);
  lb.id = uid + "-lb";
  inp.setAttribute("aria-controls", lb.id);

  function open(v) {
    drop.hidden = !v;
    inp.setAttribute("aria-expanded", v ? "true" : "false");
    if (!v) setAct(-1);
  }
  function setAct(i) {
    act = i;
    opts.forEach(function (o, j) { o.setAttribute("aria-selected", j === i ? "true" : "false"); });
    if (i >= 0) { inp.setAttribute("aria-activedescendant", opts[i].id); if (opts[i].scrollIntoView) opts[i].scrollIntoView({ block: "nearest" }); }
    else inp.removeAttribute("aria-activedescendant");
  }
  function opt(url, icon, title, meta, q) {
    var o = A(url, "k-opt", [ic(icon), h("span", "k-opt-b", [
      h("span", "k-opt-t", q ? marks(title, q) : title), meta ? h("span", "k-opt-m", meta) : null])]);
    o.setAttribute("role", "option");
    o.setAttribute("tabindex", "-1");
    o.setAttribute("aria-selected", "false");
    o.id = uid + "-o" + opts.length;
    o.addEventListener("mousedown", function (e) { e.preventDefault(); });
    opts.push(o);
    return o;
  }
  function group(name, items) {
    if (!items.length) return null;
    var gid = uid + "-g" + opts.length;
    return h("div", null, [h("span", "k-lb-g", name, { id: gid })].concat(items), { role: "group", "aria-labelledby": gid });
  }
  function tail(q) {
    var n = ok(CONFIG.neuronUrl);
    return [h("div", "k-lb-sep", null, { role: "presentation" }),
      opt(searchUrl(q), "se", "Все результаты по запросу «" + q + "»", null),
      n ? opt(n, "sp", "Спросить у Нейрона", "откроется страница Нейрона") : null];
  }
  function map(r, base) {
    var c = r.content || {};
    return { id: c.id || r.url, t: clean(c.title || r.title), u: linkOf(c._links && c._links.webui ? c : r, base),
      sp: r.resultGlobalContainer && r.resultGlobalContainer.title, when: r.friendlyLastModified };
  }
  function render(q, all, pr, err) {
    opts = [];
    act = -1;
    var ids = {}, prItems, rest, kids = [];
    pr.list.forEach(function (x) { ids[x.id] = 1; });
    prItems = pr.list.slice(0, 5).map(function (x) { return opt(x.u, "dc", x.t, [x.sp, x.when].filter(Boolean).join(" · "), q); });
    rest = all.list.filter(function (x) { return !ids[x.id]; }).slice(0, 5)
      .map(function (x) { return opt(x.u, "ar", x.t, [x.sp, x.when].filter(Boolean).join(" · "), q); });
    kids.push(group("Практики · " + pr.total.toLocaleString("ru-RU"), prItems));
    kids.push(group("Разделы и документы", rest));
    st.textContent = err ? "Подсказки сейчас недоступны — откройте полный поиск." :
      !prItems.length && !rest.length ? "Ничего не найдено. Попробуйте другой запрос." : "";
    st.hidden = !st.textContent;
    fill(lb, kids.concat(tail(q)));
    open(true);
  }
  function pick(r) {
    var base = r._links && r._links.base;
    return { list: (r.results || []).map(function (x) { return map(x, base); }).filter(function (x) { return x.t && x.u; }),
      total: typeof r.totalSize === "number" ? r.totalSize : (r.results || []).length };
  }
  function run(q) {
    var my = ++seq, e = '"' + q.replace(/["\\*]/g, " ").trim() + '*"', c = window.AbortController ? new AbortController() : null;
    if (ctl) ctl.abort();
    ctl = c;
    last = q;
    st.textContent = "Ищем…";
    st.hidden = false;
    if (drop.hidden) { opts = []; fill(lb, tail(q)); open(true); }
    var base = "/rest/api/search?cql=", cq = "siteSearch ~ " + e + " AND type = page", pl = lab(CONFIG.practiceLabel);
    var fail = false, none = { results: [] };
    Promise.all([
      api(base + encodeURIComponent(cq) + "&limit=8", c).catch(function () { fail = true; return none; }),
      pl ? api(base + encodeURIComponent(cq + ' AND label = "' + pl + '"') + "&limit=5", c).catch(function () { return none; }) : none
    ]).then(function (r) {
      if (my !== seq) return;
      render(q, pick(r[0]), pick(r[1]), fail);
    });
  }
  function go(u) { if (u) window.location.href = u; }

  box.addEventListener("submit", function (e) { e.preventDefault(); go(searchUrl(inp.value.trim())); });
  inp.addEventListener("input", function () {
    var q = inp.value.trim();
    clearTimeout(timer);
    if (q.length < 3) { seq++; if (ctl) ctl.abort(); open(false); return; }
    timer = setTimeout(function () { run(q); }, 250);
  });
  inp.addEventListener("keydown", function (e) {
    var k = e.key, q = inp.value.trim();
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      if (drop.hidden) { if (q.length >= 3) { if (q === last && opts.length) open(true); else run(q); } return; }
      if (!opts.length) return;
      setAct(k === "ArrowDown" ? (act + 1) % opts.length : (act <= 0 ? opts.length - 1 : act - 1));
    } else if (k === "Enter") {
      e.preventDefault();
      if (!drop.hidden && act >= 0) go(opts[act].getAttribute("href"));
      else if (q) go(searchUrl(q));
    } else if (k === "Escape") {
      if (!drop.hidden) { e.preventDefault(); open(false); } else if (inp.value) { e.preventDefault(); inp.value = ""; }
    } else if (k === "Tab") open(false);
  });
  inp.addEventListener("focus", function () { if (inp.value.trim().length >= 3 && opts.length && inp.value.trim() === last) open(true); });
  document.addEventListener("mousedown", function (e) { if (!box.contains(e.target)) open(false); });
  document.addEventListener("keydown", function (e) {
    var t = e.target, tag = t && t.tagName;
    if (e.key !== "/" || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (t && t.isContentEditable)) return;
    if (!inp.offsetParent) return;
    e.preventDefault();
    inp.focus();
  });
  if (pop) {
    var qs = (CONFIG.popularQueries || []).filter(function (x) { return ok(x); });
    if (!qs.length && MOCK && MOCK.popularQueries) qs = MOCK.popularQueries;
    if (!qs.length) todo("popularQueries");
    qs.forEach(function (x) {
      var b = h("button", "k-chip", x, { type: "button" });
      b.addEventListener("click", function () { inp.value = x; inp.focus(); clearTimeout(timer); run(x); });
      pop.appendChild(b);
    });
    pop.hidden = !qs.length;
  }
}
