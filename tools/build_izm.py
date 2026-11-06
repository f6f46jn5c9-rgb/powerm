"""Сборка страницы «БССМ. Устойчивость изменений»: src/izm/* -> dist/ (3 HTML-макроса).
Подставляет BUP_URL и IZM_PAGE_ID из src/izm/izm-pages.js (пусто - токен остаётся).
Проверяет лимит размера. Другие комплексы не трогает.
Запуск: python3 tools/build_izm.py"""
import pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
S, D = R / 'src/izm', R / 'dist'
MAX_KB = 38
cfg = dict(re.findall(r'(\w+)\s*:\s*"([^"]*)"', (S / 'izm-pages.js').read_text(encoding='utf-8').split('{', 1)[1]))
names = ['1-izm-hero.html', '2-izm-cbl-open.html', '3-izm-cbl-close.html']
bad = False
for n in names:
    t = (S / n).read_text(encoding='utf-8')
    if cfg.get('BUP_URL'): t = t.replace('URL_БУП', cfg['BUP_URL'])
    if cfg.get('IZM_PAGE_ID'): t = t.replace('IZM_PAGE_ID', cfg['IZM_PAGE_ID'])
    (D / n).write_text(t, encoding='utf-8')
    kb = (D / n).stat().st_size / 1024
    bad |= kb > MAX_KB
    print(f'dist/{n:24s} {kb:5.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(1 if bad else 0)
