# Prenumerera, tillägg #37

Utgångspunkt: main 6d83c6d978e7b4f752c4a58b769f878fc1ab810a efter dagens fyra leveranser i produktion #121. V6 #28 behålls.

## Funktion

Alla HTML-skal har en tydlig Prenumerera-länk med minst 44 px höjd i befintligt klistrat sidhuvud. Sidhuvudet finns också på den stora spelarens mobilsida. Det tar plats i dokumentflödet, kan radbrytas och tar hänsyn till safe areas.

Länken öppnar prenumerera.html med befintlig SPA-navigering. Samma audio-element, kö och ljudposition används vidare. Texten förklarar Telegram och öppnar den redan publicerade gemensamma inbjudningslänken https://t.me/+jlPUjsmjlE03NDFk i ny flik eller Telegramappen. Inventering av app.js visar denna gemensamma länk under Mer och inga separata kanalprenumerationer, RSS-, mejl- eller webbpushflöden. Inga nya integrationer har skapats.

## Verifiering och publicering

Pågående: 36 enhetstester passerade; nya Chromiumprov för mobil, desktop, 320 px, förstorad text, tangentbord och bevarad spelare passerade. Full regressionssvit och CI följs före integration. Slutkvitton fylls på efter verklig publicering. WebKitprov är emulering, fysisk iPhone/iPad har inte provats.

Inga ändringar i katalog, policy, artiklar, ljud, bildproduktion eller produktionsrepo. Återställning: återställ bara tilläggets skal/app/CSS/service worker, aldrig katalogen till äldre snapshot.
