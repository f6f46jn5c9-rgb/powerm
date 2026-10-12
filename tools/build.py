import pathlib, re
R = pathlib.Path(__file__).resolve().parent.parent
logo = (R/'tools/logo.b64').read_text().strip()
names = ['01-logo','02-cta','03-catalog','04-new-practices','05-curators']
(R/'dist').mkdir(exist_ok=True)
parts = {}
for n in names:
    t = (R/f'src/{n}.html').read_text().replace('%%LOGO%%', logo)
    (R/f'dist/{n}.html').write_text(t); parts[n] = t
ph = lambda s: f'<div class="ph">{s}</div>'
body = ph('[нативный макрос] Поиск по базе Силовых Машин') + ph('[нативный макрос] Поиск по базе Севергрупп')
order = [parts['01-logo'], ph('[нативный макрос] Поиск по базе Силовых Машин'), ph('[нативный макрос] Поиск по базе Севергрупп'), parts['02-cta'], parts['03-catalog'], parts['04-new-practices'], parts['05-curators']]
html = '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Превью стартовой страницы СМ</title><style>body{margin:0;background:#f2f1ed;font-family:sans-serif}.wrap{max-width:1180px;margin:0 auto;padding:24px 20px 60px;display:flex;flex-direction:column;gap:32px}.ph{background:#d9dbe0;color:#555;border-radius:12px;padding:14px;text-align:center;font-size:14px}@media(max-width:640px){.wrap{padding:16px}}</style></head><body><main class="wrap">' + '\n'.join(f'<div>{o}</div>' if not o.startswith('<div class="ph"') else o for o in order) + '</main></body></html>'
(R/'dist/preview.html').write_text(html)
(R/'preview.html').write_text(html)

# --- Страница «Цифровой инструментарий» (src/tools.*) -> dist/01-instrumentarii.html ---
def build_instrumentarii():
    css = (R/'src/tools.css').read_text().strip()
    html = (R/'src/tools.html').read_text().strip()
    js = (R/'src/tools.js').read_text().strip()
    block = f'<style>\n{css}\n</style>\n{html}\n<script>\n{js}\n</script>\n'
    (R/'dist/01-instrumentarii.html').write_text(block)
    prev = ('<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>Превью: Цифровой инструментарий</title><style>body{margin:0;background:#f2f1ed}.col{width:960px;max-width:100%;margin:0 auto;padding:24px 0 60px}</style></head>'
            '<body><div class="col">' + block + '</div></body></html>')
    (R/'preview-instrumentarii.html').write_text(prev)

build_instrumentarii()

# --- Страница «Стандарты и инструкции СМК» (src/docs-smk*) -> dist/01-docs-smk.html ---
def build_docs_smk():
    css = (R/'src/docs-smk.css').read_text().strip()
    html = (R/'src/docs-smk.html').read_text().strip()
    data = (R/'src/docs-smk-data.js').read_text().rstrip()
    js = (R/'src/docs-smk.js').read_text().rstrip()
    block = f'<style>\n{css}\n</style>\n{html}\n<script>\n(function () {{\n  "use strict";\n{data}\n{js}\n}})();\n</script>\n'
    (R/'dist/01-docs-smk.html').write_text(block)
    prev = ('<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>Превью: Стандарты и инструкции СМК</title><style>body{margin:0;background:#f2f1ed}.col{width:1100px;max-width:100%;margin:0 auto;padding:24px 0 60px}</style></head>'
            '<body><div class="col">' + block + '</div></body></html>')
    (R/'preview-docs-smk.html').write_text(prev)

build_docs_smk()

# --- «Каталог сервисов» для Confluence: index.html (лендинг, не меняется) -> dist/catalog-services.html ---
# Правки точечные: каждая подмена проверяется assert, чтобы при изменении index.html сборка не молчала.
DOCS_PAGE_URL = 'https://kb.severstal.com/spaces/BSS/pages/578781394/%D0%A1%D1%82%D0%B0%D0%BD%D0%B4%D0%B0%D1%80%D1%82%D1%8B+%D0%B8+%D0%B8%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%86%D0%B8%D0%B8+%D0%A1%D0%9C%D0%9A'  # адрес страницы «Стандарты и инструкции СМК»; если пусто — кнопка и строка показывают подсказку

