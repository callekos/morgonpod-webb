"""Local task preparation using the existing reviewed publication/catalog adapters."""
from pathlib import Path
import copy, datetime, hashlib, json, subprocess, sys

ROOT = Path('/Users/kos/Documents/ChatGPT/Watson - bygge')
WEB = ROOT / 'watson-night-web-20261025'
POD = ROOT / 'watson-night-special-20261025/pod'
OUT = Path(__file__).parent
sys.path.insert(0, str(POD / 'src'))
from producer_publication_plan import plan_publication
from producer_article_notes import rollback_candidate
from archive_catalog import build_catalog
from story_index import digest

def git(*args):
    return subprocess.check_output(['git', *args], cwd=WEB)

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

base = git('rev-parse', 'HEAD').decode().strip()
assert base == 'd2f5c44de233bfeebe073f601ede533d4421f446'
assert git('ls-remote', 'origin', 'refs/heads/main').decode().split()[0] == base
snapshot, candidate = OUT / 'snapshot', OUT / 'candidate'
assert not snapshot.exists() and not candidate.exists()
paths = ['story_index.json', 'episodes/sjoomradet/2026-10-25/brief.json',
         'catalog/articles/e1afa92226cd1c3bfa171d6b.json']
kinds = ['index', 'brief', 'catalog']
for name in paths + ['episodes.json', 'catalog/manifest.json', 'catalog-policy.json',
                     'episode-numbers.json', 'channel-art-manifest.js']:
    data = git('show', base + ':' + name)
    for directory in [snapshot, candidate]:
        p = directory / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(data)
oldplan = json.loads(git('show', '7041e1c:docs/evidence/sjo-galveston-correction-2026-10-25/PLAN.json'))
stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
binding = copy.deepcopy(oldplan['plans'][0]['manifest']['binding'])
binding.update(base_revision=base, cycle_id='producer_2026W44')
source = json.loads((ROOT / 'watson-night-evidence-20261025/sjo-25oct/osint_sources.json').read_text())
source = next(s for s in source['sources'] if 'port-of-galveston-strengthening' in s['url'])
assert source['page_sha256'] == '828cbc87564c3b424442eea8637504a5baf5e93d6713d6af7d2058477160197a'
assert all(v in source['text'] for v in ['840-acre', '$1,180,524', '$131,250', '$200,525', '$22,232', '$39,503'])
assert sum([131250, 200525, 22232, 39503]) == 393510
assert sum([393750, 601575, 66693, 118506]) == 1180524
plans, rollback_records = [], []
for previous in oldplan['plans']:
    record = json.loads((candidate / paths[2]).read_text())
    change = copy.deepcopy(previous['change'])
    change.update(expected_revision=record['revision'], expected_record_sha256=digest(record))
    change['note'] = change['note'].replace('25 oktober 2026', '26 oktober 2026')
    evidence = copy.deepcopy(previous['evidence'])
    evidence['change_sha256'] = digest(change)
    assert evidence['page_sha256'] == source['page_sha256']
    snapshots = [{'path': p, 'kind': kind, 'bytes': (candidate / p).read_bytes()}
                 for p, kind in zip(paths, kinds)]
    planned = plan_publication(binding, snapshots, change, evidence, stamp)
    assert len(planned['writes']) == 3
    for p, data in planned['writes'].items():
        (candidate / p).write_bytes(data)
    after = json.loads((candidate / paths[2]).read_text())
    inverse = {'expected_after_sha256': digest(after), 'before_record': record}
    assert rollback_candidate(after, inverse) == record
    rollback_records.append(inverse)
    plans.append({'change': change, 'evidence': evidence, 'manifest': planned['manifest']})

final_record = json.loads((candidate / paths[2]).read_text())
assert final_record['revision'] == 3 and len(final_record['editorial_notes']) == 2
original = json.loads((snapshot / paths[2]).read_text())
assert rollback_candidate(rollback_candidate(final_record, rollback_records[1]), rollback_records[0]) == original
for planned in plans:
    inputs = [{'path': p, 'kind': kind, 'bytes': (candidate / p).read_bytes()}
              for p, kind in zip(paths, kinds)]
    replay = plan_publication(binding, inputs, planned['change'], planned['evidence'], stamp)
    assert not replay['writes'] and replay['manifest']['new_changes'] == 0

old_index = json.loads((snapshot / 'story_index.json').read_text())
new_index = json.loads((candidate / 'story_index.json').read_text())
assert len(old_index['stories']) == len(new_index['stories']) == 154
assert [s['id'] for s in old_index['stories']] == [s['id'] for s in new_index['stories']]
changed = [a['id'] for a, b in zip(old_index['stories'], new_index['stories']) if a != b]
assert changed == [original['id']]
for key in ['id', 'episode_id', 'channel', 'published_at', 'source_url', 'title']:
    assert final_record[key] == original[key]

old_manifest = json.loads((snapshot / 'catalog/manifest.json').read_text())
manifest = build_catalog(candidate, new_index, old_manifest['channels'])
for key, value in old_manifest.items():
    if key not in manifest:
        manifest[key] = value
write(candidate / 'catalog/manifest.json', manifest)
assert json.loads((candidate / paths[2]).read_text()) == final_record
for p in ['episodes.json', 'episode-numbers.json', 'catalog-policy.json', 'channel-art-manifest.js']:
    a, b = (snapshot / p).read_bytes(), (candidate / p).read_bytes()
    if p.endswith('.json'):
        assert json.loads(a) == json.loads(b), p
    else:
        assert a == b
    (candidate / p).write_bytes(a)
assert len(json.loads((candidate / 'episodes.json').read_text())['episodes']) == 78

tree = {}
for line in git('ls-tree', '-r', '-z', base).decode().rstrip('\0').split('\0'):
    left, p = line.split('\t', 1)
    mode, kind, sha = left.split()
    if kind == 'blob':
        tree[p] = sha
changes = []
for p in sorted(candidate.rglob('*')):
    if not p.is_file():
        continue
    name = p.relative_to(candidate).as_posix()
    data = p.read_bytes()
    if name in tree and name.endswith('.json'):
        previous = git('show', base + ':' + name)
        if json.loads(previous) == json.loads(data):
            data = previous
            p.write_bytes(data)
    blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
    if blob != tree.get(name):
        changes.append({'path': name, 'before_git_blob': tree.get(name), 'after_git_blob': blob,
                        'after_sha256': hashlib.sha256(data).hexdigest()})
assert not any(p['path'].startswith(('assets/', 'tests/')) for p in changes)
assert not any(p['path'] in ['episodes.json', 'episode-numbers.json', 'catalog-policy.json',
                             'channel-art-manifest.js'] for p in changes)
write(OUT / 'PLAN.json', {'base_revision': base, 'prepared_at': stamp,
                         'adapter_revision': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=POD).decode().strip(),
                         'source_artifact': 12585367147, 'source_page_sha256': source['page_sha256'],
                         'plans': plans, 'replay_writes': 0, 'conditional_record_inverse_verified': True,
                         'execution_authorized_by_planner': False, 'publication_performed': False})
write(OUT / 'COPIES.json', {'base_revision': base, 'files': changes,
                           'preserved_episodes': 78, 'preserved_other_articles': 153,
                           'article_order_preserved': True, 'old_unpublished_candidate_not_used_as_base': True})
print(json.dumps({'base': base, 'changed_files': len(changes), 'article_revision': 3,
                  'published': False, 'prepared_at': stamp}))
