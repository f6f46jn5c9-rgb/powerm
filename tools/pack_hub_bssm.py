"""Упаковка hub-bssm-final/: файлы для вставки (побайтно из dist), README, preview, zip.
Скриншот делает: node tools/check_hub_bssm.js --shot hub-bssm-final/screens/hub-bssm.png
Запуск: python3 tools/pack_hub_bssm.py"""
import pathlib, shutil, zipfile, hashlib, html
R = pathlib.Path(__file__).resolve().parent.parent
D, F = R / 'dist', R / 'hub-bssm-final'
MAP = [('1-hub-bssm-shapka.html', 'hub-bssm-1-hub-bssm-shapka.html', 'HTML-макрос 1 — шапка'),
       ('2-hub-bssm-razdely-programmy.html', 'hub-bssm-2-hub-bssm-razdely-programmy.html', 'HTML-макрос 2 — разделы и программы'),
       ('3a-hub-bssm-cbl-open.html', 'hub-bssm-3a-hub-bssm-cbl-open.html', 'HTML-макрос 3a — обёртка (открытие)'),
       ('3b-hub-bssm-cbl-close.html', 'hub-bssm-3b-hub-bssm-cbl-close.html', 'HTML-макрос 3b — обёртка (закрытие)')]
(F / 'preview').mkdir(parents=True, exist_ok=True); (F / 'screens').mkdir(exist_ok=True)
for out, src, _ in MAP: shutil.copyfile(D / src, F / out)
for out, src, _ in MAP: assert hashlib.sha256((F / out).read_bytes()).digest() == hashlib.sha256((D / src).read_bytes()).digest()
(F / 'README.txt').write_text("""Страница "Бизнес-система. СМ" (раздел БУП, kb.severstal.com/spaces/BSS/)

ЧТО ВСТАВЛЯТЬ (сверху вниз)
Страница в Confluence              | Порядок | Что вставить
-----------------------------------+---------+--------------------------------------------------------
Бизнес-система. СМ                 | 1       | макрос HTML  <- файл 1-hub-bssm-shapka.html
                                   | 2       | макрос HTML  <- файл 2-hub-bssm-razdely-programmy.html
                                   | 3a      | макрос HTML  <- файл 3a-hub-bssm-cbl-open.html
                                   | между   | НАТИВНЫЙ макрос "Содержимое по меткам" (Content by Label):
                                   |         |   метка: раздел_бизнес_система, сортировка: по дате (убывание), пространство: BSS
                                   | 3b      | макрос HTML  <- файл 3b-hub-bssm-cbl-close.html

ШАГИ
1. Открыть страницу на редактирование.
2. Удалить старые HTML-макросы.
3. Вставить новые макросы HTML по порядку 1, 2, 3a; в каждый скопировать целиком содержимое своего файла. Сразу после 3a вставить нативный макрос "Содержимое по меткам" (настройки выше), после него - макрос HTML 3b.
4. Сохранить.

ВАЖНО
- Ссылки URL_PLACEHOLDER_HUB16 ... HUB21 в файле 2 заменить на реальные адреса. Пока ссылка не заменена, плашка бледная, показывает "Скоро" и не нажимается; после замены становится обычной плашкой сама.
  HUB16 Практики; HUB17 УП / ДБВ; HUB18 Agile; HUB19 Устойчивость изменений; HUB20 Школа / Мини-Т; HUB21 Программы трансформации, СМ 2.0 и СМ 3.0.
- Макрос 3a открывает обёртку, а 3b её закрывает - нельзя вставлять только один из них.
- Пунктирная рамка в 3a ("Content by Label | тег: ...") - подсказка для редактора; после вставки нативного макроса её можно удалить из файла 3a (строка с классом bssm-cbl__stub).

СОСТАВ
preview/ - предпросмотр без интернета: открыть preview/index.html двойным щелчком (переключатель ширины 1100/820/560/375).
screens/ - снимок страницы при ширине колонки 1100 px.
""", encoding='utf-8')
parts = ''
for out, _, label in MAP:
    body = (F / out).read_text(encoding='utf-8')
    parts += f'<div class="pv-lbl">{html.escape(label)}</div>\n' + body + '\n'
    if out.startswith('3a'):
        parts += '<div class="pv-native">Нативный макрос "Содержимое по меткам" (вставляется вручную между 3a и 3b)</div>\n'
(F / 'preview/hub-bssm-preview.html').write_text(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: Бизнес-система. СМ</title>
<style>
body{{margin:0;background:#eef1f4;font:14px/1.4 Arial,sans-serif;color:#1F2A33}}
.pv-bar{{padding:12px 16px;background:#fff;border-bottom:1px solid #d5dbe0}}
.pv-bar button{{margin:0 6px 0 0;padding:6px 12px;border:1px solid #5B6670;border-radius:6px;background:#fff;color:#1F2A33;font:inherit;cursor:pointer}}
.pv-bar button[aria-pressed=true]{{background:#1e4d8c;border-color:#1e4d8c;color:#fff}}
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
(F / 'preview/index.html').write_text('<!doctype html><html lang="ru"><meta charset="utf-8"><title>Предпросмотр</title><body style="font:16px Arial;margin:24px"><h1 style="font-size:22px">Предпросмотр</h1><ul><li><a href="hub-bssm-preview.html">Бизнес-система. СМ - все блоки подряд</a></li></ul></body></html>\n', encoding='utf-8')
z = F / 'hub-bssm-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in [*(F / o for o, _, _ in MAP), F / 'README.txt', *sorted((F / 'preview').iterdir()), *sorted((F / 'screens').iterdir())]:
        zf.write(p, p.relative_to(F).as_posix())
print('zip', z.stat().st_size, 'байт'); print(*zipfile.ZipFile(z).namelist(), sep='\n')
