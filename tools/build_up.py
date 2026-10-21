"""Сборка страницы «Управление проектами»: src/up/up-main.html -> dist/up-main.html (один HTML-макрос, без pages.js).
Проверяет лимит размера. Другие страницы не трогает. Запуск: python3 tools/build_up.py"""
import pathlib, shutil, sys

R = pathlib.Path(__file__).resolve().parent.parent
MAX_KB = 38
src, dst = R / 'src/up/up-main.html', R / 'dist/up-main.html'
dst.parent.mkdir(exist_ok=True)
shutil.copyfile(src, dst)
kb = dst.stat().st_size / 1024
print(f'dist/up-main.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(0 if kb <= MAX_KB else 1)
