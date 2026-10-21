# Morgonpodden V4, granskning och prioritering

## Aktuell uppföljning i V5

Prioritering 1 till 13 har levererats genom PR 17 till 25 och PR 30. Se V5-CHECKPOINT.md för bildreleasens aktuella kvitton. De tre småförfiningarna nedan levererades redan i PR 24 och ska inte göras om. Ny avgränsad rättning för 320 px och stor text samt uppmätt bildpayload finns i V5-UX-VERIFICATION.md. Fysisk Safari/VoiceOver och lång bakgrundsuppspelning är fortsatt inte testade. Större gruppering av kanaler följs separat i ärende 28.

Granskad 21 oktober 2026. V3 behåller redaktionell identitet, sidonavigation på desktop, mobilnavigation, tematokens och den beständiga spelaren. Nya designriktningar provas endast som lokala bilder i Designlaboratoriet.

## Granskade flöden

| Steg | Flöde | Bedömning och evidens |
| --- | --- | --- |
| 1 | Startsida och bevakningskö | Tydliga fyra redaktionella sektioner. Mobilens horisontella bevakningsrad gömmer kanaler; byt till två gånger två. Desktop fungerar. `evidence/v4-audit-start-desktop.png`, V3/V4 browserprov. |
| 2 | Kanalöversikt | Åtta tydliga kanaler, sök och kategorier fungerar. Inga små kategorietiketter under kanalnamnen. 320 till 1450 px verifieras. |
| 3 | Kanal, uppstart och arkiv | Uppstart hittas och historisk ordning bevaras, men kunskapskanaler saknar typanpassade ingångar. `evidence/v4-audit-channel-desktop.png`, historik- och katalogprov. |
| 4 | Avsnitt och expansion | Direkt uppspelning och läsning är separerade. Ett öppet avsnitt åt gången och scrollankare finns redan och ska behållas. Kötester verifierar navigation utan avbrott. |
| 5 | Artiklar och källor | Bra läsbredd, tydliga källor och tidig ljudkoppling. Mellanrubriker i källtext behöver återges semantiskt när de faktiskt finns. `evidence/v4-audit-article-desktop.png`. |
| 6 | Sök och ämnen | Sökningen är ordindelad och begär avgränsade index. Kanal, avsnittstyp och längd saknas som kombinerade urval. `evidence/v4-audit-search-desktop.png`. |
| 7 | Mini-, fullspelare och kö | Samma ljudnod bevaras. Kö kan redigeras och fortsätta över arkivsidor. Nya bildmarkörer i kön behöver tvåspaltsjustering, inte mer spelarhöjd. |
| 8 | Mer och teman | Ljust, mörkt och systemläge fungerar. Bildval är separat lokal inställning. `evidence/v4-audit-lab-live.jpg`, `evidence/v4-audit-lab-mobile.png`. |
| 9 | Stora arkiv och nya poster | Befintliga prov omfattar 20 kanaler, 6 000 avsnitt och 24 000 artiklar. Katalogen hämtas i sidor. Ordinarie nästa dag och specialavsnitt hålls skilda. |
| 10 | Tillgänglighet och rörelse | Semantiska kontroller, synliga fokusmarkeringar, reduced motion och safe areas finns. WebKit är emulering. Fysisk iPhone, VoiceOver och långvarig bakgrundsuppspelning är ännu inte verifierade. |

## Prioriterade förbättringar

| Prio | Verifierat behov | Ändring och acceptans | Risk / komplexitet |
| --- | --- | --- | --- |
| 1 | Lagstiftning ingår i bevakning trots nytt ägarbeslut | Exakt fyra dagliga och fyra kunskapskanaler. Historik kvar, gemensamt producenturval avaktiverar bara Lagstiftning. PR 17 och producent PR 118. | Låg / liten |
| 2 | Statiska bildjämförelser räcker inte | Liveväljare under Mer, samma sida och ljud, lokal persistens och återställning. Bara kompletta serier. PR 18. | Medel / stor |
| 3 | Mobilens bevakningsrad kräver sidscroll | Fyra utgåvor ryms i två gånger två vid 320 och 393 px. Ingen horisontell överströmning. | Låg / liten |
| 4 | Fyra kunskapskort i trekolumnsgrid blir ojämnt | Två jämna kolumner på större skärm, befintlig mobilstapel behålls. | Låg / liten |
| 5 | Kunskap och daglig bevakning får samma ingångar | Kunskapsmärkning, Börja här, Grundkurser, Fördjupningar, Artiklar och befintligt arkiv. Skapa inte falska grundkurser om metadata saknas. | Medel / medel |
| 6 | Sökresultat kan inte avgränsas samtidigt | Kombinerade kanal-, innehålls- och längdfilter på redan hämtade ordträffar. Kön ska följa de synliga resultaten. | Medel / medel |
| 7 | Filtrerad kö riskerar orelaterade senare sidor | Seriell innehållsmarkör i kökursorn. Nästa arkivsida ska behålla samma urval även efter reload. | Medel / medel |
| 8 | Rubriksyntax i artikeltext återges som brödtext | Enbart faktiskt levererade rubriker får bli h2. Alla texter escapade. Inga påhittade redaktionella mellanrubriker. | Låg / liten |
| 9 | Små bildytor annonserar stora bildbredder | Anpassa sizes för avsnitt, kö och små artikelkort. Samma identitet och återanvända filer. | Låg / liten |
| 10 | Köbild och knapp kan staplas onödigt | 40 px bildspalt, text och redigering i andra spalten. Behåll knappar för tangentbord. | Låg / liten |
| 11 | Utökat laboratorium behöver tåla 20 alternativ | Lazyloadade kontaktförhandsvisningar, inga masterhämtningar i klienten, enbart vald serie för innehållsytor. Mät faktisk bildpayload. | Medel / medel |
| 12 | Bildval ska kunna återställas vid nätfel | Återställ till V3 utan att först kräva nätverksförladdning. Bilder använder befintlig fallback. | Låg / liten |
| 13 | Bildseriernas kvalitet måste följas separat från kod | Åtta individuella original, granskning av liten och kvadratisk beskärning, hashkontroller och sparade prompter per serie. | Medel / stor |
| 14 | Fysisk miljö saknas | Separat redovisning av emulerat WebKit och fysisk Safari/VoiceOver. Inga påståenden om full WCAG- eller fysisk verifiering. | Externt beroende |

