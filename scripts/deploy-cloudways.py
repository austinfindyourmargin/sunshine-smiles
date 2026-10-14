"""Publish a verified release to the Sunshine Smiles Cloudways application."""

import hashlib
import json
import os
from pathlib import Path
from datetime import datetime, timezone

import paramiko


DIST = Path(__file__).resolve().parent.parent / "dist"
BASE = "https://phpstack-1564285-6705359.cloudwaysapps.com/"
manifest = json.loads((DIST / "release.json").read_text())
assert manifest["site"] == "sunshine-smiles" and manifest["base"] == BASE
files = sorted(path for path in DIST.rglob("*") if path.is_file())
assert {p.relative_to(DIST).as_posix() for p in files} == set(manifest["files"]) | {"release.json"}
for relative, expected in manifest["files"].items():
    assert hashlib.sha256((DIST / relative).read_bytes()).hexdigest() == expected, relative

client = paramiko.SSHClient()
client.load_system_host_keys()
client.connect(
    "144.202.14.99",
    username="smiles",
    password=os.environ["SS_SFTP_PASSWORD"],
    look_for_keys=False,
    allow_agent=False,
    timeout=30,
    auth_timeout=30,
)
stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
stage = f"private_html/.sunshine-stage-{stamp}"
backup = f"private_html/sunshine-backup-{stamp}"

with client, client.open_sftp() as sftp:
    with sftp.open("public_html/index.html") as file:
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

    # The application user cannot replace Cloudways' managed public_html folder.
    # Promote its contents only after every staged file passes verification.
    # Assets precede pages, and the homepage is promoted last.
    sftp.mkdir(backup, mode=0o700)
    previous = set(sftp.listdir("public_html"))
    incoming = set(sftp.listdir(stage))
    ordered = sorted(incoming, key=lambda name: (name == "index.html", name.endswith(".html"), name))
    saved = []
    promoted = []
    try:
        for name in ordered:
            if name in previous:
                sftp.rename(f"public_html/{name}", f"{backup}/{name}")
                saved.append(name)
            sftp.rename(f"{stage}/{name}", f"public_html/{name}")
            promoted.append(name)
        for name in sorted(previous - incoming):
            sftp.rename(f"public_html/{name}", f"{backup}/{name}")
            saved.append(name)
    except Exception:
        for name in reversed(promoted):
            sftp.rename(f"public_html/{name}", f"{stage}/{name}")
        for name in reversed(saved):
            sftp.rename(f"{backup}/{name}", f"public_html/{name}")
        raise
    sftp.rmdir(stage)
    print(f"Published {len(files)} verified files to {BASE}")
    print(f"Previous release preserved at {backup}.")
