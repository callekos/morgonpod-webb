# V4 checkpoint, 21 oktober 2026

## Integrerat och verifierat

Webb PR 17, merge 335f27d: fyra dagliga och fyra kunskapskanaler. Producent PR 118, merge 2bc6592: endast återkommande Lagstiftning avaktiverad genom automatic_production=false, historisk typbestämning bevarad. 333 lokala producentprov och producent-CI passerade. Fyra övriga kanalregister och 07.45-tider oförändrade.

Webb PR 18, merge 6b29d91: live Designlaboratorium under Mer, kanoniskt bildmanifest, lokal beständig inställning, återställning och fallback. V3 är alltid standard för besökare utan eget val. 33 enhetsprov och 96 browserfall passerade i CI 39530906834. Publicerings-CI 39531389244 är grön. Direkt moln-Chrome-prov: byte till Redaktionell illustration, samma IT-juridikljud fortsatte från 0:36 till 1:27 och kön behöll fyra kommande. Testuppspelningen pausades. Ingen fysisk iPhone påstås testad.

Webb PR 19, merge cc542be: typanpassade kunskapsingångar, fyra synliga bevakningskort på mobil, jämnt kunskapsgrid, kombinerade sökfilter kanal/typ/längd, filtrerad sidfortsättning i kontextkön, artikelrubriker från faktisk text och effektivare sizes. 33 enhetsprov och 108 browserfall godkända i CI 39532417757. Dess nya publiceringskvitto ska kontrolleras. Audit och 14 prioriteringar: UX-AUDIT-V4.md. Äldre issue 1 avslutat efter verifiering.

## Bildproduktion

Ordinarie V3 plus 02 Redaktionell illustration är publicerade. Batch 2 innehåller 03 Grafisk minimalism och 17 Monokromt reportage, båda med åtta separat genererade original, tre WebP-format per kanal och kontaktförhandsvisning. Serierna är visuellt granskade och sex riktade desktop/Android-prov samt 33 enhetsprov passerade efter lokal aktivering. Alla 66 binära batchfiler har laddats upp med exakt blobhashkontroll. Releasegrenen ska få full CI och livekvitto före nästa bildbatch.

17 av 20 experimentella stilar återstår att producera. Se docs/design-lab/STYLE-STATUS.md och production-plan.json. scripts/build-art-series.py kräver åtta distinkta original, sparar prompter och SHA256, bygger optimerade derivat och aktiverar först med --activate efter granskning. Originalmotiven sparas som master-WebP i respektive stilkatalog.

## Nästa konkreta steg

1. Verifiera PR 19 live och publicera batch 2 på färsk main, utan att röra katalogfiler. Kontrollera bildbyte på alla ytor och fysisk enhet endast om sådan faktiskt finns.
2. Fortsätt med återstående 17 stilar i batcher om 2 till 4. Varje batch ska vara komplett, visuellt granskad, testad, publicerad och checkpointad före nästa. Inga halvfärdiga alternativ i manifestet.
3. Slutkontroll: 20 kompletta stilar, 160 distinkta original, inga masterhämtningar i klienten, beständigt lokalt val, återställning, obrutet ljud, teman, nya katalogposter och gamla länkar.
4. Uppdatera issue 14, 15, 16 och äldre issue 3 efter verifierat utfall. Slutleverans får inte påstå 20 färdiga innan alla är live.

## Permanent stil och återställning

Ägaren väljer själv slutlig stil efter test i laboratoriet. Ny standard kräver separat uttryckligt beslut och PR. Behåll V3 tillgänglig och befintliga lokala val. Rollback ändrar enbart avsedda frontendfiler/manifest, aldrig hela katalogen över nya publiceringar. Alla publicerade avsnitt, artiklar, källor och ordinarie kataloguppdateringar bevaras. Gemini, TTS och Watson ska inte ändras.

## Tillgänglighet, nästa fristående etapp