PM_DOCS_CSS = """
  /* ---------- Кнопка «Документы СМК» (добавлено для Confluence-версии) ---------- */
  .header-search-row{flex-wrap:wrap;}
  .header-search-row .search-box{flex:1 1 280px;}
  .pm-docs-btn{
    display:inline-flex;
    align-items:center;
    gap:8px;
    flex:0 0 auto;
    font-family:inherit;
    font-size:14.5px;
    font-weight:700;
    line-height:normal;
    padding:11px 18.5px;
    border:1.5px solid transparent;
    border-radius:999px;
    background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,#1a2a5e,#0e7c7b) border-box;
    color:#1a2a5e !important;
    text-decoration:none !important;
    cursor:pointer;
    box-shadow:var(--shadow-sm),0 0 28px rgba(14,124,123,.18);
    transition:box-shadow .25s ease,transform .2s ease;
  }
  .pm-docs-btn svg{color:#0e7c7b !important;flex-shrink:0;}
  .pm-docs-btn:hover{
    transform:translateY(-2px);
    color:#0a5f5e !important;
    box-shadow:var(--shadow-md),0 0 40px rgba(14,124,123,.32);
  }
  .pm-docs-btn:hover svg{color:#0a5f5e !important;}
  .pm-docs-btn:focus-visible{outline:3px solid #f5a623;outline-offset:3px;}
  @media (max-width:640px){
    .header-search-row{flex-wrap:nowrap;}
    .header-search-row .search-box{flex:0 0 auto;}
    .pm-docs-btn{width:100%;justify-content:center;}
  }
  @media (prefers-reduced-motion:reduce){
    .pm-docs-btn{transition:none;}
    .pm-docs-btn:hover{transform:none;}
  }
"""

PM_DOCS_BTN = """
      <a class="pm-docs-btn" id="pmDocsBtn" href="#" aria-label="Документы СМК: стандарты и инструкции">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
        Документы СМК
      </a>
"""

def sub1(text, old, new, flags=0):
    import re as _re
    if flags:
        text2, n = _re.subn(old, lambda m: new, text, count=1, flags=flags)
    else:
        n = text.count(old); text2 = text.replace(old, new, 1)
    assert n == 1, 'catalog-services: якорь не найден/не единственный: ' + old[:60]
    return text2

def build_catalog_services():
    src = (R/'index.html').read_text()
    css = re.search(r'<style>\n(.*?)</style>', src, re.S).group(1)
    body = re.search(r'<body>\s*(<div class="wrap">.*?<div id="tooltip">[^<]*</div>)\s*<script>(.*?)</script>', src, re.S)
    html, js = body.group(1), body.group(2)
    # 1. шапка с логотипом СМ в Confluence не нужна
    html = sub1(html, r'    <div class="brand-block">.*?\n    </div>\n', '', re.S)
    # 2. кнопка «Документы СМК» сразу после .trigger-wrap «Новый сотрудник»
    anchor = '<ul class="dropdown-list" id="newbieList"></ul>\n        </div>\n      </div>\n'
    html = sub1(html, anchor, anchor + PM_DOCS_BTN.lstrip('\n'))
    # 3. стили кнопки и переноса ряда
    css = css.rstrip('\n') + '\n' + PM_DOCS_CSS
    # 4. константа в начале скрипта
    js = sub1(js, '"use strict";\n', '"use strict";\n\n  // Адрес страницы «Стандарты и инструкции СМК». Пока пусто — кнопка показывает подсказку «Ссылка появится позже».\n  var DOCS_PAGE_URL = %r;\n' % DOCS_PAGE_URL)
    # 5. строка в «О компании и правила» -> «Политики и регламенты»
    old = "['Алкотестеры','https://pmweb.powerm.ru/Security/Pages/Alcotest.aspx#/company']\n      ]}\n    ]}\n  ];"
    new = "['Алкотестеры','https://pmweb.powerm.ru/Security/Pages/Alcotest.aspx#/company'],\n        ['Стандарты и инструкции СМК', DOCS_PAGE_URL || null]\n      ]}\n    ]}\n  ];"
    js = sub1(js, old, new)
    # 5а. картинка «Приложение СИЗ» (JPEG 179 КБ) -> облегчённый PNG из 5 цветов (tools/siz-app.png, те же 1287x590 и те же QR-коды)
    import base64
    png = base64.b64encode((R/'tools/siz-app.png').read_bytes()).decode()
    js, n = re.subn(r"(const SIZ_APP_IMAGE = ')data:image/jpeg;base64,[A-Za-z0-9+/=]+(')", lambda m: m.group(1) + 'data:image/png;base64,' + png + m.group(2), js)
    assert n == 1, 'catalog-services: SIZ_APP_IMAGE не найден'
    # 6. href кнопки при инициализации
    t = '  // ---------- Tooltip on placeholder links ----------\n'
    js = sub1(js, t, "  const pmDocsBtn = document.getElementById('pmDocsBtn');\n  if (pmDocsBtn) pmDocsBtn.setAttribute('href', DOCS_PAGE_URL || '#');\n\n" + t)
    out = f'<style>\n{css}</style>\n{html}\n<script>{js}</script>\n'
    (R/'dist/catalog-services.html').write_text(out)

build_catalog_services()
