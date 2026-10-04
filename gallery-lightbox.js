(function () {
  'use strict';

  const labelsByLanguage = {
    it: { dialog: 'Visualizzatore immagini', close: 'Chiudi', previous: 'Immagine precedente', next: 'Immagine successiva', count: 'Immagine %1 di %2' },
    en: { dialog: 'Image viewer', close: 'Close', previous: 'Previous image', next: 'Next image', count: 'Image %1 of %2' },
    fr: { dialog: 'Visionneuse d’images', close: 'Fermer', previous: 'Image précédente', next: 'Image suivante', count: 'Image %1 sur %2' },
    de: { dialog: 'Bildbetrachter', close: 'Schließen', previous: 'Vorheriges Bild', next: 'Nächstes Bild', count: 'Bild %1 von %2' },
    es: { dialog: 'Visor de imágenes', close: 'Cerrar', previous: 'Imagen anterior', next: 'Imagen siguiente', count: 'Imagen %1 de %2' },
    sk: { dialog: 'Prehliadač obrázkov', close: 'Zavrieť', previous: 'Predchádzajúci obrázok', next: 'Nasledujúci obrázok', count: 'Obrázok %1 z %2' },
    hu: { dialog: 'Képnézegető', close: 'Bezárás', previous: 'Előző kép', next: 'Következő kép', count: 'Kép %1 / %2' },
    ro: { dialog: 'Vizualizator de imagini', close: 'Închide', previous: 'Imaginea anterioară', next: 'Imaginea următoare', count: 'Imaginea %1 din %2' },
    pl: { dialog: 'Przeglądarka zdjęć', close: 'Zamknij', previous: 'Poprzednie zdjęcie', next: 'Następne zdjęcie', count: 'Zdjęcie %1 z %2' }
  };

  function initLightboxAccessibility() {
    if (!window.lightbox) return;

    const language = (document.documentElement.lang || 'it').split('-')[0];
    const labels = labelsByLanguage[language] || labelsByLanguage.it;
    let lastTrigger = null;
    let focusTimer = null;
    let restoreTimer = null;
    let isOpen = false;

    function getDialog() {
      return document.getElementById('lightbox');
    }

    function isVisible(element) {
      return Boolean(element && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
    }

    function getFocusableControls() {
      const dialog = getDialog();
      if (!dialog) return [];

      return Array.from(dialog.querySelectorAll('[role="button"][tabindex]:not([tabindex="-1"]), button:not(:disabled), a[href]'))
        .filter(isVisible);
    }

    function configureDialog() {
      const dialog = getDialog();
      if (!dialog) return false;

      const overlay = document.getElementById('lightboxOverlay');
      const closeButton = dialog.querySelector('.lb-close');
      const cancelButton = dialog.querySelector('.lb-cancel');
      const previousButton = dialog.querySelector('.lb-prev');
      const nextButton = dialog.querySelector('.lb-next');
      const caption = dialog.querySelector('.lb-caption');
      const count = dialog.querySelector('.lb-number');

      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-label', labels.dialog);
      dialog.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      if (overlay) overlay.setAttribute('aria-hidden', 'true');

      if (closeButton) closeButton.setAttribute('aria-label', labels.close);
      if (cancelButton) cancelButton.setAttribute('aria-label', labels.close);
      if (previousButton) previousButton.setAttribute('aria-label', labels.previous);
      if (nextButton) nextButton.setAttribute('aria-label', labels.next);
      if (caption) {
        caption.id = 'lightbox-caption';
        caption.setAttribute('aria-live', 'polite');
      }
      if (count) count.setAttribute('aria-live', 'polite');

      return true;
    }

    function rememberTrigger(trigger) {
      const element = trigger && typeof trigger.get === 'function' ? trigger.get(0) : trigger;
      if (element instanceof Element && element.matches('a[data-lightbox]')) {
        lastTrigger = element;
      }
    }

    function focusCloseWhenReady(attempt) {
      if (!isOpen) return;

      configureDialog();
      const dialog = getDialog();
      const closeButton = dialog && dialog.querySelector('.lb-close');
      if (isVisible(closeButton)) {
        closeButton.focus({ preventScroll: true });
        return;
      }

      if (attempt < 40) {
        focusTimer = window.setTimeout(function () {
          focusCloseWhenReady(attempt + 1);
        }, 100);
      } else if (dialog) {
        (getFocusableControls()[0] || dialog).focus({ preventScroll: true });
      }
    }

    window.lightbox.option({ albumLabel: labels.count });
    configureDialog();
    window.setTimeout(configureDialog, 0);

    document.addEventListener('click', function (event) {
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest('a[data-lightbox]');
      if (!trigger) return;

      rememberTrigger(trigger);
      if (restoreTimer) window.clearTimeout(restoreTimer);
      configureDialog();
    }, true);

    const originalStart = window.lightbox.start;
    window.lightbox.start = function (trigger) {
      rememberTrigger(trigger);
      isOpen = true;
      if (restoreTimer) window.clearTimeout(restoreTimer);
      if (focusTimer) window.clearTimeout(focusTimer);

      originalStart.apply(window.lightbox, arguments);
      configureDialog();
      focusTimer = window.setTimeout(function () {
        focusCloseWhenReady(0);
      }, 50);
    };

    const originalEnd = window.lightbox.end;
    window.lightbox.end = function () {
      const trigger = lastTrigger;
      isOpen = false;
      if (focusTimer) window.clearTimeout(focusTimer);
      originalEnd.call(window.lightbox);
      if (restoreTimer) window.clearTimeout(restoreTimer);

      window.setTimeout(configureDialog, 600);
      restoreTimer = window.setTimeout(function () {
        if (trigger && document.contains(trigger)) trigger.focus();
      }, 650);
    };

    document.addEventListener('keydown', function (event) {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        window.lightbox.end();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = getDialog();
      const focusableControls = getFocusableControls();
      if (!dialog || !focusableControls.length) {
        event.preventDefault();
        if (dialog) dialog.focus({ preventScroll: true });
        return;
      }

      const first = focusableControls[0];
      const last = focusableControls[focusableControls.length - 1];
      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || !dialog.contains(activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }, true);

    document.addEventListener('focusin', function (event) {
      const dialog = getDialog();
      if (!isOpen || !dialog || dialog.contains(event.target)) return;

      (getFocusableControls()[0] || dialog).focus({ preventScroll: true });
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightboxAccessibility);
  } else {
    initLightboxAccessibility();
  }
})();
