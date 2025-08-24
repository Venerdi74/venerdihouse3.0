/* ===================== REDIRECT LINGUA (home) ===================== */
(function(){
  try{
    const userLang = navigator.language || navigator.userLanguage;
    const langMap = { it:'index.html', en:'en.html', fr:'fr.html', de:'de.html', es:'es.html', sk:'sk.html', hu:'hu.html', ro:'ro.html', pl:'pl.html' };
    const short = (userLang || 'it').split('-')[0];
    if ((location.pathname.endsWith('index.html') || location.pathname === '/') && langMap[short] && short !== 'it') {
      location.href = langMap[short];
    }
  }catch(e){}
})();
// === i18n minimale (multi-lingua) ===
const LANG = (document.documentElement.lang || 'it').slice(0,2);
const I18N = {
  it: { open:'Apri il menu', close:'Chiudi il menu', mapBlocked:'Per motivi di privacy, la mappa è bloccata fino al tuo consenso.', enableMap:'Abilita mappa' },
  en: { open:'Open menu', close:'Close menu', mapBlocked:'For privacy reasons, the map is blocked until you consent.', enableMap:'Enable map' },
  de: { open:'Menü öffnen', close:'Menü schließen', mapBlocked:'Aus Datenschutzgründen ist die Karte bis zu Ihrer Zustimmung blockiert.', enableMap:'Karte aktivieren' },
  fr: { open:'Ouvrir le menu', close:'Fermer le menu', mapBlocked:'Pour des raisons de confidentialité, la carte est bloquée jusqu’à votre consentement.', enableMap:'Activer la carte' },
  es: { open:'Abrir menú', close:'Cerrar menú', mapBlocked:'Por motivos de privacidad, el mapa está bloqueado hasta que des tu consentimiento.', enableMap:'Activar mapa' },
  sk: { open:'Otvoriť menu', close:'Zavrieť menu', mapBlocked:'Z dôvodu ochrany súkromia je mapa zablokovaná až do udelenia súhlasu.', enableMap:'Povoliť mapu' },
  hu: { open:'Menü megnyitása', close:'Menü bezárása', mapBlocked:'Adatvédelmi okokból a térkép a hozzájárulásig le van tiltva.', enableMap:'Térkép engedélyezése' },
  ro: { open:'Deschide meniul', close:'Închide meniul', mapBlocked:'Din motive de confidențialitate, harta este blocată până la consimțământ.', enableMap:'Activează harta' },
  pl: { open:'Otwórz menu', close:'Zamknij menu', mapBlocked:'Ze względów prywatności mapa jest zablokowana do czasu wyrażenia zgody.', enableMap:'Włącz mapę' }
};
const t = k => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || I18N.it[k] || k;
// === fine i18n minimale ===

document.addEventListener('DOMContentLoaded', function () {
/* ===================== MENU MOBILE ===================== */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav-links');
  const backdrop = document.getElementById('menu-backdrop');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      const willOpen = !expanded;
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', !expanded ? t('close') : t('open'));
      nav.classList.toggle('active');
      if (backdrop) {
        if (willOpen) { backdrop.classList.add('show'); document.body.style.overflow = 'hidden'; }
        else { backdrop.classList.remove('show'); document.body.style.overflow = ''; }
      }
    });
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', t('open'));
        if (backdrop) backdrop.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
    const drawerClose = document.querySelector('.drawer-close');
    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        nav.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', t('open'));
        if (backdrop) backdrop.classList.remove('show');
        document.body.style.overflow = '';
      });
    }
  }

/* ===================== DROPDOWN LINGUA ===================== */
  const langDropdown = document.querySelector('.language-dropdown');
  if (langDropdown) {
    const btn = langDropdown.querySelector('.dropdown-toggle');
    const menu = langDropdown.querySelector('.dropdown-menu');
    if (btn && menu) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
      });
      document.addEventListener('click', () => menu.classList.remove('show'));
    }
  }

/* ===================== LAZY IMAGES ===================== */
  const lazyImages = document.querySelectorAll("img[loading='lazy']");
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    });
    lazyImages.forEach(img => obs.observe(img));
  }

/* ===================== DATE: ARRIVO → PARTENZA MIN ===================== */
  const arrivo = document.getElementById('arrivo');
  const partenza = document.getElementById('partenza');
  if (arrivo && partenza) {
    arrivo.addEventListener('change', function () {
      if (arrivo.value) {
        partenza.min = arrivo.value;
        if (!partenza.value || partenza.value < arrivo.value) partenza.value = arrivo.value;
      }
    });
  }
}); 

/* ===================== MAPPA: CARICAMENTO ON CONSENT ===================== */
window.loadMap = function(){
  const mapContainer = document.getElementById('map-placeholder');
  if (!mapContainer) return;
  if (mapContainer.dataset.loaded === 'true') return;
  mapContainer.innerHTML = '<iframe src="https://www.google.com/maps?q=Via+Pasquale+Paoli,+103,+07041+Alghero+SS&output=embed" width="100%" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
  mapContainer.dataset.loaded = 'true';
};

