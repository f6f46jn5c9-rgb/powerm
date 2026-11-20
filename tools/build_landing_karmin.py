#!/usr/bin/env python3
"""Сборка стартовой страницы БУП «Севергрупп» в стиле «Кармин».

  python3 tools/build_landing_karmin.py

Для каждого исходника src/landing-karmin/modules/*.html:
  * подставляет части разметки ({{> part}}), иконки ({{ic:name}}) и статичные ссылки из CONFIG;
  * берёт из core/karmin.css, core/data.js, core/search.js только нужные блоки («/*@ имя */»);
  * скоупит CSS под корневой класс модуля (.bupk-1k01 …), ставит !important, переименовывает keyframes;
  * собирает самодостаточный фрагмент <style> + разметка + <script> (IIFE) в dist/landing-karmin/;
  * проверяет размер ≤ 38 КБ.
Затем генерирует harness для автопроверки (tools/landing_harness/) и предпросмотр (dist/landing-karmin/preview/index.html).
"""
import html
import json
import pathlib
import re
import sys
import urllib.parse

R = pathlib.Path(__file__).resolve().parent.parent
SRC = R / 'src/landing-karmin'
DIST = R / 'dist/landing-karmin'
HARN = R / 'tools/landing_harness'
LIMIT = 38 * 1024

VARIANTS = {
    '1K': ('Лаконичный', ['1K-01-hero', '1K-02-kpi-companies', '1K-03-practices-news', '1K-04-cta-sections-links']),
    '2K': ('Навигатор', ['2K-01-hero', '2K-02-navigator', '2K-03-practices-news-sections']),
    '6K': ('Полки практик', ['6K-01-hero', '6K-02-shelves', '6K-03-companies-news-cta']),
}
INITS = {'hero': 'initHero', 'search': 'initSearch', 'kpi': 'initKpi', 'companies': 'initCompanies',
         'practices': 'initPractices', 'news': 'initNews', 'cta': 'initCta', 'sections': 'initSections',
         'links': 'initLinks', 'nav': 'initNav', 'shelves': 'initShelves'}
JS_FILE = {'search': 'search.js'}


def chunks(text):
    """Разбить файл на блоки по маркерам /*@ имя */ (текст до первого маркера — шапка, отбрасывается)."""
    parts = re.split(r'/\*@ ([\w-]+) \*/', text)
    return {parts[i]: parts[i + 1] for i in range(1, len(parts), 2)}


def strip_css_comments(s):
    return re.sub(r'/\*.*?\*/', '', s, flags=re.S)


def split_top(s, sep=','):
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == sep and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += ch
    out.append(cur)
    return [x.strip() for x in out if x.strip()]


def match_brace(s, i):
    depth = 0
    for k in range(i, len(s)):
        if s[k] == '{':
            depth += 1
        elif s[k] == '}':
            depth -= 1
            if depth == 0:
                return k
    raise ValueError('unbalanced braces near: ' + s[i:i + 80])


def important(body):
    decls = []
    for d in split_top(body, ';'):
        if d.startswith('--') or d.endswith('!important'):
            decls.append(d)
        else:
            decls.append(d + '!important')
    return ';'.join(decls)


def scope_css(css, root, stats):
    css = strip_css_comments(css)
    out, i = [], 0
    while True:
        j = css.find('{', i)
        if j < 0:
            break
        prelude = ' '.join(css[i:j].split())
        k = match_brace(css, j)
        body = css[j + 1:k]
        if prelude.startswith(('@media', '@container', '@supports')):
            out.append(prelude + '{' + scope_css(body, root, stats) + '}')
        elif prelude.startswith('@keyframes'):
            out.append(prelude.replace('@@K', root) + '{' + ' '.join(body.split()) + '}')
        else:
            sels = []
            for sel in split_top(prelude):
                sel = sel.replace(':scope', '.' + root) if ':scope' in sel else '.' + root + ' ' + sel
                sels.append(sel)
                stats['selectors'] += 1
            body = ' '.join(body.split()).replace('@@K', root)
            out.append(','.join(sels) + '{' + important(body) + '}')
        i = k + 1
    s = ''.join(out)
    return re.sub(r'\s*([{};,>])\s*', r'\1', s)


