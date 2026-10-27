"""Упаковка сдачи «Чемпионат»: chempionat-final/ (файлы для вставки, README.txt, preview/, screens/, chempionat-all.zip).
Файлы для вставки — побайтовые копии dist/chp. Запуск: python3 tools/pack_chp.py (после tools/build_chp.py)"""
import hashlib, os, pathlib, shutil, subprocess, sys, tempfile, zipfile

R = pathlib.Path(__file__).resolve().parent.parent
D = R / 'chempionat-final'
PASTE = [  # (файл вставки, файл dist, превью, подпись, снимок, заметка под блоком только в превью)
    ('1-chempionat-1-hub.html', 'hub.html', '1-chempionat.html', 'Чемпионат лучших практик', '1-chempionat-1100.png', None),
    ('2-golosovanie-1-shapka.html', 'voting.html', '2-golosovanie.html', 'Голосование', '2-golosovanie-1100.png', 'Здесь добавляются нативные опросы'),
]
SHELL_CSS = ('html,body{margin:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}'
             '.pvx-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid #ddd;font-size:14px;color:#555;background:#f6f7f8}'
             '.pvx-bar b{margin-right:6px}.pvx-bar button{font:inherit;padding:5px 12px;border:1px solid #bbb;border-radius:6px;background:#fff;color:#333;cursor:pointer}'
             '.pvx-bar button[aria-pressed="true"]{background:#333;color:#fff;border-color:#333}'
             '.pvx-wrap{box-sizing:border-box;width:1000px;max-width:100%;margin:0 auto;padding:16px 0 40px}.pvx-cap{font-size:12px;color:#6b7075;margin:0 0 8px}'
             '.pvx-note{font-size:13px;color:#6b7075;margin:24px 0 0;padding:16px;border:1px dashed #bbb;text-align:center}'
             '.pvx-idx{max-width:640px;margin:32px auto;padding:0 16px;line-height:1.8}')
SHELL_JS = ('(function(){var w=document.getElementById("w"),bs=document.querySelectorAll(".pvx-bar button");'
            'bs.forEach(function(b){b.addEventListener("click",function(){w.style.width=b.getAttribute("data-w")+"px";'
            'bs.forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")})})})})();')
SHOT_JS = r"""const pw=require('playwright');const fs=require('fs');(async()=>{const b=await pw.chromium.launch();
for(const [src,dst] of JSON.parse(process.argv[1])){const p=await b.newPage({viewport:{width:1148,height:800}});
await p.setContent('<body style="margin:0;background:#fff"><div style="width:1100px;margin:0 auto;padding:24px 0">'+fs.readFileSync(src,'utf8')+'</div></body>');
await p.waitForTimeout(200);await p.locator('body > div').screenshot({path:dst});await p.close();}await b.close();})()"""
README = """Комплекс: Чемпионат лучших практик Бизнес-системы СМ 2026
(kb.severstal.com, Data Center, Силовые машины)

СТРАНИЦА В CONFLUENCE → ФАЙЛЫ ПО ПОРЯДКУ
| Страница в Confluence       | Что вставить (сверху вниз)                                              |
| Чемпионат лучших практик    | 1. HTML-макрос: 1-chempionat-1-hub.html                                 |
| Голосование                 | 1. HTML-макрос: 2-golosovanie-1-shapka.html                             |
|                             | 2. Под ним — три макроса «Опросы» (см. раздел «Опросы» ниже)            |

КАК ЗАМЕНИТЬ СОДЕРЖИМОЕ СТРАНИЦЫ (4 шага)
Шаг 1. Откройте страницу в Confluence и нажмите «Редактировать».
Шаг 2. Удалите старые макросы HTML на странице (выделите макрос, нажмите Delete).
Шаг 3. Вставьте макрос HTML и целиком скопируйте в него содержимое нужного файла (файл откройте в Блокноте, Ctrl+A, Ctrl+C).
Шаг 4. Сохраните страницу («Опубликовать») и проверьте результат.

КАК СОЗДАТЬ ОПРОСЫ ТАК, ЧТОБЫ ПРАВИЛА НА СТРАНИЦЕ БЫЛИ ПРАВДОЙ
Опросы делаются не в HTML-блоке (HTML не хранит голоса), а нативным макросом «Опросы» (Polls for Confluence).
На странице «Голосование», ПОД вставленным HTML-блоком, добавьте по одному макросу «Опросы» на каждую номинацию:
  1. Операционная эффективность
  2. Цифровизация
  3. Человекоцентричность
Перед каждым опросом поставьте обычный заголовок номинации (текст страницы Confluence, не HTML-блок).
Настройки КАЖДОГО опроса (названия пунктов в окне макроса могут немного отличаться — это нормально):
  - «Голосовать анонимно» (Vote anonymously) — ВКЛЮЧИТЬ;
  - «Показывать имена других голосующих» (Display names of other voters) — ВЫКЛЮЧИТЬ;
  - «Разрешить менять голос» (Allow users to change their votes) — ВКЛЮЧИТЬ;
  - «Разрешить голосовать незарегистрированным» — ВЫКЛЮЧИТЬ;
  - выбор одного варианта (по умолчанию, ничего менять не нужно).
Ограничений на просмотр у страницы голосования быть не должно (иначе «любой сотрудник» не станет правдой).
Практики добавляются вариантами в опросы, когда будет список.
Почему так: правила на странице («голосовать может любой сотрудник», «голос можно изменить», «не видно, кто за кого») верны,
только если настройки выше выставлены именно так.

КОГДА ПОЯВЯТСЯ АДРЕСА СТРАНИЦ
Сейчас вкладки и кнопка «Проголосовать →» показываются неактивными, с подписью «Скоро» — адресов страниц ещё нет.
Когда обе страницы созданы в Confluence, сообщите их адреса Claude Code: он впишет их в src/chp/chp-pages.js,
пересоберёт блоки (python3 tools/build_chp.py) и обновит файлы для вставки. После этого повторите шаги 1–4 для обеих страниц.

ЧТО ВНУТРИ
preview/  — предпросмотр без интернета (откройте preview/index.html; переключатель ширины 1100/820/560/375).
            На странице «Голосование» серая подпись «Здесь добавляются нативные опросы» есть только в предпросмотре.
screens/  — по одному снимку каждой страницы при ширине колонки 1100 px.
"""


