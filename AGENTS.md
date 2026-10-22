# AGENTS.md: Morgonpod webb

Denna webbplats är publicerings- och läsgränssnittet för Morgonpod. Den delar projektmål och driftkrav med `callekos/nyhetspodden`, som är källan för produktion, modellval, kvotstyrning och research.

## Varje nytt utvecklingsuppdrag
1. Läs aktuell `README.md`, detta dokument, samt `AGENTS.md` i produktionsrepo `callekos/nyhetspodden`.
2. Läs [den centrala modellstrategin](https://github.com/callekos/nyhetspodden/blob/main/docs/MODELLSTRATEGI_OCH_KVOTSTYRNING.md) och [maskinläsbara modellpolicyn](https://github.com/callekos/nyhetspodden/blob/main/config/model_policy.json) när arbetet berör AI eller produktion.
3. Inspektera befintlig webb, datamodell, byggflöden och tester innan ny kod skapas.
4. Skilj målbild, existerande kod, aktiv drift och verifierat resultat. Dokumentationsändringar innebär inte driftsatta funktioner.

## Drift och användarupplevelse
- Webbarkivet ska tåla nio kanaler idag (fem bevakningskanaler och fyra kunskapskanaler, där Mediesvepet följer vardagsschema) och växa mot många tusen avsnitt utan att ladda hela arkivet i webbläsaren.
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
