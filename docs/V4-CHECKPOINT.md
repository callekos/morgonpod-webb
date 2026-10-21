# V4 checkpoint, 21 oktober 2026

## Utgångspunkt och skydd

V3 publicerad från main 54e90a3. Ärenden 10 och 12 redan avslutade. Katalog, avsnitt, artiklar och producentens Gemini/TTS/Watson ändras inte av frontendgrenar. Separat redaktion kan publicera nya katalogposter; varje merge ska bevara dem.

## Klassificering

Webb PR 17: fyra dagliga kanaler, Lagstiftning bland fyra kunskapskanaler. 28 enhetstester och 84 webbläsarscenarier passerar i CI 39529712623. Producent PR 118 avaktiverar endast återkommande Lagstiftning genom automatic_production=false i gemensamt kanalurval. 333 lokala offlinetester passerar. Båda releaserna ska återläsas före slutförandekvitto.

## Designlaboratorium, första fungerande etapp

Mer länkar till designlaboratorium.html. Ett kanoniskt manifest channel-art-manifest.js mappar stil/kanal/format/fokus. channel-art.js validerar att alla åtta kanaler finns innan stilen blir valbar. Bildvalet sparas separat från tema och ljud i localStorage. Byte förladdar åtta småbilder och uppdaterar endast bildattribut. Ljudnod, källa, kö och aktiv sida återskapas inte. Bildfel faller tillbaka till ordinarie V3. Snabba byten har senaste-val-vinner-skydd.

Stil 02 Redaktionell illustration: 8 individuella genererade originalmotiv och 24 WebP-derivat, samt förhandsvisning med alla åtta. Separata master-WebP finns i assets/design-lab/02-editorial. Totalt 4 521 818 byte inklusive masters. Övriga 19 stilar är ännu INTE producerade eller valbara. V3 är standard för nya besökare.

Lokalt: 33 enhetstester samt 48 webbläsarscenarier på desktop och emulerad Android passerade. Bildbyte under verklig ljuduppspelning verifierar noll pause-event, samma ljudnod/källa, löpande position samt bevarat tema. Persistens, återställning, kanal, artikel, stor spelare, sök, arkiv, kö och fel återges i tests/browser/designlab.spec.cjs. WebKit saknar systembibliotek lokalt, befintlig CI måste verifiera iPhone/iPad innan merge. Fysisk telefon och VoiceOver är inte testade.

## Nästa steg

1. Verifiera och integrera producent PR 118 och webb PR 17. Kontrollera publicerad fyrkanalsvy.
2. Publicera första laboratoriesteget efter komplett CI. Kontrollera bildbyte live.
3. Producera återstående 19 kompletta originalserier i mindre batcher, kontrollera samtliga format, lägg till i manifest först när alla åtta motiv är granskade. Håll 20-stilsstatus och bildprompter uppdaterade.
4. Fortsätt UX 16 efter fungerande liveväljare. Ingen experimentell stil blir permanent utan ägarens val.

## Permanent standard senare

Efter uttryckligt ägarval: ändra ordinarie manifestpost/default i en separat PR, behåll valbar V3 och befintliga lokala preferenser, versionsändra shell och testa samma matris. Ändra aldrig alla besökares standard via en persons lokala laboratorieval.

## Senare verifiering och UX-etapp

Producent PR 118 är integrerad 2bc6592; återläst automatic_production=false. Webb PR 17 integrerad 335f27d; CI 39530271849 verifierade exakta livebytes 02.00.49 UTC och fyra publicerade flödestester. Äldre issue 1 avslutat efter verifieringen.

Laboratorium PR 18 integrerad 6b29d91 efter 33 enhetsprov och 96 browserfall i CI 39530906834. Första CI stoppade korrekt två WebKit-testfall där check() inte accepterade den avsiktliga återställningen vid nätfel. Provet använder nu click() och explicit not.toBeChecked(). Ingen produktspärr eller testacceptans sänktes. Publicerings-CI 39531389244 kontrolleras.

UX-etapp finns lokalt: kunskapsingångar, två gånger två bevakning på mobil, jämnt kunskapsgrid, kombinerade sökfilter, lässtruktur från verkliga rubriker, mindre bildstorleksannonsering och filtrerad sidfortsättning i kontextkön. 33 enhetsprov och 54 desktop/Android-scenarier passerar. WebKit återstår i CI. Audit och prioritering i UX-AUDIT-V4.md.

Bildbatch 2: 03 Grafisk minimalism och 17 Monokromt reportage har åtta separata original vardera och är visuellt granskade som serier. De är ännu inte aktiverade eller publicerade. 17 stilar återstår att producera efter dessa. Bildbyggverktyget scripts/build-art-series.py skapar först fullständiga assets/proveniens, --activate används först efter visuell kontroll.
