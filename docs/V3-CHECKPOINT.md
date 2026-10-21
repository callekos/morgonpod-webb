# V3 checkpoint: levererad 21 oktober 2026

## Verifierat läge

Kanalernas morgon V3 är publicerad på https://callekos.github.io/morgonpod-webb/. Frontendrelease: PR #13, merge a70ae19. Producentens exakta katalogpolicy: nyhetspodden PR #115, merge 920ef5a. Efterföljande commit 697f285 rättar enbart en gammal versionsförväntan i livekontrollen.

28 enhetstester, 84 browserfall och fyra verkliga liveflödestester passerar i CI 39518670565. iPhone/iPad med WebKit, Android och desktop ingår. Lokala katalogtester omfattar 6 000 avsnitt och 24 000 artiklar. Livekontroll 21 oktober 01.56.58 svensk tid: 31/31 frontend-/bildfiler matchar, 25 aktiva avsnitt, 25 artiklar, åtta kanaler, åtta uppstarter och alla 25 biblioteks-ID:n kvar. Alla fem gamla direktlänkar har rätt superseded-status och ersättnings-ID. Gammal och ny MP3 svarar HTTP 206. Källregister och originalmedia är oförändrade.

## Fortsättning och kontrakt

Inget arbete återstår för den verifierade frontendleveransen. Läs V3-DELIVERY-2026-10-21.md och V3-LIVE-RECEIPT.json för kvitton, begränsningar och rollback. Åtta bilders manual finns i channel-art-v3.md; final surfplattebild finns i evidence/tablet-webkit-v3-final.jpg.

Nattredaktionen äger de 15 nya specialerna i nyhetspodden #114. Vid webbens bytekontroll hade 0 publicerats. Katalogen ska alltid byggas från färsk main med aktuell build_catalog och bevarad catalog-policy.json. Nya specialer och kommande daily ska behållas. Ändra inte deras manus, ljud eller ordinarie 07.45-flöde från detta webbuppdrag. Bevakningsvyn hämtar nya poster vid sidöppning eller omladdning, med exakt datum och tydlig fallback.

## Kända begränsningar

Ingen fysisk iPhone-, VoiceOver- eller Lighthousekontroll har gjorts. Den utlovade V3-konceptbilden kunde inte hämtas, så design-qa.md behåller blocked för exakt jämförelse mot den bilden; detta är ingen påstådd pixelperfekt reproduktion. Den skriftligt godkända riktningen är implementerad och renderingen granskad. Små radbrytningar i långa kunskapskanalnamn på surfplatta kan förfinas senare. Ingen Telegramkvittens finns från denna session.

## Återställning

För att återställa gamla avsnitt: ta bort önskade exakta policypar och bygg om från kvarvarande episodes.json/story_index.json. Återställ inte en gammal hel katalog över nyare publiceringar. Frontendrollback ska hålla senare innehåll och katalogpolicy separata. Inga Gemini-, TTS-, profil- eller schemaändringar ingår.
