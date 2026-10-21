# Kanalkort och avpublicering, ärende 39

Utgångspunkt: färsk main efter #37:s Prenumerera-knapp. #39 ersätter endast den tidigare likadana kortpresentationen i #28. Kanalgrupper, registerstyrd ordning, högst fyra på startsidan, villkorade Visa alla och delbara filter behålls.

Startsidan har kompakta tvåkolumnskort för Bevakningskanaler och avlånga knowledge-card-kort för Kunskapskanaler. Kanaler använder samma avlånga komponent i båda grupperna. Varje kort har bild, namn, registerbeskrivning och kanallänk. Kanalvisa bildkanter och dekorativa ikoner före namnen är borttagna. Funktionella ikoner, neutrala kantrundningar och fokusmarkeringar behålls. Stil 06 och alla lokala stilval/resolverregler är oförändrade. Inga nya bilder.

## Avpublicering enligt punkt 4 i aktuell #39

Endast `WORK_LIBRARY_2026_10:lagstiftning:replacement_ordinary:2` och artikel `work-lagstiftning_ordinary-article-1` tas bort från aktiva upptäcktsytor. `catalog-policy.json` har beständig withdrawn-metadata. Direktlänkar förklarar avpubliceringen. Sparad kö som innehåller avsnittet återställs inte och förklaras med statusmeddelande. Fem tidigare supersessionrelationer behålls så föregångaren inte återkommer.

Alla 49 råavsnitt, källposter, ljud, nummer, datum, lagstiftningsintro och samtliga 15 specialer bevaras. Aktiva antal går från44 till43 avsnitt och50 till49 artiklar. Semantisk granskning av samtliga listor visar att enbart den utpekade aktiva posten tas bort. Äldre redan ersatta rader rensas även ur kvarvarande inaktiva sökshardfiler. Inga RSS-/mejl-/webbpushflöden finns i den inventerade webben.

Producentens PR [141](https://github.com/callekos/nyhetspodden/pull/141), head d1469f1e0656f906f05ba89d58ac84439070d4f5, är integrerad som58084ebb655ee4419f48378c63e4462dff0637da efter grön CI39652501076. Katalogbyggaren läser samma withdrawn-policy och bevarar råposter och supersession vid nästa ombyggnad. Sex lokala Pythonprov passerade, inklusive6000 avsnitt/24000 artiklar och upprepad ombyggnad. Lagstiftning har redan automatic_production:false. Äldre veckoschedule är historik och ändras inte.

## Prov och slutkvitton

37 enhetstester och92 lokala Chromiumprov passerade. Dessa omfattar320px, stor text, tangentbord, mobil/desktop, bildstilval, spelare, kö, position, grupptillväxt0/1/4/5/10 och korrekt avpublicering. Visuell granskning av mobil och desktop är gjord. CI/WebKit och verklig publicering återstår och fylls på här.

Återställning görs avgränsat för app/CSS/skal eller withdrawn-beslut, aldrig genom äldre katalogsnapshot. Ingen fysisk iPhone/iPad, VoiceOver eller faktisk anslutning till Telegramgrupp har provats.
