"""Сборка блока «Карта проектов»: src/karta-proektov.html -> dist/karta-proektov.html (лимит 38 КБ),
затем bssm-karta-final/ (файл для вставки, README, preview, zip). Другие файлы не трогает.
Скриншот: node tools/check_karta.js. Запуск: python3 tools/build_karta.py"""
import pathlib, shutil, sys, hashlib, zipfile
R = pathlib.Path(__file__).resolve().parent.parent
MAX_KB = 38
src, dst, F = R/'src/karta-proektov.html', R/'dist/karta-proektov.html', R/'bssm-karta-final'
shutil.copyfile(src, dst)
kb = dst.stat().st_size/1024
print(f'dist/karta-proektov.html {kb:.1f} КБ')
if kb > MAX_KB: sys.exit(f'!! больше {MAX_KB} КБ')
(F/'preview').mkdir(parents=True, exist_ok=True); (F/'screens').mkdir(exist_ok=True)
shutil.copyfile(dst, F/'1-karta-proektov.html')
h = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert h(F/'1-karta-proektov.html') == h(dst)
block = dst.read_text(encoding='utf-8')
(F/'README.txt').write_text("""Добавить на страницу Confluence: Бизнес-система. Силовые машины

1. Открыть страницу на редактирование.
2. Прокрутить в конец, после последнего HTML-макроса добавить новый HTML-макрос.
3. Вставить в него целиком содержимое файла 1-karta-proektov.html.
4. Сохранить.

Существующие макросы не трогать. Предпросмотр без интернета: preview/index.html.
""", encoding='utf-8')
page = lambda w: f'''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Карта проектов — предпросмотр</title>
<style>body{{font-family:Arial,sans-serif;margin:16px;background:#f4f6f8}}.bar{{margin:0 0 12px}}.bar button{{padding:6px 12px;margin-right:6px;cursor:pointer}}#col{{width:{w}px;max-width:100%;background:#fff;padding:16px;margin:0 auto 0 0}}</style></head><body>
<div class="bar"><b>Ширина колонки:</b> <button data-w="1100">1100</button><button data-w="820">820</button><button data-w="560">560</button><button data-w="375">375</button></div>
<div id="col">
{block}
</div>
<script>var b=document.querySelectorAll('.bar button');for(var i=0;i<b.length;i++)b[i].onclick=function(){{document.getElementById('col').style.width=this.getAttribute('data-w')+'px'}}</script>
</body></html>'''
(F/'preview/karta.html').write_text(page(1000), encoding='utf-8')
(F/'preview/index.html').write_text('<!doctype html><meta charset="utf-8"><title>Предпросмотр</title><meta http-equiv="refresh" content="0;url=karta.html"><a href="karta.html">karta.html</a>', encoding='utf-8')
z = F/'bssm-karta-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in ['1-karta-proektov.html','README.txt','preview/karta.html','preview/index.html','screens/karta-1100.png']:
        if (F/p).exists(): zf.write(F/p, p)
print('OK', h(F/'1-karta-proektov.html')[:12])
