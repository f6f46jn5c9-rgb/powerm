"""Упаковка shkola-final/: файлы для вставки (побайтно из dist), README, preview, screens, zip.
Запуск: python3 tools/build_shkola.py && python3 tools/pack_shkola.py"""
import pathlib, shutil, zipfile, hashlib, html, re, subprocess
R = pathlib.Path(__file__).resolve().parent.parent
D, F = R / 'dist', R / 'shkola-final'
MAP = [('1-shkola-hero.html', 'HTML-макрос 1 — hero + плашки модулей + изображения'),
       ('2-shkola-cbl-open.html', 'HTML-макрос 2 — открывающая обёртка CBL')]
CLOSE = ('3-shkola-cbl-close.html', 'HTML-макрос 4 — закрывающая обёртка CBL')
(F / 'preview').mkdir(parents=True, exist_ok=True); (F / 'screens').mkdir(exist_ok=True)
for n in [m[0] for m in MAP] + [CLOSE[0]]:
    shutil.copyfile(D / n, F / n); assert hashlib.sha256((F / n).read_bytes()).digest() == hashlib.sha256((D / n).read_bytes()).digest()
(F / 'README.txt').write_text("""Страница "БССМ. Школа" (подхаб раздела БУП, kb.severstal.com/spaces/BSS/)

ЧТО ВСТАВЛЯТЬ (сверху вниз)
Страница в Confluence | Порядок | Что вставить
----------------------+---------+----------------------------------------------------------------
БССМ. Школа           | 1       | макрос HTML <- файл 1-shkola-hero.html (шапка, 3 плашки «Модуль 1-3», два изображения)
                      | 2       | макрос HTML <- файл 2-shkola-cbl-open.html (открывающая обёртка)
                      | 3       | НАТИВНЫЙ макрос "Содержимое по меткам" (Content by Label):
                      |         |   метка: бссм_школа; сортировка: по дате изменения (убывание);
                      |         |   показывать пространства: нет; отображать как: список
                      | 4       | макрос HTML <- файл 3-shkola-cbl-close.html (закрывающая обёртка)

ШАГИ ВСТАВКИ
1. Открыть страницу на редактирование.
2. Удалить старые HTML-макросы (и старый нативный макрос "Содержимое по меткам", если он был).
3. Вставить по порядку: макрос HTML 1, макрос HTML 2 (в каждый скопировать целиком содержимое своего файла), нативный макрос "Содержимое по меткам" с настройками выше, затем макрос HTML 4 (файл 3-shkola-cbl-close.html).
4. Сохранить.

КАК ПОДКЛЮЧИТЬ ИЗОБРАЖЕНИЯ
(ID страницы 232849639 уже подставлен в файл 1-shkola-hero.html - шаги 2-3 нужны, только если страница будет перенесена/пересоздана.)
Шаг 1. Загрузите два файла как вложения страницы: "краткое описание.png" и "инструменты программы.png"
        (кнопка "..." -> "Вложения" в редакторе Confluence). Имена файлов - ровно такие, строчными буквами, с пробелом.
Шаг 2. Найдите ID страницы: откройте страницу, посмотрите адрес в браузере - число после /pages/
        (например: .../pages/123456/...). Здесь ID = 123456.
Шаг 3. Откройте файл 1-shkola-hero.html в Блокноте, замените ВСЕ вхождения SHKOLA_PAGE_ID на найденное число
        (Правка -> Заменить). Сохраните файл. Их два: по одному на каждое изображение.
Шаг 4. Удалите старый HTML-макрос 1 на странице и вставьте обновлённый файл целиком.
Пока ID не подставлен, вместо картинок будет виден их текст-описание в рамке.

ПЛАШКИ МОДУЛЕЙ
Адреса страниц "1 модуль", "2 модуль", "3 модуль" уже вшиты в файл 1-shkola-hero.html. Если страница будет перенесена -
замените адреса в href трёх плашек (3 вхождения https://kb.severstal.com/...). Плашка без адреса (URL_МОДУЛЬ_N) бледная и не нажимается.

КРОШКА "<- БУП"
Пока адрес не задан, крошка показана серым текстом и не нажимается. Чтобы сделать её ссылкой: в файле
1-shkola-hero.html замените URL_БУП (одно вхождение) на полный адрес страницы БУП и вставьте файл заново (как в шаге 4).
Крошка станет светлой ссылкой.

ВАЖНО
- Макрос 2 открывает обёртку, макрос 4 её закрывает - нельзя вставлять только один из них.
- Нативный макрос "Содержимое по меткам" вставляется строго между ними.
- Метку бссм_школа надо поставить на каждую страницу-практику, которая должна попасть в список.

СОСТАВ
preview/ - предпросмотр без интернета: открыть preview/index.html двойным щелчком (переключатель ширины 1100/820/560/375).
           Изображения в предпросмотре - серые заглушки, настоящие появятся после загрузки вложений в Confluence.
screens/ - shkola-1100.png: страница целиком, ширина колонки 1100 px.
""", encoding='utf-8')
parts = ''
for out, label in MAP:
    body = (F / out).read_text(encoding='utf-8')
    if out.startswith('1'):
        names = iter(['краткое описание.png', 'инструменты программы.png'])
        body = re.sub(r'<img class="shkola-hero__img"[^>]*>', lambda m: f'<div class="pv-ph">[Вложение: {next(names)}]</div>', body)
    parts += f'<div class="pv-lbl">{html.escape(label)}</div>\n{body}\n'
