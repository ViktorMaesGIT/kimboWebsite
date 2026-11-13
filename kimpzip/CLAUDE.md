# Kimbo Creates – website

Website voor Kim (Kimbo Creates, @kimbo_creates): raam- en muurschilderingen, schmink, optredens, kostuums, events en teksten. Gebouwd door Viktor. Taal van de site: Nederlands (Vlaams).

Lees bij elke taak eerst de skill `.claude/skills/kimbo-creates-website/SKILL.md`. Daarin staan de stijl, de bouwstenen, de toon en de inhoudsregels.

## Techniek

- Gewone HTML + CSS + een beetje eigen JavaScript (`assets/js/`), geen framework, geen build-stap, geen externe bibliotheken.
- De site moet ook zonder JavaScript leesbaar blijven: wat een script opbouwt, staat ook in een `<noscript>`.
- Lettertypes staan lokaal in `assets/fonts/` (via `css/fonts.css`). Nooit Google Fonts of een andere externe bron.
- Bekijken: open `index.html` in de browser, of gebruik de VS Code-extensie *Live Server*.
- Alle kleuren en maten staan als variabelen bovenaan `css/style.css`. Pas ze daar aan, niet in de HTML.
- Elke pagina laadt in deze volgorde: `css/fonts.css`, `css/style.css`, `css/stapel.css`, en vlak voor `</body>` `assets/js/stapel.js` (met `defer`). Alleen de home laadt daarna ook `assets/js/vloei.js`.

## Structuur

```
index.html              home: one-page van vier schermen
ramen-en-muren.html     dienstpagina's (zelfde opbouw)
schmink.html
optredens.html
kostuums.html
events.html
teksten.html
css/fonts.css           @font-face van de lokale lettertypes
css/style.css           alle stijl, variabelen bovenaan
css/stapel.css          stijl van de stapel werkjes
assets/js/stapel.js     stapel werkjes (home en dienstpagina's)
assets/js/vloei.js      scrollvloei en ramen die opengaan (alleen home)
assets/fonts/           Instrument Serif, Inter, IBM Plex Mono (woff2)
assets/img/             foto's van Kim (jpg/webp, max ~1600px breed)
assets/deco/            getekende SVG's: stam, takken, bijtjes, weide, bijenkorf
```

## Regels

- Kop/menu en contactblok + voet zijn op elke pagina identiek. Pas je er één aan, pas ze dan op alle 7 pagina's aan. Enige verschillen op de home: logo en Home linken naar `#top`, Over mij naar `#over`, en het contactblok staat in `.slotblok` binnen `<main>`.
- Het actieve menu-item krijgt `aria-current="page"`.
- De kicker, de h1 en de intro van de home staan als gewone HTML in `.stapel__statisch` in `index.html`; pas die tekst daar aan, niet in `stapel.js`.
- Nieuwe foto: in `assets/img/`, verkleinen en comprimeren, met een beschrijvende `alt` en `loading="lazy"`. Op een dienstpagina zet je ze op twee plaatsen: in de JSON van de stapel (`"img"` met een beschrijvende `"alt"`) en in het raster in de `<noscript>` (in plaats van `[Foto]` in een `.foto-raam`, met dezelfde `alt`).
- Verzin nooit prijzen, reviews, cijfers of klantnamen. Onbekende info blijft een zichtbare plaatshouder tussen vierkante haken.
- Controleer na een wijziging de pagina op gsm-breedte (360–390px): geen horizontaal scrollen, tekst valt niet over de stam.
- Beweging valt weg bij `prefers-reduced-motion`; alles wat op hover reageert, reageert ook op focus (Tab).

## Nog in te vullen (plaatshouders)

- `[EMAIL]` in alle `mailto:`-links
- `[BTW-nummer]` in de voet
- `[Portret van Kim]` op de home
- `[Foto]`-werkjes in de stapels (home en dienstpagina's) en de drie ramen op de home
- `[solo of met muzikanten]` op optredens.html
- Nog met Kim te bevestigen: welke van de 6 dienstpagina's ze echt wil tonen (vooral Events & catering en Teksten op maat).

## Agents (in `.claude/agents/`)

- `kimbo-bouwer`: bouwt en wijzigt pagina's en stijl.
- `kimbo-teksten`: schrijft teksten in Kim haar stem.
- `kimbo-ontwerpcheck`: controleert huisstijl en gsm-weergave (wijzigt niets).
- `kimbo-toegankelijkheid-seo`: controleert toegankelijkheid en SEO (wijzigt niets).

Onafhankelijke taken mogen parallel lopen (bv. de twee controleurs samen). Laat de bouwer en de tekstschrijver niet tegelijk in hetzelfde bestand werken. Na een bouwtaak: laat de twee controleurs het resultaat nakijken en verwerk hun punten.

## Git

- Kleine, duidelijke commits in het Nederlands, bv. "Foto's toegevoegd aan schminkpagina".
- Remote: GitHub-repo `kimbo-creates-website` (nog aan te maken met `gh repo create`).
