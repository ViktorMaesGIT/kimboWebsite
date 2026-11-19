/* Menuknop op de gsm: klapt het hoofdmenu open en dicht. */
(function () {
  var knop = document.querySelector('.kc-menuknop');
  var menu = document.getElementById('hoofdmenu');
  if (!knop || !menu) return;
  function zet(open) {
    menu.classList.toggle('open', open);
    knop.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  knop.addEventListener('click', function () { zet(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zet(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { zet(false); knop.focus(); } });
})();
