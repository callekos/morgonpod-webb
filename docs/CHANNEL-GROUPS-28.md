# Webbuppdrag 28: publicerat och verifierat

Slutfört den 21 oktober 2026. PR #34 är integrerad som fc51dbc498042894cd7a28cf57683ce04d623efc. Exakt slutrevision c61f2dbbf624799076f4949054d952f3dffa4be9 passerade PR-acceptans 39644474113 med 36 enhetsprov och 168 browserfall inklusive iPhone/iPad WebKit.

Huvudgrenens acceptans 39645372457 är helt grön: 36 enhetsprov, 168 browserfall, exakt filverifiering och åtta browserprov mot den verkliga webbplatsen. Pages 39645368971 är success. Filverifieringen kvitterade rätt frontendbytes och 42 aktiva avsnitt kl. 17:42:50 UTC. De åtta verkliga webbproven passerade kl. 17:44:04 UTC. Oberoende HTTP-kontroll matchade exakt manifest samt rätt channel-art.js och sw.js.

## Publicerad förändring

Stil 06-film, Analog filmfotografi, är global standard. Giltiga egna stilval bevaras. Återställ till standard väljer 06. Alla 20 stilar och befintliga leveransbilder kvarstår; inga masteroriginal laddas i klienten.

Startsidan visar Dagens bevakning, Bevakningskanaler, Kunskapskanaler och Senast publicerat. Grupperna är ömsesidigt uteslutande och hämtas från registrets channel_type och display_order. Två lika breda kompakta kort per mobilrad, grupper bredvid varandra från 1200 px och gemensam sidskrollning. Högst fyra kanaler per grupp. Visa alla finns endast vid fler än fyra och öppnar delbar group-URL. Kanaler-fliken använder samma grupper.

Ordinarie bevakning har beständiga kanalvisa nummer och innehållsrubriker. Listor, detaljer, sök, kö och spelare använder samma titel. Datum, kunskaps-/specialtitlar, ljud och artiklar bevaras. Äldre kötitlar uppdateras genom en begränsad engångsmigrering utan ljud- eller köbyte.

## Bevarat innehåll och produktionskontrakt

Färsk innehållsbas f6f6af86c87d8760079993b265682c76da214be8 inkluderar nattredaktionens samtliga 15 specialavsnitt och deras rättade verkliga publiceringstider. Alla 47 råavsnitt och 57 råartiklar bevaras. 1176 skyddade filer i episodes/, assets/ och catalog-policy.json är byteidentiska. Endast avsedda titel-/nummer-/registermetadata och deras katalogprojektioner ändras. Inga Telegramomsändningar, ingen ny bildproduktion och inga ändringar av scheman, modeller, TTS eller Watson.

Produktionsdelarna är integrerade via PR #137 och #138. 380 Pythonprov samt PR-/mainacceptans och heartbeat 39637253315 på 5f28ea5e3abee619d9642c733405f8bd283ad335 är gröna. episode-numbers.json ingår i den befintliga gittransaktionen och konfliktomkörningen. Omkörning, rättning, supersession, datumrättning och samtidiga publiceringar behåller stabil tilldelning. Köernas engångsmigrering har fast ursprunglig ID-mängd och växer inte med framtida avsnitt.

## Prov och begränsningar

Prov täcker 0, 1, 4, 5 och 10 kanaler per grupp, totalt 20, oberoende tillväxt, registerordning, URL i ny flik, omladdning, bakåt, 320 px, 200 procent textstorlek, tangentbord, teman, 20 bildstilar och bevarat ljud/kö/scroll. Förutbestämda dagsantal använder kontrollerade fixtures. Produktionsdata har inte ändrats för att få tester gröna.

Ett äldre mobilprov rättades till att kontrollera båda grupperna. WebKit-provet för delbar URL öppnar en ny flik efter att samma URL efter historiknavigering kraschade i testmotorn. Alla krav och assertioner finns kvar.

Fysisk iPhone/iPad, VoiceOver och långvarig bakgrundsspelning är inte verifierade. Ett separat direkt molnwebbläsaranrop fastnade och räknas inte som godkänt bevis. Den verkliga webbverifieringen utfördes av GitHubs Chromium/WebKit-prov och oberoende HTTP.

## Återställning och fortsatt arbete

Återställ endast avgränsad frontendkod eller korrigera metadata per ID mot färsk main. Ta aldrig bort nummerledgern och återställ aldrig äldre katalogsnapshotter. Kontrollverktyg: scripts/verify-metadata-migration.cjs. Produktionskontrakt: nyhetspodden/docs/WEB-TITLES-28.md och docs/WEB-PRODUCTION-CONTRACT.md.

Uppdrag #28 är slutfört. Inget implementerings- eller publiceringssteg återstår inom denna omfattning. Dokumentationskvittot ändrar endast Markdown; testad kodrevision är fc51dbc498042894cd7a28cf57683ce04d623efc.
