/* De raamkaart op de homepage volgt het seizoen dat eraan komt:
   na halloween kerst, na kerst de lente, enz. Heeft een seizoen meer
   foto's, dan wisselen ze om de 5 seconden. */
(function () {
  var kaart = document.getElementById('seizoen-kaart');
  var label = document.getElementById('seizoen-label');
  if (!kaart || !label) return;

  var P = 'assets/img/portfolio/';
  var SEIZOENEN = {
    winter: { id: 'winter', label: 'nu in het seizoen: kerst', naam: 'kerstramen', fotos: [
      { img: 'kerstraam-paardenkouter.jpg', alt: 'Kerstdecoratie raamschildering op de deuren van restaurant de Paardenkouter', plaats: 'restaurant de Paardenkouter' },
      { img: 'winterraam-vos-paardenkouter.jpg', alt: 'Winterraam met vos in witte lijnen bij restaurant de Paardenkouter', plaats: 'restaurant de Paardenkouter', pos: '50% 70%' } ] },
    lente: { id: 'lente', label: 'nu in het seizoen: lente', naam: 'lenteramen', fotos: [
      { img: 'lenteraam-keet.jpg', alt: 'Lenteraam met bloesem en tulpen bij Keet', plaats: 'Keet', pos: '50% 60%' },
      { img: 'lenteraam-woonzorgcentrum-mechelen.jpg', alt: 'Kim schildert een lenteraam met madeliefje in een woonzorgcentrum in Mechelen', plaats: 'Mechelen', pos: '50% 40%' } ] },
    feest: { id: 'feest', label: 'nu in het seizoen: feesten & trouw', naam: 'feest- en trouwramen', fotos: [
      { img: 'trouwdecoratie-raam-lokeren.jpg', alt: 'Kim schildert een trouwdecoratie op het raam in Lokeren', plaats: 'Lokeren', pos: '50% 35%' },
      { img: 'jubileum-kos-kinesitherapie-lebbeke.jpg', alt: "Jubileumraam '3 jaar' voor KOS Kinesitherapie in Lebbeke", plaats: 'Lebbeke', pos: '50% 30%' } ] },
    herfst: { id: 'herfst', label: 'nu in het seizoen: herfst', naam: 'herfstramen', fotos: [
      { img: 'herfstraam-michous-nails-droeshout.jpg', alt: "Herfstraam met eekhoorn en pompoen in witte lijnen bij Michou's Nails in Droeshout", plaats: 'Droeshout', pos: '50% 60%' } ] },
    halloween: { id: 'halloween', label: 'nu in het seizoen: halloween', naam: 'halloweenramen', fotos: [
      { img: 'halloween-weerwolf-wetteren.jpg', alt: 'Halloween raamschildering van een weerwolf bij Boerenparlement in Wetteren', plaats: 'Wetteren', pos: '50% 40%' },
      { img: 'halloween-civilia-merchtem.jpg', alt: 'Halloween raamschildering met skelet en spookjes bij Civilia in Merchtem', plaats: 'Merchtem' },
      { img: 'halloween-luxora-gym-merchtem.jpg', alt: "Halloween raamschildering 'Creep it real' met skelet bij Luxora Gym in Merchtem", plaats: 'Merchtem', pos: '50% 45%' },
      { img: 'halloween-pompoenen-wetteren.jpg', alt: 'Halloweenraam met pompoenen, spinnenweb en grafsteen bij Boerenparlement in Wetteren', plaats: 'Wetteren' } ] }
  };
  /* maand (0 = januari) → seizoen dat eraan komt */
  var MAAND = ['winter', 'lente', 'lente', 'lente', 'feest', 'feest', 'feest', 'feest', 'herfst', 'halloween', 'winter', 'winter'];
  var s = SEIZOENEN[MAAND[new Date().getMonth()]];

  /* het pad naar de site-root afleiden uit de link van de kaart (bv. "ramen/" of "../ramen/") */
  var root = kaart.getAttribute('href').replace(/ramen\.html.*$/, '');
  kaart.setAttribute('href', root + 'ramen.html#' + s.id);
  kaart.setAttribute('aria-label', 'Bekijk mijn ' + s.naam);

  kaart.querySelectorAll('img').forEach(function (img) { img.remove(); });
  var imgs = s.fotos.map(function (f, i) {
    var img = document.createElement('img');
    img.src = root + P + f.img;
    img.alt = f.alt;
    img.loading = 'lazy';
    img.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: ' + (f.pos || '50% 50%') + '; transition: opacity 1.4s ease; opacity: ' + (i === 0 ? '1' : '0');
    kaart.insertBefore(img, label);
    return img;
  });

  var i = 0;
  function toon() {
    imgs.forEach(function (img, k) { img.style.opacity = k === i ? '1' : '0'; });
    label.textContent = s.label + ' · ' + s.fotos[i].plaats;
  }
  toon();
  if (imgs.length > 1) setInterval(function () { i = (i + 1) % imgs.length; toon(); }, 5000);
})();
