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
