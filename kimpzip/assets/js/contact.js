/* Contactformulier (alleen contact.html).
   Zonder JavaScript verstuurt de browser het formulier gewoon naar de formulierdienst.
   Met JavaScript blijft de bezoeker op de pagina en verschijnt het bedankje in de kaart.
   Alle teksten staan in contact.html (data-attributen op het formulier en .formulier-dank). */
(function () {
  var form = document.querySelector('.formulier');
  if (!form || !window.fetch || !window.FormData) return;

  var status = form.querySelector('.formulier-status');
  var dank = document.querySelector('.formulier-dank');
  var knop = form.querySelector('button[type="submit"]');
  var bezig = false;

  // eerst leegmaken: zo leest een schermlezer ook twee keer dezelfde melding na elkaar voor
  function meld(tekst, fout) {
    status.textContent = '';
    status.classList.toggle('is-fout', !!fout);
    setTimeout(function () { status.textContent = tekst || ''; }, 50);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (bezig) return;

    var adres = form.getAttribute('action') || '';
    if (!adres || adres.charAt(0) === '[') { // plaatshouder nog niet vervangen
      meld(form.dataset.open, true);
      return;
    }

    bezig = true;
    knop.setAttribute('aria-disabled', 'true');
    meld(form.dataset.bezig);
    fetch(adres, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (antwoord) {
        if (!antwoord.ok) throw new Error('status ' + antwoord.status);
        form.hidden = true;
        form.parentNode.classList.add('is-verstuurd'); // verbergt de titel "Vertel het me"
        dank.hidden = false;
        dank.querySelector('.formulier-dank-titel').focus();
        dank.parentNode.scrollIntoView({ block: 'center' });
      })
      .catch(function () {
        bezig = false;
        knop.removeAttribute('aria-disabled');
        meld(form.dataset.fout, true);
      });
  });
})();
