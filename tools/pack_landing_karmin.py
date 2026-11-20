#!/usr/bin/env python3
"""Итоговая папка bup-landing-final/ (п. 8): модули, README, предпросмотр, снимки, отчёт, ZIP."""
import pathlib, shutil, subprocess, sys, zipfile
R = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(R / 'tools'))
import build_landing_karmin as B  # noqa: E402
F = R / 'bup-landing-final'
if F.exists():
    shutil.rmtree(F)
(F / 'screens').mkdir(parents=True)
for vid, (_, mods) in B.VARIANTS.items():
    for m in mods:
        shutil.copy(B.DIST / (m + '.html'), F / (m + '.html'))
shutil.copy(R / 'src/landing-karmin/README.txt', F / 'README.txt')
shutil.copytree(B.DIST / 'preview', F / 'preview')
subprocess.run(['node', str(R / 'tools/shot_landing_karmin.js'), str(F / 'screens')], check=True)
shutil.copytree(R / 'reports/landing-check', F / 'reports/landing-check')
z = F / 'bup-landing-all.zip'
with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
    for p in sorted(F.rglob('*')):
        if p.is_file() and p != z:
            zf.write(p, 'bup-landing-final/' + str(p.relative_to(F)))
print('ZIP:', z, round(z.stat().st_size / 1024 / 1024, 1), 'МБ')
