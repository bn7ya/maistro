import json
import os
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLUGIN = ROOT / "plugins" / "maistro"
SCRIPTS = PLUGIN / "scripts"
sys.path.insert(0, str(SCRIPTS))
sys.path.insert(0, str(ROOT / "tools"))


def run_script(name, args, cwd=None, stdin=None, env=None):
    e = dict(os.environ)
    e.update(env or {})
    return subprocess.run([sys.executable, str(SCRIPTS / name)] + list(args), cwd=cwd, input=stdin,
                          capture_output=True, text=True, env=e, timeout=60)


def hook(name, payload, cwd=None, env=None):
    r = run_script(name, [], cwd=cwd, stdin=json.dumps(payload), env=env)
    return json.loads(r.stdout) if r.stdout.strip() else None


def meta(**kw):
    m = {
        "title": "A study", "authors": [{"name": "Ada Lovelace", "kind": "person"}], "year": 2020,
        "identifier": {"type": "doi", "value": "10.1000/xyz"}, "type": "journal-article", "empirical": True,
        "resolution": {"method": "cli", "match_score": 0.97},
    }
    m.update(kw)
    return m