/* ===================== CONSENSO COOKIE (UNIFICATO) ===================== */
(function(){
  const CONSENT_KEY = 'cookieConsent'; // 'accepted' | 'rejected'
  const CONSENT_TS = CONSENT_KEY + '_ts';
  const MAX_AGE_DAYS = 180; // 6 mesi

  function getConsent(){
    const status = localStorage.getItem(CONSENT_KEY);
    const ts = parseInt(localStorage.getItem(CONSENT_TS) || '0', 10);
    return { status, ts };
  }
  function setConsent(status){
    localStorage.setItem(CONSENT_KEY, status);
    localStorage.setItem(CONSENT_TS, Date.now().toString());
  }
  function expired(ts){
    if(!ts) return true;
    return (Date.now() - ts) / (1000*60*60*24) > MAX_AGE_DAYS;
  }
  function removeMap(){
    const mapContainer = document.getElementById('map-placeholder');
    if (mapContainer) {
      mapContainer.innerHTML = `<p>${t('mapBlocked')}</p><button id="accept-map">${t('enableMap')}</button>`;
      mapContainer.removeAttribute('data-loaded');
      const btn = document.getElementById('accept-map');
      if (btn) btn.addEventListener('click', () => {
        setConsent('accepted');
        if (typeof loadMap === 'function') loadMap();
        const banner = document.getElementById('cookie-banner'); if (banner) banner.style.display = 'none';
        btn.style.display = 'none';
      });
    }
  }
  function applyConsent(){
  const mapBtn = document.getElementById('accept-map');

    const { status, ts } = getConsent();
    const isExpired = expired(ts);
    const banner = document.getElementById('cookie-banner');
    if ((!status || isExpired) && banner) banner.style.display = 'block';
    if (status === 'accepted' && !isExpired) {
      if (typeof loadMap === 'function') loadMap();
      if (mapBtn) mapBtn.style.display = 'none';
    } else {
      removeMap();
      if (mapBtn) mapBtn.style.display = '';
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    const banner = document.getElementById('cookie-banner');
    const accept = document.getElementById('accept-cookies');
    const reject = document.getElementById('reject-cookies');
    const openSettings = document.getElementById('open-cookie-settings');
    if (accept && banner) accept.addEventListener('click', () => { setConsent('accepted'); banner.style.display='none'; applyConsent(); });
    if (reject && banner) reject.addEventListener('click', () => { setConsent('rejected'); banner.style.display='none'; applyConsent(); });
    if (openSettings && banner) openSettings.addEventListener('click', () => { banner.style.display='block'; });
    applyConsent();
  });
})(); 
/* =================== FINE CONSENSO COOKIE (UNIFICATO) =================== */


/* === Drawer hardening (auto-added) =============================== */
(function(){
  if (window.__drawerPatched__) return;
  window.__drawerPatched__ = true;

  function qs(sel){ return document.querySelector(sel); }

  function getDrawer(){ return qs('#nav-links') || qs('.nav-links'); }
  function getToggle(){ return qs('#menu-toggle') || qs('.menu-toggle') || qs('.hamburger'); }
  function getBackdrop(){ return qs('#menu-backdrop') || qs('.backdrop'); }

  function closeDrawer(){
    var drawer = getDrawer();
    var toggle = getToggle();
    var backdrop = getBackdrop();
    if (!drawer) return;
    drawer.classList.remove('active');
    if (toggle){
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label', t('open'));    }
    if (backdrop){ backdrop.classList.remove('show'); }
    document.body && (document.body.style.overflow = '');
  }
  window.closeDrawer = window.closeDrawer || closeDrawer;

  // Close when clicking a nav link (event delegation)
  document.addEventListener('click', function(e){
    var link = e.target && e.target.closest && e.target.closest('#nav-links a, .nav-links a, nav a');
    if (!link) return;
    var drawer = getDrawer();
    if (drawer && drawer.classList.contains('active')) {
      // don't prevent navigation; just close UI
      closeDrawer();
    }
  }, true);

  // Click outside to close
  document.addEventListener('click', function(e){
    var drawer = getDrawer();
    if (!drawer || !drawer.classList.contains('active')) return;
    var clickedInsideDrawer = e.target.closest && e.target.closest('#nav-links, .nav-links');
    var clickedToggle = e.target.closest && e.target.closest('#menu-toggle, .menu-toggle, .hamburger');
    if (!clickedInsideDrawer && !clickedToggle){
      closeDrawer();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeDrawer();
  });
})();
/* === End drawer hardening ======================================= */

/* === Cookie banner cross-browser hardening (additive) === */
(function () {
  var btn = document.getElementById('open-cookie-settings');
  var banner = document.getElementById('cookie-banner');
  if (!btn || !banner) return;

  function closeDrawerIfAny() {
    try {
      // Common selectors used in the site; harmless if not present
      var backdrop = document.getElementById('menu-backdrop') || document.querySelector('.menu-backdrop');
      var drawer   = document.getElementById('mobile-drawer') || document.querySelector('.mobile-drawer, .nav-drawer, #nav-drawer');
      var body     = document.body;

      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
      }
      if (backdrop && backdrop.classList.contains('show')) {
        backdrop.classList.remove('show');
      }
      // Restore scroll in case menu code locked it
      body.style.overflow = '';
      body.classList.remove('menu-open');
    } catch (e) {}
  }

  btn.addEventListener('click', function () {
    closeDrawerIfAny();

    // Ensure banner sits at the top document level to avoid stacking-context bugs
    if (banner.parentElement !== document.body) {
      document.body.appendChild(banner);
    }

    // Defensive styles for stubborn mobile browsers
    banner.style.position = 'fixed';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.bottom = '0';
    banner.style.zIndex = '2147483647';
    banner.style.display = 'block';
    banner.setAttribute('aria-hidden', 'false');
  }, { passive: true });
})();
