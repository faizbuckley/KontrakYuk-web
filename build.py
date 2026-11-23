#!/usr/bin/env python3
"""Wrap each page in src/ with the shared head, header and footer taken from index.html.

Usage: python3 build.py   (writes pindahan.html, pesanan.html, dashboard.html, detail.html)
A page in src/ starts with a line `<!--title: ...-->`, optionally `<!--nav: file.html-->`
(the nav word marked current) and `<!--chrome: none-->` (no site header/footer, for the
owner panel pages), then the page's own <style> and <main>.
"""
import pathlib
import re

root = pathlib.Path(__file__).parent
index = (root / "index.html").read_text()

head_links = re.search(r'(<link rel="preconnect".*?<link rel="stylesheet" href="css/kontrakyuk.css">)', index, re.S).group(1)
header = re.search(r'(<header class="site-header".*?</header>)', index, re.S).group(1)
footer = re.search(r'(<footer class="site-footer">.*?</footer>)', index, re.S).group(1)
header = header.replace(' aria-current="page"', "")

for src in sorted((root / "src").glob("*.html")):
    text = src.read_text()
    meta = dict(re.findall(r"<!--(\w+): (.*?)-->", text))
    body = re.sub(r"<!--\w+: .*?-->\n?", "", text)
    styles = "\n".join(re.findall(r"<style>.*?</style>", body, re.S))
    body = re.sub(r"<style>.*?</style>\n?", "", body, flags=re.S)
    extra_css = f'\n<link rel="stylesheet" href="{meta["css"]}">' if "css" in meta else ""
    head_links_page = head_links + extra_css + ("\n" + styles if styles else "")
    page_header = header
    if "nav" in meta:
        page_header = page_header.replace(f'href="{meta["nav"]}">', f'href="{meta["nav"]}" aria-current="page">', 1)
    chrome = meta.get("chrome") != "none"
    out = f"""<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{meta.get('title', 'KontrakYuk')}</title>
{head_links_page}
</head>
<body>
{page_header if chrome else ''}
{body.strip()}
{footer if chrome else ''}
<script src="js/kontrakyuk.js"></script>
</body>
</html>
"""
    (root / src.name).write_text(out)
    print("wrote", src.name)
