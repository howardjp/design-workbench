#!/usr/bin/env python3
"""Build both standalone Jekyll sites, plus clean source downloads."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--family', choices=['martlet', 'krigsvold'])
parser.add_argument('--baseurl', default='')
parser.add_argument('--destination', type=Path)
args = parser.parse_args()
if args.destination and not args.family: parser.error('--destination requires --family')
command = json.loads(os.environ.get('JEKYLL_COMMAND_JSON', '["bundle", "exec", "jekyll"]'))
for family in ([args.family] if args.family else ['martlet', 'krigsvold']):
    source = REPO / 'examples/jekyll' / family
    destination = (args.destination or source / 'dist').resolve()
    subprocess.run([*command, 'build', '--source', str(source), '--destination', str(destination), '--baseurl', args.baseurl, '--strict_front_matter', '--trace'], check=True, cwd=source)
    # Never archive hosting identity, credentials, generated output, or a prior archive.
    with zipfile.ZipFile(destination / 'template.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(source.rglob('*')):
            relative = file.relative_to(source)
            if not file.is_file() or any(part in {'.git', '.openai', '.jekyll-cache', '.bundle', 'vendor', 'node_modules', 'dist', '_site'} for part in relative.parts): continue
            if file.suffix == '.zip': continue
            archive.write(file, relative)
    print(f'{family}: built with baseurl={args.baseurl!r}; source download ready')
