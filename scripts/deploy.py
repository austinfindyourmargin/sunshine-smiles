"""Publish only dist/ to the Sunshine Smiles preview, with verified staging."""

import hashlib
import json
import os
from pathlib import Path
import stat
from datetime import datetime, timezone

import paramiko


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
TARGET = "public_html/sunshinesmiles"
manifest = json.loads((DIST / "release.json").read_text())
assert manifest["site"] == "sunshine-smiles"
assert manifest["base"] == "https://findyourmargin.com/sunshinesmiles/"
files = sorted(path for path in DIST.rglob("*") if path.is_file())
for relative, expected in manifest["files"].items():
    assert hashlib.sha256((DIST / relative).read_bytes()).hexdigest() == expected, relative

client = paramiko.SSHClient()
client.load_system_host_keys()
client.connect(
    hostname=os.environ["SS_SFTP_HOST"],
    username=os.environ["SS_SFTP_USER"],
    password=os.environ.get("SS_SFTP_PASSWORD"),
    timeout=30,
    auth_timeout=30,
)
stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
# Staging and backups stay outside the public web root.
stage = f"private_html/.sunshinesmiles-stage-{stamp}"
backup = f"private_html/.sunshinesmiles-backup-{stamp}"


def exists(sftp, path):
    try:
        return sftp.stat(path)
    except FileNotFoundError:
        return None


with client, client.open_sftp() as sftp:
    previous = exists(sftp, TARGET)
    if previous:
        if not stat.S_ISDIR(previous.st_mode):
            raise RuntimeError("Destination exists but is not a directory.")
        with sftp.open(f"{TARGET}/index.html") as file:
            if b"Sunshine Smiles" not in file.read():
                raise RuntimeError("Destination is not an identifiable Sunshine Smiles site.")
    sftp.mkdir(stage, mode=0o755)
    sftp.chmod(stage, 0o755)
    made = {stage}
    for index, source in enumerate(files, start=1):
        relative = source.relative_to(DIST).as_posix()
        remote = f"{stage}/{relative}"
        parent = stage
        for part in Path(relative).parts[:-1]:
            parent += "/" + part
            if parent not in made:
                sftp.mkdir(parent, mode=0o755)
                sftp.chmod(parent, 0o755)
                made.add(parent)
        sftp.put(str(source), remote)
        sftp.chmod(remote, 0o644)
        with sftp.open(remote) as file:
            actual = hashlib.sha256(file.read()).hexdigest()
        if actual != hashlib.sha256(source.read_bytes()).hexdigest():
            raise RuntimeError(f"Upload verification failed: {relative}")
        if index % 25 == 0:
            print(f"Verified {index}/{len(files)} files", flush=True)
    if previous:
        sftp.rename(TARGET, backup)
    try:
        sftp.rename(stage, TARGET)
    except Exception:
        if previous:
            sftp.rename(backup, TARGET)
        raise
    print(f"Published {len(files)} verified files to {TARGET}.")
    if previous:
        print(f"Previous release preserved at {backup}.")
