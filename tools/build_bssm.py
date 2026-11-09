"""Сборка 6 страниц-подхабов БССМ: src/bssm/* -> dist/bssm-{prefix}-*.html (по 3 файла на страницу).
Подставляет bup из src/bssm/bssm-pages.js вместо URL_БУП. Лимит размера 38 КБ. Другие комплексы не трогает.
Запуск: python3 tools/build_bssm.py"""
import pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
S, D = R / 'src/bssm', R / 'dist'
PREFIXES = ['praktiki', 'metod', 'agile', 'mini-t', 'sm30', 'sm20']
PARTS = ['1-hero', '2-cbl-open', '3-cbl-close']
MAX_KB = 38
cfg = dict(re.findall(r"(\w+)\s*:\s*'([^']*)'", (S / 'bssm-pages.js').read_text(encoding='utf-8')))
if not cfg.get('bup'): sys.exit('bup пуст в bssm-pages.js')
bad = False
for p in PREFIXES:
    for part in PARTS:
        t = (S / f'{p}-{part}.html').read_text(encoding='utf-8').replace('URL_БУП', cfg['bup'])
        out = D / f'bssm-{p}-{part}.html'
        out.write_text(t, encoding='utf-8')
        kb = out.stat().st_size / 1024
        bad |= kb > MAX_KB
        print(f'dist/{out.name:28s} {kb:5.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(1 if bad else 0)