## Jämförelse med professionella produkter

Primärkällor lästa 21 oktober. Jämförelsen gäller dokumenterade användningsmönster, inte en påstådd fullständig audit av respektive app.

* [Apple Podcasts: sök och filter](https://support.apple.com/en-ie/guide/iphone/iph19bb8e705/ios) ger stöd för tydlig skillnad mellan kanal och avsnitt samt sök oberoende av visningsfilter.
* [Apple Podcasts: uppspelningskö](https://support.apple.com/en-ie/118668) har tydliga val för nästa och sist i kön. Morgonpoddens befintliga kontextkö bevaras.
* [Pocket Casts: smarta listor](https://support.pocketcasts.com/knowledge-base/episode-filters/) och [sortering](https://support.pocketcasts.com/knowledge-base/episode-sorting/) stöder längd och publiceringsordning som användbara urval.
* [Spotify: Play Queue](https://support.spotify.com/us/article/play-queue/) skiljer den kompakta spelaren från den redigerbara kön och har motsvarande desktopingång.
* [Sveriges Radio: nästa avsnitt](https://teknisk-support.sverigesradio.se/org/teknisk-support/d/lyssna-pa-poddar-ipnm/) visar betydelsen av att serieordning och nyhetsordning kan skilja sig.
* [BBC: internationell tillgång](https://help.bbc.com/hc/en-us/articles/42655683267091-Information-on-Closure-of-BBC-Sounds) innebär en begränsning: Sounds stängde utanför Storbritannien 21 juli 2025. Ingen svensk livejämförelse av Sounds har därför påståtts. BBC:s tydliga skiljelinje mellan nyheter, fördjupning och tillgänglighet är referens, inte grund för kopierad navigation.
* [apple-design](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md) används selektivt: omedelbar tryckåterkoppling, avbrytbara bildbyten, begränsad rörelse, läsbar typografi och bevarad kontext. Ingen ny animationsmotor behövs.

## Avgränsning

Större grafiska omtag och ny permanent bildstandard kräver ägarens val. De genomförda små ändringarna håller V3:s informationsarkitektur. Inga konton, favoriter, personliga rekommendationer eller parallella produktionsmotorer tillkommer. Framtida 07.45-publicering kan aldrig bevisas av ett frontendtest i förväg.

## Ytterligare verifierad tillgänglighetsrättning

Axe-core 4.14.0 på fem huvudvyer i båda färgteman hittade nested-interactive på avsnittsraderna: en spelknapp låg inuti summary. Spelknappen är nu en separat syskonkontroll bredvid details, med samma kontextkö och visuella rad. Efter rättningen visar de tio automatiska kombinationerna inga träffar inom wcag2a, wcag2aa och wcag21aa. Resultatet finns i accessibility-v4-results.json. Detta är automatisk regelkontroll, inte full WCAG-certifiering eller fysisk VoiceOver-testning. Nya browserprov kontrollerar att Enter på spelknappen spelar utan expansion och att Enter på summary expanderar utan att avbryta ljudet.

## Verifierad bildskärpa och kvarvarande småförfiningar

Efter elva publicerade serier hittades ett faktiskt desktopfel: en 1 093 px bred kanalhero fick webbläsaren att välja `ibat-small.webp` (400 px export) eftersom sizes annonserade 320 px. En egen kanalhero-klass får nu sizes som följer respektive brytpunkts verkliga sidbredd. Regressionstestet granskar vald currentSrc i V3 och en experimentserie, inte bara src-attributet.

Upprepat kanalnamn döljs i den egna kanalens avsnittsrader, men behålls i globala listor. Laboratoriets radioknappar namnges en gång med stilnummer och stilnamn; kontaktförhandsvisningen är dekorativ inom etiketten. Sökantal, laddning och fel använder en beständig statusregion i stället för att hela avsnitts-/artikellistan är en live-region. Tester kontrollerar statusnodens identitet över sökning och filtrering. Lokalt: 33 enhetsprov och 22 riktade desktop/Android-prov gröna. Fysisk VoiceOver är fortsatt inte verifierad.
