# V4 checkpoint

Utgångspunkt: V3 main 54e90a3, PR 13 publicerad. Ärenden 10 och 12 redan avslutade. Arbetsgren work/web-v4-designlab.

## Etapp 1 och 2

Prioritering: klassificering 15, Designlaboratorium 14 med komplett första serie, återstående serier i batcher, därefter UX 16. Ändra inte katalog, avsnitt, artiklar, Gemini, TTS eller Watson.

Koden väljer fyra dagliga kanaler och fyra kunskapskanaler. Lagstiftning behåller alla ID:n och historiska poster. Producentens samordnade avaktivering av automatisk Lagstiftning måste kvitteras före release.

28 basenhetstester passerade före ändring. Första desktopkörningen: 20 av 21 passerade; den sista väntade på tidigare rubrik Vad bevakas, nu Om ämnet. WebKit kunde inte starta på grund av saknade systembibliotek, installationen blockerades av miljöns behörigheter. WebKit ska verifieras i befintlig CI. Desktop efter rättning: 21 av 21 godkända. Ingen fysisk enhet verifierad.

## Fortsätt

Kör lokala tester på slutlig kod, skapa egen PR för klassificering. Publicera och kontrollera live före nästa etapp. Designlaboratoriet ska använda ett kanoniskt manifest och localStorage. V3 förblir standard. Varje aktiverad stil måste innehålla åtta separata originalbilder plus optimerade derivat. Första serien Redaktionell illustration är under produktion, ännu inte valbar.
