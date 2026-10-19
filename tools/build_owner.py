import pathlib
R = pathlib.Path(__file__).resolve().parent.parent
block = (R/'src/owner-signature.html').read_text()
(R/'dist/01-owner-signature.html').write_text(block)
prev = ('<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Превью: подпись владельца страницы</title><style>body{margin:0;background:#fff;font-family:sans-serif}.col{width:1100px;max-width:100%;margin:0 auto;padding:24px 0 60px}</style></head>'
        '<body><div class="col"><h2>Чужой заголовок</h2><p>Текст страницы и <a href="#x">чужая ссылка</a>.</p>' + block + '</div></body></html>')
(R/'preview-owner-signature.html').write_text(prev)
