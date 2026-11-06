"""Сборка хаба «Внешние практики»: src/vnesh/vnesh-hub.html + src/vnesh/vnesh-pages.js -> dist/vnesh-hub.html.
Плашка с пустым URL -> «Скоро» (не ссылка); с URL -> активная ссылка. Запуск: python3 tools/build_vnesh.py"""
import pathlib, re, sys, html
R = pathlib.Path(__file__).resolve().parent.parent
MAX_KB = 38
js = (R / 'src/vnesh/vnesh-pages.js').read_text(encoding='utf-8')
pages = dict(re.findall(r"(\w+)\s*:\s*'([^']*)'", js))
src = (R / 'src/vnesh/vnesh-hub.html').read_text(encoding='utf-8')

def tile(m):
    key, name = m.group(1), m.group(2)
    url = pages.get(key, '')
    if url:
        return f'<a class="vnesh-hub-tile" href="{html.escape(url, quote=True)}" target="_blank" rel="noopener">{name}</a>'
    return f'<div class="vnesh-hub-tile vnesh-hub-tile--soon" aria-disabled="true">{name}<span class="vnesh-hub-soon">Скоро</span></div>'

out = re.sub(r'<div class="vnesh-hub-tile" data-key="(\w+)">(.*?)</div>', tile, out := src)
out = re.sub(r'\{\{(\w+)\}\}', lambda m: html.escape(pages[m.group(1)], quote=True), out)
dst = R / 'dist/vnesh-hub.html'
dst.write_text(out, encoding='utf-8')
kb = dst.stat().st_size / 1024
print(f'dist/vnesh-hub.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(0 if kb <= MAX_KB else 1)
