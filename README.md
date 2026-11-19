# Kimbo Creates – website

Statische website (gewone HTML, CSS en JavaScript, geen build-stap) voor Kimbo Creates:
raamschilderingen, muurschilderingen en belettering, met de hand geschilderd door Kim.

## Pagina's

| Pagina | Bestand |
|---|---|
| Home | `index.html` |
| Ramen (galerij per seizoen + stapel) | `ramen.html` |
| Muren | `muren.html` |
| FAQ | `faq.html` |
| Bedankt (na het offerteformulier) | `bedankt.html` |

## Mappen

- `css/site.css` – alle gedeelde stijlen (krijtbord, fonts, hero met boom, polaroids, animaties)
- `js/reveal.js` – zachte animatie bij het scrollen
- `js/seizoen.js` – de raamkaart op de homepage toont het seizoen dat eraan komt
- `js/stapel.js` – de foto-stapel (rondgooien, omdraaien, netjes op een rij)
- `js/ramen.js` – de seizoensfilter en de val-animatie op de Ramen-pagina
- `assets/fonts` – Kimbo Poster (titels), Kimbo Krijt (tekst), Kimbo Casual (reserve)
- `assets/img/portfolio` – de foto's van Kims werk (bestandsnaam = onderwerp + plaats, voor SEO)
- `assets/img/deco` – boom, vos en hert in de hero
- `assets/video` – procesvideo "van schets tot raam"

## Lokaal bekijken in Visual Studio Code

Dubbelklikken op `index.html` werkt, maar met een kleine webserver ververst de pagina
vanzelf als je iets aanpast:

1. Installeer de extensie **Live Server** (Ritwick Dey).
2. Open de repo-map in VS Code (File → Open Folder).
3. Rechtsklik op `index.html` → **Open with Live Server**.

Of in een terminal in deze map: `python -m http.server 8000` en surf naar http://localhost:8000.

## Online zetten (Lovable)

1. Koppel deze repo via GitHub (of pak hem in als ZIP) en importeer hem in Lovable
   via Free Import. Vraag Lovable de bestanden als **statische HTML** te laten staan en ze niet
   om te bouwen naar React.
2. Publiceer. Op een betaald plan (ook Lite) kun je daarna je eigen domein koppelen
   via Project → Settings → Domains.

`netlify.toml` wordt door Lovable genegeerd; die is er voor als je ooit naar Netlify gaat.

## Offerteformulier

Het formulier gebruikt **Web3Forms** (gratis, werkt op elke host):

1. Ga naar https://web3forms.com en vraag een access key aan met Kims e-mailadres.
2. Vervang in `index.html` de tekst `WEB3FORMS-ACCESS-KEY` door die sleutel.
3. Na het versturen gaat de bezoeker naar `bedankt.html` (adres staat in het verborgen veld `redirect`).

## Nog te doen

- Domein: overal staat `https://kimbocreates.be` (canonical, sitemap, robots, JSON-LD op de homepage).
  Is het domein anders, zoek-en-vervang dat dan in de hele map.
- Teksten met `[Kim vult aan …]` en `[KBO-NUMMER]` / `[BTW-NUMMER]` invullen.
- Toestemming van de ouders vragen voor de eenhoornmuur met de naam van het kindje,
  of de naam van de foto halen.
- Na publicatie: sitemap indienen in Google Search Console, Google Bedrijfsprofiel aanmaken
  (dienstverlener met servicegebied, adres verborgen). Zie het SEO-onderzoek.