def shell(title, inner, cap_note=None):
    btns = ''.join(f'<button type="button" data-w="{w}" aria-pressed="false">{w} px</button>' for w in (1100, 820, 560, 375))
    note = f'<div class="pvx-note">{cap_note}</div>' if cap_note else ''
    return (f'<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>Предпросмотр: {title}</title><style>{SHELL_CSS}</style></head><body>'
            f'<div class="pvx-bar"><b>Ширина колонки:</b>{btns}<span>(по умолчанию 1000 px; оболочка предпросмотра, не часть блока)</span></div>'
            f'<div class="pvx-wrap" id="w"><div class="pvx-cap">HTML-макрос 1</div>\n{inner}{note}</div><script>{SHELL_JS}</script></body></html>')


def main():
    if D.exists():
        shutil.rmtree(D)
    (D / 'preview').mkdir(parents=True); (D / 'screens').mkdir()
    shots, links = [], []
    for paste, dist, prev, title, shot, note in PASTE:
        data = (R / 'dist/chp' / dist).read_bytes()
        (D / paste).write_bytes(data)
        (D / 'preview' / prev).write_text(shell(title, data.decode('utf-8'), note), encoding='utf-8', newline='\n')
        shots.append([str(R / 'dist/chp' / dist), str(D / 'screens' / shot)])
        links.append(f'<li><a href="{prev}">{title} (HTML-макрос 1)</a></li>')
    (D / 'preview/index.html').write_text(
        f'<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предпросмотр: Чемпионат лучших практик</title>'
        f'<style>{SHELL_CSS}</style></head><body><div class="pvx-idx"><h2>Предпросмотр комплекса «Чемпионат лучших практик»</h2><ol>{"".join(links)}</ol></div></body></html>', encoding='utf-8', newline='\n')
    (D / 'README.txt').write_text(README, encoding='utf-8', newline='\n')
    env = dict(os.environ, NODE_PATH=os.environ.get('NODE_PATH', '/opt/node-tools/node_modules'))
    subprocess.run(['node', '-e', SHOT_JS, __import__('json').dumps(shots)], check=True, env=env)
    z = D / 'chempionat-all.zip'
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(D.rglob('*')):
            if f.is_file() and f != z:
                zf.write(f, f.relative_to(D).as_posix())
    # проверка: файлы вставки побайтно = dist
    for paste, dist, *_ in PASTE:
        a, b = hashlib.sha256((D / paste).read_bytes()).hexdigest(), hashlib.sha256((R / 'dist/chp' / dist).read_bytes()).hexdigest()
        print(('OK  ' if a == b else 'FAIL'), paste, a[:16])
    with zipfile.ZipFile(z) as zf:
        for paste, dist, *_ in PASTE:
            same = zf.read(paste) == (R / 'dist/chp' / dist).read_bytes()
            print(('OK  ' if same else 'FAIL'), 'zip:', paste)
        print(*zf.namelist(), sep='\n')


if __name__ == '__main__':
    main()