Axe-core 4.14.0 hittade nested-interactive i avsnittsradernas summary. Spelknappen har flyttats till en separat syskonkontroll med samma utseende och kö. Efter rättning: 54 befintliga desktop/Android-prov och fyra nya riktade prov passerar; fem huvudvyer i båda teman har noll automatiska wcag2a/wcag2aa/wcag21aa-träffar. Nya tester kontrollerar oberoende Enter-uppspelning/expansion och reduced motion. Detta är inte fysisk VoiceOver-kvittens. Filerna ska få egen PR och full WebKit-CI före merge.

## Kvitterad release efter PR 21

PR 20 publicerade 03 Grafisk minimalism och 17 Monokromt reportage. PR 21 (merge dc4cb557b324fddb3457a5c61a72b242a4a93eeb) publicerade tillgänglighetsrättningen och fixade ett tvetydigt Mer-länkval i liveprovet. CI 39534317398 är helt grön: 33 enhetsprov, 116 browserfall och fyra publicerade flöden. Exakta frontendbytes på Pages verifierades 2026-10-21 02:44:09 UTC, 25 publicerade avsnitt bevarade. Tidigare livekörningar för PR 19/20 föll på testets tvetydiga Mer-länk, inte produktens navigation.

Ärende 15 och äldre 3 är nu avslutade med verifieringskommentarer. Ärende 14 fortsätter med 17 återstående stilar; 16 följer UX. Batch 3 producerar 04, 05, 10, 11. De får inte aktiveras före granskning av samtliga åtta motiv och WebP-exporter.

Ett nytt globalt unikhetstest hittade tomma masterexporter i 02/AI, 03/IT-juridik och 04/AI samt tom 04/IBAT-kvadrat. PNG-originalen är distinkta och finns kvar, visningsbilderna i de publicerade serierna är giltiga. Återskapa skadade exporter från ursprungliga PNG och ersätt dem i nästa PR. Byggskriptet exporterar nu till minnesbuffer, avkodar för validering och flyttar filen atomärt. Kontrollera alla exporter genom faktisk bildavkodning efter att varje byggprocess avslutats. Lämna inte exec_command-sessioner med pågående export utan slutkvittens.

## Batch 3 klar för egen PR

04 Linoleumsnitt, 05 Isometrisk illustration, 10 Premium 3D-diorama och 11 Nordisk akvarell har 32 separat genererade och granskade original. En oavsiktlig bilmärkesliknande detalj i 04/IBAT har tagits bort genom lokal image_gen-redigering. Alla 231 WebP-filer för sju serier är faktiskt avkodade och alla 56 masteroriginal är distinkta; se quality-batch-3.json. Tre tomma äldre masterexporter samt en lokal kvadrat har återskapats från individuella PNG. Byggskriptet validerar nu i minne och sparar atomärt. Nytt browserprov spärrar experimentella hämtningar för vanliga besökare och masterhämtningar i laboratoriet. Nya testförväntningar räknar aktuell katalog i stället för att anta exakt två lagstiftningsavsnitt eller tomma framtida grundkurser. Inga katalogfiler ska ingå i PR.

## Batch 3 publicerad och slutkvitterad

PR 22 head 286c55c414b8f30e88ae9631d7a2482a61b5d78f, merge d0a2bae33eef50e2164c61722a1c248e7d5974a9. CI 39537197891: 33 enhetsprov och 120 browserfall gröna. Pages 39537596175 grön. Main-CI 39537596815 helt grön, exakta frontendbytes och sju seriers derivat verifierade 03:19:45 UTC, 25 avsnitt bevarade, fyra liveflöden passerade 03:20:41 UTC. Direkt moln-Chrome: alla åtta kanalbilder laddade för 04, 05, 10 och 11, samma ljud fortsatte från 1:50 till 2:01 och kön behöll fyra kommande. Uppspelning pausad. Bildbevis: docs/evidence/v4-batch3-live.jpg.

Sju publicerade experimentella serier: 02, 03, 04, 05, 10, 11, 17. Återstår 13 serier och 104 original. Nästa batch 01, 06, 07, 08 produceras nu med separata inbyggda bildanrop. Ingen aktivering före granskning av komplett serie. Inga katalog-, ljud- eller kärnspelarändringar i bildbatcherna.
