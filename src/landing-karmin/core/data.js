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
/* Фирменные плитки компаний: gl — цвета свечения (R,G,B) для тёмных плиток «Аврора» (вариант 1КА), bg — градиент и белый логотип (WebP без потерь, обрезан по контуру;
   box = [left, top, width] в % от поля 2:1 исходного макета — логотип стоит ровно там же, где в макете). Ключ — name из CONFIG.companies.
   Компания без записи здесь получит тёмную плитку с названием текстом. */
var CO_BRAND = {
  "Северсталь": { gl: ["226,31,38", "28,123,193"], bg: "linear-gradient(150deg,#0B4A96 0%,#00336C 45%,#030A16 100%)",
    box: [8.52, 24.43, 82.67], logo: "data:image/webp;base64,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" },
  "Силовые машины": { gl: ["0,194,199", "0,120,128"], bg: "linear-gradient(150deg,#00C2C7 0%,#00939C 45%,#005057 100%)",
    box: [0.0, 27.84, 100.0], logo: "data:image/webp;base64,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" },
  "NordGold": { gl: ["255,175,0", "158,177,0"], avbox: [13.5, 11, 80.68], bg: "linear-gradient(135deg,#F8AC00 0%,#C9AA00 42%,#86A000 100%)",
    box: [13, 15, 80.68], logo: "data:image/webp;base64,UklGRsIFAABXRUJQVlA4TLYFAAAvG8EcEAUlt5EESVL+/9MEpjPdzTNzK/20iGAI26qgr/AUnsJTSCGFFFYhhRRSSCGFZQmCJLlxm2EcODcWoSkCJPWA4317QzjeYpozi0E4h4uxzpnN2L0YcH/YpeA74WgrdjFGXnB8JbZoC8FU+NYBurLBNrA1ehkw1zRcRpbSYbaRpSzGuB67Eesv3mgV000r8FxsBGTKbsIIif1/iewSDKhwiokSFvDMl79svz/Zhb/fz1KU+/gn/DyHGmV23/03mD3PF6bFEoufnPDbeV5ydUzD914U3bWpOypJ8rvzNspRpXPsqzNavMk9yz7zongXrE176RNL9fdBH1wUYPYZvnOOJW6Dd8/YZ2YoN6Fq+JdOq+Qt0wJTIT570qlvWA4SH56smPGVVH10/YjsbPUULynuTnaIydNF8evLjU4MvsIXUKZ28VcErGDrBs8e7GufTZISIwjKr6EwDpaxH0r5Tu08HRUL2RC1k/10puRqF2N2sSdKd/Cl7Nwtlsr2smOMreNcUrNZbB3wbpPhWnY2m+MtBCp3w+/F+I63EvBqd9LMJUtZirlkKXsxYi/gD7LICP5jMmDgmhY/6arE3yZD3OEa+6GzGfG6suosY/ul5Q/3Nvyrwf5fFIDEOKPRfQgRz44NHUfM3CGEhtRjON4NmlMSGX8+vgYQ1bq9CXdOkR46BqLalK+xcocXegyV5JJ5evhX+0vNEakMQ68AlOuagvFxBNk6Jlu3wn36FgsmkmXwhNs+KBmx0udhLmmsPUgYND495ZK6y3t4JJm6/hJpFjmYhOdphMsaH53a6TtJ5HXsrulQc8nHw1RzRK70WciljeaO6SsqAfNoNqix5InzKiFX+izVoCAFF+WAFbxQrSAkrvrIQnlxYIz77Nln17gjdILoJJf/IbhDc0TZXf6UmhcgiuHy2j1bGaZwLDjNgqnnIP55IPtBHXwlTfcy2I96sl0st5RoDlCFqqtSWfKo1cmoa5sLhIpe/rYOnE13HWE2Zok64CIa8KHRrMea1UBpxaNfb+JZByY8toK1/GiLSGWhcbcGg0cpQtZOmDBSrGSi9Fl47XI7qFMpKp1HmfImCeHLgKUDh6jEmXR75PFu0GxLRkofRWWdjapOo6rEK+zSBbILbbwV60rZzeNA3KK5YqT0IZoRPlStqo8h9pcKWNZNRHzFEXU3Dw1vNIeGKkZK5ZPoMDKXLphGrh6eeQGFL4Mg4gWs2HYz1uzysVk26Fzpi8Hrb4ml+qYkGeOFYoDF+BWkC2kyd940mFzp+/HlyBgTc7yAOBJm1tPu5Xi/F37DO/s62A/9gN3B6z6gH/otWDgu4/5lC0H+W77lFqXv445fhDE8/0X9dMzGAbcjzSr8RVOlx3slMutW5XU9ZBLxqzuTOae58LY5p3khcb5QJhqDgcReB/BBN5ZhtJi7cIfmOFdJc7EXUue4YeRwgAi6YxPkPMfF5uCHf6aZSu5Q+lIoqk+wIjEfAM4F/mAnwSRVe3INzCVv7JnaiDreC+kOVVKwJIHNxTk1TgU1NeiLifwsAMsKoe00s0JzWFPrlMqgpgavBcqKKSMqS5xiOHGpF9o4P7k7Wdyw/1p3k61+4eSseViLtROlb2ReRx8CsbsmX1npmGqWx2uYK30ns8DI+YQX7CDYo2UxVOc4TjWnaz8QP17KVauJFhVvSQbUcDUtW1Y0cImEnmnmx+uQM6Xy+ePrIbq+n0+HD4LULFxAbwNqkpSBStcMFZGQM81BgMZKn1tnlr5/7/tBUpy8abogynwnwfl2EvltkHxlMNP4AONSGyUY1LWMWLPtNAv5p5nFTjqB/6HT3MQ5Z/iUuwQ3HzXDmzWnTn7DcbWsqrKaE4pyJ9iFnBXvJwpqB71TEWQ3HIU1nJu3itNfE3YZN+3Qrm07OEbf5KRLubEUpRvp1jCJEn2JwLJdzBYYN1XZ7MdMp44H" },
  "Лента": { gl: ["56,120,255", "255,204,0"], bg: "linear-gradient(150deg,#1F63E0 0%,#003B95 50%,#001E57 100%)",
    box: [7.95, 30.68, 84.09], logo: "data:image/webp;base64,UklGRrQEAABXRUJQVlA4TKcEAAAvJ4EQELVIVgC3bq3//+ouHpLsprdnOcYQCHghcc1gMEQRBiFJYXiFV0ghhRRSSCGFFFJIIYVYmgCYP/Dgwx/92MeTbI96WODPMh/6GCrvh/xJ5CNpuvLP4RE0X38LnSVb/CEsFj7/DJzFxx+Bs8L7T8BZ5fgD2Kx0/XyT1caPl6z4x7st/Fpru8X+6YJq73id3VXMX841LSDuqvHDBZU3tOkK5u+2FTcMXbF+N8obLFPRfrZQhAlCxvzVTtmGscvmr3bLwipk+1drogZzmf9qFC+7IWo/Wsqm3RLxL6DbzQOLub2RbD5Wz28Ua7TGx7V7xZdYXvw26YPqHRoXhkG6MJ5Or3Er8qJ8xNPp7/cHnBU4yxuctPWQUTgtKHyxWWMT5aZ+JHDxfRNBtuz2ETRVp/0w6hVcVbik07ZjCdzO7ZqofQo1gyVbfoVF627mIqZVUjwOIRvLtm8wWKNiyU6rS3YeQbL4fXyD9YWMaZOUh1GrKllhHN3iB0AxbFyBA/Aa/OCCH3HLeFpclO8DOKls+5x9Llcwj42f0RU8dYvK+Lyk/Eq8zSHrn7CraE9LsyIBZFyloOFW5E1lg/V/wZniZbFFLSHeovMTUr4F/1MOICk/IV2FpoY8810uqsOMwoB4WlDq0IrWJyhPQYN6yQLyKIOmIsfZI/p5U++o7TSYkga1fwmKE9ooEwYF8wBcEkXmgYUooO9FsOtZqCFLUejQUxoHtiQXLEcRtFocBxCS0A0RdM317VNckiZZJitpOIIpmalIp/QyKFwXhTdsvQiijjyEJSH9mpFPGdMpzwNLyTQ6yyAqaImSWc+WFZz4DmEUhZCtlKOsCIVGHReOLCRplKWAq8zCN1n4x4iIlCGanQe+Sce/xkWSbZzxDpjNpnWUD0ErtcstyI8oJWEUOjy9HPEG6LduBGrsAi+1JP1qOp/QHtw0Og3mO5IrXwHoy9/5ClR6CkapLgGQMa+7NbI132ck9KL2v8n/t0+B5DZyAzQJufLNy8xM1LwFq1RIJmqUTOjzU1zANElahIycouqbYJaCpFXWj2NJLpNhgq2gZ5mMufa0ojCK3QLOLxUShkHQBk1BTrtYjc9hFJIs1iXM7wQRU5W0ShWX0Wx8vWG8BQ3FIGIarPsLLBFTEZQ3CULFYTEphHFSuCtYIk5NODmOL2U8RYtaEbqKropGYRhlk/QKIGOb+S6n83kcHi4ZuSIBZGzqlwhdxVsxKV3Q55rnpjhr6DKSbazzXKPx/Tg8aIruHnO8Qai4RZvSAcOg9kYN2BrLcXi9npfvEP81PAWD0hs1RB3wYhxHh/UhwNAw3gxKB2pwVAIvxn50uD8FU9NeLUoXqshqcJeaODzcBfooAlwyrqdO4f9AFR314CzT8QWwzSaiEHKLmEBSuGCumDCcgqZBut2d+AqYRgHgLgTkaoIbGO9WogoPWJ4CqoBwG+8QS2ZtS0Az5DAYiWcvBSCWv2ImX94TRfNN2wHb7re/HgZAnq5pV0B5++vbwwD+9naL7re/3nZAXoodeLtEbgMg4xzeOG62e0WidMacMxKfm33d7an5noEvHMsbyearQ5zzbiTbOBMA" },
  "Свеза": { gl: ["182,230,0", "90,160,0"], bg: "linear-gradient(150deg,#B6E600 0%,#8CC800 45%,#3F7D00 100%)",
    box: [6.82, 33.52, 86.08], logo: "data:image/webp;base64,UklGRhYFAABXRUJQVlA4TAkFAAAvLgEOEAXlSJIcSVLxz7QuqAzgWXvwE8EQtlVBKTyFFJ5CCimk8BVSSCGFFJ7CsiwESXLjNoPAtysAeAAk5Q/47wl/7O9Z/gPDQ4FBEYj0t86NgIu//RsMo/wXgJd8k7zvH+GCSkoBqDztjnYloxXOAgVjGUZ7L0PntabTd08hxNp0Tl7xsQwg3CgzkeYttMhi5HQbUy+Q+VTEeVKwhA4XPoD3VkgAm4iSaAxcx91giY6jFt7ALikcAtfRb40gt6GHlrWV18CdgXJ3f9zdxrx1QzKcvCQhcAkVnS6GjUuXcW+NoCORz+KiJJ2X8/AWIoaENYLyJ6AsfrwBxhdEM3vdReDQCLxrD3JW/xZLXTyzuCDeuaqcOG+s61x3w/ume1wD6G11BldhEbrKq36pxbWrPKGpNLJlsVyEychyAkrXvdlMNM94bkZSM2DZKUaDo7pr8XZ5HTsoumWBY9enEffaeWJEUBsS3+HbPt+iZz7cA3fO0ySFzGdwOyKnKbp8tgoEtuyiLePoqkxZDRaTyI4wIaYp0L8OpSnaZUlnlFqy6riwy4G06GOeO6emCSmdERi3uyCZBI/dxy4Hll3098IC34SQ5nBlf1o/jd6IOEXeWnYU2eM7e0Xp8YCMBimLqUBDJl/mK7aTx+5lXC3qzenigIDyxyJM65HdZlnya/RY/EbIt8BuhqC5QabuIZgEjhogCR+snHMdUK/uxYCbwml4P2gZ3+lji9ULOR7vWLj6AbDM3S0+uNA4b0FlNlshrmkYMYtgZlkdo3OO5/GbWtyl3Y3VYBuI2GSedvaP4uOPhZHFN3MElvX42CfxYFN6QVsq8wYfTeUYy386v5PEFxHL2ag3xGQ+Yi6hvgYhfhPTuDPvxLaIYcNY//Cb+h345ssk5oXqJF2qhqn+QSREfgCcTcYwvMdRQmkYK3H34o/5mhOyFmWo/PJ9wLzFNhvvw5p51nRii3l7fPCn1HveyIni/2G63osdJqpR95KzmNAS99syeOwSN1cTy3VtaDWRc7UYL6OdpukmF66wr3cfK/nYWpWf4xw6toMkzOnZvi/JgSV6vCNXMn18HZM4z8MFk94mp8S2YxZr+P12lyvu5rj3nBQgsH+a3zhaGmku4VvvJNOgvrGmkSKKtmL2OMt4mklsS0ahIYmesA5OYUci1c8A+9YI+3xH++f2y6h1onP9KVgCPQKOx1eB4AmUatlWg2HEoLBdZg6dOcGHCYfG2PaYsWlVgQoRTJHg45veW2/6U50M6qR/fBscbzj0HchFKh5VuZCu99zuT7cDS/lDclKrg8cusLlq07UnV6K0CfthDpxDKRxVaSVvTwOBw0w4DPoKCWiXKH3eKK8qpYFUVoqDTj+A6BbQWkkhpFLaunahGBmBwcmtP7Kk1nfxEqkb310XJ7fOmQeN3iVZDvyyOwzu6atynvSd1iVX5fybWrNsXkogHstiHsvzmIjsR62vjuiddW9K/QrgEtdipi/yjBL80/srhgcDhL+o9C7ZC+/xsSz6sTs8hpTZ60R/crVoXhR6mzbvrcIOj0Wx+NgV9pWJgb7+1JGcCa+P01uvMR87dppb+6OyZSJ2AtLJy3YBkjR0R8FohEcugfzttzge3yDwgtK/t663P0YCPhaY2bgXmOzq1b77be/7aXGZAzbuvhr1rZfZ+Qh/Bb90g+84v5wv3Lw16O/+R82eVDP51RpmaNE/rt+A/1/FYwA=" }
};
function initCompanies(root) {
  var box = $(root, "cos"), cat = $(root, "cat"), u = ok(CONFIG.categoriesUrl);
  if (cat) { if (u) cat.setAttribute("href", u); else cat.hidden = true; }
  if (!box) return;
  var av = !!box.closest(".k-coav");
  fill(box, CONFIG.companies.map(function (c, i) {
    var b = CO_BRAND[c.name] || {};
    if (av && b.avbox) b = { gl: b.gl, bg: b.bg, logo: b.logo, box: b.avbox };
    var kids = [h("span", "k-co-n", (i < 9 ? "0" : "") + (i + 1)),
      h("span", "k-co-l", b.logo ? h("span", "k-co-f", h("img", null, null, { src: b.logo, alt: c.name,
        style: "left:" + b.box[0] + "%;top:" + b.box[1] + "%;width:" + b.box[2] + "%" })) : h("span", "k-co-t", c.name)),
      h("span", "k-co-s", [h("span", null, "практики компании"), ic("ar")])];
    var e = ok(c.url) ? A(c.url, "k-co", kids) : h("div", "k-co", kids);
    e.setAttribute("aria-label", c.name + ": практики компании");
    if (b.bg) e.style.setProperty("--bc", b.bg);
    if (b.gl) b.gl.forEach(function (g, j) { e.style.setProperty("--g" + (j + 1), g); });
    return e;
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
