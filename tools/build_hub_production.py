"""Сборка хаба «Производство»: src/hub-production.html -> dist/hub-production.html (один HTML-макрос, 4 блока).
Проверяет лимит размера. Другие страницы не трогает. Запуск: python3 tools/build_hub_production.py"""
import pathlib, shutil, sys
R = pathlib.Path(__file__).resolve().parent.parent
MAX_KB = 38
src, dst = R / 'src/hub-production.html', R / 'dist/hub-production.html'
shutil.copyfile(src, dst)
kb = dst.stat().st_size / 1024
print(f'dist/hub-production.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(0 if kb <= MAX_KB else 1)
