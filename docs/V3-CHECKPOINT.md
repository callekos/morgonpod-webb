# Kanalernas morgon V3

## Scope and current checkpoint

Issue #12 implements the approved direction. Source concept was described in issue #12 and the owner's explicit brief. The promised new concept attachment was not actually exposed in this session. This is an implementation of the approved information architecture and image direction, not a claim of pixel-perfect matching to an unseen concept image.

The homepage has four sections in order: Dagens bevakning, Våra kanaler, Fördjupa dina kunskaper, Senast publicerat. All eight channels have individual original photographs and shared image identity for episodes, articles, detail views and media session. Morning playback starts a bounded queue of ordinary episodes on one editorial date in channel order. Special editions never enter it. A missing morning clearly shows the latest available date, and missing channels are stated. New same-day arrivals take precedence automatically on reload. The law channel joins only when its ordinary edition has the same date. No login, favourites or profiling.

## Duplicate correction

catalog-policy.json maps exactly five 2026-10-20 daily IDs to the five WORK_LIBRARY_2026_10 replacement_ordinary IDs. Each pair activates only if its replacement exists in retained episodes.json. Active lists, histories, topics, counts and search omit the retired records and their 14 articles. 25 library episodes and 25 articles remain. Direct URLs explain the replacement and link to the new episode. Old source records and MP3 files remain byte-for-byte unchanged. Queues reject retired saved entries. All future daily and special IDs remain eligible.

Producer support is integrated in callekos/nyhetspodden PR #115, commit 920ef5a3a9145f75263b6ff711061fcab1e5a661. Its CI tests passed. Five local Python tests include large archives, exact IDs, same-day re-run, next-day daily, special, search, missing replacement, media preservation and rollback. The publisher reads the web-owned policy and creates episodes/ordinary/channel/<id> pages. No Gemini/TTS, schedule, transport or profile changes. Issue #114 has the contract and integration notice.

## Recovery

To restore superseded records, remove selected mappings from catalog-policy.json and rebuild the catalog through current build_catalog using retained episodes.json/story_index.json. The producer then removes retired markers from fresh detail files too. Do not merely remove the frontend guard or restore old generated list snapshots. To roll back only the frontend, revert the V3 frontend/image commit without reverting later catalog/content publications. Read fresh main before each catalog write.

## Validation

28 local unit tests passed. Existing desktop and Android Chromium browser flows passed, including real MP3 playback, natural queue advance, resume without autoplay, search, sources, themes and large paginated archives. Added V3 scenarios cover four-section order, eight image identities, morning queue, future four-channel arrival, special exclusion and old direct URLs. Full final local run and CI results must be recorded after completion.

Local WebKit cannot launch because this host lacks its shared libraries; dependency installation was denied by filesystem permissions. The existing GitHub browser job installs WebKit dependencies on Ubuntu and is the release gate for iPhone/iPad WebKit. Do not claim physical iPhone hardware testing. The cloud-browser local preview call stalled and was interrupted; use the automated rendered browser evidence and report that limitation. No changes are published yet at this checkpoint.

## Next steps

Upload final code, generated catalog projection and test/evidence changes to design/kanalernas-morgon-v3. Open one release PR, inspect all checks and review the diff. Merge only after the full browser suite passes in CI, including WebKit. Then verify exact frontend and all eight image bytes live, active counts, direct-link replacement handling and audio. Recheck issue #114 for actual published specials. Report exact outcome, without treating future content or future morning production as already verified. Private Telegram status is optional only through an existing approved transport; do not create a new bot or leak credentials.
