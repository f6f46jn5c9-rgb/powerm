"""Упаковка izm-final/: файлы для вставки (побайтно из dist), README, preview, zip.
Порядок: python3 tools/build_izm.py; python3 tools/pack_izm.py; node tools/shot_izm.js; python3 tools/pack_izm.py
Другие комплексы не трогает."""
import pathlib, shutil, zipfile, hashlib, html
R = pathlib.Path(__file__).resolve().parent.parent
D, F = R / 'dist', R / 'izm-final'
MAP = [('1-izm-hero.html', 'HTML-макрос 1 — hero + файлы для скачивания'),
       ('2-izm-cbl-open.html', 'HTML-макрос 2 — открывающая обёртка CBL'),
       ('3-izm-cbl-close.html', 'HTML-макрос 4 — закрывающая обёртка CBL')]
(F / 'preview').mkdir(parents=True, exist_ok=True); (F / 'screens').mkdir(exist_ok=True)
for out, _ in MAP:
    shutil.copyfile(D / out, F / out)
    assert hashlib.sha256((F / out).read_bytes()).digest() == hashlib.sha256((D / out).read_bytes()).digest()
(F / 'README.txt').write_text("""Страница "БССМ. Устойчивость изменений" (подраздел БУП, kb.severstal.com, пространство Силовые Машины / BSS)

ЧТО ВСТАВЛЯТЬ (сверху вниз)
Страница в Confluence          | Порядок | Что вставить
-------------------------------+---------+------------------------------------------------------------
БССМ. Устойчивость изменений   | 1       | макрос HTML <- файл 1-izm-hero.html (шапка + файлы для скачивания)
                               | 2       | макрос HTML <- файл 2-izm-cbl-open.html (открывающая обёртка)
                               | 3       | НАТИВНЫЙ макрос "Содержимое по меткам" (Content by Label):
                               |         |   метка: бссм_изменения; сортировка: по дате изменения (убывание);
                               |         |   отображать как: список
                               | 4       | макрос HTML <- файл 3-izm-cbl-close.html (закрывающая обёртка)

ШАГИ ВСТАВКИ
1. Открыть страницу на редактирование.
2. Удалить старые HTML-макросы (и старый нативный макрос "Содержимое по меткам", если он был).
3. Вставить по порядку: HTML-макрос 1 (файл 1), HTML-макрос 2 (файл 2), нативный макрос "Содержимое по меткам" с меткой бссм_изменения, HTML-макрос 4 (файл 3). В каждый HTML-макрос скопировать целиком содержимое своего файла.
4. Сохранить.

ВАЖНО
- Макрос 2 открывает обёртку, макрос 4 её закрывает - нельзя вставлять только один из них.
- Ссылка "<- БУП" в файле 1 пока без адреса: показывается серым текстом, не нажимается. Чтобы сделать её ссылкой, замените в файле 1 текст URL_БУП на адрес страницы БУП (целиком, вместе со словом URL_БУП).

КАК ПОДКЛЮЧИТЬ ФАЙЛЫ ДЛЯ СКАЧИВАНИЯ
Шаг 1. Загрузите три файла как вложения страницы (кнопка "..." -> "Вложения" в редакторе Confluence):
  - Диагностика ADKAR.pptx
  - Оценка проекта изменений_шаблон.xlsx
  - Типовой план управления изменениями.xlsx
  Имена файлов должны совпасть с указанными буква в букву (включая пробелы и знак подчёркивания).
Шаг 2. Найдите ID страницы: откройте страницу, посмотрите URL - число после /pages/ (например: .../pages/123456/...).
Шаг 3. Откройте файл 1-izm-hero.html, замените все вхождения IZM_PAGE_ID на найденное число (в файле их 3). Сохраните файл.
Шаг 4. Удалите старый HTML-макрос 1 и вставьте обновлённый файл.

СОСТАВ
preview/ - предпросмотр без интернета: открыть preview/index.html двойным щелчком (переключатель ширины 1100/820/560/375).
  Ссылки на файлы в предпросмотре открываются в пустой вкладке - это нормально, без Confluence файлы не загрузятся.
screens/ - izm-1100.png, ширина колонки 1100 px (на месте нативного макроса - имитация списка).
""", encoding='utf-8')
parts = ''
for out, label in MAP:
    parts += f'<div class="pv-lbl">{html.escape(label)}</div>\n' + (F / out).read_text(encoding='utf-8').replace('target="_blank"', '') + '\n'
    if out.startswith('2'):
        parts = parts.replace('<div class="pv-lbl">HTML-макрос 2', '<div class="pv-lbl">HTML-макрос 2')
        parts += '<div class="pv-native">HTML-макрос 3 (нативный) "Содержимое по меткам", метка бссм_изменения — вставляется вручную; ниже имитация списка</div>\n<ul><li><a href="#">Пример практики 1 (имитация)</a></li><li><a href="#">Пример практики 2 (имитация)</a></li></ul>\n'
parts = parts.replace('<a class="izm-file"', '<a target="_blank" class="izm-file"')
(F / 'preview/izm-preview.html').write_text(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: БССМ. Устойчивость изменений</title>
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
(F / 'preview/index.html').write_text('<!doctype html><html lang="ru"><meta charset="utf-8"><title>Предпросмотр</title><body style="font:16px Arial;margin:24px"><h1 style="font-size:22px">Предпросмотр</h1><ul><li><a href="izm-preview.html">БССМ. Устойчивость изменений — все макросы подряд</a></li></ul>\n', encoding='utf-8')
z = F / 'izm-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in [*(F / o for o, _ in MAP), F / 'README.txt', *sorted((F / 'preview').iterdir()), *sorted((F / 'screens').iterdir())]:
        zf.write(p, p.relative_to(F).as_posix())
print('zip', z.stat().st_size, 'байт'); print(*zipfile.ZipFile(z).namelist(), sep='\n')
