"""Упаковка hub-hr-final/: файл для вставки, превью, README, zip. Запуск после build_hub_production.py и скриншота.
python3 tools/pack_hub_production.py [--preview-only]"""
import pathlib, shutil, hashlib, zipfile, sys
R = pathlib.Path(__file__).resolve().parent.parent
F = R / 'hub-hr-final'
dist = (R / 'dist/hub-hr.html').read_text(encoding='utf-8')

PREVIEW = '''<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Превью: HR и обучение</title>
<style>.pv-body{margin:0;background:#f4f5f6;font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif}
.pv-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:12px 16px;font-size:14px;color:#1F2A33}
.pv-bar button{font:inherit;padding:6px 14px;border:1px solid #6b7280;background:#fff;color:#1F2A33;cursor:pointer;border-radius:4px}
.pv-bar button[aria-pressed="true"]{background:#1a2a5e;color:#fff;border-color:#1a2a5e}
.pv-bar button:focus-visible{outline:3px solid #1a2a5e;outline-offset:2px}
.pv-col{width:1000px;max-width:100%;margin:0 auto 24px;padding:0;background:#fff;box-sizing:border-box}
.pv-col .cap{font-size:12px;color:#5B6670;margin:0 0 8px;padding:8px 0 0}</style></head>
<body class="pv-body"><div class="pv-bar" role="group" aria-label="Ширина колонки">Ширина колонки, px: <button type="button" data-w="1100" aria-pressed="false">1100</button><button type="button" data-w="820" aria-pressed="false">820</button><button type="button" data-w="560" aria-pressed="false">560</button><button type="button" data-w="375" aria-pressed="false">375</button></div>
<div class="pv-col" id="pv-col"><div class="mac"><div class="cap">HTML-макрос 1</div>
@@BLOCKS@@
</div></div>
<script>(function(){var col=document.getElementById('pv-col'),bs=document.querySelectorAll('.pv-bar button');
function set(w){col.style.width=w+'px';for(var i=0;i<bs.length;i++)bs[i].setAttribute('aria-pressed',bs[i].getAttribute('data-w')===String(w)?'true':'false');}
for(var i=0;i<bs.length;i++)bs[i].addEventListener('click',function(){set(this.getAttribute('data-w'));});})();</script></body></html>
'''
README = '''Страница "HR и обучение" -> 1 HTML-макрос (файл 1-hub-hr.html: шапка, вкладки HR | БССМ, кнопка "Будь в курсе").

ШАГИ
1. Открыть страницу на редактирование.
2. Удалить старые HTML-макросы.
3. Вставить макрос HTML и скопировать в него целиком содержимое файла 1-hub-hr.html.
4. Сохранить.

ВАЖНО
- Вкладки HR / БССМ сбрасываются при обновлении страницы (по умолчанию открыта HR) - это норма: состояние нигде не хранится.
- Ссылки URL_PLACEHOLDER_* заменить на реальные: URL_PLACEHOLDER_STARTOVAYA (крошка "БУП"), URL_PLACEHOLDER_ПОДБОР, _КАДРЫ, _ОБУЧЕНИЕ, _ООТ, _АСО (вкладка HR), URL_PLACEHOLDER_УП, _AGILE, _УСТОЙЧИВОСТЬ, _ШКОЛА, _МИНИТ (вкладка БССМ), URL_PLACEHOLDER_БУДЬ_В_КУРСЕ (кнопка).
- После вставки добавить нативные макросы "Содержимое по меткам" с тегами раздел_hr и раздел_методология рядом с заглушками (в HTML-макрос нативный макрос вставить нельзя). Макрос с раздел_hr поставить под страницей рядом с заглушкой вкладки HR, с раздел_методология - рядом с заглушкой вкладки БССМ.

СОСТАВ
preview/ - предпросмотр без интернета (переключатель ширины 1100/820/560/375).
screens/ - снимок страницы при ширине колонки 1100 px (вкладка HR).
'''
F.mkdir(exist_ok=True); (F/'preview').mkdir(exist_ok=True)
(F/'preview/hub-hr-preview.html').write_text(PREVIEW.replace("@@BLOCKS@@", dist), encoding='utf-8')
if '--preview-only' in sys.argv: sys.exit(0)
(F/'screens').mkdir(exist_ok=True)
shutil.copyfile(R/'dist/hub-hr.html', F/'1-hub-hr.html')
(F/'README.txt').write_text(README, encoding='utf-8')
assert hashlib.sha256((F/'1-hub-hr.html').read_bytes()).hexdigest() == hashlib.sha256((R/'dist/hub-hr.html').read_bytes()).hexdigest()
z = F/'hub-hr-all.zip'
if z.exists(): z.unlink()
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in ['1-hub-hr.html','README.txt','preview/hub-hr-preview.html']: zf.write(F/p, p)
    for p in sorted((F/'screens').glob('*.png')): zf.write(p, 'screens/'+p.name)
print('ok', z.stat().st_size)
