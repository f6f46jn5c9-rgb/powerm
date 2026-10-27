"""Сверка видимого текста страниц «Чемпионат» с заданием: список всех отличий. Запуск: python3 tools/chp_text_check.py"""
import json, os, pathlib, subprocess, sys, tempfile

R = pathlib.Path(__file__).resolve().parent.parent
EXPECT = {
    'hub': ['Чемпионат 2026', 'Голосование', 'Скоро',
            'Чемпионат лучших практик Бизнес-системы "Силовые Машины" 2026',
            'Цель',
            'Обменяться лучшими практиками для сохранения конкурентного преимущества: повышения операционной эффективности и качества продукции, клиентоориентированности в новых условиях, самоуправления и вовлеченности персонала, опытом использования автоматизации и роботизации',
            'Номинации', 'Операционная эффективность', 'Цифровизация', 'Человекоцентричность', 'Проголосовать', 'Скоро'],
    'voting': ['Чемпионат 2026', 'Скоро', 'Голосование',
               'Голосование чемпионата лучших практик Бизнес-системы "Силовых машин" 2026',
               'Проголосуйте за лучшие практики по номинациям.',
               'Правила голосования', 'Голосовать может любой сотрудник.', 'Свой голос можно изменить.', 'Кто за кого проголосовал, не видно.'],
}
JS = r"""const pw=require('playwright');const fs=require('fs');(async()=>{const b=await pw.chromium.launch();const o={};
for(const [k,f] of Object.entries(JSON.parse(process.argv[2]))){const p=await b.newPage();await p.setContent('<body>'+fs.readFileSync(f,'utf8')+'</body>');
o[k]=await p.evaluate(()=>{const r=document.createTreeWalker(document.querySelector('.chp-root'),NodeFilter.SHOW_TEXT);const a=[];
for(let n;(n=r.nextNode());){const t=n.textContent.replace(/\s+/g,' ').trim();if(t)a.push(t);}
return a;});}
console.log(JSON.stringify(o));await b.close();})()"""


def main():
    files = {'hub': str(R / 'dist/chp/hub.html'), 'voting': str(R / 'dist/chp/voting.html')}
    env = dict(os.environ, NODE_PATH=os.environ.get('NODE_PATH', '/opt/node-tools/node_modules'))
    out = json.loads(subprocess.run(['node', '-e', JS.replace('argv[2]', 'argv[1]'), json.dumps(files)], capture_output=True, text=True, env=env, check=True).stdout)
    # узлы h1 режутся на «текст» + «2026» (акцентный span) — склеиваем
    diffs = 0
    for page, exp in EXPECT.items():
        got = out[page]
        merged, i = [], 0
        while i < len(got):
            if i + 1 < len(got) and got[i + 1] == '2026' and got[i].endswith(' ') is False and 'лучших практик' in got[i]:
                merged.append(got[i] + ' 2026'); i += 2
            else:
                merged.append(got[i]); i += 1
        print(f'--- {page}: на странице {len(merged)} текстовых узлов, ожидается {len(exp)}')
        for e in exp:
            if e not in merged:
                print('  ОТЛИЧИЕ: нет дословно:', e[:70]); diffs += 1
        extra = [m for m in merged if m not in exp]
        for m in extra:
            print('  ОТЛИЧИЕ: лишний текст:', m); diffs += 1
    print('Отличий:', diffs)
    return 0 if diffs == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