def min_js(js):
    out = []
    in_block = False
    for line in js.split('\n'):
        t = line.strip()
        if in_block:
            if '*/' in t:
                in_block = False
            continue
        if t.startswith('/*'):
            if '*/' not in t:
                in_block = True
            continue
        if not t or t.startswith('//'):
            continue
        out.append(t)
    return '\n'.join(out)


def cfg_field(cfg, name):
    m = re.search(name + r'\s*:\s*"([^"]*)"', cfg)
    return m.group(1) if m else ''


def build():
    cfg = (SRC / 'core/config.js').read_text().strip()
    css_chunks = chunks((SRC / 'core/karmin.css').read_text())
    js_chunks = chunks((SRC / 'core/data.js').read_text())
    js_chunks.update(chunks((SRC / 'core/search.js').read_text()))
    data_src = (SRC / 'core/data.js').read_text()
    icons = dict(re.findall(r'^\s*(\w+): "([^"]+)"', data_src.split('var ICONS = {')[1].split('};')[0], re.M))

    space = cfg_field(cfg, 'spaceKey') or 'BSS'
    label = cfg_field(cfg, 'practiceLabel')
    search_page = cfg_field(cfg, 'searchPageUrl') or '/dosearchsite.action?queryString='
    statics = {
        'searchAction': search_page.split('?')[0],
        'searchPage': search_page,
        'allPractices': '/label/' + urllib.parse.quote(space) + '/' + urllib.parse.quote(label),
        'newsPage': '/pages/viewrecentblogposts.action?key=' + urllib.parse.quote(space),
    }

    DIST.mkdir(parents=True, exist_ok=True)
    report = []
    built = {}
    for vid, (vname, mods) in VARIANTS.items():
        for name in mods:
            src = (SRC / 'modules' / (name + '.html')).read_text()
            uses = re.search(r'<!-- uses: ([^>]+) -->', src).group(1).split()
            markup = re.sub(r'<!-- uses:[^>]+-->\s*', '', src)
            for _ in range(3):
                markup = re.sub(r'\{\{> ([\w-]+)\}\}', lambda m: (SRC / 'parts' / (m.group(1) + '.html')).read_text().strip(), markup)
            root = 'bupk-' + name[:5].replace('-', '').lower()
            markup = markup.replace('{{root}}', root)
            markup = re.sub(r'\{\{ic:(\w+)\}\}', lambda m: '<svg class="k-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="%s"/></svg>' % icons[m.group(1)], markup)
            markup = re.sub(r'\{\{(\w+)\}\}', lambda m: html.escape(statics[m.group(1)]), markup)
            assert '{{' not in markup, name
            markup = '\n'.join(l.strip() for l in markup.split('\n') if l.strip())

            css_names = ['base'] + uses
            stats = {'selectors': 0}
            css = scope_css(''.join(css_chunks[c] for c in css_names if c in css_chunks), root, stats)
            js = '\n'.join(js_chunks[c] for c in ['base'] + uses if c in js_chunks)
            inits = ', '.join(INITS[u] for u in uses if u in INITS)
            script = ('(function () {\n"use strict";\n'
                      '/* ==== CONFIG — одинаковый во всех модулях страницы; что заполнить — см. README.txt ==== */\n'
                      + cfg + '\n/* ==== код модуля (не редактировать) ==== */\n'
                      + min_js(js) + '\nboot("%s", [%s]);\n})();' % (root, inits))
            out = ('<!-- БУП «Севергрупп» · стиль «Кармин» · модуль %s · вставить целиком в HTML Module (Refined) -->\n'
                   '<style>\n%s\n</style>\n<div class="%s" data-bupk="%s" lang="ru"><div class="k-wrap">\n%s\n</div></div>\n<script>\n%s\n</script>\n'
                   % (name, css, root, name, markup, script))
            size = len(out.encode('utf-8'))
            (DIST / (name + '.html')).write_text(out)
            built[name] = out
            report.append((vid, name, size, stats['selectors']))
            flag = 'OK ' if size <= LIMIT else 'BIG'
            print(f'{flag} {name:34s} {size/1024:6.1f} КБ  селекторов: {stats["selectors"]}')
    (DIST / 'sizes.json').write_text(json.dumps([{'variant': v, 'module': n, 'bytes': s, 'selectors': c} for v, n, s, c in report], ensure_ascii=False, indent=1))
    big = [n for _, n, s, _ in report if s > LIMIT]
    gen_harness(built)
    gen_preview(built)
    if big:
        print('ОШИБКА: модули больше 38 КБ:', ', '.join(big))
        sys.exit(1)


