/* site.js – menu mobile, retour en haut, boutons copier/imprimer, plan à la demande, apparition douce */
(function () {
    // Menu mobile (bouton « Menu »)
    var nav = document.querySelector('.nav-container');
    var menu = document.querySelector('.nav-menu');
    if (nav && menu) {
        menu.id = menu.id || 'menu-principal';
        var btn = document.createElement('button');
        btn.className = 'nav-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', menu.id);
        btn.innerHTML = '<span class="nav-toggle-bars" aria-hidden="true"></span><span class="nav-toggle-label">Menu</span>';
        nav.insertBefore(btn, menu);
        btn.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus();
            }
        });
    }

    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Bouton « Remonter en haut » (apparaît après un bon défilement)
    var haut = document.createElement('button');
    haut.type = 'button';
    haut.className = 'back-to-top';
    haut.setAttribute('aria-label', 'Remonter en haut de la page');
    haut.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(haut);
    var majHaut = function () { haut.classList.toggle('is-visible', window.scrollY > window.innerHeight * 1.2); };
    window.addEventListener('scroll', majHaut, { passive: true });
    majHaut();
    haut.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' });
        var principal = document.getElementById('contenu');
        if (principal) principal.focus({ preventScroll: true });
    });

    // Boutons « Copier » (téléphone, email)
    document.querySelectorAll('[data-copy]').forEach(function (b) {
        if (!navigator.clipboard) { b.hidden = true; return; }
        var texte = b.textContent;
        b.addEventListener('click', function () {
            navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () {
                b.textContent = 'Copié\u00a0!';
                b.classList.remove('is-done'); void b.offsetWidth; b.classList.add('is-done');
                setTimeout(function () { b.textContent = texte; b.classList.remove('is-done'); }, 2000);
            }, function () { b.hidden = true; });
        });
    });

    // Bouton « Imprimer »
    document.querySelectorAll('[data-print]').forEach(function (b) {
        b.addEventListener('click', function () { window.print(); });
    });

    // Plan Google Maps chargé seulement à la demande (cookies Google)
    document.querySelectorAll('[data-map-load]').forEach(function (b) {
        b.addEventListener('click', function () {
            var bloc = b.closest('[data-map-src]');
            var cadre = document.createElement('iframe');
            cadre.src = bloc.getAttribute('data-map-src');
            cadre.className = 'map-frame';
            cadre.title = bloc.getAttribute('data-map-title');
            cadre.setAttribute('allowfullscreen', '');
            cadre.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            bloc.replaceWith(cadre);
            cadre.focus();
        });
    });

    // Apparition douce (seulement pour les blocs sous la ligne de flottaison)
    if (reduit || !('IntersectionObserver' in window)) return;
    var cibles = document.querySelectorAll('.card, .price-card, .step, .timeline li, .cta-final, .why-quote, .check-list li, .section-title');
    var obs = new IntersectionObserver(function (entrees) {
        // Les éléments qui arrivent ensemble apparaissent l'un après l'autre (30 ms d'écart)
        var rang = 0;
        entrees.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target;
            el.style.transitionDelay = Math.min(rang++, 8) * 30 + 'ms';
            el.classList.add('is-visible');
            setTimeout(function () { el.style.transitionDelay = ''; }, 900); // ne pas retarder le survol ensuite
            obs.unobserve(e.target);
        });
    }, { threshold: 0.12 });
    cibles.forEach(function (el) {
        if (el.getBoundingClientRect().top > window.innerHeight) {
            el.classList.add('reveal');
            obs.observe(el);
        }
    });
})();
