# Återupptagen nattredaktion, issue 114

Deadline 07.00 svensk tid missades. Denna batch publicerar endast två återfunna kompletta paket: lagstiftning_3 och lagstiftning_4. De nio kompletta ljudfilerna har fullavkodats och bundits till manus. Inga nya textmodellanrop eller publika Telegramutskick.

## Katalogfel och rättning

Körningarna 39545374263 och 39546021105 gav samma åtta fel, två i vardera fyra webbläsarmiljöer. Den temporära publiceraren använde en äldre lokal src/archive_catalog.py utan supersessionsstöd. Den byggde därför listor med fem gamla daily och 14 gamla artiklar men återförde sedan superseded från föregående manifest. Frontend dolde korrekt dessa ID:n, vilket gav olika antal mellan manifest och vy. Tester och frontend behöver inte försvagas.

Denna katalog är byggd med aktuell produktionsmainbyggare, blob 8b59b26602a1c9a767842614820241d7d016e226, och webbens oförändrade catalog-policy.json. Adaptern kopierar policyn före byggnad och stoppar om en nödvändig policy saknas. Den kontrollerar alla aktiva samlingars antal, unika ID:n och dolda ID:n före release. En ny Nodekontroll skyddar även samtliga sökshards.

Alla tidigare 37 råavsnitt och 46 råartiklar är bevarade. Två avsnitt och två artiklar tillkommer. Aktiva antal är därför 34 avsnitt och 34 artiklar, med åtta uppstarter bevarade. Fem gamla avsnitt och deras 14 artiklar ligger kvar som original med hänvisning till ersättaren.

## Inventering per beställt avsnitt före denna publicering

| Paket | Text och källbevis | Sofie | Webb |
| --- | --- | --- | --- |
| sjoomradet_1 | Validerat | Komplett | Tidigare publicerat, ny livekontroll återstår |
| sjoomradet_2 | Validerat | Komplett | Tidigare publicerat, ny livekontroll återstår |
| sjoomradet_3 | Validerat | Komplett | Tidigare publicerat, ny livekontroll återstår |
| sjoomradet_4 | Validerat | Komplett | Tidigare publicerat, ny livekontroll återstår |
| sjoomradet_5 | Validerat | Komplett | Tidigare publicerat, ny livekontroll återstår |
| lagstiftning_1 | Validerat | Komplett | Tidigare publicerat, ny livekontroll återstår |
| lagstiftning_2 | Validerat | Komplett | Tidigare publicerat, ny livekontroll återstår |
| lagstiftning_3 | Validerat | Komplett, 4 075 653 bytes | Denna batch, ännu inte livekvitterad |
| lagstiftning_4 | Validerat | Komplett, 4 134 021 bytes | Denna batch, ännu inte livekvitterad |
| lagstiftning_5 | Validerat | Ofullständig segmentcache | Ej publicerat |
| kek_1 | Validerat | Ofullständig segmentcache | Ej publicerat |
| kek_2 | Validerat | Saknas | Ej publicerat |
| kek_3 | Validerat | Saknas | Ej publicerat |
| kek_4 | Validerat | Saknas | Ej publicerat |
| kek_5 | Validerat | Saknas | Ej publicerat |

Automatisk säkerhetsgranskning stoppade ny Edge TTS därför att opublicerade manus skulle lämnas till speech.platform.bing.com. Inga nya syntesförsök görs efter avslaget. De sex paketen får inte kallas levererade. Fortsatt syntes behöver uttrycklig bekräftelse av överföringen. Ingen betaltjänst, alternativ röst eller ändring av ordinarie produktion har införts.

## Verifiering och nästa steg

Fyra Pythonprov för katalogpolicy och specialpublicering passerar. 33 befintliga Nodeprov passerar lokalt. Befintliga V3/V4-browserprov passerar i samtliga 18 Chromiumfall, inklusive de två tidigare felande fallen. Lokal WebKit saknar systembibliotek; full fyrmiljömatris ska verifieras i befintlig PR-CI före merge. Oberoende mänsklig faktagranskning eller genomlyssning påstås inte.

Efter merge: verifiera faktiska Pages-bytes och fullavkoda alla nio publicerade specialer, kontrollera artikelkroppar/källor, kanalantal, direktlänkar och uppstartsordning. Spara kvitto i nyhetspodden#114 och uppdatera denna fil. Nästa sex paket återanvänder manus, artiklar, research och segment från produktionsgrenen work/specials-2026-10-21.

Rollback: ta en ny färsk snapshot, avlägsna endast lagstiftning_3 och lagstiftning_4 samt deras artikelposter ur råindex och bygg om med aktuell policy. Bevara senare publiceringar, frontend, bilder och övriga ljud. Återställ inte hela katalogen från en äldre snapshot.
