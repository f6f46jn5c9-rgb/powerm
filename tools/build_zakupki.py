"""Сборка хаба «Закупки»: src/zakupki/zakupki-hub.html + src/zakupki/zakupki-pages.js -> dist/zakupki-hub.html.
Плашка с адресом -> <a>, без адреса -> «Скоро». Запуск: python3 tools/build_zakupki.py"""
import pathlib, re, sys, html
R = pathlib.Path(__file__).resolve().parent.parent
MAX_KB = 38
pages = dict(re.findall(r"^\s*(\w+)\s*:\s*'([^']*)'", (R/'src/zakupki/zakupki-pages.js').read_text(encoding='utf-8'), re.M))
src = (R/'src/zakupki/zakupki-hub.html').read_text(encoding='utf-8')
def tile(m):
    key, name = m.group(1), m.group(2)
    url = pages.get(key)
    if url is None: sys.exit(f'нет ключа {key} в zakupki-pages.js')
    if url:
        return f'<a class="zk-tile" href="{html.escape(url)}" target="_blank" rel="noopener">{name}</a>'
    return f'<span class="zk-tile zk-tile--soon" role="group" aria-label="{name} — скоро">{name}<span class="zk-soon">Скоро</span></span>'
out = re.sub(r'<span class="zk-tile" data-zk="(\w+)">(.*?)</span>', tile, src)
out = out.replace('{{bup}}', html.escape(pages['bup']))
assert '{{' not in out
dst = R/'dist/zakupki-hub.html'
dst.write_text(out, encoding='utf-8')
kb = dst.stat().st_size/1024
print(f'dist/zakupki-hub.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(0 if kb <= MAX_KB else 1)
