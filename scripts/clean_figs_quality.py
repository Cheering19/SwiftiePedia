#!/usr/bin/env python3
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
html_files = list(root.rglob('*.html'))
fig_count = 0
sec_count = 0
intro_count = 0
changed_files = []

fig_re = re.compile(r'<span\s+class="fig-ret"[^>]*>(.*?)</span>', re.S|re.I)
qual_section_re = re.compile(r'<div[^>]*class="section"[^>]*>\s*<h3>[^<]*Qualit[\u00E0A-Za-z\s]*[^<]*</h3>.*?</div>', re.S|re.I)
intro_re = re.compile(r'<p[^>]*>[^<]*figure[^<]*retor[^<]*</p>', re.S|re.I)

for fp in html_files:
    text = fp.read_text(encoding='utf-8')
    original = text
    # replace fig-ret spans with their inner text
    new_text, nfig = fig_re.subn(lambda m: m.group(1), text)
    if nfig:
        fig_count += nfig
        text = new_text
    # remove per-song "Qualità" sections
    new_text, nsec = qual_section_re.subn('', text)
    if nsec:
        sec_count += nsec
        text = new_text
    # remove intro paragraphs that mention figure retoriche
    new_text, nintro = intro_re.subn('', text)
    if nintro:
        intro_count += nintro
        text = new_text
    if text != original:
        fp.write_text(text, encoding='utf-8')
        changed_files.append(str(fp.relative_to(root)))

print(f"Processed {len(html_files)} HTML files")
print(f"Replaced {fig_count} fig-ret spans")
print(f"Removed {intro_count} intro paragraphs mentioning fig/retor")
print(f"Removed {sec_count} per-song quality sections")
print("Modified files:")
for f in changed_files:
    print(f" - {f}")
