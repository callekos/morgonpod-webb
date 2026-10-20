# V3 design and functional QA

Source: approved direction and requirements in issue #12 and the explicit owner brief. The V3 concept attachment was not exposed to this session. The older docs/evidence/approved-design.jpg is V2 and must not be mislabelled as the V3 target.

Implementation evidence: docs/evidence/android-chromium-v3-full.jpg, android-chromium-v3-dark.jpg, desktop-v3-full.jpg, desktop-v3-dark.jpg and v3-channel-series.jpg. CSS viewports 393x727 (Pixel 5) and 1280x720 desktop, screenshots normalized to CSS pixels. Light/dark, ordinary playback, queue, old direct links and the new homepage are covered in tests/browser/v3.spec.cjs. Existing tests cover responsive channel views, article expansion, reduced requests, search, theme persistence and real audio. No page console errors in passed scenarios.

Typography: existing Georgia brand/display and system sans interface retained. Headings, descriptions and small metadata have distinct hierarchy; long channel names wrap. Spacing: four visible sections, compact morning panel, 2-column mobile and 4-column desktop channel grid. Morning editions use horizontal scrolling on narrow screens to preserve channel discovery above the fold. Colors: existing off-white/navy identity with eight restrained image accents; both themes use existing semantic variables. Images: all eight new motifs reviewed at 80px and 300px, responsive WebP and no baked-in UI text. Copy: actual dates/counts/durations, explicit fallback for unpublished morning, no fabricated personal recommendations.

Iteration 1 found [P2] IBAT's long label overflowed the compact morning edition card and [P2] five fallback editions made the morning section too tall on mobile. Fixed with the short IBAT label, wrapping constraints and a horizontally scrollable morning strip. Post-fix screenshots are saved in the V3 evidence files. The image series itself is a single comparison board covering all eight images at matched sizes.

A visual fidelity comparison with the exact V3 concept image cannot be completed because that source image is absent. The cloud-browser preview call also stalled and was interrupted. The rendered automated browser evidence supports implementation and interaction QA, but does not satisfy a pixel-fidelity claim to the unavailable concept. Local WebKit is blocked by missing host dependencies; GitHub CI WebKit is required before release. Physical iPhone testing is not claimed.

final result: blocked

This result refers to exact concept-image fidelity. Functional release acceptance is separately gated on the approved written direction, rendered desktop/mobile review, CI browser coverage and byte verification. Do not report pixel-perfect reproduction or the Product Design prototype workflow as fully passed.


Iteration 2: CI WebKit found [P2] tablet overflow and invisible titles from inherited V2 order/nested grids/line-clamp. Scoped CSS removes those inherited rules. Added five intermediate viewport checks. Desktop/mobile V3 tests pass after the fix. Awaiting full CI WebKit evidence before functional release acceptance.
