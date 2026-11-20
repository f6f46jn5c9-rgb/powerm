#!/usr/bin/env python3
"""Автопроверка стартовой БУП «Кармин» (п. 7 задания).

  python3 tools/landing_check.py            # сборка + матрица + отчёт в reports/landing-check/
  python3 tools/landing_check.py --before   # первый прогон «до исправлений» в reports/landing-check/before/
  QUICK=1 python3 tools/landing_check.py    # укороченная матрица (для отладки)

Состав: статические проверки собранных модулей (Python), матрица в имитации Refined (tools/landing_check.js,
Playwright/Chromium), сравнение скриншотов с «агрессивной темой» и без (Pillow), отчёт report.md + report.html.
"""
import html
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys

from PIL import Image, ImageChops

R = pathlib.Path(__file__).resolve().parent.parent
DIST = R / 'dist/landing-karmin'
REP = R / 'reports/landing-check'
LIMIT = 38 * 1024
sys.path.insert(0, str(R / 'tools'))
import build_landing_karmin as B  # noqa: E402


def static_checks():
    out = []
    for vid, (vname, mods) in B.VARIANTS.items():
        for name in mods:
            t = (DIST / (name + '.html')).read_text()
            size = len(t.encode())
            root = re.search(r'<div class="(bupk-[\w]+)"', t).group(1)
            issues = []
            if size > LIMIT:
                issues.append(f'размер {size} Б > 38 КБ')
            cfg_start = t.index('var CONFIG = {')
            cfg_end = t.index('/* ==== код модуля')
            outside = t[:cfg_start] + t[cfg_end:]
            for pat, what in [(r'localStorage', 'localStorage'), (r'sessionStorage', 'sessionStorage'),
                              (r'position\s*:\s*fixed', 'position:fixed'), (r'100vh', '100vh'), (r'@import', '@import'),
                              (r'@font-face', '@font-face'), (r'<img\b', '<img>'), (r'url\(', 'url( в CSS'),
                              (r'\.innerHTML', 'innerHTML'), (r'document\.write', 'document.write')]:
                if re.search(pat, outside):
                    issues.append('найдено: ' + what)
            for m in re.finditer(r'https?://[^\s"\'<>)]*', outside):
                if m.group(0) != 'http://www.w3.org/2000/svg':
                    issues.append('внешний адрес вне CONFIG: ' + m.group(0))
            css = re.search(r'<style>\n(.*?)\n</style>', t, re.S).group(1)
            bad = []
            nsel = 0

            def walk(s):
                nonlocal nsel
                i = 0
                while True:
                    j = s.find('{', i)
                    if j < 0:
                        return
                    pre = s[i:j].strip()
                    k = B.match_brace(s, j)
                    if pre.startswith(('@media', '@container', '@supports')):
                        walk(s[j + 1:k])
                    elif not pre.startswith('@keyframes'):
                        for sel in B.split_top(pre):
                            nsel += 1
                            if not (sel == '.' + root or sel.startswith('.' + root + ' ') or sel.startswith('.' + root + ',')
                                    or sel.startswith('.' + root + ':') or sel.startswith('.' + root + '>')):
                                bad.append(sel)
                    i = k + 1
            walk(css)
            if bad:
                issues.append('селекторы без корня: ' + ', '.join(bad[:5]))
            kf = re.findall(r'@keyframes\s+([\w-]+)', css)
            if any(not k.startswith(root) for k in kf):
                issues.append('keyframes без префикса модуля')
            out.append({'variant': vid, 'module': name, 'file': name + '.html', 'bytes': size, 'selectors': nsel,
                        'root': root, 'issues': issues})
    return out


def diff_ratio(a, b):
    ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
    if ia.size != ib.size:
        w, h = max(ia.size[0], ib.size[0]), max(ia.size[1], ib.size[1])
        return 1.0, f'размеры различаются: {ia.size} vs {ib.size}'
    d = ImageChops.difference(ia, ib).convert('L').point(lambda v: 255 if v > 24 else 0)
    hist = d.histogram()
    changed = hist[255]
    return changed / (ia.size[0] * ia.size[1]), ''