AGGR = ('a{color:#0052cc;text-decoration:underline} h1,h2,h3{font-family:Georgia;color:#172b4d;margin:24px 0} '
        'p{margin:0 0 16px;line-height:1.8} button{font:13px sans-serif;padding:2px 6px} ul{padding-left:40px} '
        '*{box-sizing:content-box}')

HARNESS_CSS = '''
html,body{margin:0;padding:0}
body{font:14px/1.43 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#172b4d;background:#fff}
.rf-head{height:56px;background:#1F2A33;color:#fff;display:flex;align-items:center;padding:0 16px;gap:16px}
.rf-head b{font-weight:600}
.rf-body{display:flex;align-items:stretch;min-height:calc(100% - 56px)}
.rf-tree{flex:0 0 var(--tree,0px);width:var(--tree,0px);background:#F4F5F7;border-right:1px solid #DFE1E6;overflow:hidden}
.rf-tree div{padding:8px 16px;white-space:nowrap;color:#42526E}
.rf-main{flex:1 1 auto;min-width:0;background:linear-gradient(#F7F8F9,#E9ECEE)}
.rf-right{flex:0 0 360px;background:#fff;border-left:1px solid #DFE1E6;padding:16px}
.rf-col{padding:32px;max-width:var(--col,none);margin:0 auto}
@media (max-width:600px){.rf-col{padding:24px}}
.rf-sec{overflow:hidden;margin:0 0 32px}
.wiki-content{margin:0 0 24px;height:72px;overflow:hidden}
.rf-foot{padding:24px;color:#6B778C;border-top:1px solid #DFE1E6;background:#fff}
'''

HARNESS_HEAD_JS = '''
(function(){var q=new URLSearchParams(location.search),d=document.documentElement;
d.style.setProperty('--tree',(q.get('tree')||'0')+'px');
window.__H={right:q.get('right')==='1',theme:q.get('theme')!=='0',fail:q.get('fail')==='1'};})();
'''


def page_html(title, sections_html, mock_json, extra_head='', extra_body='', controls=''):
    return f'''<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<style>{HARNESS_CSS}</style>
<style id="aggr">{AGGR}</style>
<script>{HARNESS_HEAD_JS}
if(!window.__H.theme)document.getElementById('aggr').disabled=true;
window.__BUP_MOCK__={mock_json};
if(window.__H.fail)window.__BUP_MOCK__.fail=true;
</script>
{extra_head}
</head><body>
{controls}
<header class="rf-head"><b>Refined</b><span>kb.severstal.com</span></header>
<div class="rf-body">
<aside class="rf-tree" aria-label="Дерево страниц"><div>Дерево страниц</div><div>· Раздел 1</div><div>· Раздел 2</div></aside>
<main class="rf-main"><div class="rf-col" id="col">
<div class="wiki-content" id="neighbor"><p>Абзац Confluence вне модулей.</p><a class="aui-button" href="#">Кнопка AUI</a></div>
{sections_html}
</div><footer class="rf-foot">Штатный подвал Refined</footer></main>
<aside class="rf-right" id="right" hidden>Панель Нейрона (имитация, 360 px)</aside>
</div>
<script>if(window.__H.right)document.getElementById('right').hidden=false;</script>
{extra_body}
</body></html>'''


