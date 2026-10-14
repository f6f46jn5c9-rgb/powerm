"""Сборка хаба «Проектный трек ДБВ»: src/core + src/blocks/NN-имя -> dist/NN-имя.html и preview-dbv-hub.html.
Запуск: python3 tools/build_dbv.py
Отдельный от tools/build.py скрипт: не трогает файлы других страниц."""
import pathlib, re, sys

R = pathlib.Path(__file__).resolve().parent.parent
CORE_CSS = (R / 'src/core/dbv-core.css').read_text(encoding='utf-8')
CORE_GL = (R / 'src/core/dbv-glossary.js').read_text(encoding='utf-8').rstrip()
BLOCKS = [  # (папка, файл в dist, корневой класс, подпись, секции core сверх базы)
    ('01-shapka', '01-shapka', 'dbv-hero', 'Шапка', {'logo', 'chip', 'tip'}),
    ('02-roadmap', '02-roadmap', 'dbv-road', 'Путь проекта', {'tip'}),
    ('03-principy', '03-principy', 'dbv-prin', 'Три принципа', {'glass', 'tip'}),
    ('04-razdely', '04-razdely', 'dbv-next', 'Куда дальше', {'glass'}),
    ('05-faq-kontakty', '05-faq-kontakty', 'dbv-faq', 'Вопросы и контакты', {'glass', 'tip'}),
]
SECTION = re.compile(r'/\*@(\w+)\*/(.*?)/\*@end\*/', re.S)
MAX_KB = 40


def mini(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s*\n\s*', ' ', css)
    css = re.sub(r'\s*([{};])\s*', r'\1', css)
    return css.strip()


def scope(css, root):
    # doubled class raises specificity over Confluence rules; no global selectors remain
    return css.replace('.ROOT', f'.{root}.{root}').replace('ROOTK', root)


def core_for(sections):
    return SECTION.sub(lambda m: m.group(2) if m.group(1) in sections else '', CORE_CSS)


def build_block(folder, root, sections):
    d = R / 'src/blocks' / folder
    css = mini(scope(core_for(sections), root)) + '\n' + mini(scope((d / 'block.css').read_text(encoding='utf-8'), root))
    html = (d / 'block.html').read_text(encoding='utf-8').strip()
    js = (d / 'block.js').read_text(encoding='utf-8').rstrip()
    # блок без data-gl не тянет модуль подсказок
    js = js.replace('/*%%GLOSSARY%%*/', CORE_GL if 'dbvGlossary(' in js else '')
    js = '\n'.join('  ' + l if l else l for l in js.split('\n'))
    return f'<style>\n{css}\n</style>\n{html}\n<script>\n(function () {{\n  "use strict";\n{js}\n}})();\n</script>\n'


def main():
    (R / 'dist').mkdir(exist_ok=True)
    out = []
    ok = True
    for folder, name, root, cap, sections in BLOCKS:
        t = build_block(folder, root, sections)
        (R / 'dist' / f'{name}.html').write_text(t, encoding='utf-8')
        kb = len(t.encode('utf-8')) / 1024
        print(f'dist/{name}.html  {kb:.1f} КБ')
        if kb > MAX_KB:
            ok = False
            print('  !! больше 40 КБ')
        out.append((cap, t))
    cells = '\n'.join(
        f'<div class="mac"><div class="cap">HTML-макрос {i}: {cap}</div>\n{t}</div>' for i, (cap, t) in enumerate(out, 1))
    prev = ('<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>Превью: Проектный трек ДБВ (хаб)</title>'
            '<style>.pv-body{margin:0;background:#f4f5f6;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}'
            '.pv-col{width:1000px;max-width:100%;margin:0 auto;padding:24px;background:#fff;box-sizing:border-box;display:flex;flex-direction:column;gap:16px}'
            '.pv-col .cap{font-size:12px;color:#8a8f94;margin:0 0 4px}</style></head>'
            f'<body class="pv-body"><div class="pv-col" id="pv-col">\n{cells}\n</div></body></html>')
    (R / 'preview-dbv-hub.html').write_text(prev, encoding='utf-8')
    print('preview-dbv-hub.html')
    sys.exit(0 if ok else 1)


main()
