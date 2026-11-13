---
name: kimbo-creates-website
description: Use when building or editing the Kimbo Creates website (Kim's creative business, @kimbo_creates): its style, building blocks, pages and tone of voice.
---

# Kimbo Creates website

Website for Kim, "een creatieve madam" from Flanders who brings windows, walls and ideas to life with hand-painted work. The site is in Dutch (Flemish), built by Viktor.

## Tech

- Plain HTML + CSS + a little hand-written JavaScript, no build step, no framework, no external libraries. One `.html` file per page.
- Folder layout:
  - `index.html` (home), `ramen-en-muren.html`, `schmink.html`, `optredens.html`, `kostuums.html`, `events.html`, `teksten.html`
  - `css/fonts.css` (local `@font-face`), `css/style.css` (all shared style, variables in `:root`), `css/stapel.css` (the pile of works). Load them in that order on every page.
  - `assets/js/stapel.js` (every page, `defer`, just before `</body>`), `assets/js/vloei.js` (home only, after `stapel.js`)
  - `assets/fonts/` (woff2), `assets/img/` (Kim's photos), `assets/deco/` (SVG decorations: branches, bee, meadow, trunk, beehive)
- The home is a one-page of four screens; the six services stay separate pages.
- The header/menu and the contact band + footer are identical on every page: when you change one, change it on all pages. Only on the home do the logo and Home link to `#top` and Over mij to `#over`, and the contact band sits inside `.slotblok` within `<main>`.
- Mobile first: works at 360px wide, 16px side padding, no horizontal scroll, menus wrap.
- Real `<a>`, `<button>`, `<nav>`, alt text on every photo, touch targets at least 44px (`--raak`), text contrast at least 4.5:1.
- Everything that reacts to hover also reacts to focus (Tab). All motion is dropped under `prefers-reduced-motion`.
- The site must stay readable without JavaScript: whatever a script builds also exists in a `<noscript>`.

## Look: "Raamkader met bloesem"

The whole page feels like looking through one of Kim's painted windows.

Colors (CSS custom properties in `:root` of `css/style.css`):
- `--papier: #F4EDE1` page background, `--papier-licht: #FFF8EE` alternate sections, `--kaart: #FFFDF8` cards
- `--inkt: #1F1B24` text, `--inkt-zacht: #4A4450` body text
- `--raam: #3D6682` window frames, contact band, primary nav button; `--raam-donker: #2F536B` window sill
- `--terracotta: #A8452A` main call-to-action button
- `--violet: #7A4FB0` kicker lines
- `--goud: #F2C95C` accents on the blue band
- Nature accents: stem `#C8742E`/`#E8892E`/`#F0A04B`, grass `#3FAE5A`, lavender `#A066D6`, buttercup `#F2C230`, butterfly `#E8722C`

Fonts (hosted locally in `assets/fonts/`, declared in `css/fonts.css`; never Google Fonts or any other external source):
- `Instrument Serif` 400, regular + italic, never bold (`--font-serif`): logo, titles, captions. Italic is the accent.
- `Inter` 400/500/600 (`--font-tekst`): body text.
- `IBM Plex Mono` 500, uppercase with letter-spacing (`--font-mono`): menu, buttons, kickers, labels.
- Deliberate exception: the six service pills in `.dienstenmenu` are set in Inter 500, not in the mono font.
- No font preloads: with `crossorigin` they throw CORS errors in the console when a page is opened straight from disk (`file://`). `font-display: swap` in `css/fonts.css` covers the loading.
- There is no handwriting font any more; the class name `.titel-hand` is kept but now uses Instrument Serif.

## Building blocks (CSS classes)

- Menu (`.kop`, `.hoofdmenu`, `.dienstenmenu`): logo `<a class="logo">Kimbo <span>creates</span></a>`; links Home, Over mij, and button "Stuur me een berichtje" (blue). Second row "wat ik doe:" with pill links to the six pages; the current page has `aria-current="page"`. Hover/focus animations: the logo tilts and "creates" turns italic, a wavy line draws under Home / Over mij, the contact button lifts with a gold edge and an arrow, each service pill lifts, tilts and gets its own soft colour (`nth-of-type`).
- Home header: `.pagina--home .kop` lies on top of the pile from 701px wide; `.kop-tak` (`assets/deco/tak-logo.svg`) is the big blossom branch growing from the trunk with the logo sitting on it (hidden on mobile).
- Trunk (`.stam`, `assets/deco/stam.svg`): orange hand-drawn stem running down the full left edge of every page. Content keeps `--links: 52px` padding so it never overlaps text.
- Branches (`.deco--tak`): section titles get a branch growing from the trunk, each with a different flower: pink blossom (`tak-roze.svg`, Wat ik graag maak), purple hanging clusters like wisteria (`tak-paars.svg`, Mijn creatieve avontuur), small yellow flowers with a hanging beehive (`tak-geel-korf.svg`, Hoi, ik ben Kim), white blossom for service pages (`tak-dienst.svg`).
- Bees: hand-drawn bee (thick black outline, yellow stripes, white tail, veined wings) with a dotted flight line, drawn inside the branch and meadow SVGs. A few per page, never over text.
- Meadow (`.weide-strook`): grass strip with lavender, buttercups, pink wildflowers and an orange butterfly just above the contact band.
- Arch frames (`.foto-raam`, `.kaart`, `.verwachten`): photos and cards sit in window shapes with a `--raam` border and rounded top.
- Pile of works, "stapel werkjes" (`css/stapel.css` + `assets/js/stapel.js`): cards on a paper table that you can throw around and flip.
  - Markup: `<div class="stapel" data-modus="hero | galerij">` containing `<script type="application/json" class="stapel__data">{"items": [...]}</script>` and a `<noscript>` fallback. On service pages it is wrapped in `<div class="stapel-kader">`.
  - A work is `{ titel, soort, tekst, img, alt, fit, pos, href }`. Only `titel` and `soort` are required. Without `img` the card shows `[Foto]`. Every `img` gets an `alt` that describes what is on the photo (same text as in the `<noscript>`); without it the card falls back to "Werkje van Kim: titel". `"fit": "contain"` is for cut-out images (the sloth), `pos` is an `object-position`, `href` adds a link on the back.
  - Mode `hero` (home, first screen): scrolling fans the cards out loosely over the table, no rows, no zooming in. A grid only appears through the button "Netjes op een rij". The kicker, the `<h1>` and the intro are plain HTML in `<div class="wrap stapel__statisch">` inside `.stapel`; `stapel.js` moves them onto the table (the intro shows in the left column on screens from 701px wide and taller than 860px, otherwise it stays available to screen readers only). Edit that text in `index.html`, never in the script. The `<noscript>` holds the real photos with captions.
  - Mode `galerij` (service pages, "Een greep uit mijn werk"): buttons "Schudden" and "Netjes op een rij". The old arch-frame grid stays in the `<noscript>` (`.foto-raam--contain` for cut-out images); if the JSON is invalid the script shows that grid instead.
  - Keyboard: each card has a button (`.werkje__toets`) that flips it with Enter; the card with focus comes to the top.
- Scroll flow, "scrollvloei" (`assets/js/vloei.js`, home only): `data-vloei="kop | kaart | tak | foto"` makes an element come in as you scroll (titles slide up, cards fly in tilted, branches from the left, the sloth from the right); optional `data-vloei-d="30"` delays it by that many px of scrolling. Because the flow owns `transform`, hover effects on those elements use `translate` instead.
- Windows, "ramen" (`.rm` in Mijn creatieve avontuur): a `<button type="button" class="rm" aria-expanded="false">` holding one of three windows: `rm-boog` (blue arch, two casements), `rm-luik` (square, green shutters), `rm-rond` (round, purple). They open on hover (mouse only), Tab focus and tap/click/Enter (`.is-open` and `aria-expanded`, kept in sync by `vloei.js`). No `aria-label`: the button's name comes from its content, `<span class="visueel-verborgen">Open het raam: </span>` followed by what is behind the glass in `.rm-zicht`. A real photo goes in `.rm-zicht` as an `<img>` with a descriptive `alt` (it replaces the placeholder text and becomes part of the button's name).
- Home layout (`.pagina--home`): 1. pile, 2. Wat ik graag maak (six cards), 3. Mijn creatieve avontuur (three windows), 4. `.slotblok` = Hoi, ik ben Kim + meadow + contact band + footer on one screen. Nothing comes below it.
- Service page template: kicker + title + intro + buttons on the left, `.verwachten` arch card "Wat kan je verwachten?" with three points on the right, then "Een greep uit mijn werk" as a pile in `galerij` mode, meadow, blue contact band "Zin in iets moois?".
- Kim's real paintings (e.g. the sloth on a branch, `assets/img/luiaard.webp`) can be cut out of their wall background and placed on the page as decoration.

## Pages (plain names for her registered activities)

| Page | File | Registered activity |
|---|---|---|
| Ramen & muren | ramen-en-muren.html | supporting activities for creative arts |
| Schmink & facepaint | schmink.html | applying make-up |
| Optredens & animatie | optredens.html | other entertainment, performing arts |
| Kostuums & kleding | kostuums.html | making clothing + renting costumes |
| Events & catering | events.html | organising events and fairs + event catering |
| Teksten op maat | teksten.html | literary creation |

Windows and walls are her main thing; lead with them. Confirm with Viktor before adding or removing a page.

## Tone of voice

- Kim speaks for herself: "ik" and "jij/je", warm, playful, Flemish ("een creatieve madam", "nét dat beetje extra", "Stuur me gerust een berichtje!").
- Reuse her own sentences where possible, e.g. "Achter Kimbo Creates zit gewoon een creatieve madam met een hoofd vol ideeën en een grote liefde voor verf, kleuren en tekenen." and "Van speelse tekeningen op winkelramen tot unieke muurschilderingen: ik vind het heerlijk om iets te creëren dat een plek nét dat beetje extra geeft." Sign-off: "Liefs, Kim".
- No emoji in the page; the drawings carry the playfulness.

## Content rules

- Never invent prices, reviews, testimonials, numbers or client names. Unknown facts become visible placeholders in square brackets: `[EMAIL]`, `[BTW-nummer]`, `[Foto: bruidsraam]`.
- Only use photos that are Kim's own work.
- Don't draw or reuse protected characters (e.g. Pokémon, Stitch, Winnie the Pooh) in the site's own decorations, even if they appear in her portfolio.
- Instagram: https://www.instagram.com/kimbo_creates/
