# Mediesvepets synliga referensdag, S08d

Ägarbeslut#151kommentar6346276438. Alla Mediesvepsytor använder avsnittets date som synlig publiceringsdag och time-elementets datetime, även när referensdag och faktisk publicering är samma dag. Gemensam datumrendering används för kanal, avsnitt, artiklar, sökning, startsida och kö. Datumet visas i Europe/Stockholm utan att verklig senare produktionstid fogas till den synliga dagen. Historiska avsnitt behåller efterhandsmarkering. Ingen syntetisk klocktid behöver införas: modellen stöder en ISO-referensdag direkt.

Katalogens befintliga Mediesvepssortering följer redan date; den bevaras. Verkliga produced_at och published_at bevaras orörda i källdata och leveranskvitton. Ingen ny publiceringstransaktion, innehållsgenerering, TTS eller Telegramleverans utlöses av datumrenderingen. Stabilt ID, länk, nummer, ljud, manus och artiklar ändras inte.

Fyra riktade offlineprov godkända, inklusive faktisk publicering på båda sidor om svensk midnatt, oförändrade metadata och andra kanalers befintliga visning. Full CI och faktisk list-/detaljkontroll efter integration återstår; dessa påstås inte genomförda i förväg. Jämför då publicerade episodes.json med baseline från före S08d och kontrollera22,21,20,19,16 i fallande ordning utan17/18. Rollback: återställ endast gemensamma datumrenderingens ändrade rader och tillhörande app-cacheversion.
