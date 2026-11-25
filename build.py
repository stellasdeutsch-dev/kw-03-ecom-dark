#!/usr/bin/env python3
"""Сборка сайта №03 одной командой: python3 build.py

Берёт gh/content.en.json и gh/content.tr.json и пишет:
  gh/en/index.html, gh/en/lesson/index.html  (Dias English)
  gh/tr/index.html, gh/tr/lesson/index.html  (Alterna Timur)
  gh/index.html и gh/lesson/index.html       (перенаправление на /en/ и /en/lesson/)
Данные вшиваются в страницу, поэтому отдельного запроса за JSON нет.
"""
import json
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
</head>
<body>
<main id="app"></main>
<noscript><p style="padding:40px;text-align:center">Для этой страницы нужен JavaScript.</p></noscript>
<script>window.SITE_MODE = '{mode}'; window.SITE_BASE = '{base}';
window.SITE = {data};</script>
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


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')
    print('  ', path.relative_to(ROOT.parent))


def main():
    for lang in ('en', 'tr'):
        data = json.loads((ROOT / f'content.{lang}.json').read_text(encoding='utf-8'))
        blob = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
        meta = data['meta']
        for mode, sub, base in (('full', f'{lang}/', '../'), ('lesson', f'{lang}/lesson/', '../../')):
            write(ROOT / sub / 'index.html', PAGE.format(
                title=esc(meta['title']), desc=esc(meta['description']), theme=meta.get('themeColor', '#0a0a0c'),
                base=base, mode=mode, data=blob,
                robots='<meta name="robots" content="noindex">\n' if mode == 'lesson' else ''))
    write(ROOT / 'index.html', REDIRECT.format(to='en/'))
    write(ROOT / 'lesson' / 'index.html', REDIRECT.format(to='../en/lesson/'))


if __name__ == '__main__':
    main()
