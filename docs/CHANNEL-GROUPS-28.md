# Webbuppdrag 28, arbetscheckpoint 21 oktober 2026

## Omfattning och bas

Gren work/issue-28-channel-groups i PR 34. Ursprunglig bas c4957b0; metadata är återgenererad över färsk webbmain e0f5170 efter integrerad nattredaktions-PR 33, vars tre nytillkomna specialavsnitt bevaras. V5 och bildlaboratoriets 20 serier återanvänds. Produktionsdelen finns i nyhetspodden PR 137, integrerad ed68b8b1ea3ceb8dc89078139c3527f883f259fd efter PR-CI 39635545778/tests119344880041 success. 379 lokala Pythonprov passerar. Ingen ny innehållsproduktion eller Telegramomsändning.

## Ändring

06-film, Analog filmfotografi, är global standard utan eget val. Alla giltiga egna val bevaras. Återställ till standard tar bort eget val efter lyckat bildbyte. Alla 20 stilar, befintliga leveransbilder och fokalpunkter kvarstår. Okänd kanal får neutral bild, aldrig en annan kanals motiv.

Bevakningskanaler och Kunskapskanaler använder samma kompakta kort. Högst fyra per grupp på startsidan. Visa alla finns bara vid fler än fyra, med group=monitoring eller group=knowledge i delbar URL. Fliken Kanaler har Alla och samma två grupper samt sökning med q i URL. Två lika breda kort per rad på mobil. Grupperna ligger bredvid varandra från 1200 px, annars efter varandra. Gemensam sidskrollning. Dagens bevakning och Senast publicerat bevaras; den överlappande äldre kunskapsgruppen tas bort.

Grupper och ordning kommer från publika kanalregistret: channel_type och display_order, med stabilt ID som sekundär ordning. Den befintliga klassificeringen migreras en gång från tidigare frontendvärden. Ingen separat runtimekanallista används. Bevakningskanaler kan fortfarande ha specialavsnitt.

Ordinarie bevakning har Avsnitt N: godkänd innehållsrubrik. Datum behålls separat. episode_order behålls som gammal sorteringsmetadata. Beständiga nummer och identitetsalias ligger i episode-numbers.json och ingår i befintlig gittransaktion med konfliktomkörning. Superseded-versioner delar nummer. Migrationen ändrar ingen brief, manus, ljud, artikeltext, källa, datum eller direktlänk. Titeluppdateringen går till råmetadata, detaljer, listor, sök, artikelns avsnittslänk, kö och spelare. title_migration i manifestet rättar äldre sparade kötitlar utan att byta ID eller ljudposition.

## Verifierat före webbpublicering

36 enhetsprov och 40 desktopprov passerar. Android: 39 av 40 första gången; enda felet var testets försök att pausa på den dolda minispelaren när stor spelare visades. Rättat till den synliga stora knappen och samtliga sju riktade Androidprov passerar. Ny full kontroll mot nattredaktionens PR 33 körs före integration. Prov täcker 0, 1, 4, 5 och 10 kanaler i varje grupp, totalt 20; stabil registerordning, gräns fyra, URL, omladdning, bakåt, 320 px, stor text och tangentbord. Alla 20 bildstilar provas med ljud, kö och scroll. Numrering provas med två konkurrerande verkliga gitkloner, omkörning, korrigering, separat kanalserie, historisk komplettering och supersession.

Lokalt WebKit blockerades före browserstart av saknade systembibliotek. Det är inte ett produktprov. Befintlig CI för iPhone/iPad WebKit ska passera före merge. Fysisk iPhone, fysisk iPad och VoiceOver är inte testade.

## Samordning, nästa steg och rollback

Dagens IBAT/KEK var levererade före start, Våld/Sjö dokumenterat stoppade i #121. Ingen produktionskörning aktiv vid avstämning. Nattredaktionens öppna webb-PR 33 får gå före denna integration. Före webb-PR/merge: hämta färsk main, behåll nyare innehåll och kör metadata-migreringen igen på färsk data. Ersätt aldrig katalogen med en äldre snapshot. Kontrollera semantisk diff och full CI. Följ Pages och exakt frontendverifiering samt verklig katalog, ljud och artikellänkar. Skriv faktiska kvitton här, i V5-CHECKPOINT och #28.

Rollback sker endast med avgränsad kodrevert eller metadatarättning mot färsk main. Nummerledger och senare innehåll får aldrig tas bort. Produktionskontrakt och migrationskommando finns i nyhetspodden/docs/WEB-TITLES-28.md och scripts/migrate_web_metadata.py.
