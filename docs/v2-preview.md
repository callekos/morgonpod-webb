# Morgonpodden V2, förhandsversion

Uppdrag: #3. Gren: ui/morgonpod-v2-preview. Bas: 2922b2b8b30607f13abbb3441a132975e16dea23.

## Avgränsning och samordning

Denna gren äger frontendfiler, bilder, webbtester och separat previewpaketering. Ändringen är anmäld i webbärende #3 och callekos/nyhetspodden#34. Inga ljud, produktionsjobb, kvoter, feeds eller originalkataloger ändras. Granskad publicerad sida: https://callekos.github.io/morgonpod-webb/.

## Implementerat

Idag med bildhero, senaste per kanal och artiklar. Sökbar/kategoriserad kanalgrid. Kanal med bild och Avsnitt/Artiklar/Om, sortering och 24 poster per sida. Global sökning med Alla/Avsnitt/Artiklar/Kanaler och uppslag i befintliga SHA-256-buckets. Artikel med stor kanalbild, full text, källor, bedömning, öppna frågor och avsnittslänk. Stor spelare med position, paus, 15 sekunder och hastighet samt permanent docka. Gemensamt beständigt audioelement. Ljust/mörkt/system, lokal lagring av endast färgval. Desktop har sidomeny och sekundär artikelspalt. Alla ursprungliga URL:er bibehålls. IBAT:s stabila kanal-ID är oförändrat, visningsnamnet är exakt IBAT - Informationsförsörjning.

Fem verkliga kanaler visas. De 15 framtida kanalerna är inte fabricerade. Nya kanaler kan läggas till i manifestet utan layoutändring. Deras egna masterbilder behöver då beställas och registreras i visuals. Bilderna är symboliska, med dokumenterad proveniens i assets/channels/README.md. Feather-ikoner används under MIT.

## Arkiv och publiceringsordning

`node scripts/build-preview.cjs /absolut/utdatamapp` kopierar webbens publika filer och skapar om listorna i utdatakopian. Produktionsfilerna ändras aldrig. Skriptet sammanfogar detaljmetadata, sorterar hela samlingen före sidindelning och skriver history_pages med intro först. Det undviker felet att bara sortera den hämtade sidan. 24 listposter laddas åt gången i webbläsaren. Detaljer hämtas vid öppning. Inget fullarkiv hämtas av webbläsaren. Sök använder befintligt shardingkontrakt och lokal cache har ett begränsat antal poster.

published_at används för senasteordning. kind=introduction, is_intro eller äldre :introduction-ID känns igen. episode_order respekteras i historiken. Inga publiceringstider skrivs om. Ordningen mellan poster utan tidsstämpel faller tillbaka på date och stabilt ID, vilket inte kan bevisa faktisk publiceringsordning.

De 12 äldre publicerade avsnitten saknar verifierbar published_at. De behåller dokumenterad datumfallback; inga tider fabriceras. Produktionskontraktet är infört genom nyhetspodden PR #75 och docs/WEB-PRODUCTION-CONTRACT.md. Framtida publiceringstransaktioner för published_at, kind, is_intro och episode_order vidare till detaljer, listor och sök. published_at är publiceringstransaktionens tid, inte exakt första CDN-tillgänglighet. Separat web_verified_at är verifieringstid.

V2 läser nu producentens kanoniska collection episodes/history/channel/CHANNEL direkt. Previewaliaset history_pages behålls bakåtkompatibelt. Gamla enskilda sidor kan sorteras fullständigt lokalt; flersidiga äldre episodarkiv utan historikindex visar ett begripligt meddelande i stället för falsk global ordning. Startsidan jämför en begränsad förstasida per kanal innan den väljer första åtta, så den senaste faktiska publiceringen inte missas i kanal 9 till 20. Inga hela arkiv eller detaljposter behövs för startsidan.

Producenten bygger redan deterministiska katalogsidor vid ordinarie publicering. Previewpaketeringen är därför inte längre en produktionsgrind och ska inte kopplas in som konkurrerande produktionsjobb. Ingen RSS/XML-feed finns enligt producentens inventering; ny distribution ligger utanför V2 och är inte en blockerande ändring.

## Förhandsdrift och release

Separat privat Sites-förhandsversion med en kopia av verkligt publicerat innehåll. Den tar inte över den ordinarie publiceringsadressen eller katalogen. Denna preview är en innehållssnapshot och uppdateras vid nästa previewbygge. Ingen modell för manus eller ljud har anropats. Ingen betaltjänst aktiveras.

Ägaren har granskat preview på iPhone, styrt bildriktningen och den 20 oktober cirka 05.06 uttryckligen bett att genomföra och färdigställa arbetet. Slutlig release görs på befintlig Pages-adress efter grön CI på exakt head. Inga hostinginställningar eller produktionsjobb byts. Main har hämtats in inklusive sista KEK-uppstarten utan ändringar av dess data. Produktionsfiler och ljud ska vara byteidentiska före/efter UI-merge.

Webbens acceptans kör 44 browserfall: iPhone WebKit, Android Chromium, iPad WebKit och desktop. Efter UI-push till main verifierar separat read-only-jobb exakta publicerade frontendbytes och därefter sex flöden med verklig ljuduppspelning i alla fyra browserprofiler. Det är inte ett påstående om fysisk iPhone eller om morgonens ännu inte publicerade utgåvor. Innehållspushar ensamma utlöser inte den tunga UI-sviten. Livejobbet skriver varken till kataloger, Telegram eller produktionssystemet.

Rollback: återgå till tidigare frontendfiler och deras cacheversion; behåll nytillkomna katalogposter och ljud. Revert får aldrig återställa hela repot eller förlora publiceringar som skett efter basen.

## Testgränser

Tidigare lokala Chromiumtester omfattar mobil, desktop, navigering, stora syntetiska arkiv, temalagring/systemval, artiklar, faktisk ljudposition, hastighet och beständigt ljud. Den aktuella miljön saknar stödd lokal browserstyrning, så nattens integrationskontroll använder GitHub Actions med WebKit/systemberoenden. Ingen fysisk iPhone Safari har testats av agenten. Ägarens tidigare iPhonegranskning och de automatiska WebKitproven redovisas separat. 20 kanaler och stora arkiv provas syntetiskt; bara fem verkliga kanaler är publicerade.