def gen_harness(built):
    HARN.mkdir(parents=True, exist_ok=True)
    mock = (SRC / 'mock/fixtures.json').read_text()
    mock_min = json.dumps(json.loads(mock), ensure_ascii=False, separators=(',', ':'))
    for vid, (vname, mods) in VARIANTS.items():
        secs = '\n'.join(f'<section class="rf-sec" data-mod="{m}">\n{built[m]}\n</section>' for m in mods)
        (HARN / f'page-{vid}.html').write_text(page_html(f'Harness {vid}', secs, mock_min))
    (HARN / 'empty.html').write_text(page_html('Harness: без модулей', '', mock_min))


PREVIEW_CTRL = '''
<style>
.pv{position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;padding:10px 16px;background:#0E1418;color:#fff;font:13px/1.3 Arial,sans-serif}
.pv b{font-weight:700}.pv label{display:inline-flex;gap:6px;align-items:center}
.pv button{font:600 13px Arial,sans-serif;padding:6px 12px;border-radius:8px;border:1px solid #556;background:#1F2A33;color:#fff;cursor:pointer}
.pv button[aria-pressed=true]{background:#fff;color:#1F2A33}
.pv input[type=range]{width:180px}
</style>
<div class="pv" role="toolbar" aria-label="Настройки предпросмотра">
<b>Предпросмотр БУП · «Кармин»</b>
<span>Вариант: <button data-v="1K" aria-pressed="true">1К Лаконичный</button> <button data-v="2K">2К Навигатор</button> <button data-v="6K">6К Полки</button></span>
<span>Дерево: <button data-t="0" aria-pressed="true">0</button> <button data-t="280">280</button> <button data-t="480">480</button></span>
<label><input type="checkbox" id="pvR"> правая панель 360</label>
<label>Ширина колонки: <input type="range" id="pvW" min="360" max="1600" step="10" value="1600"><output id="pvWo">без ограничения</output></label>
<label><input type="checkbox" id="pvT" checked> «агрессивная тема»</label>
</div>
'''

PREVIEW_JS = '''
<script>
(function(){
var bar=document.querySelector('.pv'),d=document.documentElement,col=document.getElementById('col');
function setV(v){[].forEach.call(document.querySelectorAll('[data-variant]'),function(s){s.hidden=s.getAttribute('data-variant')!==v;});
 [].forEach.call(bar.querySelectorAll('[data-v]'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-v')===v);});}
bar.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.dataset.v)setV(b.dataset.v);
 if(b.dataset.t!=null){d.style.setProperty('--tree',b.dataset.t+'px');[].forEach.call(bar.querySelectorAll('[data-t]'),function(x){x.setAttribute('aria-pressed',x===b);});}});
document.getElementById('pvR').addEventListener('change',function(){document.getElementById('right').hidden=!this.checked;});
document.getElementById('pvT').addEventListener('change',function(){document.getElementById('aggr').disabled=!this.checked;});
var w=document.getElementById('pvW'),o=document.getElementById('pvWo');
w.addEventListener('input',function(){var v=+w.value;if(v>=1600){col.style.removeProperty('--col');o.textContent='без ограничения';}else{col.style.setProperty('--col',v+'px');o.textContent=v+' px';}});
col.style.setProperty('box-sizing','content-box');
})();
</script>
'''


def gen_preview(built):
    mock = json.dumps(json.loads((SRC / 'mock/fixtures.json').read_text()), ensure_ascii=False, separators=(',', ':'))
    secs = []
    for vid, (vname, mods) in VARIANTS.items():
        inner = '\n'.join(f'<section class="rf-sec">\n{built[m]}\n</section>' for m in mods)
        secs.append(f'<div data-variant="{vid}"{"" if vid == "1K" else " hidden"}>\n{inner}\n</div>')
    page = page_html('Предпросмотр: стартовая БУП «Кармин»', '\n'.join(secs), mock,
                     controls=PREVIEW_CTRL, extra_body=PREVIEW_JS)
    (DIST / 'preview').mkdir(parents=True, exist_ok=True)
    (DIST / 'preview/index.html').write_text(page)


if __name__ == '__main__':
    build()
