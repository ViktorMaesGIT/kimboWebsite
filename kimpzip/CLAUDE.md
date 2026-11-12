# Kimbo Creates – website

Website voor Kim (Kimbo Creates, @kimbo_creates): raam- en muurschilderingen, schmink, optredens, kostuums, events en teksten. Gebouwd door Viktor. Taal van de site: Nederlands (Vlaams).

Lees bij elke taak eerst de skill `.claude/skills/kimbo-creates-website/SKILL.md`. Daarin staan de stijl, de bouwstenen, de toon en de inhoudsregels.

## Techniek

- Gewone HTML + CSS, geen framework, geen build-stap, geen JavaScript nodig.
- Bekijken: open `index.html` in de browser, of gebruik de VS Code-extensie *Live Server*.
- Alle kleuren en maten staan als variabelen bovenaan `css/style.css`. Pas ze daar aan, niet in de HTML.

## Structuur

```
index.html              home
ramen-en-muren.html     dienstpagina's (zelfde opbouw)
schmink.html
optredens.html
kostuums.html
events.html
teksten.html
css/style.css           alle stijl
assets/img/             foto's van Kim (jpg/webp, max ~1600px breed)
assets/deco/            getekende SVG's: stam, takken, bijtjes, weide, bijenkorf
```

## Regels

- Kop/menu en contactblok + voet zijn op elke pagina identiek. Pas je er één aan, pas ze dan op alle 7 pagina's aan.
- Het actieve menu-item krijgt `aria-current="page"`.
- Nieuwe foto: in `assets/img/`, verkleinen en comprimeren, met een beschrijvende `alt` en `loading="lazy"`. Vervang daarmee een `[Foto]`-plaatshouder in een `.foto-raam`.
- Verzin nooit prijzen, reviews, cijfers of klantnamen. Onbekende info blijft een zichtbare plaatshouder tussen vierkante haken.
- Controleer na een wijziging de pagina op gsm-breedte (360–390px): geen horizontaal scrollen, tekst valt niet over de stam.

## Nog in te vullen (plaatshouders)

- `[EMAIL]` in alle `mailto:`-links
- `[BTW-nummer]` in de voet
- `[Portret van Kim]` op de home
- `[Foto]`-kaders op de dienstpagina's en de home
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
