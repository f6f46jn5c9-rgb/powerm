"""Сборка страницы «БССМ. Школа»: src/shkola/*.html -> dist/*.html (побайтно после подстановки адресов).
Адреса берутся из src/shkola/shkola-pages.js; пустое значение = плейсхолдер остаётся в файле.
Проверяет лимит размера и запреты Confluence. Другие страницы не трогает.
Запуск: python3 tools/build_shkola.py"""
import pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
S, D = R / 'src/shkola', R / 'dist'
MAX_KB = 38
FILES = ['1-shkola-hero.html', '2-shkola-cbl-open.html', '3-shkola-cbl-close.html']
cfg = dict(re.findall(r'(\w+)\s*:\s*"([^"]*)"', (S / 'shkola-pages.js').read_text(encoding='utf-8').split('*/')[-1]))
subst = {'URL_БУП': cfg.get('BUP_URL', ''), 'SHKOLA_PAGE_ID': cfg.get('SHKOLA_PAGE_ID', '')}
BAN = [r'localStorage', r'sessionStorage', r'position\s*:\s*fixed', r'100vh', r'https?://', r'@import', r'<link\b', r'<html', r'<body', r'<head']
bad = False
for name in FILES:
    t = (S / name).read_text(encoding='utf-8')
    for k, v in subst.items():
        if v: t = t.replace(k, v)
    for pat in BAN:
        if re.search(pat, t): print(f'!! {name}: запрещено {pat}'); bad = True
    (D / name).write_text(t, encoding='utf-8')
    kb = (D / name).stat().st_size / 1024
    over = kb > MAX_KB; bad |= over
    print(f'dist/{name:24s} {kb:5.2f} КБ' + (f'  !! больше {MAX_KB} КБ' if over else ''))
sys.exit(1 if bad else 0)
