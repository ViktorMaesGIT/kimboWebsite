/* Zachte animatie bij het scrollen: titels, teksten, kaarten en foto's schuiven
   omhoog en vervagen in zodra ze in beeld komen. Wie "minder beweging" heeft
   ingesteld, ziet alles meteen. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var sel = [
    'main > section h2', 'main > section p.kk', 'main > section > div > p',
    'main article', 'main ol > li', 'main figure:not(.kc-foto)', 'main details',
    '#kim > div > p', '#contact form', '#contact ul', '[data-reveal]'
  ].join(', ');

  var els = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function (el) {
    return !el.closest('.kc-bos') && !el.closest('[data-no-reveal]');
  });

  var perOuder = new Map();
  els.forEach(function (el) {
    var p = el.parentElement, n = perOuder.get(p) || 0;
    perOuder.set(p, n + 1);
    el.style.setProperty('--kc-delay', Math.min(n, 5) * 0.09 + 's');
    if (el.tagName === 'ARTICLE' || el.tagName === 'FIGURE') el.style.setProperty('--kc-rot', (n % 2 ? 1.5 : -1.5) + 'deg');
    el.classList.add('kc-reveal');
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('kc-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(function (el) { io.observe(el); });
})();
