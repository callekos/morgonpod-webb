# Webbacceptans inför morgonleveransen 19 oktober

Produktionsuppdrag: callekos/nyhetspodden#34.
Bas: 582125b9d6d26a40e3ff9a65c6266b914f77faa7.

Senaste befintliga Web acceptance, 39106932559, hade två enhetsfel och fyra
mobilfall. Pages-deploy var grön, men det innebar inte grön webbacceptans.

Alla publika HTML-ingångar får samma cacheversion för befintlig app och CSS.
De laddade tidigare två olika versionsnycklar. Service worker får samma
versionsbyte, utan att arkivdata eller ljud börjar cachas.

Hover-effekten begränsas till muspekare med faktisk hover-förmåga. Touchknappar
ska aktiveras direkt, även på iOS. Arkivpagineringens och startsidans befintliga
browsertester behåller sina krav på 48 respektive 10 poster och begränsade anrop.

Mobilspelaren startar redan i kompakt läge. Dess tidigare test antog utvidgat
läge och förväntade därför motsatt resultat efter första trycket. Testet öppnar
nu spelaren först och verifierar därefter båda växlingarna, aria-expanded och
oförändrad ljudkälla. Standardbeteendet ändras inte.

Inga episoder, artiklar, källor, statistikvärden, hemligheter eller
produktionsgrindar ändras av PR:n. Rollback är revert av denna avgränsade
webbändring, med bibehållet publicerat innehåll. Merge kräver grön Web acceptance
på exakt PR-head. Faktisk Pages-deploy och HTTP-innehåll kontrolleras efter merge
samt journalförs i produktionsuppdraget.
