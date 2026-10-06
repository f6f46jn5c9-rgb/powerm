import pathlib, re
R = pathlib.Path(__file__).resolve().parent.parent
logo = (R/'tools/logo.b64').read_text().strip()
names = ['01-logo','02-cta','03-catalog','04-new-practices','05-curators']
(R/'dist').mkdir(exist_ok=True)
parts = {}
for n in names:
    t = (R/f'src/{n}.html').read_text().replace('%%LOGO%%', logo)
    (R/f'dist/{n}.html').write_text(t); parts[n] = t
ph = lambda s: f'<div class="ph">{s}</div>'
body = ph('[нативный макрос] Поиск по базе Силовых Машин') + ph('[нативный макрос] Поиск по базе Севергрупп')
order = [parts['01-logo'], ph('[нативный макрос] Поиск по базе Силовых Машин'), ph('[нативный макрос] Поиск по базе Севергрупп'), parts['02-cta'], parts['03-catalog'], parts['04-new-practices'], parts['05-curators']]
html = '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Превью стартовой страницы СМ</title><style>body{margin:0;background:#f2f1ed;font-family:sans-serif}.wrap{max-width:1180px;margin:0 auto;padding:24px 20px 60px;display:flex;flex-direction:column;gap:32px}.ph{background:#d9dbe0;color:#555;border-radius:12px;padding:14px;text-align:center;font-size:14px}@media(max-width:640px){.wrap{padding:16px}}</style></head><body><main class="wrap">' + '\n'.join(f'<div>{o}</div>' if not o.startswith('<div class="ph"') else o for o in order) + '</main></body></html>'
(R/'dist/preview.html').write_text(html)
