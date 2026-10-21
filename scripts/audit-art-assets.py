"""Offline validation of the ready art manifest, original provenance and WebP files.

Requires Pillow, like build-art-series.py. Does not generate images or use APIs.
Example: python3 scripts/audit-art-assets.py --expected-series 20 --output docs/design-lab/quality-final.json
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CHANNELS = {'ibat', 'vald', 'sjoomradet', 'kek', 'lagstiftning',
            'ai_brottsbekampning', 'it_juridik', 'verksamhetsutveckling'}


def decoded(path, expected=None):
    data = path.read_bytes()
    assert len(data) > 100, f'Empty or incomplete image: {path}'
    with Image.open(path) as image:
        image.load()
        assert image.format == 'WEBP', f'Unexpected format: {path}'
        assert min(image.size) >= 200, f'Insufficient resolution: {path}'
        if expected:
            assert image.size == tuple(expected), f'Wrong dimensions: {path}'
        dimensions = list(image.size)
    return {'bytes': len(data), 'dimensions': dimensions,
            'sha256': hashlib.sha256(data).hexdigest()}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--expected-series', type=int)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    source = (ROOT / 'channel-art-manifest.js').read_text()
    manifest = json.loads(source.split('const data=', 1)[1].split(';if(typeof module=', 1)[0])
    styles = [s for s in manifest['styles'] if s['id'] != 'v3']
    if args.expected_series is not None:
        assert len(styles) == args.expected_series, 'Not all expected series are ready'
    if args.expected_series == 20:
        assert sorted(s['number'] for s in styles) == list(range(1, 21))
        assert not manifest['planned'], 'Unfinished styles remain'
    all_masters, all_sources, series = [], [], []
    for style in styles:
        assert style['status'] == 'ready'
        assert set(style['channels']) == CHANNELS
        metadata = json.loads((ROOT / 'docs/design-lab' / (style['id'] + '.json')).read_text())
        originals = {o['channel']: o for o in metadata['originals']}
        assert len(metadata['originals']) == 8 and set(originals) == CHANNELS
        assets, small_bytes = [], 0
        for channel, paths in style['channels'].items():
            provenance = originals[channel]
            assert provenance['prompt'] and len(provenance['generated_png_sha256']) == 64
            original = decoded(ROOT / provenance['master'], provenance['original_dimensions'])
            all_masters.append(original['sha256'])
            all_sources.append(provenance['generated_png_sha256'])
            assets.append(original)
            for role, dimensions in [('small', (400, 267)), ('wide', (960, 640)), ('square', (640, 640))]:
                asset = decoded(ROOT / paths[role], dimensions)
                assets.append(asset)
                if role == 'small':
                    small_bytes += asset['bytes']
        preview = decoded(ROOT / style['preview'], (800, 268))
        assets.append(preview)
        series.append({'id': style['id'], 'number': style['number'], 'originals': 8,
                       'decoded_webp_files': len(assets), 'total_bytes': sum(a['bytes'] for a in assets),
                       'eight_small_bytes': small_bytes, 'preview_bytes': preview['bytes']})
    assert len(set(all_masters)) == len(all_masters), 'Reused or corrupt master originals'
    assert len(set(all_sources)) == len(all_sources), 'Reused generated PNG originals'
    report = {'experimental_series_count': len(styles), 'distinct_originals': len(all_masters),
              'decoded_webp_files': len(styles) * 33, 'ordinary_default': 'V3',
              'validation': 'offline image decoding, dimensions, provenance and SHA256 uniqueness',
              'physical_device_tested': False, 'series': series}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(f"Validated {len(styles)} series, {len(all_masters)} distinct originals, {len(styles) * 33} decoded WebP files")


if __name__ == '__main__':
    main()
