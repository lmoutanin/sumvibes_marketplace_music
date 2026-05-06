#!/usr/bin/env python3
"""
Replace `rounded-full` -> `rounded-none` on button/CTA elements in .tsx files,
while keeping `rounded-full` intact on:
  1. Circle/avatar patterns: w-\d+ h-\d+ on same line
  2. Toggle switches: w-16 h-8 or w-14 h-7 on same line
  3. Very small badges/pills: text-xs or text-[10px] combined with px-2 or px-3
  4. Progress/slider tracks: type="range" or the word "progress"
  5. Avatar.tsx entirely (never touch it)
  6. Spinner/animation dots: animate-spin or animate-pulse with rounded-full
  7. Lines containing `border-radius`
  8. Lines with rounded-full only on ::before or pseudo-element

Also adds `border-radius: 0;` as first property in .btn-primary rule in globals.css.
"""

import re
import os
import sys
from pathlib import Path

SRC_DIR = Path("/home/Yarda/STAGE/sumvibes_marketplace_music/src")

# ── helpers ──────────────────────────────────────────────────────────────────

def should_keep_rounded_full(line: str) -> bool:
    """Return True when rounded-full on this line must NOT be replaced."""

    # Rule 1 – circle / avatar: w-<N> h-<N> on the same line
    if re.search(r'\bw-\d+\b', line) and re.search(r'\bh-\d+\b', line):
        return True

    # Rule 2 – toggle switch dimensions
    if re.search(r'\bw-16\s+h-8\b|\bw-14\s+h-7\b', line):
        return True

    # Rule 3 – very small badge/pill: (text-xs | text-[10px]) AND (px-2 | px-3)
    has_tiny_text = bool(re.search(r'\btext-xs\b|\btext-\[10px\]', line))
    has_small_px  = bool(re.search(r'\bpx-2\b|\bpx-3\b', line))
    if has_tiny_text and has_small_px:
        return True

    # Rule 4 – progress / slider
    if re.search(r'\bprogress\b|type=["\']range["\']', line, re.IGNORECASE):
        return True

    # Rule 6 – spinner / animation dots
    if re.search(r'\banimate-spin\b|\banimate-pulse\b', line):
        return True

    # Rule 7 – CSS border-radius property
    if 'border-radius' in line:
        return True

    # Rule 8 – pseudo-element (::before / ::after / :before / :after)
    if re.search(r'::?(?:before|after)', line):
        return True

    return False


def process_tsx_file(path: Path) -> int:
    """Process a single .tsx file, return the number of replacements made."""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    new_lines = []
    replacements = 0

    for line in lines:
        if "rounded-full" in line and not should_keep_rounded_full(line):
            new_line = line.replace("rounded-full", "rounded-none")
            replacements += len(line.split("rounded-full")) - 1
            new_lines.append(new_line)
        else:
            new_lines.append(line)

    if replacements:
        path.write_text("".join(new_lines), encoding="utf-8")

    return replacements


def patch_globals_css(css_path: Path) -> bool:
    """Add `border-radius: 0;` as first property inside .btn-primary {}."""
    text = css_path.read_text(encoding="utf-8")

    # Check if already patched
    if re.search(r'\.btn-primary\s*\{[^}]*border-radius:\s*0', text, re.DOTALL):
        print("globals.css: .btn-primary already has border-radius: 0 — skipping.")
        return False

    # Match .btn-primary { and insert border-radius: 0; right after the opening brace
    new_text, count = re.subn(
        r'(\.btn-primary\s*\{)',
        r'\1\n  border-radius: 0;',
        text,
        count=1
    )
    if count == 0:
        print("globals.css: WARNING — .btn-primary rule not found!", file=sys.stderr)
        return False

    css_path.write_text(new_text, encoding="utf-8")
    return True


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    tsx_files = [p for p in SRC_DIR.rglob("*.tsx")
                 if p.name != "Avatar.tsx"]

    total_files_changed = 0
    total_replacements = 0
    changed_files = []

    for tsx_path in sorted(tsx_files):
        n = process_tsx_file(tsx_path)
        if n:
            total_files_changed += 1
            total_replacements += n
            changed_files.append((tsx_path, n))

    print(f"\n=== TSX replacements ===")
    print(f"Files scanned  : {len(tsx_files)}")
    print(f"Files modified : {total_files_changed}")
    print(f"Total rounded-full → rounded-none replacements: {total_replacements}")
    print()
    for p, n in changed_files:
        rel = p.relative_to(SRC_DIR)
        print(f"  [{n:3d}]  {rel}")

    # Patch globals.css
    css_path = SRC_DIR / "app" / "globals.css"
    print(f"\n=== globals.css ===")
    if css_path.exists():
        patched = patch_globals_css(css_path)
        if patched:
            print("Added `border-radius: 0;` as first property in .btn-primary")
    else:
        print(f"WARNING: {css_path} not found!", file=sys.stderr)


if __name__ == "__main__":
    main()
