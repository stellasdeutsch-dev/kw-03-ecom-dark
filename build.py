#!/usr/bin/env python3
"""Сборка сайта №03 одной командой: python3 build.py

Берёт gh/content.en.json и gh/content.tr.json и пишет:
  gh/en/index.html  (Dias English)
  gh/tr/index.html  (Alterna Timur)
  gh/index.html, gh/lesson/, gh/en/lesson/, gh/tr/lesson/  (перенаправления: корень и /lesson/ на /en/,
  /en/lesson/ на /en/, /tr/lesson/ на /tr/; версий без рекламы нет)
HTML всех блоков собирается заранее через node и gh/assets/render.js и вшивается в <main>,
поэтому без JS весь контент виден. app.js только добавляет поведение и анимации.
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent / 'gh'

PAGE = '''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="{theme}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{base}media/hero-bg.webp">
{robots}<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23fd3d5e'/%3E%3Cpath d='M12 9l11 7-11 7z' fill='%23fff'/%3E%3C/svg%3E">
<link rel="preload" href="{base}assets/fonts/Montserrat-800-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{base}media/hero-bg.webp" as="image">
<link rel="stylesheet" href="{base}assets/fonts.css">
<link rel="stylesheet" href="{base}assets/style.css">
<script>document.documentElement.classList.add('js');addEventListener('load',function(){{if(!window.__live)document.documentElement.classList.remove('js')}})</script>
</head>
<body>
<main id="app">{html}</main>
<script>window.SITE_BASE = '{base}';</script>
<script src="{base}assets/render.js" defer></script>
<script src="{base}assets/app.js" defer></script>
</body>
</html>
'''

REDIRECT = '''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Переход</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url={to}">
<link rel="canonical" href="{to}">
<script>location.replace('{to}' + location.search + location.hash);</script>
</head>
<body style="background:#0a0a0c;color:#fff;font-family:system-ui;padding:40px">
<a href="{to}" style="color:#ffef90">Открыть гайд</a>
</body>
</html>
'''


def esc(s):
    return s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


NODE = """
const r = require(process.argv[1]); let s = ''; process.stdin.setEncoding('utf8');
process.stdin.on('data', c => s += c).on('end', () => process.stdout.write(r.render(JSON.parse(s), process.argv[2])));
"""


def prerender(data, base):
    out = subprocess.run(['node', '-e', NODE, str(ROOT / 'assets' / 'render.js'), base],
                         input=json.dumps(data, ensure_ascii=False), capture_output=True, text=True, check=True)
    return out.stdout


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')
    print('  ', path.relative_to(ROOT.parent))


def main():
    for lang in ('en', 'tr'):
        data = json.loads((ROOT / f'content.{lang}.json').read_text(encoding='utf-8'))
        meta = data['meta']
        write(ROOT / lang / 'index.html', PAGE.format(
            title=esc(meta['title']), desc=esc(meta['description']), theme=meta.get('themeColor', '#0a0a0c'),
            base='../', html=prerender(data, '../'), robots=''))
        # версий без рекламы нет: старый адрес lesson/ ведёт на рекламную версию своей вариации
        write(ROOT / lang / 'lesson' / 'index.html', REDIRECT.format(to='../'))
    write(ROOT / 'index.html', REDIRECT.format(to='en/'))
    write(ROOT / 'lesson' / 'index.html', REDIRECT.format(to='../en/'))


if __name__ == '__main__':
    main()
