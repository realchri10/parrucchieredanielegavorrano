(function () {
  // Header on scroll
  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Gallery lightbox
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  document.querySelectorAll('.gallery__item').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      lbImg.src = a.href;
      lbImg.alt = a.querySelector('img').alt;
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
    });
  });
  function closeLb() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); }
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLb(); setMenu(false); } });

  // Booking form -> opens WhatsApp with prefilled message
  var form = document.getElementById('booking-form');
  var msg = document.getElementById('form-msg');
  var dateInput = form.querySelector('[name="data"]');
  dateInput.min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      var ok = f.value.trim() !== '';
      f.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) { msg.textContent = 'Compila tutti i campi obbligatori.'; return; }

    // Controllo giorno/sede: Gavorrano Lun-Gio-Dom 9-13, Caldana Mar-Mer-Ven-Sab 8-19
    var giorno = new Date(form.data.value + 'T12:00:00').getDay();
    var sede = form.sede.value;
    var giorniGav = [1, 4, 0], giorniCal = [2, 3, 5, 6];
    if (sede.indexOf('Gavorrano') === 0 && giorniGav.indexOf(giorno) === -1) {
      msg.textContent = 'Gavorrano è aperto lunedì e giovedì (9:00–19:00) e domenica (9:00–13:00). Scegli un altro giorno o la sede di Caldana.'; return;
    }
    if (sede.indexOf('Caldana') === 0 && giorniCal.indexOf(giorno) === -1) {
      msg.textContent = 'Caldana è aperto martedì, mercoledì, venerdì e sabato (8:00–19:00). Scegli un altro giorno o la sede di Gavorrano.'; return;
    }
    if (sede.indexOf('Gavorrano') === 0 && giorno === 0 && form.orario.value.indexOf('Pomeriggio') === 0) {
      msg.textContent = 'La domenica a Gavorrano siamo aperti solo la mattina (9:00–13:00).'; return;
    }

    var d = new FormData(form);
    var dataIt = new Date(d.get('data') + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var lines = [
      'Ciao Daniele! Vorrei prenotare un appuntamento:',
      '',
      '*Nome:* ' + d.get('nome').trim(),
      '*Telefono:* ' + d.get('telefono').trim(),
      '*Servizio:* ' + d.get('servizio'),
      '*Sede:* ' + d.get('sede'),
      '*Data:* ' + dataIt,
      '*Fascia oraria:* ' + d.get('orario')
    ];
    if (d.get('note').trim()) lines.push('*Note:* ' + d.get('note').trim());
    lines.push('', 'Grazie!');

    var url = 'https://wa.me/393288334569?text=' + encodeURIComponent(lines.join('\n'));
    var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
    } else {
      var w = window.open(url, '_blank');
      if (!w) window.location.href = url;
    }
    msg.textContent = 'Perfetto! Premi "Invia" su WhatsApp per inviare la richiesta.';
    form.reset();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
