# Välj permanent bildstandard efter ägarens test

Nuvarande standard är V3. Laboratoriets val gäller endast localStorage-nyckeln `morgonpod-art-style` i den aktuella webbläsaren. Inga användarprofiler eller globala stilbyten sker genom väljaren.

## Ägarens beslut

Prova alla serier på startsida, kanal, avsnitt, artikel, sök och i spelaren, gärna i båda teman. Dokumentera sedan seriens nummer, namn och stabila ID från `channel-art-manifest.js` i ärende 14. Ett val i den egna webbläsaren är inte ett beslut om standard för andra besökare.

## Separat genomförande-PR

Efter uttryckligt beslut bör nästa PR införa ett explicit standard-ID i manifestet och låta `channel-art.js` använda det när inget giltigt eget val finns. Nu är V3 förvald i koden; ett manifestfält ensamt ändrar därför ingenting. Testa att återställningsknappen väljer den beslutade ordinarie stilen och att UI-texterna anger rätt standard. Bevara giltiga befintliga experimentval och håll V3 tillgänglig som äldre serie och säker bildfallback.

Återanvänd den valda seriens redan granskade masteroriginal och responsiva WebP-filer. Ingen ny bildgenerering behövs. Byt inte filnamn för befintliga V3-bilder och rör inte katalogposter, artiklar, källor, ljud eller kölagring. Testa gamla länkar, inställningar utan tidigare val, tidigare sparade stilval, återställning, ljud under byte och en trasig bild innan publicering.

## Återställ release

Återgå genom en avgränsad PR som ändrar standard-ID och berörd frontendkod. Återställ inte hela huvudgrenen eller katalogen eftersom redaktionen kan ha publicerat nya avsnitt efter designreleasen. Verifiera den publicerade revisionens exakta frontendfiler och aktuella katalog efteråt.
