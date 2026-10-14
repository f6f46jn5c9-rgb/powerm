"""Сборка ДБВ: хаб (src/blocks) -> dist/NN-имя.html + preview-dbv-hub.html,
страница «Этапы и КТ» (src/blocks-stages) -> dist/stages/NN-имя.html + preview-dbv-stages.html.
Общее: src/core (css-каркас, модуль подсказок, навигация, dbv-pages.js — единый файл адресов страниц).
Запуск: python3 tools/build_dbv.py
Отдельный от tools/build.py скрипт: не трогает файлы других страниц."""
import pathlib, re, sys

R = pathlib.Path(__file__).resolve().parent.parent
rd = lambda p: (R / p).read_text(encoding='utf-8')
CORE_CSS = rd('src/core/dbv-core.css')
CORE_GL = rd('src/core/dbv-glossary.js').rstrip()
CORE_PAGES = rd('src/core/dbv-pages.js').rstrip()
CORE_NAV_JS = rd('src/core/dbv-nav.js').rstrip() if (R / 'src/core/dbv-nav.js').exists() else ''
CORE_NAV_CSS = rd('src/core/dbv-nav.css') if (R / 'src/core/dbv-nav.css').exists() else ''
# (папка, файл в dist, корневой класс, подпись, секции core сверх базы)
HUB = [
    ('01-shapka', '01-shapka', 'dbv-hero', 'Шапка', {'logo', 'chip', 'tip'}),
    ('02-roadmap', '02-roadmap', 'dbv-road', 'Путь проекта', {'tip'}),
    ('03-principy', '03-principy', 'dbv-prin', 'Три принципа', {'glass', 'tip'}),
    ('04-razdely', '04-razdely', 'dbv-next', 'Куда дальше', {'glass'}),
    ('05-faq-kontakty', '05-faq-kontakty', 'dbv-faq', 'Вопросы и контакты', {'glass', 'tip'}),
]
STAGES = [
    ('01-navigaciya', '01-navigaciya', 'dbv-nav', 'Навигация и заголовок', {'tip'}),
    ('02-etapy', '02-etapy', 'dbv-stg', 'Этапы: один за раз', {'glass', 'tip'}),
    ('03-pervye-30-dney', '03-pervye-30-dney', 'dbv-f30', 'Первые 30 дней', {'glass', 'chip', 'tip'}),
    ('04-kriterii', '04-kriterii', 'dbv-crit', 'Критерии включения', {'glass', 'tip'}),
]
RHYTHM = [
    ('01-navigaciya', '01-navigaciya', 'dbv-nav', 'Навигация и заголовок', {'tip'}),
    ('02-ritm', '02-ritm', 'dbv-rit', 'Рабочий ритм проекта', {'glass', 'chip', 'tip'}),
    ('03-otchet-blokiratory', '03-otchet-blokiratory', 'dbv-rep', 'Пятничный отчёт и блокиратор', {'glass', 'chip', 'tip'}),
    ('04-nestatnye', '04-nestatnye', 'dbv-oops', 'Если что-то пошло не так', {'chip', 'tip'}),
]
ASSETS = [
    ('01-navigaciya', '01-navigaciya', 'dbv-nav', 'Навигация и заголовок', {'tip'}),
    ('02-aktiv', '02-aktiv', 'dbv-act', 'Актив: что это и что нет', {'glass', 'tip'}),
    ('03-ustoychivost', '03-ustoychivost', 'dbv-sus', 'Что делает результат устойчивым', set()),
    ('04-kr', '04-kr', 'dbv-kr', 'Как формулировать КР', {'chip', 'tip'}),
    ('05-oshibki', '05-oshibki', 'dbv-err', 'Чего не делать и частые ошибки', {'tip'}),
]
ROLES = [
    ('01-navigaciya', '01-navigaciya', 'dbv-nav', 'Навигация и заголовок', {'tip'}),
    ('02-matrica', '02-matrica', 'dbv-mx', 'Матрица ролей', {'tip'}),
    ('03-roli', '03-roli', 'dbv-rl', 'К кому обращаться', {'glass', 'tip'}),
]
SECTION = re.compile(r'/\*@(\w+)\*/(.*?)/\*@end\*/', re.S)
MAX_KB = 40


