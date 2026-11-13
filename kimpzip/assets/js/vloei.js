/* Scrollvloei – Kimbo Creates (enkel op de home)
 *
 * Elk blok komt binnen zoals de werkjes van de stapel: kaartjes vliegen scheef en verschoven binnen
 * en vallen recht, titels schuiven omhoog, takken groeien van links, de luiaard komt van rechts.
 * De beweging volgt de scrollpositie (zacht nagevolgd), dus terugscrollen speelt ze terug af.
 *
 * Gebruik: data-vloei="kop | kaart | tak | foto" op een element, optioneel data-vloei-d="70"
 * (vertraging in px scrollen, voor kaartjes naast elkaar).
 * Zonder JavaScript of met "minder beweging" staat alles gewoon op zijn plaats.
 *
 * Ook hier: de ramen (.rm) gaan open bij hover (CSS, alleen met een muis), bij Tab-focus en bij een tik,
 * klik of Enter (klasse .is-open, aria-expanded loopt mee).
 */
(function () {
  'use strict';

  /* ramen: tik, klik of Enter = open/dicht; met Tab erop komen = open, weer weggaan = dicht.
     Beeld en aria-expanded lopen zo altijd gelijk (hover, alleen met een muis, regelt de CSS). */
  Array.prototype.slice.call(document.querySelectorAll('button.rm')).forEach(function (b) {
    var doorFocus = false, metAanwijzer = false; /* focus door een muisklik of tik telt niet als Tab-focus */
    function zet(open) {
      b.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    b.classList.add('rm--js'); /* vanaf nu regelt dit script de focus, niet de CSS */
    b.addEventListener('pointerdown', function () { metAanwijzer = true; });
    b.addEventListener('click', function () { doorFocus = false; metAanwijzer = false; zet(!b.classList.contains('is-open')); });
    b.addEventListener('focus', function () {
      if (!metAanwijzer && b.matches(':focus-visible') && !b.classList.contains('is-open')) { doorFocus = true; zet(true); }
    });
    b.addEventListener('blur', function () { metAanwijzer = false; if (doorFocus) { doorFocus = false; zet(false); } });
  });

  var els = Array.prototype.slice.call(document.querySelectorAll('[data-vloei]'));
  if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var KINDS = {
    kop: function () { return { rx: 0, ry: 46, ra: 0, s0: 1 }; },
    kaart: function () { return { rx: (Math.random() - 0.5) * 140, ry: 110, ra: (Math.random() - 0.5) * 18, s0: 0.9 }; },
    tak: function () { return { rx: -200, ry: 0, ra: -3, s0: 1 }; },
    foto: function () { return { rx: 160, ry: 30, ra: 12, s0: 0.92 }; }
  };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  var items = els.map(function (el) {
    var o = (KINDS[el.getAttribute('data-vloei')] || KINDS.kop)();
    o.el = el; o.d = +(el.getAttribute('data-vloei-d') || 0); o.p = 0; o.top = 0; o.shown = -1;
    return o;
  });
  function apply(it) {
    var t = ease(it.p), u = 1 - t;
    it.el.style.opacity = Math.min(1, t * 1.6).toFixed(3);
    it.el.style.transform = it.p >= 1 ? 'none' :
      'translate3d(' + (u * it.rx).toFixed(1) + 'px, ' + (u * it.ry).toFixed(1) + 'px, 0) rotate(' + (u * it.ra).toFixed(2) + 'deg) scale(' + (it.s0 + (1 - it.s0) * t).toFixed(4) + ')';
    it.shown = it.p;
  }
  function measure() {
    items.forEach(function (it) { it.el.style.transform = 'none'; });
    items.forEach(function (it) { it.top = it.el.getBoundingClientRect().top + window.scrollY; });
    items.forEach(apply);
  }
  measure();

  var last = performance.now(), again = false;
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (again) { again = false; measure(); }
    var vh = window.innerHeight, sy = window.scrollY, span = Math.min(vh * 0.25, 240), k = 1 - Math.exp(-dt * 7);
    var maxS = Math.max(0, document.documentElement.scrollHeight - vh);
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      /* start wanneer het onderaan in beeld komt; helemaal onderaan de pagina is alles zeker binnen */
      var trig = Math.min(it.top + it.d - vh, maxS - span);
      var target = clamp((sy - trig) / span, 0, 1);
      it.p += (target - it.p) * k;
      if (Math.abs(target - it.p) < 0.0005) it.p = target;
      if (Math.abs(it.p - it.shown) > 0.0004) apply(it);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  function later() { again = true; }
  window.addEventListener('resize', later);
  window.addEventListener('load', later);
  if (window.ResizeObserver) new ResizeObserver(later).observe(document.body);
})();
