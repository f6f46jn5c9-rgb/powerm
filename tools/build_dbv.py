"""Сборка комплекса ДБВ: хаб (src/blocks) и пять дочерних страниц (src/blocks-<страница>) -> dist/NN-имя.html (хаб),
dist/<страница>/NN-имя.html и превью preview-dbv-<страница>.html (колонка 1000 px, подписи «HTML-макрос N»).
Общее: src/core (dbv-core.css — примитивы иерархии, dbv-nav.* — навигация, dbv-ui.js — помощники, dbv-glossary.js — подсказки,
dbv-pages.js — единый файл адресов страниц). Запуск: python3 tools/build_dbv.py
Отдельный от tools/build.py скрипт: файлы других страниц не трогает."""
import pathlib, re, sys

R = pathlib.Path(__file__).resolve().parent.parent
rd = lambda p: (R / p).read_text(encoding='utf-8')
CORE_CSS = rd('src/core/dbv-core.css')
CORE_GL = rd('src/core/dbv-glossary.js').rstrip()
CORE_PAGES = rd('src/core/dbv-pages.js').rstrip()
CORE_UI = rd('src/core/dbv-ui.js').rstrip()
CORE_NAV_JS = rd('src/core/dbv-nav.js').rstrip()
CORE_NAV_CSS = rd('src/core/dbv-nav.css')
MAX_KB = 38

# (папка исходника = имя файла в dist, корневой класс, подпись, секции core сверх базы)
HUB = [
    ('01-shapka', 'dbv-hero', 'Навигация и шапка', {'logo', 'tip'}),
    ('02-roadmap', 'dbv-road', 'Путь проекта', {'tip'}),
    ('03-principy-razdely', 'dbv-prin', 'Принципы, разделы, где что искать', {'tip'}),
]
STAGES = [
    ('01-navigaciya', 'dbv-nav', 'Навигация и заголовок', {'tip'}),
    ('02-etapy', 'dbv-stg', 'Этапы и чек-листы', {'tip'}),
    ('03-30-dney-kriterii', 'dbv-f30', 'Первые 30 дней и критерии включения', {'tip'}),
]
RHYTHM = [
    ('01-navigaciya', 'dbv-nav', 'Навигация и заголовок', {'tip'}),
    ('02-ritm-otchet-blokiratory', 'dbv-rit', 'Ритм, демонстрационный день, отчёт, блокиратор', {'tip'}),
    ('03-osobye-sluchai', 'dbv-oops', 'Особые случаи', {'tip'}),
]
ASSETS = [
    ('01-navigaciya', 'dbv-nav', 'Навигация и заголовок', {'tip'}),
    ('02-aktiv-ustoychivost', 'dbv-act', 'Актив и устойчивость результата', {'tip'}),
    ('03-kr-oshibki', 'dbv-krb', 'КР и частые ошибки', {'tip'}),
]
ROLES = [
    ('01-navigaciya', 'dbv-nav', 'Навигация и заголовок', {'tip'}),
    ('02-matrica', 'dbv-mx', 'Матрица ролей', {'tip'}),
    ('03-roli', 'dbv-rl', 'Справочник ролей', {'tip'}),
]
GRADE = [
    ('01-navigaciya', 'dbv-nav', 'Навигация и заголовок', {'tip'}),
    ('02-svetofor-priemka', 'dbv-svf', 'Светофор и приёмка', {'tip'}),
    ('03-zashchita-uchastniki', 'dbv-def', 'Защита, оценка участников, важно знать', {'tip'}),
]
SETS = {
    'hub': (HUB, 'src/blocks', 'dist', 'Проектный трек ДБВ (хаб)'),
    'stages': (STAGES, 'src/blocks-stages', 'dist/stages', 'Этапы и контрольные точки'),
    'rhythm': (RHYTHM, 'src/blocks-rhythm', 'dist/rhythm', 'Рабочий ритм и особые случаи'),
    'assets': (ASSETS, 'src/blocks-assets', 'dist/assets', 'Активы, КР и частые ошибки'),
    'roles': (ROLES, 'src/blocks-roles', 'dist/roles', 'Роли: кто за что отвечает'),
    'grade': (GRADE, 'src/blocks-grade', 'dist/grade', 'Оценка и защита'),
}
SECTION = re.compile(r'/\*@(\w+)\*/(.*?)/\*@end\*/', re.S)