parts += '<div class="pv-lbl">HTML-макрос 3 — нативный: Содержимое по меткам</div>\n<div class="pv-native">Нативный макрос «Содержимое по меткам» (метка: бссм_школа) — вставляется вручную между макросами 2 и 4</div>\n'
parts += f'<div class="pv-lbl">{html.escape(CLOSE[1])}</div>\n' + '<!-- закрывающий div: ' + (F / CLOSE[0]).read_text(encoding='utf-8').strip() + ' -->\n</div>\n'
(F / 'preview/shkola-preview.html').write_text(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: БССМ. Школа</title>
<style>
body{{margin:0;background:#eef1f4;font:14px/1.4 Arial,sans-serif;color:#1F2A33}}
.pv-bar{{padding:12px 16px;background:#fff;border-bottom:1px solid #d5dbe0}}
.pv-bar button{{margin:0 6px 0 0;padding:6px 12px;border:1px solid #5B6670;border-radius:6px;background:#fff;color:#1F2A33;font:inherit;cursor:pointer}}
.pv-bar button[aria-pressed=true]{{background:#2a5ca8;border-color:#2a5ca8;color:#fff}}
#pv-col{{width:1000px;max-width:100%;margin:16px auto;padding:0 16px;box-sizing:content-box;background:#fff}}
.pv-lbl{{margin:20px 0 8px;padding:2px 8px;display:inline-block;background:#e8edf7;color:#1e4d8c;font:600 12px Arial,sans-serif}}
.pv-native{{margin:0 0 12px;padding:10px 16px;border:1px dashed #5B6670;color:#5B6670;font-size:13px}}
.pv-ph{{width:100%;height:200px;display:flex;align-items:center;justify-content:center;text-align:center;padding:8px;box-sizing:border-box;border:1px solid #E3EAED;border-radius:8px;background:#f3f5f8;color:#5B6670;font-size:14px}}
</style></head><body>
<div class="pv-bar"><span>Ширина колонки: </span><button data-w="1100" aria-pressed="false">1100</button><button data-w="820" aria-pressed="false">820</button><button data-w="560" aria-pressed="false">560</button><button data-w="375" aria-pressed="false">375</button><button data-w="1000" aria-pressed="true">1000</button></div>
<div id="pv-col">
{parts}</div>
<script>
(function(){{var c=document.getElementById('pv-col'),b=document.querySelectorAll('.pv-bar button');
for(var i=0;i<b.length;i++){{b[i].addEventListener('click',function(){{c.style.width=this.getAttribute('data-w')+'px';for(var j=0;j<b.length;j++)b[j].setAttribute('aria-pressed',b[j]===this?'true':'false');}});}}}})();
</script></body></html>
''', encoding='utf-8')
(F / 'preview/index.html').write_text('<!doctype html><html lang="ru"><meta charset="utf-8"><title>Предпросмотр</title><body style="font:16px Arial;margin:24px"><h1 style="font-size:22px">Предпросмотр</h1><ul><li><a href="shkola-preview.html">БССМ. Школа - все макросы подряд</a></li></ul></body></html>\n', encoding='utf-8')
subprocess.run(['node', str(R / 'tools/shot_shkola.js'), str(F / 'preview/shkola-preview.html'), str(F / 'screens/shkola-1100.png')], check=True)
z = F / 'shkola-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in [*(F / o for o, _ in MAP), F / CLOSE[0], F / 'README.txt', *sorted((F / 'preview').iterdir()), *sorted((F / 'screens').iterdir())]:
        zf.write(p, p.relative_to(F).as_posix())
print('zip', z.stat().st_size, 'байт'); print(*zipfile.ZipFile(z).namelist(), sep='\n')
