"""Упаковка bssm-final/: файлы для вставки (побайтно из dist), README, preview, zip.
Скриншоты: node tools/check_hub_bssm.js --shot bssm-final/screens/hub-bssm-1100.png --shot-live bssm-final/screens/hub-bssm-1100-live.png
Запуск: python3 tools/pack_hub_bssm.py"""
import pathlib, shutil, zipfile, hashlib, html
R = pathlib.Path(__file__).resolve().parent.parent
D, F = R / 'dist', R / 'bssm-final'
MAP = [('1-hub-bssm.html', 'hub-bssm-1-hub-bssm.html', 'HTML-макрос 1 — hero + плашки'),
       ('2-hub-bssm-cbylabel-open.html', 'hub-bssm-2-hub-bssm-cbylabel-open.html', 'HTML-макрос 2 — открывающий div'),
       ('3-hub-bssm-cbylabel-close.html', 'hub-bssm-3-hub-bssm-cbylabel-close.html', 'HTML-макрос 3 — закрывающий div')]
(F / 'preview').mkdir(parents=True, exist_ok=True); (F / 'screens').mkdir(exist_ok=True)
for out, src, _ in MAP:
    shutil.copyfile(D / src, F / out); assert hashlib.sha256((F / out).read_bytes()).digest() == hashlib.sha256((D / src).read_bytes()).digest()
(F / 'README.txt').write_text("""Страница "Бизнес-система. СМ" (раздел БУП, kb.severstal.com/spaces/BSS/)

ЧТО ВСТАВЛЯТЬ (сверху вниз)
Страница в Confluence  | Порядок | Что вставить
-----------------------+---------+----------------------------------------------------------------
Бизнес-система. СМ     | 1       | макрос HTML <- файл 1-hub-bssm.html (шапка, 5 плашек, программы трансформации)
                       | 2       | макрос HTML <- файл 2-hub-bssm-cbylabel-open.html (открывающий div)
                       | между   | НАТИВНЫЙ макрос "Содержимое по меткам" (Content by Label):
                       |         |   метка: раздел_бизнес_система; сортировка: по дате изменения (убывание);
                       |         |   максимум: 10; показывать пространства: нет; отображать как: список
                       | 3       | макрос HTML <- файл 3-hub-bssm-cbylabel-close.html (закрывающий div + стиль)

ШАГИ ЗАМЕНЫ
1. Открыть страницу на редактирование.
2. Удалить старые HTML-макросы (и старый нативный макрос "Содержимое по меткам", если он был).
3. Вставить макросы HTML 1 и 2, в каждый скопировать целиком содержимое своего файла. Между 2 и 3 вставить нативный макрос "Содержимое по меткам" с настройками выше. После него вставить макрос HTML 3.
4. Сохранить.

ВАЖНО
- Макрос 2 открывает обёртку, макрос 3 её закрывает - нельзя вставлять только один из них.
- Ссылки URL_PLACEHOLDER_* в файле 1 заменить на реальные адреса (весь текст URL_PLACEHOLDER_... целиком):
  URL_PLACEHOLDER_PRAKTIKI (Практики), _UP (Управление проектами), _USTOICHIVOST (Устойчивость изменений),
  _MINI_T (Мини-Т), _SHKOLA (Школа), _SM2 (СМ 2.0), _SM3 (СМ 3.0).
  Пока ссылка не заменена, плашка бледная, показывает "Скоро" и не нажимается; после замены становится
  обычной тёмно-синей плашкой со стрелкой (так выглядит screens/hub-bssm-1100-live.png).

СОСТАВ
preview/ - предпросмотр без интернета: открыть preview/index.html двойным щелчком (переключатель ширины 1100/820/560/375).
screens/ - hub-bssm-1100.png (как сейчас, со "Скоро") и hub-bssm-1100-live.png (после замены ссылок), ширина колонки 1100 px.
""", encoding='utf-8')
parts = ''
for out, _, label in MAP:
    parts += f'<div class="pv-lbl">{html.escape(label)}</div>\n' + (F / out).read_text(encoding='utf-8') + '\n'
    if out.startswith('2'): parts += '<div class="pv-native">Нативный макрос "Содержимое по меткам" (вставляется вручную между макросами 2 и 3)</div>\n'
(F / 'preview/hub-bssm-preview.html').write_text(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: Бизнес-система. СМ</title>
<style>
body{{margin:0;background:#eef1f4;font:14px/1.4 Arial,sans-serif;color:#1F2A33}}
.pv-bar{{padding:12px 16px;background:#fff;border-bottom:1px solid #d5dbe0}}
.pv-bar button{{margin:0 6px 0 0;padding:6px 12px;border:1px solid #5B6670;border-radius:6px;background:#fff;color:#1F2A33;font:inherit;cursor:pointer}}
.pv-bar button[aria-pressed=true]{{background:#2a5ca8;border-color:#2a5ca8;color:#fff}}
#pv-col{{width:1000px;max-width:100%;margin:16px auto;padding:0 16px;box-sizing:content-box;background:#fff}}
.pv-lbl{{margin:20px 0 8px;padding:2px 8px;display:inline-block;background:#e8edf7;color:#1e4d8c;font:600 12px Arial,sans-serif}}
.pv-native{{margin:0 0 12px;padding:10px 16px;border:1px dashed #5B6670;color:#5B6670;font-size:13px}}
</style></head><body>
<div class="pv-bar"><span>Ширина колонки: </span><button data-w="1100" aria-pressed="false">1100</button><button data-w="820" aria-pressed="false">820</button><button data-w="560" aria-pressed="false">560</button><button data-w="375" aria-pressed="false">375</button><button data-w="1000" aria-pressed="true">1000</button></div>
<div id="pv-col">
{parts}</div>
<script>
(function(){{var c=document.getElementById('pv-col'),b=document.querySelectorAll('.pv-bar button');
for(var i=0;i<b.length;i++){{b[i].addEventListener('click',function(){{c.style.width=this.getAttribute('data-w')+'px';for(var j=0;j<b.length;j++)b[j].setAttribute('aria-pressed',b[j]===this?'true':'false');}});}}}})();
</script></body></html>
''', encoding='utf-8')
(F / 'preview/index.html').write_text('<!doctype html><html lang="ru"><meta charset="utf-8"><title>Предпросмотр</title><body style="font:16px Arial;margin:24px"><h1 style="font-size:22px">Предпросмотр</h1><ul><li><a href="hub-bssm-preview.html">Бизнес-система. СМ - все макросы подряд</a></li></ul></body></html>\n', encoding='utf-8')
z = F / 'bssm-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in [*(F / o for o, _, _ in MAP), F / 'README.txt', *sorted((F / 'preview').iterdir()), *sorted((F / 'screens').iterdir())]:
        zf.write(p, p.relative_to(F).as_posix())
print('zip', z.stat().st_size, 'байт'); print(*zipfile.ZipFile(z).namelist(), sep='\n')