def mini(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s*\n\s*', ' ', css)
    css = re.sub(r'\s*([{};])\s*', r'\1', css)
    return css.strip()


def scope(css, root):
    # каркас-правила чужого CSS перебиваются !important на тегах (a, h2, p, button, table...), поэтому корень — одинарный класс (экономит размер)
    return css.replace('.ROOT', f'.{root}')


def purge(css, used):
    # из core убираем правила с классами, которых нет ни в разметке, ни в скрипте блока
    def has(cls):
        return cls in used
    def rule_ok(sel):
        parts = [x for x in sel.split(',') if x.strip()]
        return any(all(has(c) for c in re.findall(r'\.(dbv-[\w-]+)', x)) for x in parts)
    def walk(txt):
        out, i = [], 0
        while i < len(txt):
            j = txt.find('{', i)
            if j < 0:
                out.append(txt[i:]); break
            head = txt[i:j]
            d, k = 1, j + 1
            while d:
                d += {'{': 1, '}': -1}.get(txt[k], 0); k += 1
            body = txt[j + 1:k - 1]
            h = head.strip()
            if h.startswith('@container') or h.startswith('@media'):
                inner = walk(body)
                if inner.strip():
                    out.append(head + '{' + inner + '}')
            elif rule_ok(head):
                out.append(head + '{' + body + '}')
            i = k
        return ''.join(out)
    return walk(css)


def squeeze(js):
    # core-код: без отступов, пустых строк и строк-комментариев
    return '\n'.join(l.strip() for l in js.split('\n') if l.strip() and not l.strip().startswith('//') and not l.strip().startswith('/*'))


def prune_ui(ui, js):
    # из dbv-ui.js в блок попадают только функции и иконки, которыми блок реально пользуется
    chunks = re.split(r'\n(?=function |var IC)', ui)
    named = {}
    for c in chunks:
        m = re.match(r'function (\w+)', c)
        named[m.group(1) if m else '#IC'] = c
    used, todo = set(), []
    def scan(text):
        for n in named:
            if n != '#IC' and n not in used and re.search(r'\b' + n + r'\(', text):
                used.add(n); todo.append(n)
    scan(js)
    while todo:
        scan(named[todo.pop()])
    body = js + ''.join(named[n] for n in used)
    ic = named['#IC']
    keys = [k for k in re.findall(r"^  (\w+):", ic, re.M) if re.search(r"ico\('" + k + r"'", body)]
    ic = re.sub(r"^  (\w+): .*?,?\n", lambda m: m.group(0) if m.group(1) in keys else '', ic, flags=re.M)
    ic = re.sub(r",(\s*\n\};)", r"\1", ic)
    out = [named[n] for n in named if n in used or n == 'esc']
    return ic + '\n' + '\n'.join(out) if keys else '\n'.join(out)


def core_for(sections):
    return SECTION.sub(lambda m: m.group(2) if m.group(1) in sections else '', CORE_CSS)


def prune_glossary(gl, js):
    # в словаре блока остаются только термины, встречающиеся в его тексте (определения не меняются)
    def keep(m):
        key = m.group(1)
        return m.group(0) if re.search(r'(?<![A-Za-zА-яЁё])' + key + r'\d*(?![A-Za-zА-яЁё])', js) else ''
    out = re.sub(r"^  '([^']+)': '.*?',?\n", keep, gl, flags=re.M)
    return re.sub(r",(\s*\n\s*\};)", r"\1", re.sub(r",\s*\n\};", "\n};", out))


def pages_for(js, nav):
    # в блок попадают только нужные записи DBV_PAGES (длинные адреса иначе раздувают файл)
    keep = {'hub', 'stages', 'rhythm', 'assets', 'roles', 'grade'} if nav else set()
    out = []
    for line in CORE_PAGES.split('\n'):
        if line.startswith('/*'):
            continue
        m = re.match(r"\s+(\w+):\s*\{", line)
        if m and not (m.group(1) in keep or re.search(r'[.\'"{|(]' + m.group(1) + r'\b', js)):
            continue
        out.append(line)
    return re.sub(r",(\s*\n\};)", r"\1", '\n'.join(out))


def build_block(src, folder, root, sections):
    d = R / src / folder
    js = (d / 'block.js').read_text(encoding='utf-8').rstrip()
    html = (d / 'block.html').read_text(encoding='utf-8').strip()
    bcss = (d / 'block.css').read_text(encoding='utf-8')
    nav = 'dbvNav(' in js
    uses_gl = 'dbvGlossary(' in js
    sec = set(sections)
    if not uses_gl:
        sec.discard('tip')
    used = set(re.findall(r'dbv-[\w-]+', html + js + bcss + CORE_UI + CORE_GL + (CORE_NAV_JS if nav else '')))
    css = purge(mini(scope(core_for(sec), root)), used)
    if nav:
        css += mini(scope(CORE_NAV_CSS, root))
    css += '\n' + mini(scope(bcss, root))
    parts = []
    if re.search(r'DBV_PAGES', js + (CORE_NAV_JS if nav else '') + CORE_UI):
        parts.append(pages_for(js + (CORE_NAV_JS if nav else ''), nav).replace(chr(10) + '  ', chr(10)))
    parts.append(squeeze(prune_ui(CORE_UI, js + (CORE_NAV_JS if nav else ''))))
    if uses_gl:
        parts.append(squeeze(prune_glossary(CORE_GL, js)))
    if nav:
        parts.append(squeeze(CORE_NAV_JS))
    parts.append('\n'.join(l.strip() for l in js.split('\n') if l.strip()))
    body = '\n'.join(parts)
    body = '\n'.join('  ' + l if l else l for l in body.split('\n'))
    return f'<style>\n{css}\n</style>\n{html}\n<script>\n(function () {{\n  "use strict";\n{body}\n}})();\n</script>\n'


def preview(title, items):
    cells = '\n'.join(f'<div class="mac"><div class="cap">HTML-макрос {i}: {cap}</div>\n{t}</div>' for i, (cap, t) in enumerate(items, 1))
    return ('<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>Превью: {title}</title>'
            '<style>.pv-body{margin:0;background:#f4f5f6;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}'
            '.pv-col{width:1000px;max-width:100%;margin:0 auto;padding:24px;background:#fff;box-sizing:border-box;display:flex;flex-direction:column;gap:16px}'
            '.pv-col .cap{font-size:12px;color:#8a8f94;margin:0 0 4px}</style></head>'
            f'<body class="pv-body"><div class="pv-col" id="pv-col">\n{cells}\n</div></body></html>')


def build_set(key):
    blocks, src, outdir, title = SETS[key]
    (R / outdir).mkdir(parents=True, exist_ok=True)
    ok, items = True, []
    for folder, root, cap, sections in blocks:
        if not (R / src / folder / 'block.js').exists():
            print(f'(пропуск: нет {src}/{folder}/block.js)')
            continue
        t = build_block(src, folder, root, sections)
        (R / outdir / f'{folder}.html').write_text(t, encoding='utf-8')
        kb = len(t.encode('utf-8')) / 1024
        print(f'{outdir}/{folder}.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
        ok = ok and kb <= MAX_KB
        items.append((cap, t))
    if items:
        (R / f'preview-dbv-{key}.html').write_text(preview(title, items), encoding='utf-8')
        print(f'preview-dbv-{key}.html')
    return ok


def main():
    only = sys.argv[1:] or list(SETS)
    ok = True
    for k in only:
        ok = build_set(k) and ok
    sys.exit(0 if ok else 1)


main()
