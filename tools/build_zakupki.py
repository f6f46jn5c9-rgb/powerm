"""Сборка хаба «Закупки»: src/zakupki/zakupki-hub.html + src/zakupki/zakupki-pages.js -> dist/zakupki-hub.html.
Плашка с адресом -> <a>, без адреса -> «Скоро». Запуск: python3 tools/build_zakupki.py"""
import pathlib, re, sys, html
R = pathlib.Path(__file__).resolve().parent.parent
MAX_KB = 38
pages = dict(re.findall(r"^\s*(\w+)\s*:\s*'([^']*)'", (R/'src/zakupki/zakupki-pages.js').read_text(encoding='utf-8'), re.M))
src = (R/'src/zakupki/zakupki-hub.html').read_text(encoding='utf-8')
ICONS = {  # белый контур, viewBox 24
 'novomu':'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M19 7v6M16 10h6"/>',
 'glosariy':'<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H19v-3"/><path d="M9 8h6M9 12h4"/>',
 'struktura':'<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="2.5" y="16" width="6" height="5" rx="1"/><rect x="15.5" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M5.5 16v-4h13v4"/>',
 'standarty':'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 14l2 2 4-4"/>',
 'shablony':'<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9h17M9.5 9v11.5"/>',
 'planirov':'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h3M13 14h3M8 17h3"/>',
 'vybor':'<path d="M12 3v18M7 21h10"/><path d="M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
 'dogovor':'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 17c1.2-1.6 2-1.6 2.5-.5.4.9 1.2.6 2.5-1"/>',
 'etp':'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><circle cx="12" cy="10" r="3"/><path d="M9 10h6M12 7c-1.4 1.8-1.4 4.2 0 6"/>',
 'oplata':'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
 'postupl':'<path d="M3.5 8L12 3.5 20.5 8v9L12 21.5 3.5 17z"/><path d="M12 3.5v6M8.5 6.2L12 9.7l3.5-3.5"/><path d="M3.5 8L12 12.5 20.5 8"/>',
 'sklad':'<path d="M2.5 10L12 3.5l9.5 6.5V21h-19z"/><path d="M7 21v-6h10v6M7 17.5h10"/>',
 'sap':'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
 'sups':'<path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
 'akademiya':'<path d="M12 4L2 9l10 5 10-5z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/><path d="M22 9v6"/>',
 'kategorii':'<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
}
SV = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
ARROW = '<svg class="zk-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h15"/><path d="M14 7l5 5-5 5"/></svg>'
def tile(m):
    key, name = m.group(1), m.group(2)
    url = pages.get(key)
    if url is None: sys.exit(f'нет ключа {key} в zakupki-pages.js')
    inner = ('<span class="zk-fx" aria-hidden="true"></span><span class="zk-glass" aria-hidden="true"></span>'
             f'<span class="zk-top"><span class="zk-tico" aria-hidden="true">{SV}{ICONS[key]}</svg></span>%ARROW%</span>'
             f'<span class="zk-txt"><span class="zk-name">{name}</span>%SOON%</span>')
    if url:
        return (f'<a class="zk-tile" href="{html.escape(url)}" target="_blank" rel="noopener">'
                + inner.replace('%ARROW%', ARROW).replace('%SOON%', '') + '</a>')
    return (f'<span class="zk-tile zk-tile--soon" role="group" aria-label="{name} — скоро">'
            + inner.replace('%ARROW%', '').replace('%SOON%', '<span class="zk-soon">Скоро</span>') + '</span>')
out = re.sub(r'<span class="zk-tile" data-zk="(\w+)">(.*?)</span>', tile, src)
out = out.replace('{{bup}}', html.escape(pages['bup']))
assert '{{' not in out
dst = R/'dist/zakupki-hub.html'
dst.write_text(out, encoding='utf-8')
kb = dst.stat().st_size/1024
print(f'dist/zakupki-hub.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
sys.exit(0 if kb <= MAX_KB else 1)
