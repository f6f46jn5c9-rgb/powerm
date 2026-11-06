"""Сборка комплекса «Инжиниринг»: src/inzh/* -> dist/inzh-{hub,pra}-*.html (по 3 HTML-макроса на страницу).
Подставляет адреса из src/inzh/inzh-pages.js. Проверяет лимит размера. Другие комплексы не трогает.
Запуск: python3 tools/build_inzh.py"""
import pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
S, D = R / 'src/inzh', R / 'dist'
MAX_KB = 38
cfg = dict(re.findall(r"(\w+)\s*:\s*'([^']*)'", (S / 'inzh-pages.js').read_text(encoding='utf-8')))
TOK = {'URL_БУП': cfg['bup'], 'URL_HUB': cfg['hub'], 'URL_PRAKTIKI': cfg['praktiki']}
bad = False
for pre in ('inzh-hub', 'inzh-pra'):
    for n in (f'{pre}-1-hero.html', f'{pre}-2-cbl-open.html', f'{pre}-3-cbl-close.html'):
        t = (S / n).read_text(encoding='utf-8')
        for k, v in TOK.items(): t = t.replace(k, v)
        (D / n).write_text(t, encoding='utf-8', newline='')
        kb = (D / n).stat().st_size / 1024
        bad |= kb > MAX_KB
        print(f'dist/{n:28s} {kb:5.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(1 if bad else 0)
