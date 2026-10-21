# Bildstandard: stil 06, Analog filmfotografi

Ägarbeslut 21 oktober 2026 i webbuppdrag 28: `06-film` är global standard. Den redan publicerade bildserien och dess small/wide/square-format återanvänds. Inga nya bilder eller masteroriginal laddas i klienten.

Utan giltigt lokalt val använder `ChannelArt.DEFAULT` stil 06. Giltiga uttryckliga val, inklusive äldre sparat v3-val, bevaras. Återställ till standard förladdar 06, byter bilder utan sidbyte och tar bort eget stilval. Tema, ljudkälla, position, kö och scroll är separata. Alla 20 experimentella serier finns kvar i väljaren. V3 är säker bildfallback för befintliga kanaler; okända framtida kanaler utan motiv får neutral cover.svg, aldrig en annan kanals motiv.

Befintlig localStorage från V3-tiden använde avsaknad av nyckel för den dåvarande standarden. Dessa besökare följer nu den nya standarden. Andra sparade giltiga stilnycklar ändras inte.

Återställ release genom avgränsad frontend-PR. Återställ aldrig gamla katalogsnapshotter eller ta bort nummerledgern. Faktiska tester och publiceringskvitton finns i ../CHANNEL-GROUPS-28.md och ../V5-CHECKPOINT.md.
