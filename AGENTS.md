# AGENTS.md: Morgonpod webb

## Ägarbeslut 8 november 2026 — Mediesvepet visas som arkiv/exempel

Mediesvepets nyproduktion och publicering är permanent pausad. Ändra inte dess tidigare innehåll, exempel, ID:n, filer, länkar eller uppspelning och kör inte de två väntande utgåvorna. Placera kanalen under “Arkiv och exempel”, skild från de fyra aktiva bevakningskanalerna `ibat`, `vald`, `kek` och `sjoomradet`. De fyra ordinarie kanalernas produktion och scheman ska vara oförändrade. Äldre antal nedan är historiska. Webbändringen i sig innebär inte publicering/deployment.

Denna webbplats är publicerings- och läsgränssnittet för Morgonpod. Den delar projektmål och driftkrav med `callekos/nyhetspodden`, som är källan för produktion, modellval, kvotstyrning och research.

## Varje nytt utvecklingsuppdrag
1. Läs aktuell `README.md`, detta dokument, samt `AGENTS.md` i produktionsrepo `callekos/nyhetspodden`.
2. Läs [den centrala modellstrategin](https://github.com/callekos/nyhetspodden/blob/main/docs/MODELLSTRATEGI_OCH_KVOTSTYRNING.md) och [maskinläsbara modellpolicyn](https://github.com/callekos/nyhetspodden/blob/main/config/model_policy.json) när arbetet berör AI eller produktion.
3. Inspektera befintlig webb, datamodell, byggflöden och tester innan ny kod skapas.
4. Skilj målbild, existerande kod, aktiv drift och verifierat resultat. Dokumentationsändringar innebär inte driftsatta funktioner.

## Drift och användarupplevelse
- Varje framtida beställning av ny kanal inkluderar automatiskt en egen kanalbild i gällande standardstil, registrering i befintligt manifest/resolver, master och responsiva leveranser samt faktisk visuell kontroll mobil och desktop. Bevara egna stilval, fokalpunkt och säker fallback; ingen separat bildbeställning eller rutinmässig godkännandefråga behövs. Produktionsrepots docs/CHANNEL-CREATION-CHECKLIST.md är gemensam checklista.
- Webbarkivet ska tåla fyra aktiva bevakningskanaler, fyra kunskapskanaler och arkiverade serier/exempel; arkivet ska växa mot många tusen avsnitt utan att ladda hela arkivet i webbläsaren.
- Behåll lättanvänt mobilgränssnitt med Idag, Lyssna, Artiklar och Utforska, tydlig uppspelning, sökbara källor och god tillgänglighet.
- Artikeltext och källreferenser ska vara spårbara; inga fabricerade nyheter eller uppföljningar.
- Gör inte blinda uppdateringar som tar bort tidigare publicerade avsnitt, index eller statistik.
- Kodgranskning, byggprov och återställningsmöjlighet krävs före större ändringar.
- Webbbygge, rendering, statistik och formatvalidering ska normalt inte konsumera Gemini-anrop.
- Aktivera aldrig automatiskt avgiftsbelagda tjänster. Inga API-hemligheter i frontend eller offentliga datafiler.

## Gemensamma kvotregler
- Webbprojektets eventuella AI-anrop delar Google-projektets faktiska kvot med poddproduktion och kodagenter.
- Planera nya AI-funktioner med produktionsbudget och modellrouter i produktionsrepo, inte med fristående nycklar som försöker kringgå kvoter.
- Förlora inte redaktionellt långtidsminne, källproveniens eller idempotenta artikel-ID:n vid migration.

## Status
Detta dokument skapar permanenta förutsättningar för framtida arbete. Det innebär **inte** att webbens produktionsfunktionalitet eller modellrouter är ändrad.
