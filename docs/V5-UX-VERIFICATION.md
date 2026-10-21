# V5, avgränsad UX-rättning

## Verifierat problem och ändring

Designlaboratoriets långa rubrik behövde 325 px i en 280 px innehållsyta vid 320 px viewport. Textförstoring ökade också stilnamnens minsta innehållsbredd. På mobil kunde den utvidgade layoutytan göra att sidinnehåll täckte navigationslänkens träffyta.

Sidhuvudets långa ord får nu brytas. Bildväljarens fieldset tillåts krympa och textspalten använder minmax(0,1fr) samt ordombrytning. Inget innehåll döljs och ingen global overflow-spärr används. Ordinarie V3-layout, bildval, teman, spelare och kö behålls.

Nytt browserprov verifierar verklig 320 px layoutyta, 200 procent rottextstorlek, reduced motion, val av stil 20 med blanksteg, återställning med Enter och klickbar mobilnavigation tillbaka till Idag. Full lokal browsermatris: 66 godkända desktop/Android-fall. PR 32 integrerad som 6a0277176d2b978a492007c555c475d1e525d705 efter grön PR-CI 39581847544. Main-CI 39582534557 är helt grön med 34 enhetsprov, 132 browserfall inklusive iPhone/iPad WebKit, exakt filverifiering och fyra publicerade liveflöden. Pages 39582532909 är grön. Direkt moln-Chrome verifierade den nya CSS-versionen och ordombrytningen.

## Bildpayload

Lokal kall Chromium-mätning med Pixel 5, utan service worker eller tidigare bildval, efter att första innehållet blivit synligt:

| Vy | Bildförfrågningar | Bilddata, encodedBodySize | Kontroll |
| --- | --- | --- | --- |
| Idag | 8 | 539 960 byte | Noll experimentella bilder |
| Designlaboratorium | 15 | 757 590 byte | Enbart kontaktförhandsvisningar, noll masterfiler |

Detta är en lokal mätpunkt, inte ett löfte om samma nätverkstider eller exakt samma antal för alla skärmar. Alla 20 seriers exportstorlekar finns i quality-final.json. Klienten hämtar responsiva visningsbilder och åtta småbilder för ett valt set, aldrig masteroriginal. Befintliga browserprov kontrollerar detta och bildfallback.

## Återläst UX-audit och återstående beslut

Prioritering 1 till 13 i UX-AUDIT-V4.md har levererats genom PR 17, 18, 19, 20, 21, 22, 23, 24, 25 och 30. Denna etapp rättar det nya småskärmsfelet. Prioritering 14 är fortfarande ett externt prov: fysisk iPhone Safari, VoiceOver och lång bakgrundsuppspelning har inte utförts.

Ärende 28 är ett separat efterföljande produktuppdrag. Det ändrar kanalgrupperingen och ingår inte i den här avgränsade rättningen. Permanent bildstandard kräver fortfarande ägarbeslut enligt CHOOSE-DEFAULT.md. Ingen större layout eller informationsarkitektur har införts under V5.
