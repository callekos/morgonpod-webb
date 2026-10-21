# Kanalkort och avpublicering, ärende 39

Utgångspunkt: färsk main efter #37:s Prenumerera-knapp. #39 ersätter endast den tidigare likadana kortpresentationen i #28. Kanalgrupper, registerstyrd ordning, högst fyra på startsidan, villkorade Visa alla och delbara filter behålls.

Startsidan har kompakta tvåkolumnskort för Bevakningskanaler och avlånga knowledge-card-kort för Kunskapskanaler. Kanaler använder samma avlånga komponent i båda grupperna. Varje kort har bild, namn, registerbeskrivning och kanallänk. Kanalvisa bildkanter och dekorativa ikoner före namnen är borttagna. Funktionella ikoner, neutrala kantrundningar och fokusmarkeringar behålls. Stil 06 och alla lokala stilval/resolverregler är oförändrade. Inga nya bilder.

## Avpublicering enligt punkt 4 i aktuell #39

Endast `WORK_LIBRARY_2026_10:lagstiftning:replacement_ordinary:2` och artikel `work-lagstiftning_ordinary-article-1` tas bort från aktiva upptäcktsytor. `catalog-policy.json` har beständig withdrawn-metadata. Direktlänkar förklarar avpubliceringen. Sparad kö som innehåller avsnittet återställs inte och förklaras med statusmeddelande. Fem tidigare supersessionrelationer behålls så föregångaren inte återkommer.

Alla 49 råavsnitt, källposter, ljud, nummer, datum, lagstiftningsintro och samtliga 15 specialer bevaras. Aktiva antal går från44 till43 avsnitt och50 till49 artiklar. Semantisk granskning av samtliga listor visar att enbart den utpekade aktiva posten tas bort. Äldre redan ersatta rader rensas även ur kvarvarande inaktiva sökshardfiler. Inga RSS-/mejl-/webbpushflöden finns i den inventerade webben.

Producentens PR [141](https://github.com/callekos/nyhetspodden/pull/141), head d1469f1e0656f906f05ba89d58ac84439070d4f5, är integrerad som58084ebb655ee4419f48378c63e4462dff0637da efter grön CI39652501076. Katalogbyggaren läser samma withdrawn-policy och bevarar råposter och supersession vid nästa ombyggnad. Sex lokala Pythonprov passerade, inklusive6000 avsnitt/24000 artiklar och upprepad ombyggnad. Lagstiftning har redan automatic_production:false. Äldre veckoschedule är historik och ändras inte.

## Slutleverans 21 oktober 2026

Publicerat och verifierat. PR #41 integrerad som 53cd54acaa60d02b5c6e5a46776bbaff8afd435d. Pages 39657136584 är success. PR #42 låser testmiljön till Ubuntu 24.04 och är integrerad som 1979788cf81f397d189f0b84d42cb67f3f861f56; den ändrar inga webb- eller innehållsbytes.

PR-acceptans 39656191328 och 39658338338 är gröna. Slutlig mainacceptans 39658586702 är grön: 37 enhetstester, 184 browserfall i Chromium och iPhone/iPad WebKit samt 21 godkända livefall. Tre överflödiga Telegramkontroller hoppas avsiktligt över eftersom en oberoende HTTP-kontroll räcker. Exakt publicerad frontend och samtliga bildderivat verifierades 19:10:34 UTC; liveproven avslutades 19:11:48 UTC. Katalogen har 43 aktiva avsnitt, 49 artiklar och samtliga 15 specialer.

Prov omfattar mobil 320/393 px, tablet och bred desktop, stor text, tangentbord, kortformat, beskrivningar, registertillväxt, filter med omladdning/bakåt, bildstilval, uppspelning, kö och position. Oberoende HTTP-jämförelse matchade app.js, style.css, sw.js, kanaler.html, idag.html, catalog/manifest.json, episodes.json och catalog-policy.json exakt. Direkt moln-Chrome visade korrekt publicerad presentation och bevarat tidigare eget bildval samt ljudposition 0:41 efter filter, omladdning och bakåtnavigering. Fysisk iPhone/iPad och VoiceOver är inte testade.

Historiska fel är bevarade: 39655061724 hittade tre föråldrade WebKit-testantaganden som rättades utan borttagna assertions. 39657137072 passerade enheter, 184 browserfall och bytekontroll men livejobbet fick Ubuntu 26.04, vilket Playwright 1.56.1 inte stöder. PR #42 löser detta genom den redan verifierade Ubuntu 24.04-miljön, med oförändrade teststeg och behörigheter.

Inga öppna genomförandesteg återstår för #39. Senare innehållsarbete ska utgå från färsk main och bevara withdrawn/superseded-policyerna. Uppstartsavsnittets eventuella redaktionella omarbetning är ett separat uppdrag. Slutkvitto finns också i [ärende 39](https://github.com/callekos/morgonpod-webb/issues/39).

Återställning görs avgränsat för app/CSS/skal eller withdrawn-beslut, aldrig genom äldre katalogsnapshot. Ingen fysisk iPhone/iPad, VoiceOver eller faktisk anslutning till Telegramgrupp har provats.
