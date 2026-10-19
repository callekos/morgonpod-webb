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

Alla 11 nuvarande avsnitt saknar published_at. Detta är en uttrycklig integrationsgrind före slutlig release. Produktionsägaren har informerats via #34, utan parallella ändringar i deras filer. Samma verkliga tidsstämpel måste följa detalj-, list- och sökposter. Feedordningen måste verifieras hos produktionen; frontend ändrar inte RSS eller historiskt ljud.

## Förhandsdrift och release

Separat privat Sites-förhandsversion med en kopia av verkligt publicerat innehåll. Den tar inte över den ordinarie publiceringsadressen eller katalogen. Denna preview är en innehållssnapshot och uppdateras vid nästa previewbygge. Ingen modell för manus eller ljud har anropats. Ingen betaltjänst aktiveras.

Inför slutlig release efter ägarens iPhonefeedback: färdigställ publiceringstidskontraktet, integrera den deterministiska paketeringen i befintlig webbpublicering i samråd med produktionsägaren, kör grön CI inklusive WebKit på exakt head, jämför nytt producerat innehåll, verifiera publicerad webb och ljud efter byte. Ingen merge eller ändring av Pages-källa innan detta.

Rollback: återgå till tidigare frontendfiler och deras cacheversion; behåll nytillkomna katalogposter och ljud. Revert får aldrig återställa hela repot eller förlora publiceringar som skett efter basen.

## Testgränser

Lokala Chromiumtester omfattar mobil, desktop, navigering, stora syntetiska arkiv, temalagring/systemval, artiklar, faktisk ljudposition, hastighet och beständigt ljud. WebKit-binarien gick att hämta men systembibliotek saknas i denna körmiljö och paketinstallationen nekades av körmiljön. GitHub Actions installerar WebKit med systemberoenden och är avsedd som releasegrind. Ingen fysisk iPhone Safari har testats av agenten. Det är därför ägarens previewfeedback behövs före ersättning av befintlig design.