def mini(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s*\n\s*', ' ', css)
    css = re.sub(r'\s*([{};])\s*', r'\1', css)
    return css.strip()


def scope(css, root, double):
    # хаб: корневой класс удвоен (выше специфичность, чем у правил Confluence); страница этапов — одинарный (экономия размера)
    return css.replace('.ROOT', f'.{root}.{root}' if double else f'.{root}').replace('ROOTK', root)


def core_for(sections):
    return SECTION.sub(lambda m: m.group(2) if m.group(1) in sections else '', CORE_CSS)


def prune_glossary(gl, js):
    # страница этапов: оставляем в словаре только термины, встречающиеся в тексте блока (тексты определений не меняются)
    def keep(m):
        key = m.group(1)
        return m.group(0) if re.search(r'(?<![A-Za-z\u0410-\u044f\u0401\u0451])' + key + r'\d*(?![A-Za-z\u0410-\u044f\u0401\u0451])', js) else ''
    out = re.sub(r"^  '([^']+)': '.*?',?\n", keep, gl, flags=re.M)
    return re.sub(r",(\s*\n\s*\};)", r"\1", re.sub(r",\s*\n\};", "\n};", out))


def purge(css, used):
    # страница этапов: убираем из core правила и keyframes с классами, которых нет в разметке/скрипте блока
    def has(cls):
        return cls in used or (('--' in cls) and cls.rsplit('--', 1)[0] + '--' in used)
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
            if head.strip().startswith('@container') or head.strip().startswith('@media') or head.strip().startswith('@supports'):
                inner = walk(body)
                if inner.strip():
                    out.append(head + '{' + inner + '}')
            elif head.strip().startswith('@keyframes'):
                out.append(head + '{' + body + '}')
            elif rule_ok(head):
                out.append(head + '{' + body + '}')
            i = k
        return ''.join(out)
    return walk(css)


PUNCT = set('{}()[];,:=+-*<>!&|?%')


def squeeze_line(line):
    out, i, n = [], 0, len(line)
    def prev_sig():
        for c in reversed(out):
            if c != ' ':
                return c
        return ''
    while i < n:
        ch = line[i]
        if ch in '\'"':
            j = i + 1
            while j < n and line[j] != ch:
                j += 2 if line[j] == '\\' else 1
            out.append(line[i:j + 1]); i = j + 1; continue
        if ch == '/' and line[i:i + 2] == '//':
            break
        if ch == '/' and line[i:i + 2] == '/*':
            j = line.find('*/', i + 2)
            i = n if j < 0 else j + 2; continue
        if ch == '/' and prev_sig() in ('', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';'):
            j, cls = i + 1, False
            while j < n and (line[j] != '/' or cls):
                if line[j] == '\\': j += 1
                elif line[j] == '[': cls = True
                elif line[j] == ']': cls = False
                j += 1
            j += 1
            while j < n and line[j].isalpha(): j += 1
            out.append(line[i:j]); i = j; continue
        if ch in ' \t':
            while i < n and line[i] in ' \t': i += 1
            nxt = line[i] if i < n else ''
            pv = prev_sig() if out else ''
            if not pv or not nxt: continue
            if pv in PUNCT or nxt in PUNCT:
                if pv == nxt and pv in '+-': out.append(' ')
                continue
            out.append(' '); continue
        out.append(ch); i += 1
    return ''.join(out).rstrip()


def squeeze_js(lines):
    # DATA (от «var DATA» до первой строки «};») не трогаем: её правит пользователь
    res, in_data = [], False
    for l in lines:
        if l.startswith('var DATA'):
            in_data = True
        if in_data:
            res.append(l)
            if l.startswith('};'):
                in_data = False
            continue
        q = squeeze_line(l)
        if q: res.append(q)
    return res


def build_block(src, folder, root, sections, double):
    d = R / src / folder
    js = (d / 'block.js').read_text(encoding='utf-8').rstrip()
    html = (d / 'block.html').read_text(encoding='utf-8').strip()
    core = mini(scope(core_for(sections), root, double))
    if not double:
        bcss = (d / 'block.css').read_text(encoding='utf-8')
        core = purge(core, html + js + bcss + CORE_GL + CORE_NAV_JS)
        # keyframes без ссылок на них
        for m in re.findall(r'@keyframes ([\w-]+)\{', core):
            if core.count(m) < 2 and m not in bcss.replace('ROOTK', root):
                core = re.sub(r'@keyframes ' + re.escape(m) + r'\{(?:[^{}]|\{[^{}]*\})*\}', '', core)
    css = core
    if '/*%%NAV%%*/' in js:
        css += mini(scope(CORE_NAV_CSS, root, double))
    css += '\n' + mini(scope((d / 'block.css').read_text(encoding='utf-8'), root, double))
    html = (d / 'block.html').read_text(encoding='utf-8').strip()
    # блок без data-gl не тянет модуль подсказок
    gl = CORE_GL if double else prune_glossary(CORE_GL, js)
    js = js.replace('/*%%GLOSSARY%%*/', gl if 'dbvGlossary(' in js else '')
    js = js.replace('/*%%PAGES%%*/', CORE_PAGES).replace('/*%%NAV%%*/', CORE_NAV_JS)
    if double:
        js = '\n'.join('  ' + l if l else l for l in js.split('\n'))
    else:  # страница этапов: без отступов и пустых строк (экономия размера)
        js = '\n'.join(squeeze_js([l.strip() for l in js.split('\n') if l.strip() and not l.strip().startswith('//')]))
    return f'<style>\n{css}\n</style>\n{html}\n<script>\n(function () {{\n  "use strict";\n{js}\n}})();\n</script>\n'


def preview(title, items):
    cells = '\n'.join(f'<div class="mac"><div class="cap">HTML-макрос {i}: {cap}</div>\n{t}</div>' for i, (cap, t) in enumerate(items, 1))
    return ('<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{title}</title>'
            '<style>.pv-body{margin:0;background:#f4f5f6;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}'
            '.pv-col{width:1000px;max-width:100%;margin:0 auto;padding:24px;background:#fff;box-sizing:border-box;display:flex;flex-direction:column;gap:16px}'
            '.pv-col .cap{font-size:12px;color:#8a8f94;margin:0 0 4px}</style></head>'
            f'<body class="pv-body"><div class="pv-col" id="pv-col">\n{cells}\n</div></body></html>')


def build_set(blocks, src, outdir, double, prev_name, prev_title):
    (R / outdir).mkdir(parents=True, exist_ok=True)
    ok, items = True, []
    for folder, name, root, cap, sections in blocks:
        if not (R / src / folder / 'block.js').exists():
            print(f'(пропуск: нет {src}/{folder}/block.js)')
            continue
        t = build_block(src, folder, root, sections, double)
        (R / outdir / f'{name}.html').write_text(t, encoding='utf-8')
        kb = len(t.encode('utf-8')) / 1024
        print(f'{outdir}/{name}.html  {kb:.1f} КБ' + ('  !! больше 40 КБ' if kb > MAX_KB else ''))
        ok = ok and kb <= MAX_KB
        items.append((cap, t))
    (R / prev_name).write_text(preview(prev_title, items), encoding='utf-8')
    print(prev_name)
    return ok


def main():
    ok = build_set(HUB, 'src/blocks', 'dist', True, 'preview-dbv-hub.html', 'Превью: Проектный трек ДБВ (хаб)')
    if (R / 'src/blocks-stages').exists():
        ok = build_set(STAGES, 'src/blocks-stages', 'dist/stages', False, 'preview-dbv-stages.html', 'Превью: Этапы и контрольные точки') and ok
    if (R / 'src/blocks-rhythm').exists():
        ok = build_set(RHYTHM, 'src/blocks-rhythm', 'dist/rhythm', False, 'preview-dbv-rhythm.html', 'Превью: Рабочий ритм и нештатные ситуации') and ok
    if (R / 'src/blocks-assets').exists():
        ok = build_set(ASSETS, 'src/blocks-assets', 'dist/assets', False, 'preview-dbv-assets.html', 'Превью: Активы, КР и частые ошибки') and ok
    if (R / 'src/blocks-roles').exists():
        ok = build_set(ROLES, 'src/blocks-roles', 'dist/roles', False, 'preview-dbv-roles.html', 'Превью: Роли: кто за что отвечает') and ok
    sys.exit(0 if ok else 1)


main()
