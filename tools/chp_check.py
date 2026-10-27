"""Проверка комплекса «Чемпионат» в Chromium: готовит вариант с заданными адресами (во временную папку, dist не трогает)
и запускает tools/chp_check.js на обоих вариантах. Запуск: python3 tools/chp_check.py"""
import os, pathlib, subprocess, sys, tempfile

R = pathlib.Path(__file__).resolve().parent.parent
tmp = pathlib.Path(tempfile.mkdtemp())
(tmp / 'pages.js').write_text("var CHP_PAGES={hub:{title:'Чемпионат 2026',url:'https://kb.example/hub'},voting:{title:'Голосование',url:'https://kb.example/vote?a=1&b=2'}};", encoding='utf-8')
env = dict(os.environ, CHP_OUT=str(tmp / 'on'), CHP_PAGES_JS=str(tmp / 'pages.js'))
subprocess.run([sys.executable, str(R / 'tools/build_chp.py')], env=env, check=True, stdout=subprocess.DEVNULL)
env = dict(os.environ, NODE_PATH=os.environ.get('NODE_PATH', '/opt/node-tools/node_modules'))
sys.exit(subprocess.run(['node', str(R / 'tools/chp_check.js'), str(R / 'dist/chp'), str(tmp / 'on')], env=env).returncode)
