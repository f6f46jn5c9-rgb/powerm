"""Сборка «Охрана труда»: src/ot/*.html -> dist/ot-*.html (3 файла). Запуск: python3 tools/build_ot.py"""
import pathlib, sys
R = pathlib.Path(__file__).resolve().parent.parent
MAX_KB = 38
bad = False
for f in sorted((R/'src/ot').glob('*.html')):
    d = R/'dist'/f.name
    d.write_bytes(f.read_bytes())
    kb = d.stat().st_size/1024
    bad |= kb > MAX_KB
    print(f'dist/{f.name:26s} {kb:5.2f} КБ' + ('  !! больше 38 КБ' if kb > MAX_KB else ''))
sys.exit(1 if bad else 0)
