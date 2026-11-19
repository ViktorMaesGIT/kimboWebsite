/* Ramen-pagina: de stapel bovenaan en de galerij per seizoen.
   Alle foto's staan in de HTML (goed voor Google); dit script toont of verbergt
   ze per seizoen en laat ze met een animatie naar hun plek vallen. */
(function () {
  var data = JSON.parse(document.getElementById('ramen-data').textContent);
  var stapelEl = document.getElementById('stapel');
  if (stapelEl && window.KcStapel) window.KcStapel(stapelEl, data.stapel, { hoogte: 640 });

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
  var grid = document.querySelector('[data-kc-grid]');
  var kop = document.querySelector('[data-kc-kop]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.kc-chip[data-cat]'));
  var fotos = Array.prototype.slice.call(grid.querySelectorAll('[data-foto]'));

  function zichtbaar() { return fotos.filter(function (f) { return f.style.display !== 'none'; }); }

  function laatVallen() {
    if (reduced) return;
    zichtbaar().forEach(function (el, i) {
      el.animate([
        { opacity: 0, transform: 'translateY(-70px) rotate(-6deg) scale(0.9)' },
        { opacity: 1, transform: el.style.transform || 'none' }
      ], { duration: 900, delay: 80 + i * 70, easing: ease, fill: 'backwards' });
    });
  }

  function kies(cat, animeer) {
    var c = data.cats.filter(function (x) { return x.id === cat; })[0] || data.cats[0];
    chips.forEach(function (b) {
      var aan = b.dataset.cat === c.id;
      b.setAttribute('aria-pressed', aan ? 'true' : 'false');
      b.style.background = aan ? '#704de1' : 'transparent';
      b.style.borderColor = aan ? '#704de1' : 'rgba(189,234,253,0.4)';
      b.style.color = aan ? '#ffffff' : '#bdeafd';
    });
    var k = 0;
    fotos.forEach(function (f) {
      var vis = c.id === 'alles' || f.dataset.cat === c.id;
      f.style.display = vis ? '' : 'none';
      if (vis) { f.style.transform = 'rotate(' + (((k % 3) - 1) * 1.4) + 'deg)'; k++; }
    });
    kop.querySelector('h2').textContent = c.h;
    kop.querySelector('p').textContent = c.t;
    if (animeer && !reduced) {
      kop.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: ease });
      laatVallen();
    }
  }

  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.getAttribute('aria-pressed') === 'true') return;
      kies(b.dataset.cat, true);
      history.replaceState(null, '', b.dataset.cat === 'alles' ? location.pathname : '#' + b.dataset.cat);
    });
  });

  /* een link als ramen/#winter opent meteen dat seizoen */
  var start = (location.hash || '').replace('#', '');
  kies(data.cats.some(function (c) { return c.id === start; }) ? start : 'alles', false);
  if (start && start !== 'alles') document.getElementById('seizoenen').scrollIntoView();

  /* de polaroids vallen pas als je tot bij de galerij scrolt */
  if (!reduced && 'IntersectionObserver' in window) {
    zichtbaar().forEach(function (f) { f.style.opacity = '0'; });
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      fotos.forEach(function (f) { f.style.opacity = ''; });
      laatVallen();
    }, { threshold: 0.08 });
    io.observe(grid);
  }
})();
