---
name: kimbo-creates-website
description: Use when building or editing the Kimbo Creates website (Kim's creative business, @kimbo_creates): its style, building blocks, pages and tone of voice.
---

# Kimbo Creates website

Website for Kim, "een creatieve madam" from Flanders who brings windows, walls and ideas to life with hand-painted work. The site is in Dutch (Flemish), built by Viktor.

## Tech

- Plain HTML + CSS, no build step, no framework. One `.html` file per page, one shared `css/style.css`.
- Folder layout:
  - `index.html` (home), `ramen-en-muren.html`, `schmink.html`, `optredens.html`, `kostuums.html`, `events.html`, `teksten.html`
  - `css/style.css`
  - `assets/img/` (Kim's photos), `assets/deco/` (SVG decorations: branches, bee, meadow, trunk, beehive)
- The header/menu and footer are identical on every page: when you change one, change it on all pages.
- Mobile first: works at 360px wide, 16px side padding, no horizontal scroll, menus wrap.
- Real `<a>`, `<button>`, `<nav>`, alt text on every photo, touch targets at least 44px, text contrast at least 4.5:1.

## Look: "Raamkader met bloesem"

The whole page feels like looking through one of Kim's painted windows.

Colors (CSS custom properties in `:root` of `css/style.css`):
- `--papier: #F4EDE1` page background, `--papier-licht: #FFF8EE` alternate sections, `--kaart: #FFFDF8` cards
- `--inkt: #1F1B24` text, `--inkt-zacht: #4A4450` body text
- `--raam: #3D6682` window frames, contact band, primary nav button; `--raam-donker: #2F536B` window sill
- `--terracotta: #A8452A` main call-to-action button
- `--violet: #7A4FB0` handwritten kicker lines
- `--goud: #F2C95C` handwritten accents on the blue band
- Nature accents: stem `#C8742E`/`#E8892E`/`#F0A04B`, grass `#3FAE5A`, lavender `#A066D6`, buttercup `#F2C230`, butterfly `#E8722C`

Fonts (Google Fonts):
- `Caveat` (600/700) for logo, section titles, kickers, captions. Handwritten feel.
- `Karla` (400/500/700) for body text, h1, buttons.

## Building blocks (CSS classes)

- Menu (`.kop`, `.hoofdmenu`, `.dienstenmenu`): logo "Kimbo creates" in Caveat; links Home, Over mij, and button "Stuur me een berichtje" (blue). Second row "wat ik doe:" with pill links to the six pages; the current page has `aria-current="page"`.
- Trunk (`.stam`, `assets/deco/stam.svg`): orange hand-drawn stem running down the full left edge of every page. Content keeps `--links: 52px` padding so it never overlaps text.
- Branches (`.deco--tak`): each section title gets a branch growing from the trunk, each with a different flower: white blossom (top of page, `tak-bloesem.svg`), pink blossom (`tak-roze.svg`, Wat ik graag maak), purple hanging clusters like wisteria (`tak-paars.svg`, Mijn creatieve avontuur), small yellow flowers with a hanging beehive (`tak-geel-korf.svg`, Over mij), white blossom for service pages (`tak-dienst.svg`).
- Bees: hand-drawn bee (thick black outline, yellow stripes, white tail, veined wings) with a dotted flight line, drawn inside the branch and meadow SVGs. A few per page, never over text.
- Meadow (`.deco--weide`, `.weide-strook`): grass strip with lavender, buttercups, pink wildflowers and an orange butterfly at the bottom of the hero and just above the contact band.
- Arch frames (`.raam`, `.foto-raam`, `.kaart`): photos and cards sit in window shapes with a `--raam` border and rounded top.
- Service page template: kicker + title + intro + buttons on the left, `.verwachten` arch card "Wat kan je verwachten?" with three points on the right, then "Een greep uit mijn werk" grid of six arch-framed photos, meadow, blue contact band "Zin in iets moois?".
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
