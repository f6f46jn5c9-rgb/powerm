"""Сборка страницы «Полезные материалы программы ДБВ»: src/materials/dbv-materials.html -> dist/materials/dbv-materials.html
и превью preview-dbv-materials.html (колонка 1000 px, «HTML-макрос 1», панель ширин, скрипт-заглушка fetch с ТЕСТОВЫМИ данными).
В маркер /*CORE*/ подставляется база src/core/dbv-core.css (токены, ссылки, фокус, аккордеон) с корнем .dbv-mat; лишние правила отбрасываются.
Запуск: python3 tools/build_materials.py. Файлы других комплексов не трогает."""
import pathlib, re, sys

R = pathlib.Path(__file__).resolve().parent.parent
ROOT, MAX_KB = 'dbv-mat', 38
SECTION = re.compile(r'/\*@(\w+)\*/(.*?)/\*@end\*/', re.S)


def mini(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s*\n\s*', ' ', css)
    return re.sub(r'\s*([{};])\s*', r'\1', css).strip()


def purge(css, used):
    # из core остаются правила, у которых все классы dbv-* есть в разметке или скрипте блока
    def ok(sel):
        return any(all(c in used for c in re.findall(r'\.(dbv-[\w-]+)', x)) for x in sel.split(',') if x.strip())

    def walk(txt):
        out, i = [], 0
        while i < len(txt):
            j = txt.find('{', i)
            if j < 0:
                out.append(txt[i:]); break
            head, d, k = txt[i:j], 1, j + 1
            while d:
                d += {'{': 1, '}': -1}.get(txt[k], 0); k += 1
            body = txt[j + 1:k - 1]
            if head.strip().startswith(('@container', '@media')):
                inner = walk(body)
                if inner.strip():
                    out.append(head + '{' + inner + '}')
            elif ok(head):
                out.append(head + '{' + body + '}')
            i = k
        return ''.join(out)
    return walk(css)


def build():
    src = (R / 'src/materials/dbv-materials.html').read_text(encoding='utf-8')
    core = (R / 'src/core/dbv-core.css').read_text(encoding='utf-8')
    core = SECTION.sub('', core).replace('.ROOT', '.' + ROOT)
    own = src.replace('/*CORE*/', '')
    used = set(re.findall(r'dbv-[\w-]+', own))
    m = re.search(r'<style>(.*?)</style>', src, re.S)
    before, after = m.group(1).split('/*CORE*/')
    css = mini(before) + '\n' + purge(mini(core), used) + '\n' + mini(after)
    out = src.replace(m.group(0), '<style>\n' + css + '\n</style>')
    out = out.strip() + '\n'
    p = R / 'dist/materials/dbv-materials.html'
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(out, encoding='utf-8')
    kb = len(out.encode('utf-8')) / 1024
    print(f'dist/materials/dbv-materials.html  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
    return out, kb <= MAX_KB


# ТЕСТОВЫЕ данные только для превью (в блок не попадают)
STUB = r"""<script>
/* ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ПРЕВЬЮ: подмена fetch; в Confluence не попадает */
(function () {
  var MB = 1048576, F = [
    ['Активы проекта.mp4', 182.4], ['Запись встречи_Отчеты в ПЗ.mp4', 96.1], ['Метрики_21.05.mp4', 54.7], ['Отчет по проекту в Полярной звезде.mp4', 120.9],
    ['Актив проекта - что это такое.pptx', 4.3], ['Вопросы для самопроверки.pdf', 3.0],
    ['1_Качественный продукт вовремя.pdf', 2.4], ['2_Доверие клиентов.pdf', 1.8], ['3_Эффективные процессы.pdf', 3.1], ['4_Развитие команды.pdf', 0.6],
    ['5_Проектные треки.pdf', 5.2], ['6_Управление рисками.pdf', 2.2], ['7_Ритм проекта.pdf', 1.1], ['10_Итоги года.pdf', 13.5], ['11_Планы на следующий год.pdf', 7.9],
    ['Выступление АВ Подколзина Силовые машины.pdf', 9.7], ['Выступление Заводской кейс - запуск участка и тиражирование решений.pdf', 6.4],
    ['Лучшие практики проектов (итоги).pdf', 4.8], ['Школа проектного управления.pdf', 3.6]
  ];
  var res = window.fetch;
  window.fetch = function (u, o) {
    if (/\/rest\/api\/content\/[^/]+\/child\/attachment/.test(String(u))) {
      var results = F.map(function (f, i) {
        return { id: 'att' + i, title: f[0], extensions: { fileSize: Math.round(f[1] * MB) }, _links: { download: '/download/attachments/1/' + encodeURIComponent(f[0]) + '?version=1' } };
      });
      var body = JSON.stringify({ results: results, size: results.length, _links: { base: 'https://kb.example/test' } });
      return Promise.resolve(new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    return res.apply(this, arguments);
  };
  if (!document.querySelector('meta[name="ajs-page-id"]')) { var m = document.createElement('meta'); m.name = 'ajs-page-id'; m.content = '12345'; document.head.appendChild(m); }
})();
</script>"""

PAGE = """<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Превью: Полезные материалы программы ДБВ</title>
<style>.pv-body{margin:0;background:#f4f5f6;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.pv-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:12px 16px;font-size:14px;color:#1F2A33}
.pv-bar button{font:inherit;padding:6px 14px;border:1px solid #9aa5ab;background:#fff;color:#1F2A33;cursor:pointer}
.pv-bar button[aria-pressed="true"]{background:#007890;color:#fff;border-color:#007890}
.pv-note{max-width:1000px;margin:0 auto 8px;padding:0 24px;font-size:13px;color:#5B6670}
.pv-col{width:1000px;max-width:100%;margin:0 auto 24px;padding:24px;background:#fff;box-sizing:border-box}
.pv-col .cap{font-size:12px;color:#5B6670;margin:0 0 4px}</style></head>
<body class="pv-body"><div class="pv-bar" role="group" aria-label="Ширина колонки">Ширина колонки, px: <button type="button" data-w="1100">1100</button><button type="button" data-w="820">820</button><button type="button" data-w="560">560</button><button type="button" data-w="375">375</button></div>
<p class="pv-note">Список файлов в этом превью — ТЕСТОВЫЕ данные. На странице Confluence список берётся из вложений.</p>
<div class="pv-col" id="pv-col">
<div class="mac"><div class="cap">HTML-макрос 1</div>
@@STUB@@
@@BLOCK@@</div>
</div>
<script>(function(){var c=document.getElementById('pv-col'),bs=document.querySelectorAll('.pv-bar button');
function set(w){c.style.width=w+'px';for(var i=0;i<bs.length;i++)bs[i].setAttribute('aria-pressed',bs[i].getAttribute('data-w')==w?'true':'false');}
for(var i=0;i<bs.length;i++)bs[i].addEventListener('click',function(){set(this.getAttribute('data-w'));});})();</script></body></html>
"""


def main():
    out, ok = build()
    (R / 'preview-dbv-materials.html').write_text(PAGE.replace('@@STUB@@', STUB).replace('@@BLOCK@@', out), encoding='utf-8')
    print('preview-dbv-materials.html')
    sys.exit(0 if ok else 1)


main()
