"""Сборка dist/01-polarnaya-zvezda.html: подставляет tools/pz-images/NN.b64 в src/01-polarnaya-zvezda.html.
(tools/build.py занят сборкой других страниц BUP, поэтому отдельный скрипт.)"""
import pathlib
R = pathlib.Path(__file__).resolve().parent.parent
t = (R/'src/01-polarnaya-zvezda.html').read_text()
for n in range(1, 12):
    b = (R/f'tools/pz-images/{n:02d}.b64').read_text().strip()
    ph = f'%%IMG{n}%%'
    assert ph in t, ph
    t = t.replace(ph, 'data:image/jpeg;base64,' + b)
assert '%%' not in t
(R/'dist').mkdir(exist_ok=True)
(R/'dist/01-polarnaya-zvezda.html').write_text(t)
print('dist/01-polarnaya-zvezda.html', len(t.encode()) // 1024, 'КБ')
(R/'preview-pz.html').write_text(
    '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    '<title>Превью: Полярная звезда</title><style>.pv-body{margin:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}'
    '.pv-col{width:1000px;max-width:100%;margin:0 auto;padding:24px;background:#fff;box-sizing:border-box}</style></head>'
    '<body class="pv-body"><div class="pv-col" id="pv-col">\n' + t + '\n</div></body></html>', encoding='utf-8')
