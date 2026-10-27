"""Упаковка страницы «Лучшие практики проектов»: dist/bp -> bp-final/ (файлы для вставки, README, preview).
Запуск: python3 tools/pack_bp.py        (файлы + README + preview)
        python3 tools/pack_bp.py zip    (после скриншотов: bp-final/bp-all.zip)
Скриншот делает tools/shot_bp.js."""
import hashlib, pathlib, shutil, sys, zipfile

R = pathlib.Path(__file__).resolve().parent.parent
F = R / 'bp-final'
FILES = [('1-shapka.html', 'Шапка страницы'), ('2-programma-dbv.html', 'Программа ДБВ: 11 практик'), ('3-shkola-v-razrabotke.html', 'Школа заместителей начальников цехов БС: в разработке')]

README = """СТРАНИЦА «ЛУЧШИЕ ПРАКТИКИ ПРОЕКТОВ» (Confluence, kb.severstal.com)

Что внутри: 3 готовых HTML-макроса. Вставляются по порядку, сверху вниз.

Страница Confluence -> файлы по порядку
+---------------------------------+------------------------------------------+-----------------------------------------------+
| Страница Confluence             | Файл                                     | Что это                                       |
+---------------------------------+------------------------------------------+-----------------------------------------------+
| Лучшие практики проектов        | 1. 1-shapka.html                         | Шапка страницы                                |
|                                 | 2. 2-programma-dbv.html                  | Программа ДБВ: 11 практик                     |
|                                 | 3. 3-shkola-v-razrabotke.html            | Школа заместителей начальников цехов БС       |
+---------------------------------+------------------------------------------+-----------------------------------------------+

Как обновить страницу (4 шага)
1. Откройте страницу «Лучшие практики проектов» на редактирование (карандаш).
2. Удалите все старые макросы HTML на странице.
3. Вставьте новые по порядку: добавьте макрос HTML, откройте файл 1-shapka.html в блокноте, скопируйте всё содержимое целиком (Ctrl+A, Ctrl+C), вставьте в макрос. То же для файлов 2 и 3, каждый в свой новый макрос HTML, сверху вниз.
4. Нажмите «Опубликовать».

Важно
- На странице должно быть ровно 3 макроса. Другие макросы в эти блоки вставлять нельзя.
- Файлы правьте только вместе с разработчиком: они собраны автоматически.
- Посмотреть результат без Confluence: откройте preview/index.html двойным щелчком (интернет не нужен).

Состав архива: файлы для вставки (3 шт.), README.txt, preview/ (index.html, bp.html), screens/ (снимок страницы).
"""

PREVIEW = """<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Превью: Лучшие практики проектов</title>
<style>.pv-body{margin:0;background:#f4f5f6;font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif}
.pv-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:12px 16px;font-size:14px;color:#1F2A33}
.pv-bar button{font:inherit;padding:6px 14px;border:1px solid #9aa5ab;background:#fff;color:#1F2A33;cursor:pointer}
.pv-bar button[aria-pressed="true"]{background:#1a2a5e;color:#fff;border-color:#1a2a5e}
.pv-col{width:1000px;max-width:100%;margin:0 auto 24px;padding:24px;background:#fff;box-sizing:border-box;display:flex;flex-direction:column;gap:20px}
.pv-col .cap{font-size:12px;color:#5B6670;margin:0 0 4px}</style></head>
<body class="pv-body"><div class="pv-bar" role="group" aria-label="Ширина колонки">Ширина колонки, px: <button type="button" data-w="1100">1100</button><button type="button" data-w="820">820</button><button type="button" data-w="560">560</button><button type="button" data-w="375">375</button></div>
<div class="pv-col" id="pv-col">
@@CELLS@@
</div>
<script>(function(){var c=document.getElementById('pv-col'),bs=document.querySelectorAll('.pv-bar button');
function set(w){c.style.width=w+'px';for(var i=0;i<bs.length;i++)bs[i].setAttribute('aria-pressed',bs[i].getAttribute('data-w')==w?'true':'false');}
for(var i=0;i<bs.length;i++)bs[i].addEventListener('click',function(){set(this.getAttribute('data-w'));});})();</script></body></html>
"""

INDEX = """<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Лучшие практики проектов: превью</title>
<style>body{margin:0;padding:32px 16px;background:#fff;color:#1F2A33;font:16px/1.5 Inter,"Segoe UI",Roboto,Arial,sans-serif}main{max-width:640px;margin:0 auto}h1{font-size:24px;color:#1a2a5e}a{color:#0a5f5e}</style></head>
<body><main><h1>Лучшие практики проектов</h1><p>Превью страницы Confluence из трёх HTML-макросов.</p><p><a href="bp.html">Открыть превью страницы →</a></p><p>Переключатель ширины колонки (1100 / 820 / 560 / 375 px) находится вверху страницы.</p></main></body></html>
"""


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def pack():
    (F / 'preview').mkdir(parents=True, exist_ok=True)
    cells = []
    for i, (name, cap) in enumerate(FILES, 1):
        shutil.copyfile(R / 'dist' / 'bp' / name, F / name)
        assert sha(R / 'dist' / 'bp' / name) == sha(F / name)
        cells.append(f'<div class="mac"><div class="cap">HTML-макрос {i}: {cap}</div>\n{(F / name).read_text(encoding="utf-8")}</div>')
    (F / 'README.txt').write_text(README, encoding='utf-8')
    (F / 'preview' / 'bp.html').write_text(PREVIEW.replace('@@CELLS@@', '\n'.join(cells)), encoding='utf-8')
    (F / 'preview' / 'index.html').write_text(INDEX, encoding='utf-8')
    print('bp-final: файлы, README, preview')


def make_zip():
    z = F / 'bp-all.zip'
    if z.exists():
        z.unlink()
    names = [n for n, _ in FILES] + ['README.txt', 'preview/index.html', 'preview/bp.html'] + sorted(str(p.relative_to(F)) for p in (F / 'screens').glob('*.png'))
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
        for n in names:
            zf.write(F / n, n)
    print('bp-all.zip', round(z.stat().st_size / 1024, 1), 'КБ;', len(names), 'файлов')


make_zip() if sys.argv[1:] == ['zip'] else pack()
