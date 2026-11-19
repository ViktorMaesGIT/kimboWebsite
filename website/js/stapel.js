/* Stapel: een stapel foto-kaartjes die je kan rondgooien, omdraaien en netjes
   op een rij leggen. Gebruik:
     KcStapel(document.getElementById('stapel'), items, { hoogte: 640 });
   items: [{ titel, plaats, soort, tekst, kicker, img, alt, fit }] */
(function () {
  var CARD_H = 1.4, LIN_DRAG = 4.2, ANG_DRAG = 5, STAGGER = 0.045;
  var TAPES = ['rgba(159, 179, 194, 0.85)', 'rgba(194, 155, 234, 0.8)', 'rgba(242, 201, 92, 0.85)'];
  var KRIJT = "'Kimbo Krijt', Inter, sans-serif";

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function kaartHTML(it, i, n) {
    var tape = TAPES[i % 3], kind = ['top', 'corners', 'side'][i % 3];
    var tapeHTML = kind === 'top'
      ? '<span style="position:absolute;left:50%;top:0;width:calc(var(--cw)*0.36);height:calc(var(--cw)*0.1);background:' + tape + ';transform:translate(-50%,-45%) rotate(-3deg);box-shadow:0 1px 2px rgba(40,32,12,.15)"></span>'
      : kind === 'corners'
        ? '<span style="position:absolute;left:-6%;top:2%;width:calc(var(--cw)*0.26);height:calc(var(--cw)*0.1);background:' + tape + ';transform:rotate(-38deg)"></span><span style="position:absolute;right:-6%;bottom:20%;width:calc(var(--cw)*0.26);height:calc(var(--cw)*0.1);background:' + tape + ';transform:rotate(-38deg)"></span>'
        : '<span style="position:absolute;right:0;top:30%;width:calc(var(--cw)*0.36);height:calc(var(--cw)*0.1);background:' + tape + ';transform:translate(50%,-50%) rotate(84deg)"></span>';
    var vlak = 'position:absolute;inset:0;background:#FFFDF8;box-shadow:0 1px 1px rgba(40,32,12,.12),0 6px 18px -6px rgba(40,32,12,.35)';
    return '' +
      '<div class="kc-binnen" style="position:absolute;inset:0;transition:transform .7s cubic-bezier(.65,0,.35,1)">' +
        '<div class="kc-voor" style="' + vlak + '">' +
          '<div style="position:absolute;left:6%;top:calc(var(--cw)*0.06);width:88%;height:calc(var(--cw)*1.1);overflow:hidden;background:' + (it.fit === 'contain' ? '#FFF8EE' : '#E4D8C4') + '">' +
            '<img src="' + esc(it.img) + '" alt="' + esc(it.alt) + '" draggable="false" style="width:100%;height:100%;object-fit:' + (it.fit || 'cover') + ';display:block;pointer-events:none">' +
          '</div>' +
          '<div style="position:absolute;left:6%;right:6%;bottom:0;height:calc(var(--cw)*0.24);display:flex;flex-direction:column;justify-content:center;gap:.25em">' +
            '<span style="font-family:' + KRIJT + ';font-size:1.6em;line-height:1;letter-spacing:.1em;text-transform:uppercase;color:#6B6152;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(it.plaats) + '</span>' +
            '<span style="font-family:' + KRIJT + ';font-size:2.2em;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(it.titel) + '</span>' +
          '</div>' + tapeHTML +
        '</div>' +
        '<div class="kc-achter" aria-hidden="true" style="' + vlak + ';transform:scaleX(-1);box-sizing:border-box;padding:9% 8% 8%;display:flex;flex-direction:column;gap:.45em;overflow:hidden;visibility:hidden">' +
          '<span style="font-family:' + KRIJT + ';font-size:1.55em;line-height:1.2;letter-spacing:.12em;text-transform:uppercase;color:#6B6152">' + esc(it.kicker) + '</span>' +
          '<span style="font-family:' + KRIJT + ';font-size:3.2em;line-height:.95;margin-top:.15em">' + esc(it.titel) + '</span>' +
          '<span style="font-size:1.7em;line-height:1.25;color:#4A4450">' + esc(it.soort) + '</span>' +
          (it.tekst ? '<p class="kc-tekst" style="margin:auto 0 0;padding-top:.7em;border-top:1px solid rgba(31,27,36,.16);font-size:1.55em;line-height:1.35;color:#4A4450">' + esc(it.tekst) + '</p>' : '') +
        '</div>' +
      '</div>' +
      '<button type="button" class="kc-sr" aria-pressed="false">Draai foto ' + (i + 1) + ' om: ' + esc(it.titel) + '</button>';
  }

  window.KcStapel = function (root, items, opts) {
    opts = opts || {};
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch = window.matchMedia('(pointer: coarse)').matches;
    var n = items.length;

    root.style.cssText += ';position:relative;font-family:' + KRIJT + ';color:#1F1B24;text-shadow:none';
    var stage = document.createElement('div');
    stage.style.cssText = 'position:relative;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none;isolation:isolate';
    root.appendChild(stage);

    var hint = document.createElement('p');
    hint.style.cssText = 'position:absolute;z-index:4;left:24px;top:18px;margin:0;max-width:340px;font-family:' + KRIJT + ';font-size:18px;letter-spacing:.14em;text-transform:uppercase;color:#bdeafd;pointer-events:none';
    hint.textContent = touch ? 'Sleep ze rond, tik er één aan om hem om te draaien.' : 'Gooi ze rond, klik er één aan om hem om te draaien.';
    stage.appendChild(hint);

    var desk = document.createElement('div');
    desk.style.cssText = 'position:absolute;inset:0;z-index:2';
    desk.setAttribute('aria-label', "Foto's van Kims werk");
    stage.appendChild(desk);

    var dock = document.createElement('div');
    dock.style.cssText = 'position:absolute;z-index:4;display:flex';
    dock.innerHTML = '<div style="display:flex;gap:4px;padding:4px;border:1px solid rgba(189,234,253,.35);border-radius:999px;background:rgba(36,39,45,.82)">' +
      '<button type="button" data-actie="schud" style="appearance:none;border:0;background:transparent;color:#bdeafd;font:400 19px/1 ' + KRIJT + ';letter-spacing:.14em;text-transform:uppercase;padding:16px 18px;border-radius:999px;cursor:pointer">Schudden</button>' +
      '<button type="button" data-actie="rij" style="appearance:none;border:0;background:#704de1;color:#fff;font:400 19px/1 ' + KRIJT + ';letter-spacing:.14em;text-transform:uppercase;padding:16px 18px;border-radius:999px;cursor:pointer">Netjes op een rij</button></div>';
    stage.appendChild(dock);

    var cards = items.map(function (it, i) {
      var el = document.createElement('div');
      el.setAttribute('data-card', '');
      el.style.cssText = 'position:absolute;left:0;top:0;width:var(--cw);height:calc(var(--cw)*1.4);font-size:calc(var(--cw)*0.05);transform-origin:50% 50%;will-change:transform;visibility:hidden';
      el.innerHTML = kaartHTML(it, i, n);
      desk.appendChild(el);
      return { el: el, x: 0, y: 0, a: 0, vx: 0, vy: 0, va: 0, hx: .5, hy: .5, ha: 0, gx: 0, gy: 0, spawnAt: 0, inside: false, z: i + 1, flipped: false };
    });

    var w = 1, h = 1, cw = 180, gridScale = 1, sort = 0, sortTarget = 0, drag = null, topZ = 40, clock = 0;

    function mobile() { return w < 700; }
    function pickHomes() {
      var cols = n <= 6 ? (mobile() ? 2 : 3) : (mobile() ? 3 : 4), rows = Math.ceil(n / cols);
      var order = cards.map(function (_, i) { return i; }).sort(function () { return Math.random() - 0.5; });
      order.forEach(function (ci, k) {
        var c = cards[ci];
        c.hx = ((k % cols) + 0.5 + rnd(-0.32, 0.32)) / cols;
        c.hy = (Math.floor(k / cols) + 0.5 + rnd(-0.3, 0.3)) / rows;
        c.ha = rnd(-0.38, 0.38);
      });
    }
    function homePx(c) { return { x: w * (0.12 + c.hx * 0.76), y: h * (0.2 + c.hy * 0.6) }; }
    function layoutGrid() {
      var top = mobile() ? 64 : 72, bottom = mobile() ? 84 : 92, side = mobile() ? 16 : Math.max(32, w * 0.06), gap = mobile() ? 10 : 18;
      var availW = w - side * 2, availH = h - top - bottom, best = { cols: 4, size: 0 };
      for (var cols = 2; cols <= 8; cols++) {
        var rows = Math.ceil(n / cols);
        var size = Math.min((availW - gap * (cols - 1)) / cols, (availH - gap * (rows - 1)) / rows / CARD_H);
        if (size > best.size) best = { cols: cols, size: size };
      }
      var rowsB = Math.ceil(n / best.cols), s = best.size;
      var gridW = best.cols * s + (best.cols - 1) * gap, gridH = rowsB * s * CARD_H + (rowsB - 1) * gap;
      var x0 = (w - gridW) / 2 + s / 2, y0 = top + (availH - gridH) / 2 + (s * CARD_H) / 2;
      gridScale = s / cw;
      cards.forEach(function (c, i) { c.gx = x0 + (i % best.cols) * (s + gap); c.gy = y0 + Math.floor(i / best.cols) * (s * CARD_H + gap); });
    }
    function resize() {
      var ow = w, oh = h;
      var mob = window.innerWidth < 700;
      stage.style.height = (mob ? 560 : (opts.hoogte || 640)) + 'px';
      w = stage.clientWidth; h = stage.clientHeight;
      cw = mobile() ? clamp(w * 0.3, 96, 150) : clamp(Math.min(w * 0.2, h * 0.38), 140, 270);
      stage.style.setProperty('--cw', cw + 'px');
      cards.forEach(function (c) { c.x *= w / ow; c.y *= h / oh; });
      dock.style.cssText = 'position:absolute;z-index:4;display:flex;' + (mobile() ? 'left:16px;right:16px;bottom:16px;justify-content:center' : 'right:clamp(16px,2.4vw,32px);bottom:clamp(20px,3vw,40px)');
      layoutGrid();
    }
    function launch(c, tx, ty, ta) {
      c.vx = (tx - c.x) * LIN_DRAG; c.vy = (ty - c.y) * LIN_DRAG;
      var spin = rnd(-1.4, 1.4); c.a = ta - spin; c.va = spin * ANG_DRAG;
    }
    function deal() {
      clock = 0;
      cards.forEach(function (c, i) {
        var home = homePx(c);
        if (reduced) { c.x = home.x; c.y = home.y; c.a = c.ha; c.inside = true; return; }
        c.x = home.x + rnd(-0.2, 0.2) * w; c.y = h + cw * CARD_H; c.inside = false; c.spawnAt = 0.15 + i * 0.075;
        launch(c, home.x, home.y, c.ha);
      });
    }
    function shuffle() {
      drag = null; pickHomes();
      cards.forEach(function (c, i) {
        var home = homePx(c);
        if (reduced) { c.x = home.x; c.y = home.y; c.a = c.ha; c.vx = c.vy = c.va = 0; return; }
        c.spawnAt = clock + i * 0.03;
        launch(c, home.x, home.y, c.ha + rnd(-0.6, 0.6));
      });
    }
    function interactive() { return sort < 0.002; }
    function cardAt(t) {
      var node = t && t.closest ? t.closest('[data-card]') : null;
      for (var i = 0; i < cards.length; i++) if (cards[i].el === node) return cards[i];
      return null;
    }
    function flip(c) {
      if (!c) return;
      c.flipped = !c.flipped;
      var f = c.flipped;
      c.el.querySelector('.kc-binnen').style.transform = f ? 'scaleX(-1)' : 'none';
      var d = reduced ? 0 : 350;
      setTimeout(function () {
        c.el.querySelector('.kc-voor').style.visibility = f ? 'hidden' : 'visible';
        c.el.querySelector('.kc-achter').style.visibility = f ? 'visible' : 'hidden';
      }, d);
      c.el.querySelector('.kc-achter').setAttribute('aria-hidden', f ? 'false' : 'true');
      c.el.querySelector('button').setAttribute('aria-pressed', f ? 'true' : 'false');
    }

    function step(dt) {
      dt = Math.min(dt, 1 / 30); clock += dt;
      var m = cw * 0.32, topM = m + 10;
      cards.forEach(function (c) {
        if ((drag && drag.card === c) || clock < c.spawnAt) return;
        c.x += c.vx * dt; c.y += c.vy * dt; c.a += c.va * dt;
        var lin = Math.exp(-LIN_DRAG * dt); c.vx *= lin; c.vy *= lin; c.va *= Math.exp(-ANG_DRAG * dt);
        if (!c.inside) { if (c.y < h - m && c.x > m && c.x < w - m) c.inside = true; return; }
        if (c.x < m) { c.x = m; c.vx = Math.abs(c.vx) * 0.45; }
        if (c.x > w - m) { c.x = w - m; c.vx = -Math.abs(c.vx) * 0.45; }
        if (c.y < topM) { c.y = topM; c.vy = Math.abs(c.vy) * 0.45; }
        if (c.y > h - m) { c.y = h - m; c.vy = -Math.abs(c.vy) * 0.45; }
      });
      render();
    }
    function render() {
      var span = 1 - STAGGER * (n - 1);
      cards.forEach(function (c, i) {
        var t = ease(clamp((sort - i * STAGGER) / span, 0, 1));
        var a0 = Math.atan2(Math.sin(c.a), Math.cos(c.a));
        var x = c.x + (c.gx - c.x) * t, y = c.y + (c.gy - c.y) * t, a = a0 * (1 - t);
        var s = (1 + (gridScale - 1) * t) * (1 + Math.sin(Math.PI * t) * 0.12);
        var st = c.el.style;
        st.transform = 'translate3d(' + (x - cw / 2).toFixed(1) + 'px,' + (y - cw * CARD_H / 2).toFixed(1) + 'px,0) rotate(' + a.toFixed(4) + 'rad) scale(' + s.toFixed(4) + ')';
        st.zIndex = String(t > 0 && t < 1 ? 500 + i : c.z);
        st.visibility = clock < c.spawnAt && !c.inside ? 'hidden' : 'visible';
        st.touchAction = interactive() ? 'none' : 'auto';
        if (!(drag && drag.card === c)) st.cursor = interactive() ? 'grab' : 'pointer';
      });
      hint.style.opacity = (1 - sort).toFixed(3);
    }

    /* slepen en gooien */
    var down = null;
    function local(e) { var r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    stage.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || (e.target.closest && e.target.closest('button'))) { down = null; return; }
      var c = cardAt(e.target), p = local(e);
      down = { card: c, x: e.clientX, y: e.clientY };
      if (!c || !interactive()) return;
      var dx = p.x - c.x, dy = p.y - c.y, cos = Math.cos(-c.a), sin = Math.sin(-c.a);
      drag = { card: c, id: e.pointerId, px: p.x, py: p.y, moved: 0, t: performance.now(), lx: dx * cos - dy * sin, ly: dx * sin + dy * cos, svx: 0, svy: 0, sva: 0 };
      c.vx = c.vy = c.va = 0; c.inside = true; c.spawnAt = 0; c.z = ++topZ;
      c.el.style.filter = 'drop-shadow(0 18px 22px rgba(40,32,12,.28))';
      stage.setPointerCapture(e.pointerId); e.preventDefault();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag || drag.id !== e.pointerId) return;
      var p = local(e), c = drag.card, now = performance.now(), dt = Math.max(1, now - drag.t) / 1000;
      var mx = p.x - drag.px, my = p.y - drag.py; drag.moved += Math.abs(mx) + Math.abs(my);
      var rx = drag.px - c.x, ry = drag.py - c.y, lever = cw * 0.9;
      var da = clamp(((rx * my - ry * mx) / (rx * rx + ry * ry + lever * lever)) * 0.9, -0.25, 0.25);
      var ox = c.x, oy = c.y; c.a += da;
      var cos = Math.cos(c.a), sin = Math.sin(c.a);
      c.x = p.x - (drag.lx * cos - drag.ly * sin); c.y = p.y - (drag.lx * sin + drag.ly * cos);
      var k = 1 - Math.exp(-dt * 18);
      drag.svx += ((c.x - ox) / dt - drag.svx) * k; drag.svy += ((c.y - oy) / dt - drag.svy) * k; drag.sva += (da / dt - drag.sva) * k;
      drag.px = p.x; drag.py = p.y; drag.t = now;
    });
    stage.addEventListener('pointerup', function (e) {
      var tap = false;
      if (drag && drag.id === e.pointerId) {
        var c = drag.card; c.el.style.filter = '';
        if (!reduced && performance.now() - drag.t <= 90) {
          var sp = Math.hypot(drag.svx, drag.svy), f = sp > 4200 ? 4200 / sp : 1;
          c.vx = drag.svx * f; c.vy = drag.svy * f; c.va = clamp(drag.sva, -14, 14);
        }
        tap = drag.moved < 7; drag = null;
      } else if (down && !interactive()) {
        tap = Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) < 7;
      }
      var c2 = cardAt(document.elementFromPoint(e.clientX, e.clientY));
      if (tap && c2 && down && c2 === down.card) flip(c2);
      down = null;
    });
    stage.addEventListener('pointercancel', function () { if (drag) drag.card.el.style.filter = ''; drag = null; down = null; });

    /* toetsenbord: de verborgen knop per kaart draait hem om */
    cards.forEach(function (c) {
      c.el.querySelector('button').addEventListener('click', function (e) { if (e.detail === 0) flip(c); });
    });

    dock.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.actie === 'schud') { sortTarget = 0; dock.querySelector('[data-actie="rij"]').textContent = 'Netjes op een rij'; shuffle(); }
      if (b.dataset.actie === 'rij') { sortTarget = sortTarget > 0 ? 0 : 1; b.textContent = sortTarget ? 'Weer op een stapel' : 'Netjes op een rij'; }
    });

    pickHomes(); resize(); deal(); render();
    window.addEventListener('resize', resize);

    var inView = true;
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe(stage);
    var last = performance.now();
    (function loop(t) {
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (inView && !document.hidden) {
        if (reduced) sort = sortTarget;
        else { sort += (sortTarget - sort) * (1 - Math.exp(-dt * 3.2)); if (Math.abs(sortTarget - sort) < 0.001) sort = sortTarget; }
        step(dt);
      }
      requestAnimationFrame(loop);
    })(last);
  };
})();
