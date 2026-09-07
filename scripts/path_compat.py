#!/usr/bin/env python3
"""Make public HTML paths portable across domain root, GitHub project paths and XAMPP subfolders.

Canonical/hreflang/OpenGraph URLs remain absolute. Only root-relative local URL strings
(e.g. /assets/css/davar.css, /es/, /florida/...) are rewritten relative to each HTML file.
"""
from pathlib import Path
import json
import re
import sys

ROOT_LOCAL_RE = re.compile(r'(["\'])(/(?!/)[^"\'<>]*)\1')


def _relative_from_html(root: Path, html_file: Path, url: str) -> str:
    """Convert /foo/bar to a path relative to html_file's directory."""
    rel_parent = html_file.parent.relative_to(root)
    depth = len(rel_parent.parts)
    prefix = "../" * depth if depth else "./"
    target = url[1:]
    return prefix + target if target else prefix


def patch_html_file(root: Path, html_file: Path) -> int:
    text = html_file.read_text(encoding="utf-8", errors="ignore")
    changes = 0

    def repl(match: re.Match) -> str:
        nonlocal changes
        quote, url = match.group(1), match.group(2)
        # Never rewrite accidental protocol-relative URLs.
        if url.startswith("//"):
            return match.group(0)
        changes += 1
        return f"{quote}{_relative_from_html(root, html_file, url)}{quote}"

    updated = ROOT_LOCAL_RE.sub(repl, text)
    if updated != text:
        html_file.write_text(updated, encoding="utf-8")
    return changes


def patch_manifest(root: Path) -> int:
    manifest = root / "site.webmanifest"
    if not manifest.exists():
        return 0
    try:
        data = json.loads(manifest.read_text(encoding="utf-8"))
    except Exception:
        return 0
    changed = 0
    # Relative manifest values inherit the URL where the manifest is hosted and work
    # at the custom domain root as well as a repository/XAMPP subdirectory.
    desired = {"start_url": "./", "scope": "./"}
    for key, value in desired.items():
        if data.get(key) != value:
            data[key] = value
            changed += 1
    for icon in data.get("icons", []):
        src = icon.get("src")
        if isinstance(src, str) and src.startswith("/") and not src.startswith("//"):
            icon["src"] = src[1:]
            changed += 1
    if changed:
        manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def patch_project_paths(root: Path) -> tuple[int, int]:
    root = Path(root).resolve()
    html_changes = 0
    files_changed = 0
    for html in root.rglob("*.html"):
        n = patch_html_file(root, html)
        if n:
            html_changes += n
            files_changed += 1
    manifest_changes = patch_manifest(root)
    # Disable Jekyll transformations for a purely static deployment on GitHub Pages.
    (root / ".nojekyll").touch(exist_ok=True)
    return files_changed, html_changes + manifest_changes


if __name__ == "__main__":
    project_root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
    files, changes = patch_project_paths(project_root)
    print(f"Path compatibility patch complete: {files} HTML files changed, {changes} URL values updated.")
