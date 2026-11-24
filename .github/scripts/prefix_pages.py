#!/usr/bin/env python3
"""Prefix root-relative local URLs for a GitHub project Pages preview."""

from pathlib import Path
import re
import sys


root = Path(sys.argv[1])
prefix = sys.argv[2].rstrip("/")
# Only a published top-level file or directory can start a local site URL.
# The same quote/slash sequence also occurs in JS regexes and remote API paths.
entries = "|".join(re.escape(entry.name) for entry in sorted(root.iterdir()))
local_path = rf"""(?=(?:{entries})(?:[/\"'`?#)\s]|$))"""
extensions = {".html", ".css", ".js", ".webmanifest"}
quoted_path = re.compile(
    rf"(?P<quote>[\"'`])/{local_path}"
)
unquoted_attribute = re.compile(
    rf"(?P<attribute>\b(?:href|src|action|poster|data-src|data-href|srcset)=)/{local_path}",
    re.IGNORECASE,
)
css_path = re.compile(
    rf"(?P<start>url\(\s*)/{local_path}",
    re.IGNORECASE,
)

for path in root.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in extensions:
        continue
    try:
        original = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    updated = quoted_path.sub(lambda match: match.group("quote") + prefix + "/", original)
    updated = unquoted_attribute.sub(
        lambda match: match.group("attribute") + prefix + "/", updated
    )
    updated = css_path.sub(lambda match: match.group("start") + prefix + "/", updated)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