def run(before=False):
    subprocess.run([sys.executable, str(R / 'tools/build_landing_karmin.py')], check=True)
    out = REP / 'before' if before else REP
    if out.exists():
        for p in out.iterdir():
            if p.name != 'before':
                shutil.rmtree(p) if p.is_dir() else p.unlink()
    out.mkdir(parents=True, exist_ok=True)
    args = ['node', str(R / 'tools/landing_check.js'), str(out)]
    if not before and (REP / 'before/results.json').exists():
        args.append(str(REP / 'before/results.json'))
    subprocess.run(args, check=True)
    raw = json.loads((out / 'raw.json').read_text())
    st = static_checks()
    for t in raw['theme']:
        r, note = diff_ratio(out / t['aggr'], out / t['clean'])
        t['diff'] = r
        t['note'] = note
        t['ok'] = r <= 0.005
        if t['ok']:  # совпавшие пары не храним — в отчёте остаётся процент отличия
            for k in ('aggr', 'clean'):
                (out / t[k]).unlink()
                t[k] = None
    if before:  # из прогона «до» нужны только кропы проблем
        for k in ('gallery', 'search', 'shelf'):
            for g in raw[k]:
                (out / g['shot']).unlink(missing_ok=True)
            raw[k] = []
    raw['static'] = st
    (out / 'results.json').write_text(json.dumps(raw, ensure_ascii=False, indent=1))
    (out / 'raw.json').unlink()
    write_reports(out, raw, before)


CHECK_NAMES = {'overflow': '1 Переполнение', 'clip': '2 Обрезанный текст', 'overlap': '3 Перекрытия', 'touch': '4 Цели касания',
               'contrast': '5 Контраст', 'font': '6 Кегль', 'iso': '7 Изоляция', 'js': '8 Ошибки JS', 'static': '9 Статика',
               'red': '10 Одно красное на экран'}


def status(issues):
    if any(i['sev'] == 'error' for i in issues):
        return '❌'
    if issues:
        return '⚠️'
    return '✅'


