# Grafisk bedömning av kanalbilder

## Uppdrag och beslut

Ägarens återkoppling den 19 oktober kl. 23.48 är styrande. Den första bildseriens cinematiska miljöer uppskattades. Problemet var att motiv och bakgrund hade liknande färg och ljusstyrka, inte att miljöerna skulle ersättas av fristående symboler. Den andra serien med prismat, pengabunten och blåljuslampan överförenklade uttrycket och förkastas som slutlig riktning.

Rekommendation: behåll en sammanhållen redaktionell illustrationsstil med verklighetsnära miljöer, djup och materialkänsla. Variera motivens silhuett, ljus, bakgrundens ton och bildens detaljtäthet. Skapa kontrast inom bilden först, därefter mellan kanalerna. En modern poddbild behöver en visuell huvudidé, inte en ensam ikon eller en gemensam enfärgad bakgrund.

## Genomgång per kanal

| Kanal | Bedömning av första bilden | Beslut om motiv | Separation och beskärning |
| --- | --- | --- | --- |
| IBAT - Informationsförsörjning | Informationsmiljö och datakopplingar är representativa. För många skärmar, stad och solnedgång konkurrerar om uppmärksamheten. | Behåll analysrummet och det stora kartbordet. | Cyan information i tydlig förgrund mot en lugn neutral varmgrå miljö. Dämpa stadsutsikt och små skärmdetaljer. Kartbordet ska kännas igen i kvadrat. |
| Kriminell ekonomi | Stad och finansmiljö har rätt redaktionell stämning men ämnet kan läsas som turism eller allmän ekonomi. | För in en ekonomisk granskningsakt i samma stads-/kontorsmiljö. | Ljus dokumentyta och tydligt granskningsverktyg i förgrund mot mörkare nedtonad stad. Undvik den andra seriens friliggande gröna pengabunt. |
| Lagstiftning | Bibliotek, vågskålar och träklubba är begripliga men guldföremålen försvinner i samma varma solljus. | Behåll bibliotek och rättsliga föremål. | Ljusare mässing mot sval grå/salviatonad bakgrund. Tydlig kontur runt vågens skålar. Gavel och böcker stöder huvudmotivet. |
| Sjöområdet | Fartyg, hav och kust ger stark relevans och djup. Det mörka skrovet har samma ton som havet och orange reflexer skapar brus. | Behåll patrullfartyg och maritim miljö. | Ljus silvergrå överbyggnad och belyst bog mot mörkt blått hav. Lugnare pärlgrå himmel och färre skarpa reflexer. Huvudfartyget prioriteras framför det mindre. |
| Våld | Utryckningsfordon och stadsmiljö fungerar bättre än en ensam blåljuslampa. Bilden beskriver polisens respons, inte hela våldsområdet, och ska förstås som symbolisk kanalidentitet. | Behåll fordonet i en tom nordisk stadsmiljö. | Ljusare fordon och gulblå reflexmarkering mot gråviolett stad. Avgränsa blå/rött ljus till fordon och närmaste mark. Ingen avbildning av offer eller påstådd faktisk brottsplats. |

## Kvalitetskrav

1. Läsbar silhuett och visuellt huvudmotiv vid 48, 64 och 128 pixlar.
2. Motiv och bakgrund måste skiljas genom ljus och form, även i gråskala. Färg ensam räcker inte.
3. Kvadratisk kanalbild, avsnittsminiatyr, stor spelare, bred hero och artikelbild ska fungera med samma kanalidentitet.
4. Bakgrunden ska skapa sammanhang och rumslighet men ha lägre detalj- och kontrastnivå än huvudmotivet.
5. Bilderna ska vara tydliga i både ljust och mörkt tema. Textöverlägg på heron verifieras separat och använder en läsbar mörk övertoning.
6. Inga stora textetiketter bakas in i bilderna. Kanalnamn och avsnittsmetadata förblir riktiga, tillgängliga gränssnittselement.
7. Illustrationerna får inte presenteras som dokumentation av faktiska nyhetshändelser. Samma masterbild återkommer på kanalens avsnitt och artiklar.

## Avgränsning

Bildgranskning kan visa form, kontrast, semantisk relevans och beskärningsproblem. Den bevisar inte full tillgänglighetsöverensstämmelse eller långsiktig användarigenkänning. Fysisk iPhonefeedback från ägaren är underlag, men en specifik telefonmiljö eller alla färgseenden är inte därmed fullständigt testade.

## Drift

Arbetet görs i den ägda UI-grenen. Produktionsjobb, ljud och originalkataloger berörs inte av bildredigeringen. Ny kanalbildsversion och uppdaterade cacheversioner används för att ersätta den förkastade serien i förhandsdriften. Samordning och deployresultat journalförs i PR #4.

## Verifierad slutlig bearbetning

Granskningen genomfördes med originalbilderna och den befintliga kanalgriden som underlag. Ett nytt föreprov av gränssnittet sparades som docs/evidence/channel-art-before.png. Efterproven använder den nya serien och ligger i aktuella iphone-chromium- och desktopbilder i docs/evidence.

1. Originalbedömning: första seriens djup och redaktionella miljöer behålls. Den andra seriens platta symboluttryck är ersatt.
2. Bildbearbetning: alla fem miljöbilder granskas i bred form samt som 128/64/48-pixlars kvadrater. Vid 64 och 48 pixlar finns även gråskalejämförelse. Motiven känns igen på form och ljus, inte enbart kulör. Kontaktblad: channel-art-final-crops.png.
3. Gränssnitt: kvadratisk bild exporteras med motivanpassat fokus i stället för att förlita sig på samma automatiska mittbeskärning överallt. Den stora spelaren och minibilder visar samma identifierbara motiv. Hero och läsbild använder bred master.
4. Funktion och drift: ordinarie ljud- och navigationsprov körs på nytt efter bytet. Slutlig head måste få grön CI innan merge. Förhandsversionen uppdateras via den etablerade privata driften, med separat rollback och bevarade produktionsfiler.

| Kanal | Kvadratens fokus | Bred bilds fokalpunkt | Resultat av liten bild/gråskala |
| --- | --- | --- | --- |
| IBAT - Informationsförsörjning | Centrum, betoning nedåt på bordet | 50% 64% | Bordets ljusa form och datayta skiljs från stillsam rumsmiljö. |
| Kriminell ekonomi | Förstoringsglas och handlingar, något åt höger/nedåt | 58% 64% | Den ljusa aktens yta och glasets cirkel fungerar mot den mörkare staden. |
| Lagstiftning | Vågens centrum och skålar | 50% 52% | Vågens kontur och mittaxel framträder mot fönster och bibliotek. |
| Sjöområdet | Huvudfartyget, något åt höger | 65% 50% | Ljusare överbyggnad och bog separeras från mörka vågor. |
| Våld | Utryckningsfordonet | 50% 53% | Fordonets ljusa reflexpartier ger större separation från gatans mellantoner. |

Bevarad begränsning: bilderna är små illustrationer och ger ingen garanti för ämnesförståelse utan kanalnamnet. Därför finns riktiga kanalnamn kvar som text i alla gränssnitt. Ingen WCAG-kontrastkvot för brödtext används som ett vilseledande kvalitetsmått för fotografiska motiv.
