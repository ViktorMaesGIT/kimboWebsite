/* Stapel werkjes – Kimbo Creates
 *
 * Kaartjes op een papieren tafel: gooien, laten uitglijden, omdraaien.
 * - modus "hero": op de home; bij het scrollen waaieren de werkjes losjes uit over de tafel
 *   (geen rijen). Netjes op een rij leggen gebeurt enkel met de knop.
 * - modus "galerij": fotogalerij op de dienstpagina's, met knoppen "Schudden" en "Netjes op een rij"
 *
 * Gebruik: <div class="stapel" data-modus="galerij"> met daarin
 *   <script type="application/json" class="stapel__data">{ "items": [...] }</script>
 * Een werkje: { "titel", "soort", "tekst", "img", "alt", "fit": "contain", "pos", "href" }
 * Op de home staan de kicker, de h1 en de intro als gewone HTML in <div class="stapel__statisch">;
 * dit script verhuist ze naar de tafel. Is de JSON ongeldig, dan verschijnt de inhoud van de <noscript>.
 * Geen externe bibliotheken nodig.
 */
(function () {
  'use strict';

  var CARD_H = 1.4, PHOTO_W = 0.88, PHOTO_H = 1.1;
  var PHOTO_CY = 0.06 + PHOTO_H / 2 - CARD_H / 2;
  var LIN_DRAG = 4.2, ANG_DRAG = 5, STAGGER = 0.045;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function kaal(s) { return String(s || '').replace(/[\[\]]/g, ''); }

  /* ------------------------------------------------------------------ fysica */
  function Desk(stage, els, cover, feature, hero) {
    this.stage = stage; this.cover = cover; this.feature = feature; this.hero = hero;
    this.w = 1; this.h = 1; this.cw = 180; this.gridScale = 1;
    this.sort = 0; this.zoom = 0; this.reduced = false; this.mode = 'pile';
    this.drag = null; this.topZ = 40; this.clock = 0;
    this.kopH = 0; /* hoogte van de navigatie die over de hero ligt (0 = ligt er niet over) */
    this.cards = els.map(function (el, i) {
      return { el: el, x: 0, y: 0, a: 0, vx: 0, vy: 0, va: 0, hx: 0.5, hy: 0.5, ha: 0, gx: 0, gy: 0, lx: 0, ly: 0, slot: i, jx: rnd(-0.28, 0.28), jy: rnd(-0.26, 0.26), ja: rnd(-0.42, 0.42), spawnAt: 0, inside: false, z: i + 1 };
    });
    this.loose = false; /* true: scrollen spreidt de kaartjes losjes uit i.p.v. in een raster */
    var slots = this.cards.map(function (_, i) { return i; }).sort(function () { return Math.random() - 0.5; });
    for (var k = 0; k < slots.length; k++) this.cards[slots[k]].slot = k;
    this.pickHomes();
  }
  Desk.prototype.isMobile = function () { return this.w < 700; };

  /* verspreid maar gelijkmatig: één verschoven vakje per kaartje */
  Desk.prototype.pickHomes = function () {
    var n = this.cards.length, mob = this.isMobile();
    var cols = n <= 6 ? (mob ? 2 : 3) : (mob ? 3 : 4);
    var rows = Math.ceil(n / cols), cards = this.cards;
    var order = cards.map(function (_, i) { return i; }).sort(function () { return Math.random() - 0.5; });
    order.forEach(function (ci, k) {
      var c = cards[ci];
      c.hx = ((k % cols) + 0.5 + rnd(-0.32, 0.32)) / cols;
      c.hy = (Math.floor(k / cols) + 0.5 + rnd(-0.3, 0.3)) / rows;
      c.ha = rnd(-0.38, 0.38);
    });
  };
  /* waar de stapel ligt (de hero laat de hoek met de titel vrij) */
  Desk.prototype.homePx = function (c) {
    var w = this.w, h = this.h;
    if (!this.hero) return { x: w * (0.12 + c.hx * 0.76), y: h * (0.2 + c.hy * 0.6) };
    if (this.isMobile()) return { x: 44 + (w - 44) * (0.14 + c.hx * 0.72), y: h * (0.4 + c.hy * 0.4) };
    return { x: w * (0.36 + c.hx * 0.57), y: h * (0.36 + c.hy * 0.46) }; /* onder de navigatie */
  };
  Desk.prototype.resize = function (w, h) {
    var ow = this.w, oh = this.h;
    this.w = w; this.h = h;
    if (this.isMobile()) this.cw = clamp(w * 0.3, 96, 150);
    else if (this.hero) this.cw = clamp(Math.min(w * 0.13, h * 0.22), 130, 230);
    else this.cw = clamp(Math.min(w * 0.15, h * 0.26), 130, 210);
    this.stage.style.setProperty('--cw', this.cw + 'px');
    this.cards.forEach(function (c) { c.x *= w / ow; c.y *= h / oh; });
    this.layoutGrid(); this.layoutCover();
  };
  Desk.prototype.layoutGrid = function () {
    var n = this.cards.length, w = this.w, h = this.h, mob = this.isMobile();
    var top = this.hero ? Math.max(mob ? 132 : 150, this.kopH + 88) : (mob ? 64 : 72); /* onder de navigatie en de rastertitel */
    var bottom = this.hero ? (mob ? 90 : 104) : (mob ? 96 : 104); /* boven de knoppenbalk */
    var side = mob ? (this.hero ? 52 : 16) : Math.max(this.hero ? 60 : 32, w * 0.06), gap = mob ? 10 : 18;
    var availW = w - side * 2, availH = h - top - bottom, best = { cols: 4, size: 0 };
    for (var cols = 2; cols <= 8; cols++) {
      var rows = Math.ceil(n / cols);
      var size = Math.min((availW - gap * (cols - 1)) / cols, (availH - gap * (rows - 1)) / rows / CARD_H);
      if (size > best.size) best = { cols: cols, size: size };
    }
    var C = best.cols, S = best.size, R = Math.ceil(n / C);
    var gridW = C * S + (C - 1) * gap, gridH = R * S * CARD_H + (R - 1) * gap;
    var x0 = (w - gridW) / 2 + S / 2, y0 = top + (availH - gridH) / 2 + (S * CARD_H) / 2;
    this.gridScale = S / this.cw;
    this.cards.forEach(function (c, i) {
      c.gx = x0 + (i % C) * (S + gap);
      c.gy = y0 + Math.floor(i / C) * (S * CARD_H + gap);
    });
    /* losse spreiding: over de hele tafel, scheef en verschoven, dus geen nette rijen */
    var lc = mob ? 3 : Math.min(5, Math.max(3, Math.ceil(n / 2))), lr = Math.ceil(n / lc);
    var lx0 = mob ? 56 : Math.max(90, w * 0.07), lx1 = w - (mob ? 20 : Math.max(50, w * 0.04));
    var ly0 = this.hero ? (mob ? 150 : 190) : 90, ly1 = h - (mob ? 70 : 90);
    var cellW = (lx1 - lx0) / lc, cellH = (ly1 - ly0) / lr;
    this.cards.forEach(function (c) {
      var col = c.slot % lc, row = Math.floor(c.slot / lc), shift = row % 2 ? 0.22 : -0.12;
      c.lx = clamp(lx0 + cellW * (col + 0.5 + shift + c.jx), lx0, lx1);
      c.ly = ly0 + cellH * (row + 0.5 + c.jy);
    });
  };
  Desk.prototype.coverScale = function () {
    var pw = PHOTO_W * this.cw * this.gridScale, ph = PHOTO_H * this.cw * this.gridScale;
    return Math.max(this.w / pw, this.h / ph) * 1.002;
  };
  Desk.prototype.layoutCover = function () {
    if (!this.cover) return;
    var s = this.coverScale();
    var pw = PHOTO_W * this.cw * this.gridScale * s, ph = PHOTO_H * this.cw * this.gridScale * s;
    var st = this.cover.style;
    st.width = pw + 'px'; st.height = ph + 'px';
    st.left = (this.w - pw) / 2 + 'px'; st.top = (this.h - ph) / 2 + 'px';
  };
  /* gooi alle kaartjes van onder de rand op tafel */
  Desk.prototype.deal = function () {
    var self = this;
    this.clock = 0;
    this.cards.forEach(function (c, i) {
      var home = self.homePx(c);
      if (self.reduced) { c.x = home.x; c.y = home.y; c.a = c.ha; c.vx = c.vy = c.va = 0; c.inside = true; c.spawnAt = 0; return; }
      c.x = home.x + rnd(-0.2, 0.2) * self.w; c.y = self.h + self.cw * CARD_H;
      c.inside = false; c.spawnAt = 0.15 + i * 0.075;
      self.launch(c, home.x, home.y, c.ha);
    });
  };
  Desk.prototype.shuffle = function () {
    var self = this;
    this.drag = null; this.pickHomes();
    this.cards.forEach(function (c, i) {
      var home = self.homePx(c);
      if (self.reduced) { c.x = home.x; c.y = home.y; c.a = c.ha; c.vx = c.vy = c.va = 0; return; }
      c.spawnAt = self.clock + i * 0.03;
      self.launch(c, home.x, home.y, c.ha + rnd(-0.6, 0.6));
    });
  };
  /* snelheid waarmee de wrijving het kaartje precies op (tx, ty, ta) laat stilvallen */
  Desk.prototype.launch = function (c, tx, ty, ta) {
    c.vx = (tx - c.x) * LIN_DRAG; c.vy = (ty - c.y) * LIN_DRAG;
    var spin = rnd(-1.4, 1.4); c.a = ta - spin; c.va = spin * ANG_DRAG;
  };
  Desk.prototype.interactive = function () { return this.sort < 0.002; };
  Desk.prototype.cardAt = function (el) {
    var node = el && el.closest ? el.closest('[data-card]') : null;
    if (!node) return null;
    for (var i = 0; i < this.cards.length; i++) if (this.cards[i].el === node) return this.cards[i];
    return null;
  };
  Desk.prototype.grab = function (el, id, px, py) {
    if (!this.interactive()) return false;
    var c = this.cardAt(el);
    if (!c) return false;
    var dx = px - c.x, dy = py - c.y, cos = Math.cos(-c.a), sin = Math.sin(-c.a);
    this.drag = { card: c, id: id, px: px, py: py, moved: 0, t: performance.now(), lx: dx * cos - dy * sin, ly: dx * sin + dy * cos, svx: 0, svy: 0, sva: 0 };
    c.vx = c.vy = c.va = 0; c.inside = true; c.spawnAt = 0; c.z = ++this.topZ;
    c.el.classList.add('is-held');
    return true;
  };
  Desk.prototype.move = function (id, px, py) {
    var d = this.drag;
    if (!d || d.id !== id) return;
    var c = d.card, now = performance.now(), dt = Math.max(1, now - d.t) / 1000;
    var mx = px - d.px, my = py - d.py;
    d.moved += Math.abs(mx) + Math.abs(my);
    /* een kaartje uit het midden trekken laat het rond het grijppunt draaien */
    var rx = d.px - c.x, ry = d.py - c.y, lever = this.cw * 0.9;
    var da = clamp(((rx * my - ry * mx) / (rx * rx + ry * ry + lever * lever)) * 0.9, -0.25, 0.25);
    var ox = c.x, oy = c.y;
    c.a += da;
    var cos = Math.cos(c.a), sin = Math.sin(c.a);
    c.x = px - (d.lx * cos - d.ly * sin); c.y = py - (d.lx * sin + d.ly * cos);
    var k = 1 - Math.exp(-dt * 18);
    d.svx += ((c.x - ox) / dt - d.svx) * k; d.svy += ((c.y - oy) / dt - d.svy) * k; d.sva += (da / dt - d.sva) * k;
    d.px = px; d.py = py; d.t = now;
  };
  /* geeft true terug als het een tik was (dan draait het kaartje om) */
  Desk.prototype.release = function (id) {
    var d = this.drag;
    if (!d || d.id !== id) return false;
    var c = d.card;
    c.el.classList.remove('is-held');
    this.drag = null;
    var idle = performance.now() - d.t > 90; /* even stilhouden voor het loslaten = niet gooien */
    if (!this.reduced && !idle) {
      var max = 4200, sp = Math.hypot(d.svx, d.svy), f = sp > max ? max / sp : 1;
      c.vx = d.svx * f; c.vy = d.svy * f; c.va = clamp(d.sva, -14, 14);
    }
    return d.moved < 7;
  };
  Desk.prototype.cancel = function () {
    if (this.drag) this.drag.card.el.classList.remove('is-held');
    this.drag = null;
  };
  Desk.prototype.setStory = function (sort, zoom) {
    this.sort = sort; this.zoom = zoom;
    if (!this.interactive()) this.cancel();
    var mode = zoom > 0.02 ? 'zoom' : sort > 0.002 ? 'index' : 'pile';
    if (mode !== this.mode) { this.mode = mode; this.stage.dataset.mode = mode; }
  };
  Desk.prototype.step = function (dt) {
    dt = Math.min(dt, 1 / 30);
    this.clock += dt;
    var w = this.w, h = this.h, m = this.cw * 0.32, topM = this.hero ? (this.isMobile() ? m + 20 : m + 180) : m + 10, leftM = this.hero ? m + 44 : m; /* niet onder de stam */
    for (var i = 0; i < this.cards.length; i++) {
      var c = this.cards[i];
      if ((this.drag && this.drag.card === c) || this.clock < c.spawnAt) continue;
      c.x += c.vx * dt; c.y += c.vy * dt; c.a += c.va * dt;
      var lin = Math.exp(-LIN_DRAG * dt);
      c.vx *= lin; c.vy *= lin; c.va *= Math.exp(-ANG_DRAG * dt);
      if (!c.inside) { if (c.y < h - m && c.x > m && c.x < w - m) c.inside = true; continue; }
      /* tafelranden: zacht terugkaatsen, een beetje overhangen mag */
      if (c.x < leftM) { c.x = leftM; c.vx = Math.abs(c.vx) * 0.45; c.va += c.vy * 0.002; }
      if (c.x > w - m) { c.x = w - m; c.vx = -Math.abs(c.vx) * 0.45; c.va -= c.vy * 0.002; }
      if (c.y < topM) { c.y = topM; c.vy = Math.abs(c.vy) * 0.45; c.va -= c.vx * 0.002; }
      if (c.y > h - m) { c.y = h - m; c.vy = -Math.abs(c.vy) * 0.45; c.va += c.vx * 0.002; }
    }
    this.render();
  };
  Desk.prototype.render = function () {
    var w = this.w, h = this.h, cw = this.cw, cards = this.cards, feature = this.feature, n = cards.length, self = this;
    var span = 1 - STAGGER * (n - 1);
    var hasF = feature >= 0 && feature < n;
    var ez = hasF ? ease(this.zoom) : 0, S1 = hasF ? this.coverScale() : 1, S = Math.pow(S1, ez);
    var tx = w / 2, ty = h / 2, fade = 1;
    if (hasF) {
      var f = cards[feature], fx = f.gx, fy = f.gy + PHOTO_CY * cw * this.gridScale;
      var pull = S1 > 1.0001 ? (1 - 1 / S) / (1 - 1 / S1) : 0;
      tx = w / 2 + (fx - w / 2) * pull; ty = h / 2 + (fy - h / 2) * pull;
      fade = 1 - clamp((ez - 0.15) / 0.4, 0, 1);
    }
    cards.forEach(function (c, i) {
      var t = ease(clamp((self.sort - i * STAGGER) / span, 0, 1));
      var a0 = Math.atan2(Math.sin(c.a), Math.cos(c.a)); /* kortste weg terug naar recht */
      var gx = self.loose ? c.lx : c.gx, gy = self.loose ? c.ly : c.gy, ga = self.loose ? c.ja : 0, gs = self.loose ? (self.isMobile() ? 1 : 1.06) : self.gridScale;
      var x = c.x + (gx - c.x) * t, y = c.y + (gy - c.y) * t, a = a0 + (ga - a0) * t;
      var s = 1 + (gs - 1) * t;
      s *= 1 + Math.sin(Math.PI * t) * 0.12; /* even opgetild onderweg */
      x = w / 2 + (x - tx) * S; y = h / 2 + (y - ty) * S; s *= S;
      var st = c.el.style;
      st.transform = 'translate3d(' + (x - cw / 2).toFixed(1) + 'px, ' + (y - (cw * CARD_H) / 2).toFixed(1) + 'px, 0) rotate(' + a.toFixed(4) + 'rad) scale(' + s.toFixed(4) + ')';
      st.zIndex = String(i === feature && self.zoom > 0 ? 999 : t > 0 && t < 1 ? 500 + i : c.z);
      st.opacity = i === feature ? '1' : fade.toFixed(3);
      st.visibility = self.clock < c.spawnAt && !c.inside ? 'hidden' : 'visible';
    });
    if (this.cover) this.cover.style.opacity = clamp((this.zoom - 0.86) / 0.1, 0, 1).toFixed(3);
  };

  /* -------------------------------------------------------------- opbouw */
  var TAPES = ['rgba(159, 179, 194, 0.85)', 'rgba(194, 155, 234, 0.8)', 'rgba(242, 201, 92, 0.85)'];
  var BGS = ['#E4D8C4', '#D9E0CF', '#E6D4E8', '#F2E3C2', '#DCE6EA'];
  var TAPE_KINDS = ['boven', 'hoeken', 'zij'];

  function cardHtml(it, i, n, feature) {
    var no = pad(i + 1), kind = TAPE_KINDS[i % 3], naam = kaal(it.titel);
    var foto = it.img
      ? '<img src="' + esc(it.img) + '" alt="' + esc(it.alt || 'Werkje van Kim: ' + naam) + '" draggable="false"' + (it.pos ? ' style="object-position: ' + esc(it.pos) + '"' : '') + '>'
      : '[Foto]';
    var tekst = it.tekst ? '<p class="werkje__tekst">' + esc(it.tekst) + '</p>' : '';
    var link = it.href ? '<a class="werkje__link" href="' + esc(it.href) + '" aria-label="' + esc('Bekijk de pagina ' + (it.soort || naam)) + '">Bekijk de pagina <span aria-hidden="true">→</span></a>' : '';
    return '<div class="werkje' + (i === feature ? ' is-feature' : '') + '" data-card role="listitem" style="--tape: ' + TAPES[i % TAPES.length] + '">' +
      /* toetsenbordknop eerst: zo komt hij in de leesvolgorde vóór de inhoud van het kaartje */
      '<button type="button" class="werkje__toets" aria-pressed="false" aria-label="' + esc('Draai werkje ' + no + ' om, ' + naam) + '"></button>' +
      '<div class="werkje__binnen">' +
        '<div class="werkje__kant werkje__voor">' +
          '<div class="werkje__foto' + (it.fit === 'contain' ? ' werkje__foto--contain' : '') + '" style="' + (it.img ? '' : 'background:' + BGS[i % BGS.length]) + '">' + foto + '</div>' +
          '<div class="werkje__label"><span class="werkje__no">No. ' + no + '</span><span class="werkje__naam">' + esc(it.titel) + '</span></div>' +
          '<i class="werkje__tape werkje__tape--' + kind + '" aria-hidden="true"></i>' +
        '</div>' +
        '<div class="werkje__kant werkje__achter" aria-hidden="true">' +
          '<span class="werkje__kicker">Werkje · ' + no + '/' + pad(n) + '</span>' +
          '<span class="werkje__titel">' + esc(it.titel) + '</span>' +
          '<span class="werkje__soort">' + esc(it.soort || '') + '</span>' + tekst + link +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* De kicker, de h1 en de intro staan als gewone HTML in .stapel (ook zonder JavaScript leesbaar);
     mount() verhuist ze naar .stapel__aside en de tafel. Hier komt enkel wat bij de stapel zelf hoort. */
  function heroHtml(cfg, n, touch) {
    return '' +
      '<div class="stapel__aside"><p class="stapel__uitleg">' +
        (touch ? 'Een paar werkjes uit mijn atelier. Sleep om ze rond te gooien, tik er één aan om de achterkant te lezen.'
               : 'Een paar werkjes uit mijn atelier. Gooi ze rond en klik er één aan om de achterkant te lezen, of gebruik Tab en Enter.') + '</p></div>' +
      '<div class="stapel__index" aria-hidden="true"><p class="stapel__index-kicker">Een greep uit mijn werk · ' + n + ' werkjes</p>' +
        '<p class="stapel__index-titel">Mijn creatieve avontuur, <em>netjes op een rij.</em></p></div>';
  }

  /* gaat er iets mis met de gegevens, toon dan wat in de <noscript> staat */
  function terugval(root) {
    var ns = root.querySelector('noscript');
    if (ns && ns.textContent) root.insertAdjacentHTML('beforeend', ns.textContent);
  }

  function mount(root) {
    var dataEl = root.querySelector('.stapel__data'), cfg;
    try { cfg = dataEl ? JSON.parse(dataEl.textContent) : { items: [] }; }
    catch (e) { cfg = { items: [] }; }
    var hero = root.dataset.modus === 'hero';
    cfg.feature = -1; /* geen inzoomen */
    var items = cfg.items || [], n = items.length;
    if (!n) { terugval(root); return; }
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch = window.matchMedia('(pointer: coarse)').matches;
    var statisch = hero ? root.querySelector('.stapel__statisch') : null;

    root.classList.add(hero ? 'stapel--hero' : 'stapel--galerij');
    root.insertAdjacentHTML('beforeend',
      '<section class="stapel__track" aria-label="' + (hero ? 'Kimbo Creates — een stapel werkjes van Kim' : 'Een stapel werkjes') + '">' +
        '<div class="stapel__stage" data-mode="pile">' +
          '<div class="stapel__licht" aria-hidden="true"></div>' +
          '<div class="stapel__desk" role="list" aria-label="Werkjes van Kim">' + items.map(function (it, i) { return cardHtml(it, i, n, cfg.feature); }).join('') + '</div>' +
          (hero ? heroHtml(cfg, n, touch) : '<p class="stapel__hint">' + (touch ? 'Sleep ze rond, tik er één aan om hem om te draaien.' : 'Gooi ze rond, klik er één aan om hem om te draaien, of gebruik Tab en Enter.') + '</p>') +
          '<div class="stapel__dock"><div class="stapel__dock-in">' +
            (hero ? '<span class="stapel__teller">Bekeken <b data-teller>00</b>/' + pad(n) + '</span>' : '') +
            '<button type="button" data-actie="schudden" disabled>Schudden</button>' +
            '<button type="button" class="stapel__sorteer" data-actie="sorteer" disabled>' + 'Netjes op een rij' + '</button>' +
          '</div></div>' +
          '<div class="stapel__laden" role="status">Werkjes ophangen 00/' + pad(n) + '</div>' +
        '</div>' +
      '</section>');

    var track = root.querySelector('.stapel__track'), stage = root.querySelector('.stapel__stage');
    var loader = root.querySelector('.stapel__laden');
    var cardEls = Array.prototype.slice.call(stage.querySelectorAll('[data-card]'));
    /* de vaste kicker, h1 en intro uit de HTML verhuizen naar de tafel, vóór de kaartjes in de leesvolgorde */
    if (hero) {
      var desk0 = stage.querySelector('.stapel__desk'), aside0 = stage.querySelector('.stapel__aside');
      stage.insertBefore(aside0, desk0);
      if (statisch) {
        var kop0 = statisch.querySelector('h1');
        Array.prototype.slice.call(statisch.querySelectorAll('.kicker, .intro')).forEach(function (x) { aside0.insertBefore(x, aside0.querySelector('.stapel__uitleg')); });
        if (kop0) { kop0.classList.add('stapel__kop'); stage.insertBefore(kop0, aside0); }
        statisch.remove();
      }
    }
    var el = {
      kop: root.querySelector('.stapel__kop'), aside: root.querySelector('.stapel__aside'), dock: root.querySelector('.stapel__dock'),
      index: root.querySelector('.stapel__index'), kopnav: document.querySelector('.pagina--home .kop'),
      teller: root.querySelector('[data-teller]')
    };
    var read = {}, engine = null, prog = 0, sortCur = 0, sortTarget = 0;

    function flip(i) {
      if (i < 0) return;
      var card = cardEls[i], on = !card.classList.contains('is-flipped');
      card.classList.toggle('is-flipped', on);
      card.querySelector('.werkje__achter').setAttribute('aria-hidden', on ? 'false' : 'true');
      card.querySelector('.werkje__toets').setAttribute('aria-pressed', on ? 'true' : 'false');
      read[i] = true;
      if (el.teller) el.teller.textContent = pad(Object.keys(read).length);
    }
    cardEls.forEach(function (card, i) {
      /* muis en vinger draaien om via de tafel (pointerup) en raken deze knop van 1 px niet */
      card.querySelector('.werkje__toets').addEventListener('click', function () { flip(i); });
      card.addEventListener('focusin', function () { if (engine) engine.cards[i].z = ++engine.topZ; });
    });

    /* ------------------------------------------------ eerst alle foto's laden */
    var done = 0;
    function settle() {
      done++;
      loader.textContent = 'Werkjes ophangen ' + pad(done) + '/' + pad(n);
      if (done >= n) start();
    }
    items.forEach(function (it, i) {
      if (!it.img) { settle(); return; }
      var img = new Image();
      img.onload = settle;
      img.onerror = function () { /* kapotte foto: het kaartje blijft, zonder foto */
        var box = cardEls[i].querySelector('.werkje__foto'); box.textContent = '[Foto]';
        settle();
      };
      img.src = it.img;
    });

    function scrollStory(dt) {
      var r = track.getBoundingClientRect(), total = Math.max(1, r.height - stage.clientHeight);
      var p = clamp(-r.top / total, 0, 1);
      if (reduced) p = p > 0.75 ? 1 : p > 0.25 ? 0.5 : 0;
      else p = prog + (p - prog) * (1 - Math.exp(-dt * 7));
      prog = p;
      engine.setStory(smooth(0.06, 0.78, p), 0);
      applyOverlay(p);
    }
    function applyOverlay(p) {
      var o1 = 1 - smooth(0.04, 0.11, p);
      [el.kop, el.aside, el.dock].forEach(function (x) {
        if (!x) return;
        x.style.opacity = o1.toFixed(3);
        x.style.transform = 'translateY(' + (-20 * (1 - o1)).toFixed(1) + 'px)';
      });
      if (el.dock) { el.dock.style.pointerEvents = o1 > 0.5 ? 'auto' : 'none'; el.dock.style.visibility = o1 > 0.01 ? 'visible' : 'hidden'; }
      el.index.style.opacity = '0'; /* "netjes op een rij" hoort enkel bij de knop */
      toonIndex(false);
    }
    /* de titel "netjes op een rij" is er alleen voor hulpsoftware wanneer hij zichtbaar is */
    var indexAan = false;
    function toonIndex(aan) {
      if (aan === indexAan) return;
      indexAan = aan;
      el.index.setAttribute('aria-hidden', aan ? 'false' : 'true');
    }
    /* hero, na een klik op "Netjes op een rij": raster, los van het scrollen */
    function heroStory(dt) {
      if (reduced) sortCur = sortTarget;
      else { sortCur += (sortTarget - sortCur) * (1 - Math.exp(-dt * 3.2)); if (Math.abs(sortTarget - sortCur) < 0.001) sortCur = sortTarget; }
      engine.setStory(sortCur, 0);
      var o1 = 1 - smooth(0, 0.35, sortCur), oi = smooth(0.6, 1, sortCur);
      [el.kop, el.aside].forEach(function (x) {
        if (!x) return;
        x.style.opacity = o1.toFixed(3);
        x.style.transform = 'translateY(' + (-20 * (1 - o1)).toFixed(1) + 'px)';
      });
      if (el.dock) { el.dock.style.opacity = '1'; el.dock.style.transform = 'none'; el.dock.style.pointerEvents = 'auto'; el.dock.style.visibility = 'visible'; }
      el.index.style.opacity = oi.toFixed(3);
      toonIndex(oi > 0.5);
      el.index.style.transform = 'translateY(' + (16 * (1 - oi)).toFixed(1) + 'px)';
    }
    function galleryStory(dt) {
      if (reduced) sortCur = sortTarget;
      else { sortCur += (sortTarget - sortCur) * (1 - Math.exp(-dt * 3.2)); if (Math.abs(sortTarget - sortCur) < 0.001) sortCur = sortTarget; }
      engine.setStory(sortCur, 0);
    }
    function scrollToProgress(p, then) {
      var r = track.getBoundingClientRect();
      var top = window.scrollY + r.top, total = Math.max(1, r.height - stage.clientHeight);
      window.scrollTo({ top: top + total * p, behavior: reduced ? 'auto' : 'smooth' });
      if (then) setTimeout(then, reduced ? 0 : 1100);
    }

    function intro() {
      if (reduced || !hero || !document.body.animate) return;
      var e = 'cubic-bezier(0.16, 1, 0.3, 1)';
      Array.prototype.slice.call(el.kopnav ? el.kopnav.querySelectorAll('.kop-rij, .dienstenmenu') : []).forEach(function (x, i) {
        x.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: 200 + i * 80, easing: e, fill: 'backwards' });
      });
      Array.prototype.slice.call(root.querySelectorAll('.stapel__kop .li')).forEach(function (x, i) {
        x.animate([{ transform: 'translateY(110%)' }, { transform: 'none' }], { duration: 1600, delay: 350 + i * 90, easing: e, fill: 'backwards' });
      });
      [el.aside, el.dock].forEach(function (x, i) {
        Array.prototype.slice.call(x ? x.children : []).forEach(function (kind) {
          kind.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 1200, delay: 1000 + i * 100, easing: e, fill: 'backwards' });
        });
      });
    }

    /* ------------------------------------------------------- de motor starten */
    function start() {
      loader.remove();
      root.querySelectorAll('[data-actie="schudden"], [data-actie="sorteer"]').forEach(function (b) { b.disabled = false; });
      engine = new Desk(stage, cardEls, null, cfg.feature, hero);
      engine.reduced = reduced;
      /* home: ligt de navigatie over de tafel, dan beginnen de rastertitel en het raster eronder */
      function maat() {
        if (hero) {
          engine.kopH = el.kopnav && getComputedStyle(el.kopnav).position === 'absolute' ? el.kopnav.offsetHeight : 0;
          stage.style.setProperty('--kop-h', engine.kopH + 'px');
        }
        engine.resize(stage.clientWidth, stage.clientHeight);
      }
      maat();
      engine.setStory(0, 0);
      engine.deal();
      engine.render();
      intro();

      var inView = true, last = performance.now();
      new IntersectionObserver(function (es) { inView = es[es.length - 1].isIntersecting; }).observe(track);
      new ResizeObserver(maat).observe(stage);
      if (hero && el.kopnav) new ResizeObserver(maat).observe(el.kopnav);
      (function loop(t) {
        var dt = Math.min(0.05, ((t || performance.now()) - last) / 1000); last = t || performance.now();
        if (inView && !document.hidden) {
          if (!hero) galleryStory(dt);
          else if (sortTarget > 0 || sortCur > 0) { engine.loose = false; heroStory(dt); }
          else { engine.loose = true; scrollStory(dt); }
          engine.step(dt);
        }
        requestAnimationFrame(loop);
      })();

      /* gooien en tikken */
      var down = null;
      function local(e) { var r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      stage.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return;
        if (e.target.closest('a, button')) { down = null; return; }
        var p = local(e);
        down = { card: engine.cardAt(e.target), x: e.clientX, y: e.clientY };
        if (engine.grab(e.target, e.pointerId, p.x, p.y)) { stage.setPointerCapture(e.pointerId); e.preventDefault(); }
      });
      stage.addEventListener('pointermove', function (e) { var p = local(e); engine.move(e.pointerId, p.x, p.y); });
      stage.addEventListener('pointerup', function (e) {
        var target = document.elementFromPoint(e.clientX, e.clientY);
        var tap = engine.release(e.pointerId), card = engine.cardAt(target);
        if (tap && card) flip(engine.cards.indexOf(card));
        else if (!tap && down && down.card && card === down.card && engine.mode === 'index' &&
                 Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) < 7) flip(engine.cards.indexOf(card));
        down = null;
      });
      stage.addEventListener('pointercancel', function () { engine.cancel(); down = null; });

      /* knoppen */
      root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-actie]');
        if (!b) return;
        var actie = b.dataset.actie;
        if (actie === 'schudden') {
          if (sortTarget > 0) { sortTarget = 0; root.querySelector('[data-actie="sorteer"]').textContent = 'Netjes op een rij'; }
          engine.shuffle();
        } else if (actie === 'sorteer') {
          sortTarget = sortTarget > 0 ? 0 : 1;
          b.textContent = sortTarget > 0 ? 'Weer op een stapel' : 'Netjes op een rij';
        }
      });
    }
  }

  function init() {
    Array.prototype.slice.call(document.querySelectorAll('.stapel[data-modus]')).forEach(mount);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
