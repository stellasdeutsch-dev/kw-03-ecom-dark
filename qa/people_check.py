#!/usr/bin/env python3
"""Проверка людей: в en только Диас (папка Диаса), в tr только Тимур (папка Тимура).
Берёт все картинки из content.<lang>.json и сверяет с таблицей gh/media/PEOPLE.md."""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'gh'
rows = {}
for line in (ROOT / 'media' / 'PEOPLE.md').read_text(encoding='utf-8').splitlines():
    m = re.match(r'\|\s*([\w\-\.… ]+?\.webp(?:\s*…\s*[\w\-]+\.webp)?)\s*\|[^|]*\|\s*([^|]+)\|\s*([^|]+)\|', line)
    if not m:
        continue
    names, src, who = m.group(1), m.group(2).strip(), m.group(3).strip()
    if '…' in names:  # who-1.webp … who-5.webp
        a, b = [x.strip() for x in names.split('…')]
        stem = re.match(r'(.*?)(\d+)\.webp', a)
        for i in range(int(stem.group(2)), int(re.match(r'.*?(\d+)\.webp', b).group(1)) + 1):
            rows[f'{stem.group(1)}{i}.webp'] = (src, who)
    else:
        rows[names.strip()] = (src, who)

DIAS = ('dias-photos-web', 'dias photos')
TIMUR = ('timur-video', 'timur-clips/photos')
bad = []
for lang, own, other, own_name, other_name in (('en', DIAS, TIMUR, 'Диас', 'Тимур'), ('tr', TIMUR, DIAS, 'Тимур', 'Диас')):
    text = (ROOT / f'content.{lang}.json').read_text(encoding='utf-8')
    used = sorted(set(re.findall(r'media/([\w\-]+\.webp)', text)))
    people = [u for u in used if u in rows]
    for u in people:
        src, who = rows[u]
        if who.startswith(other_name) or any(o in src for o in other):
            bad.append(f'{lang}: {u} -> {src} ({who})')
        elif who.startswith(own_name) and not any(o in src for o in own):
            bad.append(f'{lang}: {u} без источника в папке ({src})')
    if other_name in text:
        bad.append(f'{lang}: в тексте есть имя «{other_name}»')
    print(lang, 'людей:', len(people), ', '.join(people))
print('OK' if not bad else 'ОШИБКИ:\n' + '\n'.join(bad))
sys.exit(1 if bad else 0)