def write_reports(out, raw, before):
    cfgs = raw['configs']
    variants = list(B.VARIANTS)
    ids = []
    for c in cfgs:
        if c['id'] not in ids:
            ids.append(c['id'])
    by = {(c['v'], c['id']): c for c in cfgs}
    errors = [(c, i) for c in cfgs for i in c['issues'] if i['sev'] == 'error']
    warns = [(c, i) for c in cfgs for i in c['issues'] if i['sev'] == 'warn']
    st_bad = [s for s in raw['static'] if s['issues']]
    iso_bad = [t for t in raw['theme'] if not t['ok']]
    nb_bad = [k for k, v in raw['neighbor'].items() if not v['same']]
    srch_bad = [s for s in raw['search'] if not s['ok']]
    shelf_bad = [s for s in raw['shelf'] if not s['ok']]
    total_err = len(errors) + len(st_bad) + len(iso_bad) + len(nb_bad) + len(srch_bad) + len(shelf_bad)
    rm = [c for c in cfgs if c['cfg'].get('rm')]
    ms = {}
    for c in cfgs:
        for m, v in (c.get('ms') or {}).items():
            ms.setdefault(m, []).append(v)

    # ---------- Markdown ----------
    L = []
    L.append('# Автопроверка стартовой БУП «Кармин»' + (' — прогон «до исправлений»' if before else ''))
    L.append('')
    L.append(f'Конфигураций матрицы: **{raw["matrixSize"]}** на вариант × 3 варианта = **{len(cfgs)}** прогонов. '
             f'Ошибок обязательных проверок: **{total_err}**. Предупреждений: **{len(warns)}**. '
             f'Текстов «проверить вручную» (градиент/стекло): **{len(raw["manual"])}**.')
    L.append('')
    L.append('## Сводка: вариант × конфигурация')
    L.append('')
    L.append('| Конфигурация | ' + ' | '.join(variants) + ' |')
    L.append('|---|' + '---|' * len(variants))
    for i in ids:
        L.append(f'| {i} | ' + ' | '.join(status(by[(v, i)]['issues']) if (v, i) in by else '—' for v in variants) + ' |')
    L.append('')
    L.append('## Прочие проверки')
    L.append('')
    L.append(f'- Статика (размер ≤ 38 КБ, запреты, скоуп селекторов): {"✅ все модули" if not st_bad else "❌ " + ", ".join(s["module"] for s in st_bad)}')
    L.append(f'- Изоляция — скриншоты с «агрессивной темой» и без (≤ 0,5 % пикселей): {"✅" if not iso_bad else "❌"} '
             f'{len(raw["theme"]) - len(iso_bad)}/{len(raw["theme"])}; макс. отличие {max([t["diff"] for t in raw["theme"]] or [0]) * 100:.3f} %')
    L.append(f'- Стили «соседа» (.wiki-content p, .aui-button) не изменились: {"✅" if not nb_bad else "❌ " + ", ".join(nb_bad)}')
    L.append(f'- Умный поиск («сварк», ↓, Enter, Enter без пункта, «/»): {"✅" if not srch_bad else "❌"} {len(raw["search"]) - len(srch_bad)}/{len(raw["search"])}')
    L.append(f'- Полка 6К листается стрелкой: {"✅" if not shelf_bad else "❌"} ' + '; '.join(f'{s["cfg"]}: {s["before"]}→{s["after"]} px' for s in raw['shelf']))
    if rm:
        L.append('- prefers-reduced-motion: ' + ', '.join(f'{c["v"]} transition-duration={c.get("reducedMotion")}' for c in rm))
    L.append('')
    L.append('## Модули')
    L.append('')
    L.append('| Вариант | Файл | КБ | Селекторов | Рендер, мс (медиана) | Статика |')
    L.append('|---|---|---|---|---|---|')
    for s in raw['static']:
        v = sorted(ms.get(s['module'], [0]))
        med = v[len(v) // 2] if v else 0
        L.append(f'| {s["variant"]} | {s["file"]} | {s["bytes"] / 1024:.1f} | {s["selectors"]} | {med:.1f} | {"✅" if not s["issues"] else "; ".join(s["issues"])} |')
    L.append('')
    L.append('## Проблемы')
    L.append('')
    if not errors and not warns:
        L.append('Нет.')
    agg = {}
    for c, i in errors + warns:
        k = (c['v'], i['c'], i['sev'], i['mod'], i['sel'], re.sub(r'\d+', 'N', i['msg']))
        a = agg.setdefault(k, {'i': i, 'cfgs': [], 'crop': None})
        a['cfgs'].append(c['id'])
        if i.get('crop') and not a['crop']:
            a['crop'] = i['crop']['file']
    for (v, c, sev, mod, sel, _), a in agg.items():
        L.append(f'- {"❌" if sev == "error" else "⚠️"} **{v}** · {CHECK_NAMES.get(c, c)} · `{mod}` · `{sel}` — {a["i"]["msg"]} '
                 f'(конфигураций: {len(a["cfgs"])}, напр. {a["cfgs"][0]})' + (f' · [кроп]({a["crop"]})' if a['crop'] else ''))
    L.append('')
    if raw['before_after']:
        L.append('## До / после исправлений')
        L.append('')
        for b in raw['before_after']:
            L.append(f'- **{b["v"]}** {b["cfg"]} · {CHECK_NAMES.get(b["c"], b["c"])} · `{b["mod"]}` · `{b["sel"]}` — {b["msg"]}: [до]({b["before"]}) → [после]({b["after"]})')
        L.append('')
    L.append('## Проверить вручную (текст над градиентом/стеклом)')
    L.append('')
    for m in raw['manual'][:60]:
        L.append(f'- {m["v"]} · `{m["mod"]}` · `{m["sel"]}` — {m["why"]}')
    L.append('')
    (out / 'report.md').write_text('\n'.join(L))

    # ---------- HTML ----------
    e = html.escape
    H = ['<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
         '<title>Автопроверка БУП «Кармин»</title><style>',
         'body{margin:0;font:14px/1.5 Inter,Arial,sans-serif;color:#1F2A33;background:#F7F8F9}main{max-width:1280px;margin:0 auto;padding:24px 16px 64px}',
         'h1,h2{font-family:Manrope,Arial,sans-serif;font-weight:800;text-transform:uppercase}h1{font-size:28px}h2{font-size:20px;margin-top:40px}',
         'table{border-collapse:collapse;background:#fff;font-size:13px}td,th{border:1px solid #E3E7EA;padding:4px 8px;text-align:left}',
         '.tw{overflow-x:auto}.kpi{display:flex;flex-wrap:wrap;gap:12px}.kpi div{background:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 1px 2px rgba(0,0,0,.06)}',
         '.kpi b{display:block;font:800 28px Manrope,Arial,sans-serif}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:16px}',
         'figure{margin:0;background:#fff;border-radius:12px;padding:10px;box-shadow:0 1px 2px rgba(0,0,0,.06)}figure img{display:block;max-width:100%;height:auto;border:1px solid #E3E7EA}',
         'figcaption{font-size:12px;color:#5B6670;margin-top:6px}.gal img{max-height:640px;object-fit:cover;object-position:top}code{font-size:12px}li{margin:4px 0}',
         '</style></head><body><main>',
         '<h1>Автопроверка стартовой БУП «Кармин»' + (' — до исправлений' if before else '') + '</h1>',
         '<div class="kpi">',
         f'<div><b>{len(cfgs)}</b>прогонов матрицы</div><div><b>{total_err}</b>ошибок обязательных проверок</div>',
         f'<div><b>{len(warns)}</b>предупреждений</div><div><b>{len(raw["manual"])}</b>текстов «проверить вручную»</div></div>',
         '<h2>Сводка</h2><div class="tw"><table><tr><th>Конфигурация</th>' + ''.join(f'<th>{v}</th>' for v in variants) + '</tr>']
    for i in ids:
        H.append(f'<tr><td>{e(i)}</td>' + ''.join(f'<td>{status(by[(v, i)]["issues"]) if (v, i) in by else "—"}</td>' for v in variants) + '</tr>')
    H.append('</table></div><h2>Прочие проверки</h2><ul>')
    for line in L[L.index('## Прочие проверки') + 2:L.index('## Модули') - 1]:
        H.append('<li>' + e(line[2:]) + '</li>')
    H.append('</ul><h2>Модули</h2><div class="tw"><table><tr><th>Вариант</th><th>Файл</th><th>КБ</th><th>Селекторов</th><th>Рендер, мс</th><th>Статика</th></tr>')
    for s in raw['static']:
        v = sorted(ms.get(s['module'], [0]))
        H.append(f'<tr><td>{s["variant"]}</td><td>{e(s["file"])}</td><td>{s["bytes"] / 1024:.1f}</td><td>{s["selectors"]}</td><td>{v[len(v) // 2]:.1f}</td>'
                 f'<td>{"✅" if not s["issues"] else e("; ".join(s["issues"]))}</td></tr>')
    H.append('</table></div><h2>Проблемы</h2>')
    if not agg:
        H.append('<p>Нет — все обязательные проверки пройдены во всех конфигурациях.</p>')
    else:
        H.append('<div class="g">')
        for (v, c, sev, mod, sel, _), a in agg.items():
            img = f'<img src="{e(a["crop"])}" alt="" loading="lazy">' if a['crop'] else ''
            H.append(f'<figure>{img}<figcaption>{"❌" if sev == "error" else "⚠️"} <b>{v}</b> · {e(CHECK_NAMES.get(c, c))} · <code>{e(mod)}</code> · '
                     f'<code>{e(sel)}</code><br>{e(a["i"]["msg"])} — конфигураций: {len(a["cfgs"])} (напр. {e(a["cfgs"][0])})</figcaption></figure>')
        H.append('</div>')
    if raw['before_after']:
        H.append('<h2>До / после исправлений</h2><div class="g">')
        for b in raw['before_after']:
            H.append(f'<figure><img src="{e(b["before"])}" alt="до" loading="lazy"><img src="{e(b["after"])}" alt="после" loading="lazy">'
                     f'<figcaption><b>{b["v"]}</b> {e(b["cfg"])} · {e(CHECK_NAMES.get(b["c"], b["c"]))} · <code>{e(b["mod"])}</code><br>{e(b["msg"])} — сверху «до», снизу «после»</figcaption></figure>')
        H.append('</div>')
    H.append('<h2>Умный поиск: открытый список</h2><div class="g">')
    for s in raw['search']:
        H.append(f'<figure><img src="{e(s["shot"])}" alt="" loading="lazy"><figcaption>{"✅" if s["ok"] else "❌"} <b>{s["v"]}</b> {e(s["cfg"])} · '
                 f'пунктов {s.get("opts")}, групп: {e(", ".join(s.get("groups") or []))}; Enter → {e(str(s.get("navigated"))[:90])}; '
                 f'Enter без пункта → {e(str(s.get("enterFull"))[:90])}; «/» → фокус: {s.get("slashFocus")} {e("; ".join(s["notes"]))}</figcaption></figure>')
    for s in raw['shelf']:
        H.append(f'<figure><img src="{e(s["shot"])}" alt="" loading="lazy"><figcaption>{"✅" if s["ok"] else "❌"} 6К полка после стрелки → {e(s["cfg"])}: scrollLeft {s["before"]} → {s["after"]}</figcaption></figure>')
    H.append('</div><h2>Галерея</h2>')
    for v in variants:
        H.append(f'<h3>{v} «{e(B.VARIANTS[v][0])}»</h3><div class="g gal">')
        for g in [g for g in raw['gallery'] if g['v'] == v]:
            H.append(f'<figure><a href="{e(g["shot"])}"><img src="{e(g["shot"])}" alt="" loading="lazy"></a><figcaption>{e(g["label"])} — {e(g["cfg"])} (открыть полностью)</figcaption></figure>')
        H.append('</div>')
    H.append('<h2>Изоляция: с «агрессивной темой» / без</h2><div class="tw"><table><tr><th>Вариант</th><th>Конфигурация</th><th>Модуль</th><th>Отличие пикселей</th></tr>')
    for t in raw['theme']:
        H.append(f'<tr><td>{t["v"]}</td><td>{e(t["cfg"])}</td><td>{e(t["mod"])}</td><td>{"✅" if t["ok"] else "❌"} {t["diff"] * 100:.3f} % ' +
                 (f'<a href="{e(t["aggr"])}">с темой</a> · <a href="{e(t["clean"])}">без</a> ' if t['aggr'] else '') + f'{e(t["note"])}</td></tr>')
    H.append('</table></div><h2>Проверить вручную (текст над градиентом/стеклом)</h2><ul>')
    for m in raw['manual'][:80]:
        H.append(f'<li>{m["v"]} · <code>{e(m["mod"])}</code> · <code>{e(m["sel"])}</code> — {e(m["why"])}</li>')
    H.append('</ul></main></body></html>')
    (out / 'report.html').write_text('\n'.join(H))
    print(f'Отчёт: {out / "report.html"}  · ошибок: {total_err}, предупреждений: {len(warns)}')


if __name__ == '__main__':
    run(before='--before' in sys.argv)
