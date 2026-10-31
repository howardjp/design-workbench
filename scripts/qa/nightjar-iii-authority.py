#!/usr/bin/env python3
"""Inventory the frozen Nightjar III Jekyll export boundary without editing it."""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ARCHETYPES = Path('examples/page-archetypes')
OUTPUT = ROOT / 'docs/qa/nightjar-iii-jekyll-authority.csv'


def owner(family, path):
    shared = ARCHETYPES / 'jekyll' / path
    overlay = ARCHETYPES / 'families' / family / path
    if (ROOT / shared).is_file() and (ROOT / overlay).is_file():
        raise ValueError(f'Unexpected shared/family overlay collision: {family}/{path}')
    if (ROOT / shared).is_file():
        return 'shared-workbench-source', str(shared)
    if (ROOT / overlay).is_file():
        return 'family-workbench-overlay', str(overlay)
    if path == '_data/dashboards.json':
        return 'copied-workbench-fixture', str(ARCHETYPES / 'content/dashboards.json')
    if path.startswith('docs/archetypes/contracts/'):
        return 'copied-workbench-contract', str(ARCHETYPES / 'contracts' / Path(path).name)
    if path.startswith('docs/archetypes/'):
        return 'copied-workbench-guide', str(ARCHETYPES / Path(path).name)
    if path in {'_layouts/default.html', '_config.yml', 'index.md'}:
        return 'seeded-export-transformed-by-sync', f'examples/jekyll/{family}/{path} + {ARCHETYPES}/scripts/sync.py'
    if path.startswith('examples/') or path in {'404.html', '_data/dashboard_navigation.json', '_data/dashboard_peer.json', '_data/examples.json', '_data/navigation.yml'}:
        return 'generated-by-sync', str(ARCHETYPES / 'scripts/sync.py')
    return 'tracked-family-export', f'examples/jekyll/{family}/{path}'


def generate():
    manifests = json.loads((ROOT / ARCHETYPES / 'contracts/jekyll-source-files.json').read_text())
    result = io.StringIO(newline='')
    writer = csv.writer(result, lineterminator='\n')
    writer.writerow(['family', 'export_path', 'authority_class', 'source_or_generator', 'sha256'])
    for family in ('martlet', 'krigsvold'):
        paths = manifests[family]
        if len(paths) != len(set(paths)):
            raise ValueError(f'Duplicate manifest path for {family}')
        for path in sorted(paths):
            source = ROOT / 'examples/jekyll' / family / path
            if not source.is_file() or source.is_symlink():
                raise ValueError(f'Missing or symbolic export: {source}')
            kind, upstream = owner(family, path)
            if kind in {'shared-workbench-source', 'family-workbench-overlay', 'copied-workbench-fixture', 'copied-workbench-guide', 'copied-workbench-contract'}:
                origin = ROOT / upstream
                if not origin.is_file() or origin.is_symlink() or origin.read_bytes() != source.read_bytes():
                    raise ValueError(f'Copied source is missing, symbolic or differs: {origin} -> {source}')
            writer.writerow([family, f'examples/jekyll/{family}/{path}', kind, upstream, hashlib.sha256(source.read_bytes()).hexdigest()])
    return result.getvalue()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='verify the checked-in snapshot against the current tree')
    args = parser.parse_args()
    value = generate()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text() != value:
            raise SystemExit(f'{OUTPUT.relative_to(ROOT)} is missing or differs; examine authority and regenerate deliberately')
        print(f'{OUTPUT.relative_to(ROOT)} matches the current export manifests and bytes')
    else:
        OUTPUT.write_text(value)
        print(f'Wrote {OUTPUT.relative_to(ROOT)}')
