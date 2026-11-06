"""Упаковка it-final/: файлы для вставки (побайтно из dist), README, preview, zip.
Порядок: build_it.py; pack_it.py; node check_it.js; pack_it.py. Другие комплексы не трогает."""
import pathlib, shutil, zipfile, hashlib, html
R = pathlib.Path(__file__).resolve().parent.parent
D, F = R / 'dist', R / 'it-final'
MAP = [('1-it-hub-1.html', 'it-hub.html'),
       ('2-it-pra-1-hero.html', 'it-pra-1-hero.html'), ('2-it-pra-2-cbl-open.html', 'it-pra-2-cbl-open.html'), ('2-it-pra-3-cbl-close.html', 'it-pra-3-cbl-close.html'),
       ('3-it-dig-1-hero.html', 'it-dig-1-hero.html'), ('3-it-dig-2-cbl-open.html', 'it-dig-2-cbl-open.html'), ('3-it-dig-3-cbl-close.html', 'it-dig-3-cbl-close.html')]
(F / 'preview').mkdir(parents=True, exist_ok=True); (F / 'screens').mkdir(exist_ok=True)
for out, src in MAP:
    shutil.copyfile(D / src, F / out)
    assert hashlib.sha256((F / out).read_bytes()).digest() == hashlib.sha256((D / src).read_bytes()).digest()
(F / 'README.txt').write_text('''IT, цифровизация и автоматизация. Силовые машины: 3 страницы (kb.severstal.com, пространство BSS, Силовые Машины)

Страница                                   | Порядок | Что вставить
-------------------------------------------+---------+------------------------------------------------------------
IT, цифровизация и автоматизация (хаб)     | 1       | макрос HTML <- 1-it-hub-1.html   (единственный элемент)
IT: Практики                               | 1       | макрос HTML <- 2-it-pra-1-hero.html
                                           | 2       | макрос HTML <- 2-it-pra-2-cbl-open.html (открывающая обёртка)
                                           | 3       | НАТИВНЫЙ макрос "Содержимое по меткам" - пользователь вставляет сам
                                           | 4       | макрос HTML <- 2-it-pra-3-cbl-close.html (закрывающая обёртка)
Дайджест ИТ. Силовые машины                | 1       | макрос HTML <- 3-it-dig-1-hero.html
                                           | 2       | макрос HTML <- 3-it-dig-2-cbl-open.html (открывающая обёртка)
                                           | 3       | НАТИВНЫЙ макрос "Содержимое по меткам" - пользователь вставляет сам
                                           | 4       | макрос HTML <- 3-it-dig-3-cbl-close.html (закрывающая обёртка)

4 ШАГА ЗАМЕНЫ (одинаковы для каждой страницы)
1. Открыть страницу на редактирование, удалить старые HTML-макросы (нативный макрос "Содержимое по меткам" оставить или удалить, если вставляете заново).
2. Вставить по порядку: HTML-макрос с файлом hero (или хаб - он один), HTML-макрос с файлом cbl-open, нативный CBL, HTML-макрос с файлом cbl-close. В каждый HTML-макрос копируется целиком содержимое своего файла.
3. Между cbl-open и cbl-close ОБЯЗАТЕЛЬНО стоит нативный CBL, его вставляете вы сами. cbl-open намеренно оставляет незакрытый <div>, cbl-close закрывает его - нельзя вставлять только один из них.
4. Сохранить и проверить: крошка "БУП" ведёт на стартовую страницу, плашки хаба ведут на IT: Практики и Дайджест.

Адреса страниц заданы в src/it/it-pages.js; после изменения адресов выполнить python3 tools/build_it.py и python3 tools/pack_it.py.
''', encoding='utf-8')
LBL = {'hub': 'хаб'}
def col(inner, label):
    return f'<div class="pv-lbl">{html.escape(label)}</div>\n{inner}\n'
def page(title, parts):
    body = ''
    for label, f in parts:
        body += col((D / f).read_text(encoding='utf-8'), label) if f else f'<div class="pv-native">{html.escape(label)}</div>\n'
    return f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: {html.escape(title)}</title>
