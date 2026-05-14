#!/usr/bin/env python3
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
changed_files = []

pattern = re.compile(
    r'\n\s*\n(?P<cards>'
    r'\s*<div class="version-card">.*?</div>\s*'
    r'<div class="version-card">.*?</div>\s*'
    r')</div>\s*</div>\s*\n\s*<div class="section">\s*\n\s*<h3>Elenco canzoni</h3>',
    re.S,
)

orphan_pattern = re.compile(
    r'\n\s*\n(?P<cards>'
    r'\s*<div class="version-card">.*?</div>\s*'
    r'<div class="version-card">.*?</div>\s*'
    r')</div>\s*</div>',
    re.S,
)

replacement = (
    '\n\n            <div class="section">\n'
    '                <h3>Qualità Audio Disponibile</h3>\n'
    '                <div class="versions">\n'
    '{cards}                </div>\n'
    '            </div>\n\n'
    '            <div class="section">\n'
    '                <h3>Elenco canzoni</h3>'
)

for fp in sorted(root.glob('Albums/*/*.html')):
    text = fp.read_text(encoding='utf-8')
    if 'Qualità Lossless' not in text:
        continue
    new_text, count = pattern.subn(lambda m: replacement.format(cards=m.group('cards')), text, count=1)
    if count == 0:
        new_text, count = orphan_pattern.subn(lambda m: replacement.format(cards=m.group('cards')), text, count=1)
    if count and new_text != text:
        fp.write_text(new_text, encoding='utf-8')
        changed_files.append(str(fp.relative_to(root)))

print(f'Updated {len(changed_files)} files')
for path in changed_files:
    print(path)
