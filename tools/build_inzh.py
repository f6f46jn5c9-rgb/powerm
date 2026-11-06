"""Сборка комплекса «Инжиниринг»: src/inzh/* -> dist/ (16 файлов: hub - 1 макрос, 5 страниц Тип Б - по 3).
Подставляет адреса из src/inzh/inzh-pages.js. Проверяет лимит размера. Другие комплексы не трогает.
Запуск: python3 tools/build_inzh.py"""
import pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
S, D = R / 'src/inzh', R / 'dist'
MAX_KB = 38
cfg = dict(re.findall(r"(\w+)\s*:\s*'([^']*)'", (S / 'inzh-pages.js').read_text(encoding='utf-8')))
TOK = {'URL_БУП': cfg['bup']} | {f'URL_{k.upper()}': cfg[k] for k in ('hub', 'pra', 'sp', 'np', 'ctr', 'nad')}
names = ['inzh-hub-1.html'] + [f'inzh-{p}-{k}.html' for p in ('pra', 'sp', 'np', 'ctr', 'nad') for k in ('1-hero', '2-cbl-open', '3-cbl-close')]
bad = False
for n in names:
    t = (S / n).read_text(encoding='utf-8')
    for k, v in TOK.items(): t = t.replace(k, v)
    assert 'URL_' not in t, n
    (D / n).write_text(t, encoding='utf-8', newline='')
    kb = (D / n).stat().st_size / 1024
    bad |= kb > MAX_KB
    print(f'dist/{n:28s} {kb:5.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(1 if bad else 0)
