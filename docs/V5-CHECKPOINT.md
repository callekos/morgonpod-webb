# Webbuppdrag 28: publicerat och verifierat

Slutfört den 21 oktober 2026. PR #34 är integrerad som fc51dbc498042894cd7a28cf57683ce04d623efc. Exakt slutrevision c61f2dbbf624799076f4949054d952f3dffa4be9 passerade PR-acceptans 39644474113 med 36 enhetsprov och 168 browserfall inklusive iPhone/iPad WebKit.

Huvudgrenens acceptans 39645372457 är helt grön: 36 enhetsprov, 168 browserfall, exakt filverifiering och åtta browserprov mot den verkliga webbplatsen. Pages 39645368971 är success. Filverifieringen kvitterade rätt frontendbytes och 42 aktiva avsnitt kl. 17:42:50 UTC. De åtta verkliga webbproven passerade kl. 17:44:04 UTC. Oberoende HTTP-kontroll matchade exakt manifest samt rätt channel-art.js och sw.js.

Kanalgrupper, standardstil 06-film och beständiga bevakningstitlar är publicerade. Alla 15 specialavsnitt och senare innehåll är bevarade. Fysisk iPhone/iPad och VoiceOver är inte testade. Fullständigt slutkvitto och rollback: [CHANNEL-GROUPS-28.md](CHANNEL-GROUPS-28.md).

Tidigare V3-status nedan avser historiska releaser.

# V5, verifierad återhämtning 21 oktober 2026

## V5 färdiglevererad

Även den sista avgränsade UX-rättningen är publicerad: PR 32, merge 6a0277176d2b978a492007c555c475d1e525d705. PR-CI 39581847544 och main-CI 39582534557 är helt gröna: 34 enhetsprov, 132 browserfall inklusive iPhone/iPad WebKit, exakt filverifiering på Pages och fyra publicerade liveflöden. Pages 39582532909 är grön.

Direkt moln-Chrome verifierade senaste CSS-versionen v5-large-text-1, 20 valbara stilar, fungerande ordombrytning samt beständigt lokalt stilval med alla åtta kanalbilder laddade. Bildbevis: [publicerat laboratorium](evidence/v5-live.jpg). V3 är fortsatt global standard.

Inget bild- eller kodarbete återstår i den avgränsade V5-leveransen. Ärende 14 är avslutat med slutkvitto. Ärende 16 behåller externa prov och större beslut som öppna punkter; godkända småförbättringar är levererade. Nästa separata produktuppdrag är kanalgrupperingen i 28. Permanent bildstandard kräver ägarens uttryckliga val. Fysisk iPhone Safari, VoiceOver och långvarig bakgrundsuppspelning är inte verifierade.

Ett separat lokalt headless-liveförsök stoppades av ERR_EMPTY_RESPONSE före sidladdning. Det räknas inte som ett godkänt produktprov. Liveverifieringen ovan utfördes i moln-Chrome och i GitHubs publiceringsgrind. Senare avsnittspubliceringar har bevarats; varken PR 30 eller 32 ändrar katalog, artiklar, källor, ljud eller produktion.

## Slutkvitterad bildrelease

PR 30 integrerad som 0415051ea5e7201cd0d2c59e1c7aa91d9059e4a7. PR-CI 39578014128 och main-CI 39580690860 helt gröna: 33 enhetsprov, 128 browserfall inklusive iPhone/iPad WebKit, exakta frontend- och bildbytes samt fyra publicerade liveflöden. Pages 39580690500 ersattes av senare publicering efter redaktionens dokumentations-PR 31. Pages 39580853273 för cf497d2 är grön och innehåller bildreleasen.

Direkt moln-Chrome visar 20 av 20 stilar. Byte till stil 20 under uppspelning behöll ljudkällan för IBAT och exakt samma synliga kö; ljudet fortsatte från 9,22 till 11,00 sekunder utan paus. Provet pausades vid 43,90 sekunder. Fysisk iPhone/VoiceOver har inte testats. Alla fem sista serier är nu publicerade och inget bildarbete återstår i #14.

