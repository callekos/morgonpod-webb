# Morgonpodden V4, aktuell checkpoint

Uppdaterad 21 oktober 2026. Fortsätt befintligt arbete, generera inte om färdiga serier. Denna fil ersätter den löpande checkpointens äldre delsummeringar; full historik finns i git.

## Verifierat publicerat

V3 är standard. Designlaboratorium finns under Mer och på https://callekos.github.io/morgonpod-webb/designlaboratorium.html. Stilval sparas lokalt och påverkar inte andra besökare. Uppspelning och kontextkö bevaras vid stilbyte.

15 experimentella serier publicerade genom PR 18, 20, 22, 23 och 25. Senaste bildrelease: PR 25, merge c6ae6a2fbb3a2c37557755e7309656673db60db6. Main-CI 39545294242 helt grön: 33 enhetsprov, 128 browserfall och fyra publicerade flöden.

Klassificering publicerad i webb-PR 17 samt producent-PR 118 och dokumenterad i producent-PR 119. Lagstiftning är kunskapskanal med historik, automatic_production false. Exakt fyra dagliga kanaler: IBAT, Våld, Sjöområdet och Kriminell ekonomi. Producentens 333 lokala offlineprov och CI 39530173377 gröna. De fyra dagliga kanalernas produktionstider och kärnproduktion ändrades inte. Rör inte Gemini, TTS eller Watson.

UX publicerad i PR 19, 21 och 24: mobilens fyra bevakningskort, kunskapsingångar, kombinerade sökfilter, semantiska artikelrubriker, kompakt kö, separata play/expand-kontroller, tangentbord, reduced motion, responsiva omslag, mindre redundant metadata och beständig sökstatus. UX-CI 39544111942 helt grön.

Ärende 15 och äldre 1 och 3 avslutade efter verifiering. 10 och 12 var redan avslutade vid övertagandet. 14 följer slutleveransen och ägarens stilval; 16 följer UX och kvarstående fysisk provning.

## Slutbatch klar lokalt

15 Retro, 16 Papperskonst, 18 Surrealism, 19 Ritning och 20 Tidskrift har 40 egna original, granskade kontaktserier och beskärningar. Totalt 20 kompletta serier, 160 unika original, 660 avkodade WebP-filer enligt quality-final.json. Lokalt manifest och HTML-query v4-art-final aktiverar dessa först i egen release. V3 fortfarande standard.

33 lokala enhetsprov och 64 browserfall för desktop/emulerad Android gröna efter aktivering. Full WebKit-matris återstår i CI. Publicera från färsk main med endast nya tillgångar, metadata, manifestversion och dokumentation. Inga katalogfiler får skrivas över. Kontrollera PR-CI, Pages, exakt frontend/bildinnehåll och liveflöden innan slutkvittens i ärende 14.

## Beständiga original och återupptagning

Original i assets/design-lab/STYLE/*-master.webp, derivat i samma katalog, prompter och PNG-hashar i docs/design-lab/STYLE.json. 02:s exakta initiala promptordalydelse är inte bevarad och dokumenteras ärligt som normaliserad rekonstruktion. Övriga serieprompter och lokala redigeringar finns i proveniensen.

Gren work/v4-art-production-checkpoints sparar färdiga original före release utan extra Actions. Den är återhämtningsunderlag, inte releasegren. Lokala upload-STYLE.json kan återanvändas efter SHA-kontroll. Ändra endast från färsk main; separat redaktion får publicera nya katalogposter samtidigt.

## Kontroller och gränser

- npm test
- npx playwright test (CI har Chromium och WebKit; lokalt Chromium)
- python3 scripts/audit-art-assets.py --expected-series 20 --output docs/design-lab/quality-final.json
- node scripts/verify-live.cjs (följ dess URL-inställningar)
- Produktionskontrakt provar 20 kanaler, 6 000 avsnitt och 24 000 artiklar.

Testerna skiljer lokala enhetsprov, emulerad Android/iPhone/surfplatta, desktop och direkt moln-Chrome. Fysisk iPhone Safari, VoiceOver, skärmlås och lång bakgrundsuppspelning har inte kunnat verifieras. Påstå inte att dessa är klara. Inga Lighthouse-/fältprestandavärden är uppmätta.

Skyddad V3-baseline har 816 filer i episodes/, catalog/, assets/channels/, episodes.json och story_index.json. De var identiska genom batch 3. Före slutrelease har redaktionen publicerat nya specialavsnitt i PR 26/27 och byggt om katalogen: inga av 816 sökvägar saknas och alla 350 filer i episodes/ och assets/channels/ är oförändrade. Katalogens ersättningspolicy med fem poster finns kvar. Se integrity-before-final.json. Upprepa mot färsk main efter slutrelease. Nya redaktionella tillägg får tillkomma, gamla poster och direktlänkar ska finnas kvar.

## Överlämning

Se UX-AUDIT-V4.md, design-lab/STYLE-STATUS.md, REVIEW.md, quality-final.json och CHOOSE-DEFAULT.md. Slutlig publiceringskvittens och kvarstående fysisk provning dokumenteras i ärende 14/16. Ägaren ska själv välja permanent stil. Gör ingen experimentserie till standard utan ett uttryckligt nytt beslut.
