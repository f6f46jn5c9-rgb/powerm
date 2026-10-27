"""Аудит дублей комплекса «Чемпионат»: «один факт — одно место». Рендерит dist/chp/*.html в Chromium, выгружает текст по
абзацам/пунктам/заголовкам и ищет совпадения МЕЖДУ страницами: (1) любые длинные фразы (≥ 4 слов подряд), заголовки h1 заданы заданием и исключены,
(2) целые элементы текста. Допустимо только: названия страниц во вкладках и кнопка «Проголосовать».
Запуск: python3 tools/chp_dup_audit.py (нужны node и playwright)"""
import json, os, pathlib, re, subprocess, sys, tempfile

R = pathlib.Path(__file__).resolve().parent.parent
PAGES = {'hub': 'dist/chp/hub.html', 'voting': 'dist/chp/voting.html'}
ALLOWED = {'чемпионат 2026', 'голосование', 'проголосовать', 'скоро', 'разделы чемпионата'}
WINDOW = 4
JS = r"""
const pw = require(process.env.PLAYWRIGHT_NODE || 'playwright'); const fs = require('fs');
(async () => { const files = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const b = await pw.chromium.launch(); const out = [];
for (const f of files) { const p = await b.newPage(); await p.setContent('<body><div style="width:1000px">' + fs.readFileSync(f.path, 'utf8') + '</div></body>');
 const items = await p.evaluate(() => { const sel = 'p,li,h1,h2,h3,a,span.chp-nav__i,.chp-btn,.chp-soon'; const all = [...document.querySelectorAll('.chp-root ' + sel)];
  return all.filter(e => !e.querySelector(sel)).map(e => [e.tagName, e.textContent.replace(/\s+/g, ' ').trim()]).filter(x => x[1]); });
 out.push({ page: f.page, items }); await p.close(); }
fs.writeFileSync(process.argv[3], JSON.stringify(out)); await b.close(); })();
"""
norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[^\w\s]', ' ', s.lower().replace('ё', 'е'))).strip()


def main():
    tmp = pathlib.Path(tempfile.mkdtemp())
    (tmp / 'in.json').write_text(json.dumps([{'page': k, 'path': str(R / v)} for k, v in PAGES.items()]))
    (tmp / 'dump.js').write_text(JS)
    env = dict(os.environ, NODE_PATH=os.environ.get('NODE_PATH', '/opt/node-tools/node_modules'))
    subprocess.run(['node', str(tmp / 'dump.js'), str(tmp / 'in.json'), str(tmp / 'out.json')], check=True, env=env)
    data = json.loads((tmp / 'out.json').read_text())
    items = {d['page']: [norm(x) for tag, x in d['items'] if tag != 'H1'] for d in data}
    h1 = {d['page']: [norm(x) for tag, x in d['items'] if tag == 'H1'] for d in data}
    grams = {}
    for page, its in items.items():
        for it in its:
            w = it.split()
            for i in range(max(0, len(w) - WINDOW + 1)):
                grams.setdefault(' '.join(w[i:i + WINDOW]), set()).add(page)
    shared_grams = sorted(g for g, pg in grams.items() if len(pg) > 1)
    ha, va = set(items['hub']), set(items['voting'])
    shared_items = sorted(x for x in ha & va if x not in ALLOWED)
    allowed_hit = sorted(x for x in ha & va if x in ALLOWED)
    print('H1 страниц не сравниваются по фразам (названия заданы заданием и неизбежно общие: «лучших практик Бизнес-системы … 2026»):', h1)
    long_texts = {p: [x for x in its if len(x.split()) >= 7] for p, its in items.items()}
    print('Длинных текстов (≥ 7 слов): ' + ', '.join(f'{p}: {len(v)}' for p, v in long_texts.items()))
    print('Совпадающие элементы, разрешённые (вкладки/кнопка):', allowed_hit or '—')
    print(f'Совпадающие элементы вне разрешённых: {len(shared_items)}', shared_items)
    print(f'Совпадающие фразы из {WINDOW} слов между страницами: {len(shared_grams)}', shared_grams)
    ok = not shared_items and not shared_grams
    print('РЕЗУЛЬТАТ:', 'дублей нет' if ok else 'ЕСТЬ ДУБЛИ')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
