"""Сборка хаба «Бизнес-система. СМ»: src/hub-bssm.html -> dist/hub-bssm.html (все блоки) и
dist/hub-bssm-<имя>.html (по одному HTML-макросу). Проверяет лимит размера. Другие страницы не трогает.
Запуск: python3 tools/build_hub_bssm.py"""
import pathlib, re, shutil, sys
R = pathlib.Path(__file__).resolve().parent.parent
MAX_KB = 38
src, dst = R / 'src/hub-bssm.html', R / 'dist/hub-bssm.html'
shutil.copyfile(src, dst)
parts = re.split(r'^<!-- @@MACRO (\S+) -->\n', src.read_text(encoding='utf-8'), flags=re.M)
bad = False
outs = [dst]
for name, body in zip(parts[1::2], parts[2::2]):
    f = R / f'dist/hub-bssm-{name}.html'
    f.write_text(body.strip() + '\n', encoding='utf-8')
    outs.append(f)
for f in outs:
    kb = f.stat().st_size / 1024
    over = kb > MAX_KB
    bad |= over
    print(f'dist/{f.name:42s} {kb:5.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if over else ''))
sys.exit(1 if bad else 0)
