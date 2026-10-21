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

## Batch 4 klar lokalt

01 Dokumentärfoto, 06 Analog film, 07 Oljemålning och 08 Geometrisk affischkonst har producerats med separata inbyggda bildanrop och granskats tillsammans samt i små och kvadratiska beskärningar. Alla elva serier har avkodade WebP-filer och unika PNG- och masterhashar, se quality-batch-4.json. Ny reproducerbar kontroll: python3 scripts/audit-art-assets.py --expected-series 20 --output docs/design-lab/quality-final.json (kör med 11 före batch 4-release).

Originalserier sparas även i grenen work/v4-art-production-checkpoints utan Actions-körningar. Den grenen är återhämtningsunderlag, inte release. Manifestet i publicerad main ska endast ändras genom en verifierad releasegren. Lokala upload-STYLEID.json innehåller redan verifierade blobhashar för avbruten uppladdning.

02 Redaktionell illustration har nu dokumenterad PNG-proveniens; dess initiala exakta promptordalydelse var inte bevarad och promptfältet är därför uttryckligen märkt som normaliserad rekonstruktion från produktionsbriefen. Övriga nya serier innehåller faktiskt använda prompter. Ingen ny generering av äldre serier har gjorts.

## Batch 4 publicerad och slutkvitterad

PR 23 head 67e7d11c51ab86ac32e22b7414a852c941858f50, merge 59504e9e6bccadfe06aa7c6e05818678a419dd09. PR-CI 39540257610: 33 enhetsprov och 120 browserfall gröna. Pages 39540700945 grön. Main-CI 39540701633 helt grön: exakta frontend- och bildfiler 03:54:00 UTC, 25 avsnitt bevarade, fyra liveflöden 03:54:44 UTC. Direkt moln-Chrome: alla åtta kanalbilder laddade för 01, 06, 07 och 08, pausad ljudposition 2:15 och fyra kommande i kön kvar. Bildbevis docs/evidence/v4-batch4-live.jpg.

Elva publicerade serier, 88 original. Återstår nio serier och 72 original. Nästa batch 09, 12, 13, 14; sista batch 15, 16, 18, 19, 20. Håll varje serie komplett och granskad, använd separata inbyggda bildanrop. Fyra bildanrop kan köras parallellt; filuppladdning använder fyra samtidiga filer och läser validerade base64-segment om 60 000 byte med hashkontroll. Spara uppladdningslistor efter varje delbatch för återupptagning.

Filintegritet mot V3 54e90a3: samtliga 816 skyddade filer i episodes/, catalog/, assets/channels/, episodes.json och story_index.json är identiska i batch 3. Rapport integrity-v3-to-batch3.json ska följa nästa PR och jämförelsen ska upprepas efter slutreleasen. Tre små kvarstående UX-förfiningar finns dokumenterade i issue 16: kanalmetadata i egen kanalvy, kortare skärmläsarnamn i bildväljaren och beständig statusregion för sökantal. Genomför efter bildserierna, behåll fysisk Safari/VoiceOver som separat ej kvitterad kontroll.

## Fristående UX-rättning före nästa bildrelease

Direkt DOM-prov på publicerad desktop visade att 1 093 px brett kanalomslag laddade 400 px-exporten via sizes=320px. Appen använder nu en egen klass och storleksangivelse för stort kanalomslag, verifierat genom faktisk currentSrc i både V3 och vald experimentserie. Bildkorten behåller sitt tidigare urval.

Samma avgränsade etapp förenklar laboratoriets tillgängliga radionamn (dekorativ kontaktbild med tom alt), döljer upprepat kanalnamn enbart i kanalens egna avsnittsrader och flyttar sökantal/laddning/fel till en beständig statusregion. Hela resultatlistan behöver då inte annonseras vid filtrering. Sena sökfel efter navigation ignoreras. 33 enhetsprov och 22 riktade desktop/Android-prov gröna, inklusive två nya regressionsfall. Full CI och livekvittens krävs fortfarande före slutkvittering.

Nästa bildbatch 09, 12, 13, 14 är producerad som original men ännu inte publicerad. 09 är granskad och sparad i originalcheckpointgrenen. 12 till 14 ska granskas tillsammans och i beskärningar; 13/lagstiftning får en lokal korrigering av ceremoniella domarkläder till vardagliga mörka kostymer före aktivering. Fler bildstilar får inte aktiveras i UX-rättningens PR.

## Batch 5 klar för test och release

09 Collage, 12 Arkitektur, 13 Infografisk illustration och 14 Filmisk konceptkonst har åtta egna original var. Kontaktserier och små/kvadratiska format granskade. 13/lagstiftning lokalt korrigerad till vanliga mörka kostymer, ny PNG-hash och ombyggda derivat. Lokalt manifest innehåller 15 kompletta serier, publicerad webb fortfarande 11 tills egen bildrelease verifieras. Kvalitetskontroll: quality-batch-5.json med 120 unika original och 495 avkodade WebP-filer.

UX-rättningens PR 24 (head d33ce929264c980a9af16fcfb35400c3375afe6c) ska vara integrerad och verifierad innan nästa bildrelease byggs från färsk main. Den ändrar ingen bildserie. Bildbatch 5 får endast nya bildfiler, fyra stilmetadatafiler, bildmanifest, HTML-manifestversioner och dokumentation. Slutlig batch återstår med 15, 16, 18, 19, 20.

## UX-rättning publicerad

PR 24 integrerad som b83b4ff745241dddb93cb10b9ab4b9711b09fd0f. PR-CI 39543422974 och main-CI 39544111942 helt gröna: 33 enhetsprov, 128 browserfall och fyra publicerade flöden. Pages 39544111553 grön. Direkt moln-Chrome verifierade stort omslag med bred bildexport. Batch 5 är granskad och uppladdad, redo för separat release.
