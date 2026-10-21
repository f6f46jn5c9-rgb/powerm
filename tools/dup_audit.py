"""Аудит дублей текста комплекса ДБВ: «один факт — одно место».
Берёт собранные блоки dist (хаб — dist/NN-*.html, страницы — dist/<страница>/NN-*.html), рендерит их в Chromium (Playwright, node),
выгружает текст по абзацам/ячейкам/пунктам, режет на предложения ≥ 7 слов, нормализует (регистр, пробелы, пунктуация)
и ищет предложения и абзацы, которые встречаются в блоках РАЗНЫХ страниц. Допустимые повторы — tools/dup_allow.txt
(строка файла = нормализованный фрагмент; повтор разрешён, если содержит или совпадает с ним). Нерасшифрованных повторов должно быть 0.
Запуск: python3 tools/dup_audit.py   (нужны node и playwright; путь к модулю — переменная PLAYWRIGHT_NODE или глобальный npm)"""
import json, os, pathlib, re, subprocess, sys, tempfile

R = pathlib.Path(__file__).resolve().parent.parent
PAGES = {'hub': 'dist', 'stages': 'dist/stages', 'rhythm': 'dist/rhythm', 'assets': 'dist/assets', 'roles': 'dist/roles', 'grade': 'dist/grade'}
BLOCK_SEL = 'p,li,td,th,dt,dd,h2,h3,h4,button,.dbv-flow__t,.dbv-flow__c,.dbv-sc__t,.dbv-sc__s,.dbv-scale__t,.dbv-scale__kt,.dbv-r,.dbv-hero__eyebrow,.dbv-hero__lab,.dbv-lane'
JS = r"""
const pw = require(process.env.PLAYWRIGHT_NODE || 'playwright');
const fs = require('fs');
(async () => {
  const files = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const sel = %s;
  const b = await pw.chromium.launch();
  const out = [];
  for (const f of files) {
    const pg = await b.newPage({ viewport: { width: 1000, height: 900 } });
    await pg.setContent('<!DOCTYPE html><html><body><div style="width:952px">' + fs.readFileSync(f.path, 'utf8') + '</div></body></html>');
    await pg.waitForTimeout(250);
    const paras = await pg.evaluate((sel) => {
      const root = document.querySelector('body > div > div[class^="dbv-"]');
      if (!root) return [];
      const all = [...root.querySelectorAll(sel)];
      return all.filter(e => !e.querySelector(sel)).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
    }, sel);
    out.push({ page: f.page, file: f.name, paras });
    await pg.close();
  }
  fs.writeFileSync(process.argv[3], JSON.stringify(out));
  await b.close();
})();
""" % json.dumps(BLOCK_SEL)


def norm(s):
    s = s.lower().replace('ё', 'е')
    s = re.sub(r'[^\w\s]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def sentences(p):
    parts = re.split(r'(?<=[.!?])\s+(?=[«"A-ZА-ЯЁ0-9])|;\s+', p)
    return [x for x in parts if len(norm(x).split()) >= 7]


def main():
    files = []
    for page, d in PAGES.items():
        for f in sorted((R / d).glob('[0-9]*.html')):
            if page == 'hub' and f.name.startswith(('01-docs', '01-instr', '01-logo', '01-owner', '01-polar', '02-cta', '03-catalog', '04-new', '05-cur')):
                continue
            files.append({'page': page, 'name': f'{d}/{f.name}', 'path': str(f)})
    tmp = pathlib.Path(tempfile.mkdtemp())
    (tmp / 'in.json').write_text(json.dumps(files), encoding='utf-8')
    (tmp / 'dump.js').write_text(JS, encoding='utf-8')
    env = dict(os.environ)
    if 'PLAYWRIGHT_NODE' not in env:
        root = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()
        env['PLAYWRIGHT_NODE'] = root + '/playwright'
    subprocess.run(['node', str(tmp / 'dump.js'), str(tmp / 'in.json'), str(tmp / 'out.json')], check=True, env=env)
    data = json.loads((tmp / 'out.json').read_text(encoding='utf-8'))
    allow = [norm(l) for l in (R / 'tools/dup_allow.txt').read_text(encoding='utf-8').splitlines() if l.strip() and not l.startswith('#')]
    seen = {}  # нормализованный фрагмент -> {(страница, файл): исходный текст}
    for blk in data:
        for p in blk['paras']:
            units = {norm(p): p} if len(norm(p).split()) >= 7 else {}
            for s in sentences(p):
                units[norm(s)] = s
            for k, v in units.items():
                seen.setdefault(k, {})[(blk['page'], blk['file'])] = v
    bad, ok = [], []
    for k, where in seen.items():
        if len({pg for pg, _ in where}) < 2:
            continue
        (ok if any(a and a in k for a in allow) else bad).append((k, where))
    # дополнительно: общие последовательности из 8 слов в блоках разных страниц (частичные пересказы)
    grams = {}
    for blk in data:
        words = norm(' '.join(blk['paras'])).split()
        for i in range(len(words) - 7):
            grams.setdefault(' '.join(words[i:i + 8]), set()).add((blk['page'], blk['file']))
    part = sorted({g for g, w in grams.items() if len({pg for pg, _ in w}) > 1 and not any(a and (a in g or g in a) for a in allow)})
    print(f'Блоков: {len(data)}; предложений/абзацев ≥ 7 слов: {len(seen)}; всего абзацев/ячеек: {sum(len(b["paras"]) for b in data)}')
    print(f'Общие 8-словные фрагменты в блоках разных страниц: {len(part)}')
    for g in part[:20]:
        print('    ~', g, [f for _, f in sorted(grams[g])])
    print(f'Повторы между страницами: допустимых (dup_allow.txt) — {len(ok)}, нерасшифрованных — {len(bad)}')
    for tag, arr in (('ДОПУСТИМО', ok), ('НЕРАСШИФРОВАНО', bad)):
        for k, where in arr:
            print(f'[{tag}] {next(iter(where.values()))}')
            for (pg, f) in where:
                print(f'    - {f}')
    sys.exit(1 if (bad or part) else 0)


main()