Release-diffen för PR 30: 193 avsedda filer, noll ändringar i katalog, avsnitt, artiklar, ljud eller V3-bilder. Senare redaktionella publiceringar behölls vid integration. Nästa avgränsade UX-etapp finns i V5-UX-VERIFICATION.md; större kanalgruppering följs separat i #28.

Detta är aktuell checkpoint. Äldre antal och nästa steg i V4-CHECKPOINT.md är historik.

## Bas och skydd

Arbetet utgår från main dea00fcaf8f79fe3a19cbce680085776c7abfb58, inklusive redaktionens PR 26 och 27. Ingen öppen PR fanns vid start. 15 experimentella serier var publicerade genom PR 25. PR 24 är publicerad med CI 39544111942. V3 är fortsatt standard och ett lokalt bildval ändrar inte global standard.

Designreleasen ändrar inga filer i episodes/, catalog/, assets/channels/, episodes.json eller story_index.json. Katalogens 37 råposter bevaras; ersatta poster filtreras redan av klienten. Antalet publiceringar är inget fast 25-krav. Gemini, TTS, Watson, schema, layout och spelarkod ändras inte.

## Återhämtning och spårbarhet

15-retro, 16-paper, 18-surreal, 19-blueprint och 20-magazine återfanns först i den ursprungliga V4-arbetsytan. Alla 40 PNG-hashar och exakta prompter matchade metadata. Fem kontaktblad med små och kvadratiska beskärningar återgranskades. Inga bilder genererades om.

Arbetsmiljön rensades sedan automatiskt innan releasecommitten var sparad. Alla 165 bildobjekt var redan uppladdade. En andra bevarad arbetskopia gav samma exporter och metadata. GitHub accepterade samtliga 165 exakta Git-blobhashar i trädet 4ba6fca821234d6df0e676a8211ef25abee7a6bb. Återhämtningen är nu permanent sparad på work/web-v5-final-art i commit 3b428156d96b8dff63a65cae1f9abcbbfcf7f730. Återhämtningsgrenen från V4 har inte mergats över main.

Audit quality-final.json: 20 kompletta experimentella serier, 160 unika masteroriginal och 660 faktiskt avkodade WebP-filer. Alla förväntade dimensioner, prompter och unika registrerade PNG-hashar kontrollerade. Råa PNG-filer ingår inte i klientens leverans. En tidigare lokal kontroll bekräftade 889 skyddade filer identiska mot basen. Release-diffen kontrolleras separat före merge.

## Tester

Före miljörensningen passerade 33 enhetsprov, 64 desktop/Android-browserfall och två riktade prov för exakt sparad kö och bevarad scroll genom alla 20 stilbyten. Teständringarna har återställts och verifieras på nytt före PR. Två äldre förväntningar har ersatts med kontroller av faktiskt synliga aktiva ID:n, eftersom senare råkataloger behåller ersatta poster. Katalogen skrivs inte om för att få tester gröna.

Återställd bildrelease passerar 33 enhetsprov och 64 desktop/Android-browserfall inklusive exakt kö och scroll. Ett separat utökat UX-prov vid 320 px och 200 procent textstorlek hittade sidöverströmning och överlappande mobilnavigation. Det är ett kvarvarande produktfel i #16 och rättas efter bildreleasen i egen etapp, inte ett godkänt prov. Lokalt WebKit saknar systembibliotek och blockerades före teststart. Befintlig CI verifierar iPhone/iPad WebKit. Fysisk iPhone Safari, VoiceOver och lång bakgrundsuppspelning är inte testade.

## Exakt nästa steg

Slutför lokal omverifiering, skapa PR från work/web-v5-final-art, invänta full CI, jämför mot färsk main och integrera. Kontrollera Pages exakta filer, alla 20 serier och liveuppspelning med bevarad kö. Uppdatera denna fil, STYLE-STATUS.md, produktionsplan samt #14 med faktiska PR-, CI- och publiceringskvitton. Därefter följ #16 och UX-auditen. Större layoutändringar och permanent bildstandard kräver ägarbeslut.
