import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / 'scripts/qa/nightjar-jekyll-rehearsal.py'
BASE = '80a5635abe4de7a07a1983de0b3ef796b101e047'

class JekyllRehearsalTest(unittest.TestCase):
    def test_snapshots_reproduce_and_never_overwrite(self):
        with tempfile.TemporaryDirectory(prefix='nightjar-jekyll-materialize-') as temporary:
            parent = Path(temporary)
            first, second = parent / 'first', parent / 'second'
            first.mkdir(); second.mkdir()
            for location in (first, second):
                subprocess.run([sys.executable, str(SCRIPT), '--destination', str(location)], check=True, capture_output=True, text=True)
            for family, count in (('martlet', 189), ('krigsvold', 181)):
                a, b = first / f'jekyll-{family}', second / f'jekyll-{family}'
                git = lambda root, *args: subprocess.check_output(['git', '-C', str(root), *args], text=True).strip()
                self.assertEqual(git(a, 'rev-parse', 'HEAD^{tree}'), git(b, 'rev-parse', 'HEAD^{tree}'))
                self.assertEqual(git(a, 'remote'), '')
                self.assertEqual(git(a, 'status', '--porcelain'), '')
                provenance = json.loads((a / 'nightjar/PROVENANCE.json').read_text())
                self.assertEqual(provenance['workbench_commit'], BASE)
                self.assertEqual(provenance['family'], family)
                self.assertEqual(len(provenance['files']), count)
                for item in provenance['files']:
                    target = a / item['path']
                    self.assertEqual(hashlib.sha256(target.read_bytes()).hexdigest(), item['snapshot_sha256'])
                    original = subprocess.check_output(['git', '-C', str(ROOT), 'cat-file', 'blob', item['git_blob']])
                    self.assertEqual(hashlib.sha256(original).hexdigest(), item['source_sha256'])
                    if item['transformation'] == 'byte-identical':
                        self.assertEqual(target.read_bytes(), original)
                tracked = set(git(a, 'ls-files').splitlines())
                self.assertEqual(tracked, set(json.loads((a / 'nightjar/source-files.json').read_text())))
            refused = subprocess.run([sys.executable, str(SCRIPT), '--destination', str(first)], capture_output=True, text=True)
            self.assertNotEqual(refused.returncode, 0)
            self.assertIn('must be absent', refused.stderr)
            self.assertEqual(git(first / 'jekyll-martlet', 'status', '--porcelain'), '')

if __name__ == '__main__':
    unittest.main()
