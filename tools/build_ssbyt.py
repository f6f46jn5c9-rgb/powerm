"""Сборка комплекса «Сбыт и сервис. СМ»: src/ssbyt/*.html -> dist/ssbyt-*.html + preview/ssbyt-*.html.
Читает src/ssbyt/ssbyt-pages.js, заменяет %%PAGE_*%%; пустой URL -> href="#" + data-скоро="true"
(вкладки nav превращаются в span). Маркер <!-- CBL-SPLIT --> делит файл на -1 и -2. Лимит 38 КБ.
Запуск: python3 tools/build_ssbyt.py"""
import pathlib, re, sys, html
R = pathlib.Path(__file__).resolve().parent.parent
S, D, P = R / 'src/ssbyt', R / 'dist', R / 'preview'
MAX_KB = 38
SPLIT = '<!-- CBL-SPLIT -->'
SUBS = [('tkp', 'ТКП и запчасти', 'сбыт.ткп'), ('voronka', 'Воронка продаж', 'сбыт.воронка'), ('servis', 'Дивизион сервиса', 'сбыт.сервис'),
        ('auto', 'Автоматизация', 'сбыт.авто'), ('org', 'Орг. эффективность', 'сбыт.орг'), ('budget', 'Бюджеты', 'сбыт.бюджет')]
cfg = dict(re.findall(r"(\w+)\s*:\s*'([^']*)'", (S / 'ssbyt-pages.js').read_text(encoding='utf-8')))
if not cfg.get('bup'): sys.exit('bup пуст в ssbyt-pages.js')

TAG = re.compile(r'<a\b([^>]*?)%%PAGE_(\w+)%%([^>]*)>(.*?)</a>', re.S)
def fix(m):
    pre, key, post, inner = m.groups()
    url = cfg.get(key.lower(), '')
    attrs = (pre + '\0' + post).replace(' data-скоро="true"', '')
    if 'ssbyt-nav__tab' in attrs and not url:        # пустая вкладка nav -> span
        attrs = attrs.replace(' href="\0"', '').replace('\0', '')
        return f'<span{attrs} data-скоро="true" aria-disabled="true">{inner}</span>'
    if url: return '<a' + attrs.replace('\0', url) + f'>{inner}</a>'
    return '<a' + attrs.replace('\0', '#') + ' data-скоро="true" aria-disabled="true" tabindex="-1">' + inner + '</a>'
def render(t):
    t = TAG.sub(fix, t)
    assert '%%PAGE_' not in t, 'остались плейсхолдеры'
    return t

jobs = [('hub', 'Сбыт и сервис. СМ (хаб)', None)] + [(k, n, l) for k, n, l in SUBS]
dist = {}
bad = False
for k, name, label in jobs:
    t = render((S / f'ssbyt-{k}.html').read_text(encoding='utf-8'))
    if k == 'hub': parts = {f'ssbyt-hub.html': t}
    else:
        assert t.count(SPLIT) == 1, k
        a, b = t.split(SPLIT)
        parts = {f'ssbyt-{k}-1.html': a.rstrip() + '\n', f'ssbyt-{k}-2.html': b.strip() + '\n'}
    dist[k] = parts
    for fn, txt in parts.items():
        (D / fn).write_text(txt, encoding='utf-8')
        kb = len(txt.encode('utf-8')) / 1024
        bad |= kb > MAX_KB
        print(f'dist/{fn:22s} {kb:5.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))

PV_CSS = '''body{margin:0;background:#eef0f2;font:14px/1.4 system-ui,sans-serif;color:#222}
.pv-bar{position:sticky;top:0;z-index:5;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 16px;background:#fff;border-bottom:1px solid #d5d9dc}
.pv-bar b{margin-right:8px}.pv-bar button{padding:6px 12px;border:1px solid #9aa3aa;border-radius:6px;background:#fff;cursor:pointer;font:inherit}
.pv-bar button[aria-pressed=true]{background:#3a2a40;color:#fff;border-color:#3a2a40}
.pv-body{padding:20px 16px;overflow-x:auto}
#pv-col{background:#fff;margin:0 auto;padding:16px;width:1000px;max-width:100%;box-sizing:border-box}
.cap{margin:14px 0 6px;padding:2px 8px;font:12px/1.4 system-ui,sans-serif;color:#555;background:#f1f1f1;border-left:3px solid #3a2a40}
.cbl-native{margin:8px 0;padding:14px;border:1px dashed #9aa3aa;font:13px/1.4 system-ui,sans-serif;color:#666;background:#fafafa}'''
PV_JS = '''(function(){var c=document.getElementById('pv-col'),bs=document.querySelectorAll('.pv-bar button');
function set(w){c.style.width=w+'px';for(var i=0;i<bs.length;i++)bs[i].setAttribute('aria-pressed',bs[i].dataset.w==w?'true':'false')}
for(var i=0;i<bs.length;i++)bs[i].addEventListener('click',function(){set(this.dataset.w)});set(1000)})();'''
def page(title, body):
    btns = ''.join(f'<button type="button" data-w="{w}" aria-pressed="false">{w}</button>' for w in (1100, 820, 560, 375))
    return (f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{html.escape(title)}</title><style>{PV_CSS}</style></head><body><div class="pv-bar"><b>{html.escape(title)}</b>'
            f'<span>Ширина колонки:</span>{btns}</div><div class="pv-body"><div id="pv-col">{body}</div></div><script>{PV_JS}</script></body></html>')
P.mkdir(exist_ok=True)
for k, name, label in jobs:
    if k == 'hub':
        body = '<div class="cap">HTML-макрос 1</div>\n' + dist[k]['ssbyt-hub.html']
    else:
        body = (f'<div class="cap">HTML-макрос 1 (hero + открывающая обёртка CBL)</div>\n' + dist[k][f'ssbyt-{k}-1.html'] +
                f'<div class="cbl-native">Нативный макрос Content by Label · label: {label} (в Confluence, здесь не воспроизводится)</div>\n'
                f'<div class="cap">HTML-макрос 2 (закрывающая обёртка)</div>\n' + dist[k][f'ssbyt-{k}-2.html'])
    (P / f'ssbyt-preview-{k}.html').write_text(page(name, body), encoding='utf-8')
items = ''.join(f'<li><a href="ssbyt-preview-{k}.html">{html.escape(n)}</a></li>' for k, n, _ in jobs)
(P / 'ssbyt-index.html').write_text('<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Сбыт и сервис. СМ — превью</title>'
    '<style>body{font:16px/1.6 system-ui,sans-serif;margin:32px;color:#1F2A33}a{color:#3a2a40}</style></head><body>'
    f'<h1>Сбыт и сервис. СМ — превью</h1><ul>{items}</ul></body></html>', encoding='utf-8')
sys.exit(1 if bad else 0)
