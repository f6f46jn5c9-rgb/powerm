"""Упаковка prod-subhubs-final/: 18 файлов (побайтно из dist), README, preview, zip.
Порядок: build_prod_subhubs.py; pack_prod_subhubs.py; node shot_prod_subhubs.js; pack_prod_subhubs.py (второй раз включает screens в zip).
Другие комплексы не трогает."""
import pathlib, shutil, zipfile, hashlib, html
R = pathlib.Path(__file__).resolve().parent.parent
D, F = R / 'dist', R / 'prod-subhubs-final'
PAGES = [(1, 'svar', 'Производство. Обучение сварщиков', 'производство_сварщики'), (2, 'zapasy', 'Производство. Снижение запасов', 'производство_запасы'), (3, 'smarket', 'Производство. Супермаркет', 'производство_супермаркет'), (4, 'hranenie', 'Производство. Адресное хранение', 'производство_хранение'), (5, 'fabrika', 'Производство. Фабрика идей', 'производство_идеи'), (6, 'ppraktiki', 'Производство. Практики', 'производство_практики')]
PARTS = [('1-hero', 'HTML-макрос 1 — hero'), ('2-cbl-open', 'HTML-макрос 2 — открывающая обёртка CBL'), ('3-cbl-close', 'HTML-макрос 4 — закрывающая обёртка CBL')]
(F / 'preview').mkdir(parents=True, exist_ok=True); (F / 'screens').mkdir(exist_ok=True)
files = []
for n, p, title, lab in PAGES:
    for part, _ in PARTS:
        out = f'{n}-{p}-{part}.html'; shutil.copyfile(D / f'prod-{p}-{part}.html', F / out); files.append(out)
        assert hashlib.sha256((F / out).read_bytes()).digest() == hashlib.sha256((D / f'prod-{p}-{part}.html').read_bytes()).digest()
rows = ''
for n, p, title, lab in PAGES:
    rows += f'''{title}
  1. макрос HTML  <- {n}-{p}-1-hero.html
  2. макрос HTML  <- {n}-{p}-2-cbl-open.html
  3. НАТИВНЫЙ макрос "Содержимое по меткам" (Content by Label): метка {lab}; показывать: страницы;
     сортировка: по дате изменения (новые сверху); пространство: BSS; максимум: 50
  4. макрос HTML  <- {n}-{p}-3-cbl-close.html

'''
(F / 'README.txt').write_text(f'''Производство: 6 страниц-подхабов (kb.severstal.com, пространство BSS, Силовые Машины)

Что вставлять на каждую страницу (сверху вниз, ровно 4 элемента):

{rows}ШАГИ (одинаковые для всех 6 страниц)
1. Открыть страницу в Confluence на редактирование.
2. Удалить все старые HTML-макросы (и старый нативный макрос "Содержимое по меткам", если он был).
3. Вставить новые по порядку 1 -> 2 -> 3 -> 4. В HTML-макросы скопировать содержимое файла целиком (файл открывать в Блокноте/любом текстовом редакторе).
4. Сохранить.

ВАЖНО
- Макрос 2 открывает обёртку, макрос 4 её закрывает. Нельзя вставлять один без другого и нельзя менять порядок.
- В имени файла "3-cbl-close" цифра 3 - это номер файла, а на странице он стоит ЧЕТВЁРТЫМ (третий - нативный макрос).
- Метки (производство_...) должны быть выставлены на страницах, которые должны попасть в список.

СОСТАВ
preview/ - предпросмотр без интернета: открыть preview/index.html двойным щелчком (переключатель ширины 1100/820/560/375).
  На месте нативного макроса - пунктирная заглушка и имитация списка.
screens/ - по одному PNG на страницу, ширина колонки 1100 px.
''', encoding='utf-8')
parts_css = '''body{margin:0;background:#eef1f4;font:14px/1.4 Arial,sans-serif;color:#1F2A33}
.pv-bar{padding:12px 16px;background:#fff;border-bottom:1px solid #d5dbe0}
.pv-bar button{margin:0 6px 0 0;padding:6px 12px;border:1px solid #5B6670;border-radius:6px;background:#fff;color:#1F2A33;font:inherit;cursor:pointer}
.pv-bar button[aria-pressed=true]{background:#0e7c7b;border-color:#0e7c7b;color:#fff}
#pv-col{width:1000px;max-width:100%;margin:16px auto;padding:0 16px;box-sizing:content-box;background:#fff}
.pv-lbl{margin:20px 0 8px;padding:2px 8px;display:inline-block;background:#e8edf7;color:#1e4d8c;font:600 12px Arial,sans-serif}
.pv-native{margin:0 0 12px;padding:10px 16px;border:1px dashed #5B6670;color:#5B6670;font-size:13px}'''
for n, p, title, lab in PAGES:
    rd = lambda part: (F / f'{n}-{p}-{part}.html').read_text(encoding='utf-8')
    body = (f'<div class="pv-lbl">HTML-макрос 1 — hero</div>\n{rd("1-hero")}\n<div class="pv-lbl">HTML-макрос 2 — открывающая обёртка CBL</div>\n{rd("2-cbl-open")}\n'
            f'<div class="pv-native">Макрос 3 (нативный) "Содержимое по меткам", метка {html.escape(lab)} — вставляется в Confluence вручную; ниже имитация списка</div>\n'
            '<ul><li><a href="#">Пример страницы 1 (имитация)</a></li><li><a href="#">Пример страницы 2 (имитация)</a></li></ul>\n'
            f'<div class="pv-lbl">HTML-макрос 4 — закрывающая обёртка CBL</div>\n{rd("3-cbl-close")}\n')
    (F / f'preview/{n}-{p}-preview.html').write_text(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: {html.escape(title)}</title>
<style>
{parts_css}
</style></head><body>
<div class="pv-bar"><span>Ширина колонки: </span><button data-w="1100" aria-pressed="false">1100</button><button data-w="820" aria-pressed="false">820</button><button data-w="560" aria-pressed="false">560</button><button data-w="375" aria-pressed="false">375</button><button data-w="1000" aria-pressed="true">1000</button></div>
<div id="pv-col">
{body}</div>
<script>
(function(){{var c=document.getElementById('pv-col'),b=document.querySelectorAll('.pv-bar button');
for(var i=0;i<b.length;i++){{b[i].addEventListener('click',function(){{c.style.width=this.getAttribute('data-w')+'px';for(var j=0;j<b.length;j++)b[j].setAttribute('aria-pressed',b[j]===this?'true':'false');}});}}}})();
</script></body></html>
''', encoding='utf-8')
li = ''.join(f'<li><a href="{n}-{p}-preview.html">{html.escape(t)}</a></li>' for n, p, t, _ in PAGES)
(F / 'preview/index.html').write_text(f'<!doctype html><html lang="ru"><meta charset="utf-8"><title>Предпросмотр Производство</title><body style="font:16px/1.6 Arial;margin:24px"><h1 style="font-size:22px">Предпросмотр: Производство, 6 страниц</h1><ul>{li}</ul>\n', encoding='utf-8')
z = F / 'prod-subhubs-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in [*(F / f for f in files), F / 'README.txt', *sorted((F / 'preview').iterdir()), *sorted((F / 'screens').iterdir())]:
        zf.write(p, p.relative_to(F).as_posix())
print('zip', z.stat().st_size, 'байт', len(zipfile.ZipFile(z).namelist()), 'файлов')
