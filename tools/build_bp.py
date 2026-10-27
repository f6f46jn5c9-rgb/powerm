"""Сборка страницы «Лучшие практики проектов»: src/bp -> dist/bp/*.html (3 HTML-макроса).
CSS (bp-core.css) подставляется в каждый блок, JS нет. Запуск: python3 tools/build_bp.py
Отдельный скрипт: файлы других комплексов не трогает."""
import html, json, pathlib, re, sys

R = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT = R / 'src' / 'bp', R / 'dist' / 'bp'
MAX_KB = 38
CORE = (SRC / 'bp-core.css').read_text(encoding='utf-8')
SECTION = re.compile(r'/\*@(\w+)\*/(.*?)/\*@end\*/', re.S)
# (исходник, файл в dist, корневой класс, секции core сверх базы)
BLOCKS = [
    ('hero', '1-shapka', 'bp-hero-root', {'hero'}),
    ('welcome', 'welcome', 'bp-welcome-root', {'welcome'}),
    ('programma', '2-programma-dbv', 'bp-prog-root', {'prog'}),
    ('shkola', '3-shkola-v-razrabotke', 'bp-school-root', {'note'}),
]


def mini(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s*\n\s*', ' ', css)
    css = re.sub(r'\s*([{};])\s*', r'\1', css)
    return css.strip()


def css_for(root, sections):
    css = SECTION.sub(lambda m: m.group(2) if m.group(1) in sections else '', CORE)
    # корень удвоен: вес выше стилей Confluence вида .wiki-content a
    return mini(css).replace('.ROOT', f'.{root}.{root}')


def rows():
    out = []
    for p in json.loads((SRC / 'practices.json').read_text(encoding='utf-8')):
        e = html.escape
        out.append(
            f'<li class="bp-row"><span class="bp-n">{e(p["n"])}</span>'
            f'<h3 class="bp-h3"><a href="{e(p["url"])}" target="_blank" rel="noopener noreferrer">{e(p["title"])}<span class="bp-arr" aria-hidden="true"></span></a></h3>'
            f'<p class="bp-d">{e(p["digest"])}</p>'
            f'<div class="bp-f"><span class="bp-v">{e(p["value"])}</span><span class="bp-l">{e(p["label"])}</span></div></li>')
    return '\n'.join(out) + '\n'


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    ok = True
    for src, name, root, sec in BLOCKS:
        body = (SRC / f'{src}.html').read_text(encoding='utf-8').strip().replace('{{ROWS}}', rows().rstrip('\n'))
        text = f'<style>\n{css_for(root, sec)}\n</style>\n{body}\n'
        (OUT / f'{name}.html').write_text(text, encoding='utf-8')
        kb = len(text.encode('utf-8')) / 1024
        print(f'dist/bp/{name}.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
        ok = ok and kb <= MAX_KB
    sys.exit(0 if ok else 1)


main()
