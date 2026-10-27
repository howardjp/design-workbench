"""Create a sorted ZIP with stable timestamps and permissions (including empty dirs)."""
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root, destination = Path(sys.argv[1]), Path(sys.argv[2])
with ZipFile(destination, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
    for path in [root, *sorted(root.rglob('*'))]:
        if path.is_symlink():
            raise ValueError(f'Symlinks are not supported: {path}')
        name = path.relative_to(root.parent).as_posix() + ('/' if path.is_dir() else '')
        info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
        info.create_system = 3
        info.external_attr = (0o40755 if path.is_dir() else 0o100644) << 16
        if path.is_dir():
            info.external_attr |= 0x10
        archive.writestr(info, b'' if path.is_dir() else path.read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)
