# V5, verifierad återhämtning 21 oktober 2026

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
