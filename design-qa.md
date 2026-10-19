# Design QA: Morgonpodden V2 förhandsversion

## Omfattning

Granskning av den separata fungerande förhandsversionen. Detta är inte slutligt releasegodkännande. Faktisk publiceringstid, feedordning, fysisk iPhone Safari och produktionsintegrering är kvarstående releasegrindar enligt docs/v2-preview.md.

## Referens och bevis

Visuell huvudreferens: docs/evidence/approved-design.jpg, original 1536 × 1024. Godkänd konceptbild med sex mobilflöden och två desktoplayouter. Telefonram och statusrad har inte byggts in i webbgränssnittet.

Implementationsbilder: docs/evidence/iphone-chromium-today.png, iphone-chromium-channel-dark.png, iphone-chromium-player.png, iphone-chromium-article.png, iphone-chromium-channels.png och iphone-chromium-search.png. Desktop: desktop-today.png, desktop-channel-dark.png, desktop-player.png. Samma verkliga kanalbilder och publicerade innehåll används i varje vy.

Mobil: CSS-viewport 390 × 664, deviceScaleFactor 3, senaste bildfångst med scale:css ger 390 × 664 pixlar. Desktop: 1280 × 720, deviceScaleFactor 1. Mockens skärminnehåll har högre höjd/bredd-förhållande än Safaris emulerade innehållsyta. Ingen pixelperfekt jämförelse av dessa olika höjder påstås. Fullvyjämförelse med normaliserad innehållsbredd i docs/evidence/comparison-mobile-final.png. Fokuserad granskning av rubrikbrytning, hero, kanalbilder, flikar, listmetadata och spelarkontroller i respektive separata skärmbild. Granskning av desktopens sidomeny, huvudspalt, sekundärspalt och docka utförd separat mot den nedre delen av referensbilden.

Cloud browser: http://terminal.local:4173 öppnad och granskad. Startsida, Kanaler och Sjöområdets kanalarkiv provade via riktiga klick. Konsolloggar kontrollerade. Endast browserextensionens egna metadatafel observerades, inga kvarvarande applikationsfel. Tidigare laddningsfel i osäker lokal HTTP-kontext åtgärdades med lokalt vendorerad SHA-256-fallback.

## Jämförelse och iterationer

1. P1: hemsidans kort fick fel layout genom CSS-specificitet. Bilden tog hela flexraden och text flöt åt höger. Rättat med explicit blocklayout för hemsidans summary, öppet läge separat och tydlig kanaltext. Nya browserbilder och tester visar inget horisontellt overflow.
2. P2: det långa IBAT-namnet bröt olyckligt i hero. Mindre mobilrubrik och tydligare radbrytning införda. Kontroll: iphone-chromium-today.png. Namnet är oförändrat och inga maskin-ID:n eller länkar har ändrats.
3. P2: stor mobilspelare krävde scroll för huvudkontroller. Bildens höjd följer nu viewporten och den dubblerade minidockan döljs i just mobilens stora spelare. Audioelementet lever vidare. Kontroll: iphone-chromium-player.png, huvudkontroller ryms i samma vy.
4. P2: tidiga skärmbilder togs före bildavkodning. Bildfångst väntar nu på alla bilder som är synliga i viewporten. Lazy loading kvarstår för innehåll nedanför skärmen.
5. P2: sök och artikelbilder saknade tydlig kanaligenkänning i ursprungliga gränssnittet. Samma registrerade kanalbild används nu i kanalgrid, hero, avsnitt, spelare och artiklar.

## Obligatoriska visuella ytor

Typografi: Georgia används för redaktionella rubriker och artikeltitlar. Systemets sans serif används för navigation, metadata och brödtext. Storlekar och radavstånd har granskats i mobil och desktop. Långa verkliga rubriker tillåts ta mer plats än mockens korta exempel.

Layout: mobil har fast bottenmeny, hero, tre kort per rad och kompakta artiklar. Desktop har egen sidomeny, huvudspalt, artikelspalt och dockad spelare. Kanalarkivet har sidindelning och listlayout. Avstånden är konsekventa. Inget horisontellt overflow i testerna.

Färg: ljus varmvit bas, mörk marin bas, blå aktiv markering och dämpad metadata. Manuell och automatisk färgväxling samt lagring testade. Fokusmarkeringar och reduced motion finns. Ingen extern fontladdning behövs.

Bildkvalitet: fem separat genererade kanalbilder i sammanhållen marinblå/varm palett. Fartyg, rättsmiljö, ekonomi, informationsnätverk och utryckningsmiljö är semantiskt representativa. Riktiga Feather-ikoner används. Inga bildytor ersätts med ritade CSS- eller SVG-illustrationer. Mörk overlay används bara för läsbar text över bilder.

Innehåll: verkliga katalogposter, fem befintliga kanaler. Mockens påhittade framtidskanaler och nyhetsrubriker har inte gjorts till publikationer. IBAT - Informationsförsörjning är konsekvent. Avsnitt 1 / Uppstart markeras i historiken. Actual published_at saknas i originaldata och kan inte verifieras eller fabriceras genom designarbete.

## Funktionella kontroller

13 lokala enhetstester godkända. 16 browserprov godkända över iPhonestorlek i Chromium och desktop. Ljudposition ökar från verklig MP3; hastighet ändras; ljudkälla består över navigation. Artikelkällor, öppna frågor och bedömning finns kvar. Syntetiskt arkiv med 6000 avsnitt och 24000 artiklar hämtar en lista per begärd sida, samt test av 201 poster med intro på annan arkivsida. Temalagring, mörkt/ljust/system, kanalfilter, sökfilter och global kanalträff testade.

WebKit lokalt blockerad av saknade systembibliotek och nekad paketinstallation. Det ersätts inte av ett påstående om verifierad Safari. GitHub Actions WebKit och ägarens fysiska iPhoneprov kvarstår före release.

## Återstående förfining

P3: Bildspråket följer referensen men motiven är egna kanalillustrationer. Fem kanaler ger glesare desktopgrid än mockens tjugo. Separata bilder registreras när fler verkliga kanaler etableras. Desktopens hero kan göras mer kompakt efter ägarens feedback. Fysisk Safari och mellanliggande surfplattebredder behöver ytterligare granskning före slutligt byte.

Inga kvarvarande P0/P1/P2 visuella fynd för förhandsversionens granskade vyer. Produktionskraven ovan är uttryckligen inte godkända av denna visuella QA.

final result: passed
