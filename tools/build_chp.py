"""Сборка комплекса «Чемпионат лучших практик»: src/chp -> dist/chp/{hub,voting}.html (один HTML-макрос на страницу).
Адреса берутся из src/chp/chp-pages.js (пустой адрес = вкладка/кнопка неактивны, подпись «Скоро»).
Другие комплексы не трогает. Запуск: python3 tools/build_chp.py"""
import html, pathlib, re, sys

R = pathlib.Path(__file__).resolve().parent.parent
S = R / 'src/chp'
OUT = R / 'dist/chp'
MAX_KB = 38
ROOT = 'chp-root'
ARROW = '<svg class="chp-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

PAGES = {  # ключ страницы -> (файл разметки, css страницы, файл в dist)
    'hub': ('hub.html', 'hub.css', 'hub.html'),
    'voting': ('vote.html', 'vote.css', 'voting.html'),
}


def load_pages():
    js = (S / 'chp-pages.js').read_text(encoding='utf-8')
    res = {}
    for key, body in re.findall(r"(\w+):\s*\{([^}]*)\}", js):
        t = re.search(r"title:\s*'([^']*)'", body).group(1)
        u = re.search(r"url:\s*'([^']*)'", body).group(1)
        res[key] = (t, u)
    return res


def mini(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s*\n\s*', ' ', css)
    css = re.sub(r'\s*([{};,>])\s*', r'\1', css)
    return css.replace('.ROOT', '.' + ROOT).strip()


def nav(pages, current):
    items = []
    for key in ('hub', 'voting'):
        t, u = pages[key]
        if key == current:
            items.append(f'<span class="chp-nav__i chp-nav__cur" aria-current="page">{html.escape(t)}</span>')
        elif u:
            items.append(f'<a class="chp-nav__i" href="{html.escape(u, quote=True)}" rel="noopener">{html.escape(t)}</a>')
        else:
            items.append(f'<span class="chp-nav__i is-off" role="link" aria-disabled="true">{html.escape(t)} <span class="chp-soon">Скоро</span></span>')
    return '<nav class="chp-nav" aria-label="Разделы чемпионата">' + ''.join(items) + '</nav>'


def button(pages):
    u = pages['voting'][1]
    if u:
        return f'<a class="chp-btn" href="{html.escape(u, quote=True)}" rel="noopener" aria-label="Проголосовать">Проголосовать {ARROW}</a>'
    return f'<span class="chp-btn is-off" role="link" aria-disabled="true">Проголосовать {ARROW}</span><span class="chp-soon">Скоро</span>'


def build():
    pages = load_pages()
    core = (S / 'chp-core.css').read_text(encoding='utf-8')
    OUT.mkdir(parents=True, exist_ok=True)
    bad = False
    for key, (src, css, dst) in PAGES.items():
        css_all = mini(core + '\n' + (S / css).read_text(encoding='utf-8'))
        body = (S / src).read_text(encoding='utf-8').strip()
        body = body.replace('<!--NAV-->', nav(pages, key)).replace('<!--BTN-->', button(pages))
        text = f'<style>\n{css_all}\n</style>\n{body}\n'
        (OUT / dst).write_text(text, encoding='utf-8', newline='\n')
        kb = len(text.encode('utf-8')) / 1024
        bad |= kb > MAX_KB
        print(f'dist/chp/{dst}  {kb:.1f} КБ' + (f'  !! больше {MAX_KB} КБ' if kb > MAX_KB else ''))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(build())
