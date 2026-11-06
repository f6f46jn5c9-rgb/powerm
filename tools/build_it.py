"""Сборка комплекса IT: src/it/*.html + it-pages.js -> dist/it-*.html (7 файлов)."""
import pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
S, D = R / 'src' / 'it', R / 'dist'
pages = dict(re.findall(r"(\w+):\s*'([^']*)'", (S / 'it-pages.js').read_text(encoding='utf-8')))
assert set(pages) == {'hub', 'pra', 'dig', 'bup'}, pages
NAMES = ['it-hub.html'] + [f'it-{p}-{n}.html' for p in ('pra', 'dig') for n in ('1-hero', '2-cbl-open', '3-cbl-close')]
for name in NAMES:
    t = (S / name).read_text(encoding='utf-8')
    t = re.sub(r'\{\{IT_PAGES\.(\w+)\}\}', lambda m: pages[m.group(1)], t)
    assert '{{' not in t, name
    (D / name).write_text(t, encoding='utf-8', newline='\n')
    n = len(t.encode('utf-8'))
    print(f'{name}: {n} B')
    if n > 38 * 1024: sys.exit('>38KB ' + name)