<style>
body{{margin:0;background:#eef1f4;font:14px/1.4 Arial,sans-serif;color:#1F2A33}}
.pv-bar{{padding:12px 16px;background:#fff;border-bottom:1px solid #d5dbe0}}
.pv-bar button{{margin:0 6px 0 0;padding:6px 12px;border:1px solid #5B6670;border-radius:6px;background:#fff;color:#1F2A33;font:inherit;cursor:pointer}}
.pv-bar button[aria-pressed=true]{{background:#005b8e;border-color:#005b8e;color:#fff}}
#pv-col{{width:1000px;max-width:100%;margin:16px auto;padding:0 16px;box-sizing:content-box;background:#fff}}
.pv-lbl{{margin:20px 0 8px;padding:2px 8px;display:inline-block;background:#e0eef6;color:#004a73;font:600 12px Arial,sans-serif}}
.pv-native{{margin:0 0 12px;padding:10px 16px;border:1px dashed #5B6670;color:#5B6670;font-size:13px}}
</style></head><body>
<div class="pv-bar"><span>Ширина колонки: </span><button data-w="1100" aria-pressed="false">1100</button><button data-w="820" aria-pressed="false">820</button><button data-w="560" aria-pressed="false">560</button><button data-w="375" aria-pressed="false">375</button><button data-w="1000" aria-pressed="true">1000</button></div>
<div id="pv-col">
{body}</div>
<script>
(function(){{var c=document.getElementById('pv-col'),b=document.querySelectorAll('.pv-bar button');
for(var i=0;i<b.length;i++){{b[i].addEventListener('click',function(){{var w=this.getAttribute('data-w');c.style.width=w+'px';
for(var j=0;j<b.length;j++){{b[j].setAttribute('aria-pressed',b[j]===this?'true':'false');}}}});}}}})();
</script></body></html>'''
SAMPLE = 'Здесь нативный макрос «Содержимое по меткам» (вставляет пользователь)'
PV = {'1-it-hub-preview.html': ('IT, цифровизация и автоматизация', [('HTML-макрос 1 — хаб', 'it-hub.html')]),
      '2-it-pra-preview.html': ('IT: Практики', [('HTML-макрос 1 — hero', 'it-pra-1-hero.html'), ('HTML-макрос 2 — открывающая обёртка CBL', 'it-pra-2-cbl-open.html'), (SAMPLE, None), ('HTML-макрос 4 — закрывающая обёртка CBL', 'it-pra-3-cbl-close.html')]),
      '3-it-dig-preview.html': ('Дайджест ИТ. Силовые машины', [('HTML-макрос 1 — hero', 'it-dig-1-hero.html'), ('HTML-макрос 2 — открывающая обёртка CBL', 'it-dig-2-cbl-open.html'), (SAMPLE, None), ('HTML-макрос 4 — закрывающая обёртка CBL', 'it-dig-3-cbl-close.html')])}
for n, (t, parts) in PV.items(): (F / 'preview' / n).write_text(page(t, parts), encoding='utf-8')
(F / 'preview' / 'index.html').write_text('<!doctype html><html lang="ru"><meta charset="utf-8"><title>Предпросмотр IT</title><body style="font:16px/1.6 Arial;margin:24px"><h1 style="font-size:22px">Предпросмотр: IT, 3 страницы</h1><ul>' + ''.join(f'<li><a href="{n}">{html.escape(t)}</a></li>' for n, (t, _) in PV.items()) + '</ul></body></html>', encoding='utf-8')
z = R / 'it-final' / 'it-all.zip'
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for out, _ in MAP: zf.write(F / out, out)
    zf.write(F / 'README.txt', 'README.txt')
    for p in sorted((F / 'preview').glob('*.html')): zf.write(p, 'preview/' + p.name)
    for p in sorted((F / 'screens').glob('*.png')): zf.write(p, 'screens/' + p.name)
print('ok', z.stat().st_size)
