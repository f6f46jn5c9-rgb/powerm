"""Упаковка inzh-final/: файлы для вставки (побайтно из dist, с номером страницы), README, preview, zip.
Порядок: python3 tools/build_inzh.py; python3 tools/pack_inzh.py; node tools/shot_inzh.js; python3 tools/pack_inzh.py
Другие комплексы не трогает."""
import pathlib, shutil, zipfile, hashlib, html
R = pathlib.Path(__file__).resolve().parent.parent
D, F = R / 'dist', R / 'inzh-final'
# (№, префикс, название, метка CBL или None для Типа А)
PAGES = [(1, 'hub', 'Инжиниринг. Силовые машины', None), (2, 'pra', 'Инжиниринг. Практики', 'инжиниринг_практики'),
         (3, 'sp', 'Экспертная группа "Совершенствование процессов"', 'инжиниринг_совершенствование'),
         (4, 'np', 'Экспертная группа "Новые продукты"', 'инжиниринг_новые_продукты'),
         (5, 'ctr', 'Экспертная группа "Центр Технологических Решений"', 'инжиниринг_цтр'),
         (6, 'nad', 'Экспертная группа "Надежность"', 'инжиниринг_надежность')]
KB = [('1-hero', 'HTML-макрос 1 — hero'), ('2-cbl-open', 'HTML-макрос 2 — открывающая обёртка CBL'), ('3-cbl-close', 'HTML-макрос 4 — закрывающая обёртка CBL')]
def blocks(n, p, label):
    if label is None: return [(f'{n}-inzh-hub-1.html', f'inzh-hub-1.html', 'HTML-макрос 1 — вся страница (hero + плашки)', 1)]
    return [(f'{n}-inzh-{p}-{k}.html', f'inzh-{p}-{k}.html', l, int(k[0]) if k[0] != '3' else 4) for k, l in KB]
(F / 'preview').mkdir(parents=True, exist_ok=True); (F / 'screens').mkdir(exist_ok=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
files = []; rows = ''
for n, p, title, label in PAGES:
    bl = blocks(n, p, label)
    for dst, src, _, _ in bl:
        shutil.copyfile(D / src, F / dst); assert sha(D / src) == sha(F / dst); files.append(F / dst)
    if label is None:
        rows += f'{title:52s}| 1 | HTML-макрос <- файл {bl[0][0]} (вся страница целиком)\n{"-"*52}+---+{"-"*58}\n'
    else:
        rows += f'{title:52s}| 1 | HTML-макрос <- файл {bl[0][0]} (шапка)\n{"":52s}| 2 | HTML-макрос <- файл {bl[1][0]} (открывающая обёртка)\n{"":52s}| 3 | НАТИВНЫЙ макрос "Содержимое по меткам", метка {label}\n{"":52s}| 4 | HTML-макрос <- файл {bl[2][0]} (закрывающая обёртка)\n{"-"*52}+---+{"-"*58}\n'
(F / 'README.txt').write_text(f'''Комплекс "Инжиниринг" (kb.severstal.com, пространство Силовые Машины / BSS): 6 страниц

ЧТО ВСТАВЛЯТЬ (сверху вниз)
{"Страница в Confluence":52s}| № | Что вставить
{"-"*52}+---+{"-"*58}
{rows}
Нативный макрос "Содержимое по меткам" (Content by Label) на страницах 2-6:
  метка - из таблицы выше; отображать: страницы; сортировка: по дате изменения (новые сверху);
  пространство: BSS; максимум: 50.
На странице 1 нативных макросов нет: там только один HTML-макрос.

ШАГИ (для каждой страницы)
1. Открыть страницу на редактирование.
2. Удалить все старые HTML-макросы (и старый макрос "Содержимое по меткам", если был).
3. Вставить новые по порядку (таблица выше). В каждый HTML-макрос скопировать целиком содержимое своего файла.
4. Сохранить.

ВАЖНО
- Для страниц 2-6: макрос 2 открывает обёртку, макрос 4 закрывает её - нельзя вставлять только один из них.
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
for n, p, title, label in PAGES:
    parts = ''
    for dst, _, lab, num in blocks(n, p, label):
        parts += f'<div class="pv-lbl">{html.escape(lab)}</div>\n' + (F / dst).read_text(encoding='utf-8') + '\n'
        if dst.endswith('2-cbl-open.html'):
            parts += f'<div class="pv-native">HTML-макрос 3 (нативный) "Содержимое по меткам", метка {label} — вставляется вручную; ниже имитация списка</div>\n<ul><li><a href="#">Пример 1 (имитация)</a></li><li><a href="#">Пример 2 (имитация)</a></li></ul>\n'
    (F / f'preview/inzh-{p}-preview.html').write_text(f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: {html.escape(title)}</title>
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
li = ''.join(f'<li><a href="inzh-{p}-preview.html">{n}. {html.escape(t)}</a></li>' for n, p, t, _ in PAGES)
(F / 'preview/index.html').write_text(f'<!doctype html><html lang="ru"><meta charset="utf-8"><title>Предпросмотр</title><body style="font:16px Arial;margin:24px"><h1 style="font-size:22px">Предпросмотр: Инжиниринг</h1><ul>{li}</ul>\n', encoding='utf-8')
z = F / 'inzh-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for q in [*files, F / 'README.txt', *sorted((F / 'preview').iterdir()), *sorted((F / 'screens').iterdir())]:
        zf.write(q, q.relative_to(F).as_posix())
print('zip', z.stat().st_size, 'байт'); print(*zipfile.ZipFile(z).namelist(), sep='\n')
