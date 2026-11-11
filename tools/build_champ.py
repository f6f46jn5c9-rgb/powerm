"""Сборка комплекса «Чемпионат лучших практик 2026. СМ»: src/champ/champ-*.html -> dist/champ-*.html.
Подставляет %%PAGE_HUB%%, %%PAGE_GOLOS%%, %%PAGE_Y2023%%, %%PAGE_Y2024%%, %%PAGE_Y2025%% из src/champ/champ-pages.js.
Пустой адрес -> href="#" data-soon="true". Запуск: python3 tools/build_champ.py"""
import pathlib, re, sys

R = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT = R / 'src/champ', R / 'dist'
MAX_KB = 38
PAGES = ['champ-hub', 'champ-golos', 'champ-2023', 'champ-2024', 'champ-2025']
KEYS = {'hub': 'HUB', 'golos': 'GOLOS', 'y2023': 'Y2023', 'y2024': 'Y2024', 'y2025': 'Y2025'}

urls = {KEYS[k]: v for k, v in re.findall(r"(\w+):\s*'([^']*)'", (SRC / 'champ-pages.js').read_text(encoding='utf-8')) if k in KEYS}


def build(t):
    for k in KEYS.values():
        u = urls.get(k, '')
        if u:
            t = t.replace(f'%%PAGE_{k}%%', u)
        else:
            t = t.replace(f'href="%%PAGE_{k}%%"', 'href="#" data-soon="true"')
    assert '%%' not in t, 'остались неподставленные %%PAGE_*%%'
    return t


ok = True
for p in PAGES:
    t = build((SRC / f'{p}.html').read_text(encoding='utf-8'))
    (OUT / f'{p}.html').write_text(t, encoding='utf-8')
    kb = len(t.encode('utf-8')) / 1024
    print(f'dist/{p}.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
    ok = ok and kb <= MAX_KB
sys.exit(0 if ok else 1)
