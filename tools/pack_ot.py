"""Пакет «Охрана труда»: ot-final/ (3 файла, README, preview, zip). Запуск после build_ot.py и check_ot.js."""
import pathlib, hashlib, zipfile
R = pathlib.Path(__file__).resolve().parent.parent
F = R/'ot-final'; (F/'preview').mkdir(parents=True, exist_ok=True); (F/'screens').mkdir(exist_ok=True)
names = ['ot-hub-1-hero.html', 'ot-hub-2-cbl-open.html', 'ot-hub-3-cbl-close.html']
for n in names: (F/('1-'+n)).write_bytes((R/'dist'/n).read_bytes())
h1, h2, h3 = [(R/'dist'/n).read_text(encoding='utf-8') for n in names]
fake = ''.join(f'<li><a href="#">{t}</a></li>' for t in ['Практика ОТ 1 (пример строки CBL)', 'Практика ОТ 2 (пример строки CBL)', 'Практика ОТ 3 (пример строки CBL)'])
pv = f'''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: Охрана труда. Силовые машины</title>
<style>
body{{margin:0;font:14px Arial,sans-serif;background:#eef0f3;color:#1a1a2e}}
.pv-bar{{padding:10px 16px;background:#fff;border-bottom:1px solid #d5d9e0}}
.pv-bar button{{font:14px Arial;padding:6px 12px;margin-right:6px;border:1px solid #4a7628;background:#fff;color:#2f5a14;border-radius:4px;cursor:pointer}}
.pv-bar button[aria-pressed=true]{{background:#4a7628;color:#fff}}
.pv-body{{padding:16px}}
#pv-col{{width:1000px;max-width:100%;margin:0 auto;background:#fff;padding:0 16px 16px}}
.cap{{margin:12px 0 4px;padding:2px 8px;background:#fff6d6;color:#5b4a00;font-size:12px;display:inline-block;border:1px dashed #b89b00}}
.fake{{margin:16px 0 0;padding:8px;border:1px dashed #999;color:#444;font-size:12px}}
</style></head><body>
<div class="pv-bar" role="group" aria-label="Ширина колонки">Ширина колонки: <button data-w="1100">1100</button><button data-w="820">820</button><button data-w="560">560</button><button data-w="375">375</button><button data-w="1000" aria-pressed="true">1000</button></div>
<div class="pv-body"><div id="pv-col">
<div class="cap">Макрос 1 — HTML: hero</div>
{h1}
<div class="cap">Макрос 2 — HTML: открывающая обёртка CBL</div>
{h2}
<div class="fake">Позиция 3 — здесь нативный «Content by Label» (в предпросмотре — имитация списка)<ul>{fake}</ul></div>
{h3}
<div class="cap">Макрос 4 — HTML: закрывающая обёртка CBL</div>
</div></div>
<script>
document.querySelectorAll('.pv-bar button').forEach(function(b){{b.addEventListener('click',function(){{document.getElementById('pv-col').style.width=b.dataset.w+'px';document.querySelectorAll('.pv-bar button').forEach(function(x){{x.setAttribute('aria-pressed',x===b)}})}})}});
</script></body></html>'''
(F/'preview/ot-hub-preview.html').write_text(pv, encoding='utf-8')
(F/'preview/index.html').write_text('<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Предпросмотр: Охрана труда</title></head><body style="font:16px Arial;margin:24px"><h1>Охрана труда. Силовые машины</h1><ul><li><a href="ot-hub-preview.html">Предпросмотр страницы (макросы 1, 2, 4)</a></li></ul></body></html>', encoding='utf-8')
(F/'README.txt').write_text('''Страница "Охрана труда. Силовые машины" (Тип А, хаб-страница) -> 3 HTML-макроса + нативный Content by Label.
Confluence: kb.severstal.com, пространство BSS, https://kb.severstal.com/spaces/BSS/pages/520651883/

СОСТАВ СТРАНИЦЫ (порядок сверху вниз)
Позиция | Что это                          | Файл
1       | HTML-макрос: белый hero          | 1-ot-hub-1-hero.html
2       | HTML-макрос: открывающая обёртка | 1-ot-hub-2-cbl-open.html
3       | нативный макрос Content by Label | вставляется вручную (файла нет)
4       | HTML-макрос: закрывающая обёртка | 1-ot-hub-3-cbl-close.html

ВАЖНО: файл -2-cbl-open намеренно оставляет открытый <div>, файл -3-cbl-close его закрывает (там только </div>).
Между ними ОБЯЗАТЕЛЬНО стоит CBL, иначе список не получит оформление. Порядок не менять.

МЕТКА ДЛЯ CBL
Укажите метку, которая стоит на страницах практик охраны труда в пространстве BSS (рекомендация: "охрана-труда" / "ohrana-truda" - сверьте с фактической меткой на практиках; в репозитории меток нет, поэтому она не проверялась).
Настройки макроса: пространство BSS, метка - как выше, стиль отображения - только заголовки (список), сортировка по названию.

ЗАМЕНА НА СТРАНИЦЕ (4 шага)
1. Открыть страницу на редактирование, удалить старые макросы hero/списка.
2. Вставить HTML-макрос, содержимое файла 1-ot-hub-1-hero.html. Ниже вставить второй HTML-макрос с содержимым 1-ot-hub-2-cbl-open.html.
3. Ниже вставить нативный "Content by Label" и указать метку практик ОТ. Ниже него вставить третий HTML-макрос с содержимым 1-ot-hub-3-cbl-close.html.
4. Сохранить и проверить: hero сверху, под ним список практик, ссылки оливковые.

СОСТАВ ПАПКИ
preview/ - предпросмотр без интернета (preview/index.html; ширины 1100/820/560/375).
screens/ - снимок при ширине колонки 1100 px.
ot-all.zip - архив всего вышеперечисленного.
''', encoding='utf-8')
with zipfile.ZipFile(F/'ot-all.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for p in sorted(F.rglob('*')):
        if p.is_file() and p.name != 'ot-all.zip': z.write(p, p.relative_to(F))
for n in names:
    a = hashlib.sha256((F/('1-'+n)).read_bytes()).hexdigest(); b = hashlib.sha256((R/'dist'/n).read_bytes()).hexdigest()
    assert a == b; print(a[:16], n)
