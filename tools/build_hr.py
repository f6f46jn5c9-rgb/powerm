# Сборка hr-final/: копии src/hr -> hr-final, preview/, README.txt, zip. Запуск: python3 tools/build_hr.py
import os, shutil, zipfile, hashlib
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S, F = os.path.join(R, 'src/hr'), os.path.join(R, 'hr-final')
FILES = ['1-hr-hero.html', '2-hr-cbl-open.html', '3-hr-cbl-close.html']
os.makedirs(os.path.join(F, 'preview'), exist_ok=True); os.makedirs(os.path.join(F, 'screens'), exist_ok=True)
for f in FILES: shutil.copyfile(os.path.join(S, f), os.path.join(F, f))
rd = lambda f: open(os.path.join(S, f), encoding='utf-8').read()
cbl = ('<ul><li><a href="#">Адаптация нового сотрудника</a></li><li><a href="#">Оценка и развитие персонала</a></li>'
       '<li><a href="#">Кадровый резерв: как мы его строим</a></li><li><a href="#">Вовлечённость и обратная связь</a></li></ul>')
cap = lambda t: '<div class="pv-cap">%s</div>' % t
page = '''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Предпросмотр: HR / Команда</title>
<style>
.pv-b{margin:0;background:#f4f6f8;font:14px/1.4 Arial,sans-serif;color:#1F2A33}
.pv-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 16px;background:#fff;border-bottom:1px solid #E3EAED}
.pv-bar button{padding:6px 12px;border:1px solid #5B6670;border-radius:6px;background:#fff;color:#1F2A33;font:600 14px Arial,sans-serif;cursor:pointer}
.pv-bar button[aria-pressed="true"]{background:#a03060;border-color:#a03060;color:#fff}
.pv-body{padding:16px}
#pv-col{width:1000px;max-width:100%;margin:0 auto;padding:16px;background:#fff}
.pv-cap{margin:16px 0 8px;font:600 12px Arial,sans-serif;color:#5B6670}
.pv-cap:first-child{margin-top:0}
</style></head>
<body class="pv-b">
<div class="pv-bar"><span>Ширина колонки:</span>
<button type="button" data-w="1100" aria-pressed="false">1100</button><button type="button" data-w="820" aria-pressed="false">820</button><button type="button" data-w="560" aria-pressed="false">560</button><button type="button" data-w="375" aria-pressed="false">375</button><button type="button" data-w="1000" aria-pressed="true">1000</button></div>
<div class="pv-body"><div id="pv-col">
''' + cap('HTML-макрос 1 — hero + миссия (1-hr-hero.html)') + '\n' + rd(FILES[0]) + '\n' + cap('HTML-макрос 2 — метка «Практики» + открывающий div (2-hr-cbl-open.html); ниже — имитация нативного макроса «Содержимое по меткам», метка см_персонал') + '\n' + rd(FILES[1]) + cbl + '\n' + cap('HTML-макрос 3 — закрывающий div (3-hr-cbl-close.html)') + '\n' + rd(FILES[2]) + '''
</div></div>
<script>(function(){var c=document.getElementById('pv-col'),bs=document.querySelectorAll('.pv-bar button');
bs.forEach(function(b){b.addEventListener('click',function(){c.style.width=b.getAttribute('data-w')+'px';bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')})})})})();</script>
</body></html>
'''
open(os.path.join(F, 'preview/hr-preview.html'), 'w', encoding='utf-8').write(page)
open(os.path.join(F, 'preview/index.html'), 'w', encoding='utf-8').write('<!doctype html><html lang="ru"><meta charset="utf-8"><title>Предпросмотр</title><body style="font:16px Arial;margin:24px"><h1 style="font-size:22px">Предпросмотр</h1><ul><li><a href="hr-preview.html">HR / Команда — все 3 макроса подряд</a></li></ul></body></html>\n')
# zip (после README и скриншота)
def pack():
    z = os.path.join(F, 'hr-all.zip')
    if os.path.exists(z): os.remove(z)
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, _, fs in os.walk(F):
            for f in sorted(fs):
                p = os.path.join(root, f)
                if p != z: zf.write(p, os.path.join('hr-final', os.path.relpath(p, F)))
if os.path.exists(os.path.join(F, 'README.txt')): pack()
for f in FILES: print(f, os.path.getsize(os.path.join(F, f)), hashlib.sha256(open(os.path.join(F, f), 'rb').read()).hexdigest()[:12])
