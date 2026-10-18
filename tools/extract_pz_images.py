"""Извлекает скриншоты из instruction.html (inline base64 JPEG), сжимает и кладёт в tools/pz-images/NN.b64.
Использование: python3 tools/extract_pz_images.py путь/к/instruction.html
Лимит: base64-строка каждого изображения <= 40 КБ (40*1024 символов)."""
import base64, io, pathlib, re, sys
from PIL import Image

R = pathlib.Path(__file__).resolve().parent.parent
LIMIT = 40 * 1024
src = open(sys.argv[1], encoding='utf-8').read()
items = re.findall(r'src="data:image/jpeg;base64,([^"]+)"', src)
assert len(items) == 11, len(items)
out = R / 'tools/pz-images'
out.mkdir(exist_ok=True)

def enc(im, q):
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
    return base64.b64encode(buf.getvalue()).decode()

for n, b64 in enumerate(items, 1):
    if len(b64) <= LIMIT:
        res, note = b64, 'как есть'
    else:
        im = Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGB')
        res = None
        for w in (900, 800, 720, 640):
            cur = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            for q in (60, 45, 35):
                s = enc(cur, q)
                if len(s) <= LIMIT:
                    res, note = s, f'{cur.width}px q{q}'
                    break
            if res:
                break
        assert res, f'не удалось ужать #{n}'
    (out / f'{n:02d}.b64').write_text(res)
    print(n, len(b64) // 1024, '->', len(res) // 1024, 'КБ', note)
