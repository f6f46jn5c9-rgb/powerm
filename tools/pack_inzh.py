"""Упаковка inzh-final/: файлы для вставки (побайтно из dist, с номером страницы), README, preview, zip.
Порядок: python3 tools/build_inzh.py; python3 tools/pack_inzh.py; node tools/shot_inzh.js; python3 tools/pack_inzh.py
Другие комплексы не трогает."""
import pathlib, shutil, zipfile, hashlib, html
R = pathlib.Path(__file__).resolve().parent.parent
D, F = R / 'dist', R / 'inzh-final'
LABEL = 'инжиниринг_практики'
PAGES = [(1, 'inzh-hub', 'Инжиниринг. Силовые машины', '156860862'), (2, 'inzh-pra', 'Инжиниринг. Практики', '523076665')]
KINDS = [('1-hero', 'HTML-макрос 1 — hero'), ('2-cbl-open', 'HTML-макрос 2 — открывающая обёртка CBL'), ('3-cbl-close', 'HTML-макрос 4 — закрывающая обёртка CBL')]
(F / 'preview').mkdir(parents=True, exist_ok=True); (F / 'screens').mkdir(exist_ok=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
files = []
for n, pre, title, pid in PAGES:
    for k, _ in KINDS:
        src, dst = D / f'{pre}-{k}.html', F / f'{n}-{pre}-{k}.html'
        shutil.copyfile(src, dst); assert sha(src) == sha(dst); files.append(dst)
rows = ''
for n, pre, title, pid in PAGES:
    rows += f'{title:28s} | 1 | HTML-макрос  <- файл {n}-{pre}-1-hero.html (шапка)\n{"":28s} | 2 | HTML-макрос  <- файл {n}-{pre}-2-cbl-open.html (открывающая обёртка)\n{"":28s} | 3 | НАТИВНЫЙ макрос "Содержимое по меткам" (метка {LABEL})\n{"":28s} | 4 | HTML-макрос  <- файл {n}-{pre}-3-cbl-close.html (закрывающая обёртка)\n{"-"*28}-+---+{"-"*60}\n'
(F / 'README.txt').write_text(f'''Комплекс "Инжиниринг" (kb.severstal.com, пространство Силовые Машины / BSS): 2 страницы

ЧТО ВСТАВЛЯТЬ (сверху вниз)
Страница в Confluence        | № | Что вставить
{"-"*28}-+---+{"-"*60}
{rows}
Нативный макрос "Содержимое по меткам" (Content by Label), одинаково на обеих страницах:
  метка: {LABEL}; отображать: страницы; сортировка: по дате изменения (новые сверху);
  пространство: BSS; максимум: 50.

ШАГИ (для каждой страницы)
1. Открыть страницу на редактирование.
2. Удалить все старые HTML-макросы (и старый макрос "Содержимое по меткам", если был).
3. Вставить новые по порядку 1, 2, 3, 4 (таблица выше). В каждый HTML-макрос скопировать целиком содержимое своего файла.
4. Сохранить.

ВАЖНО
- Макрос 2 открывает обёртку, макрос 4 закрывает её - нельзя вставлять только один из них.
- Ссылка "<- БУП" уже ведёт на https://kb.severstal.com/spaces/BSS/pages/161546386/ - ничего менять не нужно.

СОСТАВ
preview/ - предпросмотр без интернета: открыть preview/index.html двойным щелчком (переключатель ширины 1100/820/560/375).
screens/ - по одному PNG на страницу, ширина колонки 1100 px (на месте нативного макроса - имитация списка).
''', encoding='utf-8')
CSS = '''body{margin:0;background:#eef1f4;font:14px/1.4 Arial,sans-serif;color:#1F2A33}
.pv-bar{padding:12px 16px;background:#fff;border-bottom:1px solid #d5dbe0}
.pv-bar button{margin:0 6px 0 0;padding:6px 12px;border:1px solid #546e7a;border-radius:6px;background:#fff;color:#1F2A33;font:inherit;cursor:pointer}
.pv-bar button[aria-pressed=true]{background:#546e7a;border-color:#546e7a;color:#fff}
#pv-col{width:1000px;max-width:100%;margin:16px auto;padding:0 16px;box-sizing:content-box;background:#fff}
.pv-lbl{margin:20px 0 8px;padding:2px 8px;display:inline-block;background:#e3eaed;color:#37474f;font:600 12px Arial,sans-serif}
.pv-native{margin:0 0 12px;padding:10px 16px;border:1px dashed #5B6670;color:#5B6670;font-size:13px}'''
for n, pre, title, pid in PAGES:
    parts = ''
    for k, label in KINDS:
        parts += f'<div class="pv-lbl">{html.escape(label)}</div>\n' + (F / f'{n}-{pre}-{k}.html').read_text(encoding='utf-8') + '\n'
        if k == '2-cbl-open':
            parts += f'<div class="pv-native">HTML-макрос 3 (нативный) "Содержимое по меткам", метка {LABEL} — вставляется вручную; ниже имитация списка</div>\n<ul><li><a href="#">Пример практики 1 (имитация)</a></li><li><a href="#">Пример практики 2 (имитация)</a></li></ul>\n'
    (F / f'preview/{pre}-preview.html').write_text(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: {title}</title>
<style>
{CSS}
</style></head><body>
<div class="pv-bar"><span>Ширина колонки: </span><button data-w="1100" aria-pressed="false">1100</button><button data-w="820" aria-pressed="false">820</button><button data-w="560" aria-pressed="false">560</button><button data-w="375" aria-pressed="false">375</button><button data-w="1000" aria-pressed="true">1000</button></div>
<div id="pv-col">
{parts}</div>
<script>
(function(){{var c=document.getElementById('pv-col'),b=document.querySelectorAll('.pv-bar button');
for(var i=0;i<b.length;i++){{b[i].addEventListener('click',function(){{c.style.width=this.getAttribute('data-w')+'px';for(var j=0;j<b.length;j++)b[j].setAttribute('aria-pressed',b[j]===this?'true':'false');}});}}}})();
</script></body></html>
''', encoding='utf-8')
li = ''.join(f'<li><a href="{pre}-preview.html">{t} — все макросы подряд</a></li>' for _, pre, t, _ in PAGES)
(F / 'preview/index.html').write_text(f'<!doctype html><html lang="ru"><meta charset="utf-8"><title>Предпросмотр</title><body style="font:16px Arial;margin:24px"><h1 style="font-size:22px">Предпросмотр: Инжиниринг</h1><ul>{li}</ul>\n', encoding='utf-8')
z = F / 'inzh-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in [*files, F / 'README.txt', *sorted((F / 'preview').iterdir()), *sorted((F / 'screens').iterdir())]:
        zf.write(p, p.relative_to(F).as_posix())
print('zip', z.stat().st_size, 'байт'); print(*zipfile.ZipFile(z).namelist(), sep='\n')
