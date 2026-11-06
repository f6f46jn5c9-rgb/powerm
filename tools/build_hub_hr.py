"""Сборка хаба «HR и обучение»: src/hub-hr.html -> dist/hub-hr.html (один HTML-макрос, 3 блока).
Проверяет лимит размера. Другие страницы не трогает. Запуск: python3 tools/build_hub_production.py"""
import pathlib, shutil, sys
R = pathlib.Path(__file__).resolve().parent.parent
MAX_KB = 38
src, dst = R / 'src/hub-hr.html', R / 'dist/hub-hr.html'
shutil.copyfile(src, dst)
kb = dst.stat().st_size / 1024
print(f'dist/hub-hr.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(0 if kb <= MAX_KB else 1)
