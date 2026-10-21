"""Build exactly eight original channel assets and a preview before activation.

Input maps channel IDs to {path, prompt}. No network or model calls.
Run without --activate for visual review; activate only after reviewing crops.
"""
import argparse
import hashlib
import json
import io
import re
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
CHANNELS = ['ibat', 'vald', 'sjoomradet', 'kek', 'lagstiftning',
            'ai_brottsbekampning', 'it_juridik', 'verksamhetsutveckling']
FOCAL = {'ibat': (.55, .5), 'vald': (.43, .5), 'sjoomradet': (.5, .48),
         'kek': (.53, .52), 'lagstiftning': (.65, .6),
         'ai_brottsbekampning': (.55, .5), 'it_juridik': (.5, .5),
         'verksamhetsutveckling': (.5, .5)}

def save_webp(image, path, quality):
    """Complete and validate encoding before exposing the destination file."""
    buffer = io.BytesIO()
    image.save(buffer, format='WEBP', quality=quality, method=6)
    encoded = buffer.getvalue()
    with Image.open(io.BytesIO(encoded)) as check:
        check.load()
        if check.size != image.size:
            raise ValueError('Invalid exported dimensions')
    temporary = path.with_suffix('.webp.tmp')
    temporary.write_bytes(encoded)
    temporary.replace(path)

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--id', required=True)
    p.add_argument('--number', type=int, required=True)
    p.add_argument('--name', required=True)
    p.add_argument('--sources', type=Path, required=True)
    p.add_argument('--activate', action='store_true')
    a = p.parse_args()
    if not re.fullmatch(r'[0-9]{2}-[a-z]+', a.id) or not 1 <= a.number <= 20:
        raise ValueError('Invalid style identity')
    records = json.loads(a.sources.read_text())
    if set(records) != set(CHANNELS):
        raise ValueError('Exactly eight channel originals required')
    hashes = [hashlib.sha256(Path(records[c]['path']).read_bytes()).hexdigest() for c in CHANNELS]
    if len(set(hashes)) != 8:
        raise ValueError('Originals must be distinct')
    out = ROOT / 'assets/design-lab' / a.id
    out.mkdir(parents=True, exist_ok=True)
    preview = Image.new('RGB', (800, 268), '#f5f0e7')
    entries, provenance = {}, []
    for i, c in enumerate(CHANNELS):
        with Image.open(records[c]['path']) as original:
            im = original.convert('RGB')
        if min(im.size) < 640:
            raise ValueError('Insufficient original resolution')
        save_webp(im, out / (c + '-master.webp'), 93)
        for suffix, size, quality in [('', (960, 640), 80), ('-small', (400, 267), 76),
                                       ('-square', (640, 640), 80)]:
            save_webp(ImageOps.fit(im, size, centering=FOCAL[c]), out / (c + suffix + '.webp'), quality)
        preview.paste(ImageOps.fit(im, (200, 134), centering=FOCAL[c]), ((i % 4) * 200, (i // 4) * 134))
        base = 'assets/design-lab/' + a.id + '/' + c
        entries[c] = {'wide': base + '.webp', 'small': base + '-small.webp',
                      'square': base + '-square.webp', 'focal': ' '.join(str(round(v * 100)) + '%' for v in FOCAL[c])}
        provenance.append({'channel': c, 'prompt': records[c]['prompt'], 'generated_png_sha256': hashes[i],
                           'master': base + '-master.webp', 'original_dimensions': list(im.size)})
    save_webp(preview, out / 'preview.webp', 77)
    docs = ROOT / 'docs/design-lab'
    docs.mkdir(exist_ok=True)
    (docs / (a.id + '.json')).write_text(json.dumps({'style': a.id, 'name': a.name,
        'generator': 'built-in image_gen', 'originals': provenance}, ensure_ascii=False, indent=2) + '\n')
    if a.activate:
        path = ROOT / 'channel-art-manifest.js'
        text = path.read_text()
        manifest = json.loads(text.split('const data=', 1)[1].split(';if(typeof module=', 1)[0])
        style = {'id': a.id, 'number': a.number, 'name': a.name, 'status': 'ready',
                 'preview': 'assets/design-lab/' + a.id + '/preview.webp', 'channels': entries}
        manifest['styles'] = sorted([s for s in manifest['styles'] if s['id'] != a.id] + [style], key=lambda s: s['number'])
        manifest['planned'] = [s for s in manifest['planned'] if s['number'] != a.number]
        path.write_text('(function(root){const data=' + json.dumps(manifest, ensure_ascii=False, indent=2) +
            ";if(typeof module==='object'&&module.exports)module.exports=data;else root.ChannelArtManifest=data;})(typeof window!=='undefined'?window:this);\n")
    print(a.id, '8 originals, 24 derivatives, preview;', sum(f.stat().st_size for f in out.glob('*.webp')), 'bytes')

if __name__ == '__main__':
    main()
