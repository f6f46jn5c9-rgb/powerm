"""Упаковка vnesh-final/. После build_vnesh.py и скриншота: python3 tools/pack_vnesh.py [--preview-only]"""
import pathlib, shutil, hashlib, zipfile, sys
R = pathlib.Path(__file__).resolve().parent.parent
F = R / 'vnesh-final'
dist = (R / 'dist/vnesh-hub.html').read_text(encoding='utf-8')
PREVIEW = '''<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Превью: Внешние практики</title>
<style>.pv-body{margin:0;background:#f4f5f6;font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif}
.pv-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:12px 16px;font-size:14px;color:#1F2A33}
.pv-bar button{font:inherit;padding:6px 14px;border:1px solid #6b7280;background:#fff;color:#1F2A33;cursor:pointer;border-radius:4px}
.pv-bar button[aria-pressed="true"]{background:#9c470d;color:#fff;border-color:#9c470d}
.pv-bar button:focus-visible{outline:3px solid #9c470d;outline-offset:2px}
.pv-col{width:1000px;max-width:100%;margin:0 auto 24px;padding:0;background:#fff;box-sizing:border-box}
.pv-col .cap{font-size:12px;color:#5B6670;margin:0 0 8px;padding:8px 0 0}</style></head>
<body class="pv-body"><div class="pv-bar" role="group" aria-label="Ширина колонки">Ширина колонки, px: <button type="button" data-w="1100" aria-pressed="false">1100</button><button type="button" data-w="820" aria-pressed="false">820</button><button type="button" data-w="560" aria-pressed="false">560</button><button type="button" data-w="375" aria-pressed="false">375</button></div>
<div class="pv-col" id="pv-col"><div class="mac"><div class="cap">HTML-макрос 1</div>
@@BLOCKS@@
</div></div>
<script>(function(){var col=document.getElementById('pv-col'),bs=document.querySelectorAll('.pv-bar button');
function set(w){col.style.width=w+'px';for(var i=0;i<bs.length;i++)bs[i].setAttribute('aria-pressed',bs[i].getAttribute('data-w')===String(w)?'true':'false');}
for(var i=0;i<bs.length;i++)bs[i].addEventListener('click',function(){set(this.getAttribute('data-w'));});})();</script></body></html>
'''
INDEX = '''<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Превью: Внешние практики. Силовые машины</title></head>
<body style="font-family:Arial,sans-serif;margin:24px"><h1 style="font-size:20px">Внешние практики. Силовые машины</h1><ul><li><a href="vnesh-hub-preview.html">HTML-макрос 1 — хаб (панель 1100/820/560/375)</a></li></ul></body></html>
'''
README = '''Страница "Внешние практики. Силовые машины" (ID 167117099) -> 1 HTML-макрос (файл 1-vnesh-hub.html: шапка + 5 плашек).

ШАГИ ВСТАВКИ В CONFLUENCE
1. Открыть страницу 167117099 на редактирование.
2. Удалить старые HTML-макросы.
3. Вставить макрос HTML и скопировать в него целиком содержимое файла 1-vnesh-hub.html.
4. Сохранить.

КАК ДОБАВИТЬ ССЫЛКИ НА ДОЧЕРНИЕ СТРАНИЦЫ ПОЗЖЕ
Сейчас все 5 плашек в состоянии "Скоро" (адреса пустые).
1. Открыть в репозитории файл src/vnesh/vnesh-pages.js.
2. Заполнить поля tmkh / armalit / omk / recca / cifra адресами страниц (в кавычках).
3. Выполнить: python3 tools/build_vnesh.py
4. Перезалить файл dist/vnesh-hub.html (копия: vnesh-final/1-vnesh-hub.html после упаковки) в макрос HTML на странице. Плашки с адресом станут активными ссылками сами.

СОСТАВ
preview/ - предпросмотр без интернета: открыть index.html.
screens/ - снимок страницы при ширине колонки 1100 px.
'''
F.mkdir(exist_ok=True); (F/'preview').mkdir(exist_ok=True)
(F/'preview/vnesh-hub-preview.html').write_text(PREVIEW.replace('@@BLOCKS@@', dist), encoding='utf-8')
(F/'preview/index.html').write_text(INDEX, encoding='utf-8')
if '--preview-only' in sys.argv: sys.exit(0)
(F/'screens').mkdir(exist_ok=True)
shutil.copyfile(R/'dist/vnesh-hub.html', F/'1-vnesh-hub.html')
(F/'README.txt').write_text(README, encoding='utf-8')
assert hashlib.sha256((F/'1-vnesh-hub.html').read_bytes()).hexdigest() == hashlib.sha256((R/'dist/vnesh-hub.html').read_bytes()).hexdigest()
z = F/'vnesh-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in ['1-vnesh-hub.html','README.txt','preview/vnesh-hub-preview.html','preview/index.html']: zf.write(F/p, p)
    for p in sorted((F/'screens').glob('*.png')): zf.write(p, 'screens/'+p.name)
print('ok', z.stat().st_size)
