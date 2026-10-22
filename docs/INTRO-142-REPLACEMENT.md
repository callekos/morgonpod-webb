# Uppstartsersättning #142: sparad kö och innehållsversion

Ägarbeställningen i nyhetspodden#142 ersätter innehållet på samma uppstarts-ID. Sparade köer innehåller tidigare ljudadress och titel. Spelaren hämtar därför aktuell uppstartsmetadata före spelning/återställning, uppdaterar samma köpost och nollställer gammal position när ljudadressen ändrats. Övriga köposter, ordning och hastighet behålls. Ny version får en egen filväg; serviceworkern cachar inte katalog eller ljud.

Browserregressionen återställer en gammal uppstart med12sekunders position, kontrollerar sammaID/övrig köpost, ny titel/ljudadress, nollad position, ingen request på gammal fil, pausad återställning och senare riktig uppspelning. Generella uppstartslängdgrindar ändras inte. HTMLapp/CSS har gemensam cacheversionintro142-resume-1.

Detta publicerar ännu inget nytt avsnittsinnehåll. Q01 är sparat i produktionsrepo. Native ljudstaging39828850532 kör separat på exakt godkänt paket. Efter innehållsgranskning ska en atomär katalogersättning bevara intro-/artikel-ID, episode_order1, ursprungligt published_at och alla övriga avsnitt/artiklar/policyer. Versionens verkliga produktion/ersättning journalförs separat; inget Telegramljud.
