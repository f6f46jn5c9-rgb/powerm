"""Сдача комплекса Чемпионат: champ-final/ (файлы, README, preview/, screens/, champ-all.zip). Скриншоты — отдельно: node tools/shot_champ.js"""
import pathlib, shutil, zipfile, hashlib, html
R = pathlib.Path(__file__).resolve().parent.parent
F = R / 'champ-final'
MAP = [('champ-hub', '1-hub-champioat.html', 'Хаб «Чемпионат лучших практик»', '584516251'),
       ('champ-golos', '2-golos-champion.html', 'Голосование 2026', '584516288'),
       ('champ-2023', '3-2023-champion.html', 'Чемпионат 2023', '202375778'),
       ('champ-2024', '4-2024-champion.html', 'Чемпионат 2024', '306053122'),
       ('champ-2025', '5-2025-champion.html', 'Чемпионат 2025', '410419331')]
(F / 'preview').mkdir(parents=True, exist_ok=True)
(F / 'screens').mkdir(exist_ok=True)
for src, name, cap, pid in MAP:
    t = (R / 'dist' / f'{src}.html').read_text(encoding='utf-8')
    (F / name).write_text(t, encoding='utf-8', newline='')
    pv = ('<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
          f'<title>Превью: {cap}</title><style>.pv-body{{margin:0;background:#f4f5f6;font-family:Arial,sans-serif}}'
          '.pv-bar{display:flex;gap:8px;align-items:center;padding:12px 24px;background:#fff;border-bottom:1px solid #ddd;font-size:14px}'
          '.pv-bar button{font:inherit;padding:6px 12px;border:1px solid #1b3d7a;background:#fff;color:#1b3d7a;border-radius:4px;cursor:pointer}'
          '.pv-bar button[aria-pressed="true"]{background:#1b3d7a;color:#fff}'
          '.pv-col{width:1000px;max-width:100%;margin:0 auto;padding:24px;background:#fff;box-sizing:border-box}</style></head>'
          f'<body class="pv-body"><div class="pv-bar"><span>{cap}. Ширина колонки:</span>'
          + ''.join(f'<button type="button" data-w="{w}" aria-pressed="{"true" if w==1000 else "false"}">{w}</button>' for w in (1100, 1000, 820, 560, 375)) +
          f'</div><div class="pv-col" id="pv-col">\n{t}</div>'
          '<script>(function(){var c=document.getElementById("pv-col"),b=document.querySelectorAll(".pv-bar button");'
          'for(var i=0;i<b.length;i++){b[i].addEventListener("click",function(){c.style.width=this.getAttribute("data-w")+"px";'
          'for(var j=0;j<b.length;j++){b[j].setAttribute("aria-pressed",b[j]===this?"true":"false");}});}})();</script></body></html>')
    (F / 'preview' / f'{src}.html').write_text(pv, encoding='utf-8')
(F / 'preview' / 'index.html').write_text(
    '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Превью: Чемпионат лучших практик</title></head><body style="font-family:Arial,sans-serif;max-width:640px;margin:32px auto"><h1>Чемпионат лучших практик — превью</h1><ul>'
    + ''.join(f'<li><a href="{s}.html">{c}</a></li>' for s, n, c, p in MAP) + '</ul></body></html>', encoding='utf-8')
rows = '\n'.join(f'{c:<34} https://kb.severstal.com/spaces/BSS/pages/{p}/   ->  {n}' for s, n, c, p in MAP)
(F / 'README.txt').write_text(f'''ЧЕМПИОНАТ ЛУЧШИХ ПРАКТИК 2026. СМ — файлы для вставки в Confluence (kb.severstal.com, space BSS)

Страница в Confluence -> файл
{rows}

Как заменить (для каждой страницы):
1. Открыть страницу и нажать «Редактировать».
2. Удалить старые HTML-макросы со страницы.
3. Вставить ОДИН новый HTML-макрос и целиком вставить в него содержимое нужного файла.
4. Сохранить («Опубликовать»).

Примечания:
- На странице «Голосование 2026» нативный макрос Poll добавляется вручную после HTML-макроса.
- Макросы Content by Label (CBL) на дочерних страницах добавляются отдельно.
- Просмотр без интернета: открыть preview/index.html.
- Скриншоты (колонка 1100 px): screens/.
''', encoding='utf-8')
z = F / 'champ-all.zip'
z.unlink(missing_ok=True)
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in sorted(F.rglob('*')):
        if p.is_file() and p != z:
            zf.write(p, p.relative_to(F).as_posix())
for s, n, c, p in MAP:
    a = hashlib.sha256((R / 'dist' / f'{s}.html').read_bytes()).hexdigest(); b = hashlib.sha256((F / n).read_bytes()).hexdigest()
    assert a == b, n
    print(n, round((F / n).stat().st_size / 1024, 1), 'КБ  sha256 ok')
