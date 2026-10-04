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
    const mobileMenuQuery = window.matchMedia('(max-width: 768px)');
    const getMenuFocusableElements = () => Array.from(nav.querySelectorAll('a[href], button:not([disabled])'));
    const updateMenuAccessibility = (isOpen) => {
      const isHidden = mobileMenuQuery.matches && !isOpen;
      nav.toggleAttribute('inert', isHidden);
      nav.setAttribute('aria-hidden', String(isHidden));
    };
    const closeMenu = ({ restoreFocus = true } = {}) => {
      const wasOpen = nav.classList.contains('active');
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', t('open'));
      if (backdrop) backdrop.classList.remove('show');
      document.body.style.overflow = '';
      updateMenuAccessibility(false);

      if (restoreFocus && wasOpen && mobileMenuQuery.matches) {
        requestAnimationFrame(() => toggle.focus({ preventScroll: true }));
      }
    };
    const openMenu = () => {
      nav.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', t('close'));
      if (backdrop) backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
      updateMenuAccessibility(true);

      requestAnimationFrame(() => {
        const drawerClose = nav.querySelector('.drawer-close');
        const firstFocusable = drawerClose || getMenuFocusableElements()[0];
        if (firstFocusable) firstFocusable.focus({ preventScroll: true });
      });
    };
    window.closeDrawer = () => closeMenu({ restoreFocus: false });

    toggle.addEventListener('click', () => {
      if (nav.classList.contains('active')) {
        closeMenu({ restoreFocus: false });
      } else {
        openMenu();
      }
    });

    const drawerClose = document.querySelector('.drawer-close');
    if (drawerClose) {
      drawerClose.addEventListener('click', closeMenu);
    }

    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu({ restoreFocus: false });
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeMenu);
    }

    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('active')) return;
      const clickedInsideMenu = nav.contains(e.target);
      const clickedToggle = toggle.contains(e.target);
      if (!clickedInsideMenu && !clickedToggle) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (!nav.classList.contains('active')) return;

      if (e.key === 'Escape') {
        closeMenu();
        return;
      }

      if (e.key !== 'Tab') return;
      const focusable = getMenuFocusableElements();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    mobileMenuQuery.addEventListener('change', (event) => {
      if (!event.matches) {
        closeMenu({ restoreFocus: false });
      } else {
        updateMenuAccessibility(nav.classList.contains('active'));
      }
    });
    updateMenuAccessibility(nav.classList.contains('active'));
  }

/* ===================== HERO HEADER: HOME PAGES ===================== */
  if (document.body.classList.contains('home-page')) {
    const updateImmersiveHeader = () => {
      document.body.classList.toggle('is-hero-header-scrolled', window.scrollY > 16);
    };

    updateImmersiveHeader();
    window.addEventListener('scroll', updateImmersiveHeader, { passive: true });
  }

/* ===================== DROPDOWN LINGUA ===================== */
  const langDropdown = document.querySelector('.language-dropdown');
  if (langDropdown) {
    const btn = langDropdown.querySelector('.dropdown-toggle');
    const menu = langDropdown.querySelector('.dropdown-menu');
    if (btn && menu) {
      if (!menu.id) menu.id = 'language-menu';
      btn.setAttribute('aria-controls', menu.id);
      btn.setAttribute('aria-haspopup', 'true');
      btn.setAttribute('aria-expanded', 'false');
      const closeLanguageMenu = (restoreFocus = false) => {
        const wasOpen = menu.classList.contains('show');
        menu.classList.remove('show');
        btn.setAttribute('aria-expanded', 'false');
        if (restoreFocus && wasOpen) btn.focus({ preventScroll: true });
      };

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = !menu.classList.contains('show');
        menu.classList.toggle('show', willOpen);
        btn.setAttribute('aria-expanded', String(willOpen));
      });
      document.addEventListener('click', () => {
        closeLanguageMenu();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !menu.classList.contains('show')) return;
        event.preventDefault();
        closeLanguageMenu(true);
      });
    }
  }

/* ===================== LAZY IMAGES ===================== */
  const lazyImages = document.querySelectorAll("img[data-src][loading='lazy']");
  if (lazyImages.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
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
    const localDateKey = (date) => [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
    const today = new Date();
    const todayKey = localDateKey(today);
    arrivo.min = todayKey;
    partenza.min = todayKey;

    const dateRangeTrigger = document.getElementById('date-range-trigger');
    if (document.body.classList.contains('home-page') && dateRangeTrigger) {
      initDateRangePicker(arrivo, partenza, dateRangeTrigger);
    } else {
      arrivo.addEventListener('change', function () {
        if (arrivo.value) {
          const selectedArrival = new Date(arrivo.value + 'T00:00:00');
          selectedArrival.setDate(selectedArrival.getDate() + 1);
          const firstCheckout = localDateKey(selectedArrival);
          partenza.min = firstCheckout;
          if (!partenza.value || partenza.value < firstCheckout) partenza.value = firstCheckout;
        }
      });
    }
  }
}); 

/* ===================== DATE RANGE: HOME PAGES ===================== */
function initDateRangePicker(arrivo, partenza, trigger) {
  const picker = document.getElementById('date-range-picker');
  const value = document.getElementById('date-range-value');
  const monthLabel = document.getElementById('date-range-month-label');
  const days = document.getElementById('date-range-calendar-days');
  const status = document.getElementById('date-range-status');
  const nativeFields = document.getElementById('date-range-native-fields');
  const dateRangeLabel = document.getElementById('date-range-label');
  const form = trigger.closest('form');
  const field = trigger.closest('.date-range-field');
  const previousMonthButton = picker && picker.querySelector('[data-calendar-action="previous"]');
  const nextMonthButton = picker && picker.querySelector('[data-calendar-action="next"]');

  if (!picker || !value || !monthLabel || !days || !status || !form || !field || !previousMonthButton || !nextMonthButton) return;

  // Keep native date inputs as the no-JavaScript fallback, then enhance them.
  if (nativeFields) nativeFields.hidden = true;
  if (dateRangeLabel) dateRangeLabel.hidden = false;
  arrivo.required = false;
  partenza.required = false;
  trigger.hidden = false;
  status.hidden = false;

  const dateRangeText = {
    it: {
      placeholder: 'Seleziona arrivo e partenza', arrival: 'Arrivo: {date}. Seleziona la partenza',
      selected: 'Date selezionate: dal {start} al {end}.', startSelected: 'Arrivo selezionato. Ora scegli la data di partenza.',
      previous: 'Mese precedente', next: 'Mese successivo', missing: 'Seleziona sia la data di arrivo sia la data di partenza.'
    },
    en: {
      placeholder: 'Select check-in and check-out', arrival: 'Check-in: {date}. Select check-out',
      selected: 'Selected dates: {start} to {end}.', startSelected: 'Check-in selected. Now choose a check-out date.',
      previous: 'Previous month', next: 'Next month', missing: 'Select both a check-in and a check-out date.'
    },
    fr: {
      placeholder: 'Choisissez l’arrivée et le départ', arrival: 'Arrivée : {date}. Choisissez le départ',
      selected: 'Dates sélectionnées : du {start} au {end}.', startSelected: 'Arrivée sélectionnée. Choisissez maintenant la date de départ.',
      previous: 'Mois précédent', next: 'Mois suivant', missing: 'Sélectionnez la date d’arrivée et la date de départ.'
    },
    de: {
      placeholder: 'An- und Abreise auswählen', arrival: 'Anreise: {date}. Abreise auswählen',
      selected: 'Ausgewählte Daten: {start} bis {end}.', startSelected: 'Anreise ausgewählt. Wählen Sie jetzt das Abreisedatum.',
      previous: 'Vorheriger Monat', next: 'Nächster Monat', missing: 'Wählen Sie sowohl ein Anreise- als auch ein Abreisedatum.'
    },
    es: {
      placeholder: 'Selecciona llegada y salida', arrival: 'Llegada: {date}. Selecciona la salida',
      selected: 'Fechas seleccionadas: del {start} al {end}.', startSelected: 'Llegada seleccionada. Ahora elige la fecha de salida.',
      previous: 'Mes anterior', next: 'Mes siguiente', missing: 'Selecciona tanto la fecha de llegada como la de salida.'
    },
    sk: {
      placeholder: 'Vyberte príchod a odchod', arrival: 'Príchod: {date}. Vyberte odchod',
      selected: 'Vybrané termíny: od {start} do {end}.', startSelected: 'Príchod je vybraný. Teraz vyberte dátum odchodu.',
      previous: 'Predchádzajúci mesiac', next: 'Nasledujúci mesiac', missing: 'Vyberte dátum príchodu aj odchodu.'
    },
    hu: {
      placeholder: 'Válassza ki a dátumokat', arrival: 'Érkezés: {date}. Válassza ki a távozást',
      selected: 'Kiválasztott dátumok: {start} - {end}.', startSelected: 'Érkezés kiválasztva. Most válassza ki a távozás dátumát.',
      previous: 'Előző hónap', next: 'Következő hónap', missing: 'Válassza ki az érkezés és távozás dátumát is.'
    },
  ro: {
    placeholder: 'Selectează sosirea și plecarea', arrival: 'Sosire: {date}. Selectează plecarea',
    selected: 'Date selectate: de la {start} până la {end}.', startSelected: 'Sosirea a fost selectată. Acum alege data plecării.',
    previous: 'Luna anterioară', next: 'Luna următoare', missing: 'Selectează atât data sosirii, cât și data plecării.'
  },
    pl: {
      placeholder: 'Wybierz przyjazd i wyjazd', arrival: 'Przyjazd: {date}. Wybierz wyjazd',
      selected: 'Wybrane daty: od {start} do {end}.', startSelected: 'Przyjazd wybrany. Teraz wybierz datę wyjazdu.',
      previous: 'Poprzedni miesiąc', next: 'Następny miesiąc', missing: 'Wybierz datę przyjazdu i wyjazdu.'
    }
  }[LANG] || {};
  const dateLocale = document.documentElement.lang || 'it-IT';
  const displayDate = new Intl.DateTimeFormat(dateLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const displayMonth = new Intl.DateTimeFormat(dateLocale, {
    month: 'long',
    year: 'numeric'
  });
  const today = startOfDay(new Date());
  let startDate = parseDateKey(arrivo.value);
  let endDate = parseDateKey(partenza.value);
  let displayedMonth = startDate
    ? new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    : new Date(today.getFullYear(), today.getMonth(), 1);

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function parseDateKey(key) {
    if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const parts = key.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function dateKey(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  function datesMatch(first, second) {
    return first && second && dateKey(first) === dateKey(second);
  }

  function isSameMonth(first, second) {
    return first && second && first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
  }

  function getDateButtons() {
    return Array.from(days.querySelectorAll('.date-range-day'));
  }

  function setRovingTabindex(activeButton) {
    getDateButtons().forEach((button) => {
      button.tabIndex = button === activeButton && !button.disabled ? 0 : -1;
    });
  }

  function getFirstAvailableDateButton() {
    return getDateButtons().find((button) => !button.disabled) || null;
  }

  function getDateButton(date) {
    if (!date || !isSameMonth(date, displayedMonth)) return null;
    return days.querySelector('[data-date="' + dateKey(date) + '"]');
  }

  function focusCalendarDate(preferredDate) {
    const preferredButton = getDateButton(preferredDate);
    const fallbackButton = getFirstAvailableDateButton();
    const target = preferredButton && !preferredButton.disabled ? preferredButton : fallbackButton;
    if (!target) return;

    setRovingTabindex(target);
    target.focus({ preventScroll: true });
  }

  function getPickerFocusableElements() {
    return Array.from(picker.querySelectorAll('button:not(:disabled)'))
      .filter((element) => element.tabIndex >= 0);
  }

  function moveFocusToDate(date) {
    const targetDate = date < today ? today : startOfDay(date);
    if (!isSameMonth(targetDate, displayedMonth)) {
      displayedMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      renderCalendar();
    }
    focusCalendarDate(targetDate);
  }

  function addMonths(date, amount) {
    const targetMonth = new Date(date.getFullYear(), date.getMonth() + amount, 1);
    const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
    return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), Math.min(date.getDate(), lastDay));
  }

  function interpolate(template, values) {
    return template.replace(/\{(date|start|end)\}/g, function (match, key) {
      return values[key] || match;
    });
  }

  function updateValue() {
    status.classList.remove('is-error');

    if (startDate && endDate) {
      value.textContent = displayDate.format(startDate) + ' - ' + displayDate.format(endDate);
      status.textContent = interpolate(dateRangeText.selected, {
        start: displayDate.format(startDate),
        end: displayDate.format(endDate)
      });
    } else if (startDate) {
      value.textContent = interpolate(dateRangeText.arrival, { date: displayDate.format(startDate) });
      status.textContent = dateRangeText.startSelected;
    } else {
      value.textContent = dateRangeText.placeholder;
      status.textContent = '';
    }
  }

  function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const activeDate = document.activeElement && document.activeElement.classList.contains('date-range-day')
      ? parseDateKey(document.activeElement.dataset.date)
      : null;
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    monthLabel.textContent = displayMonth.format(displayedMonth);
    days.innerHTML = '';
    previousMonthButton.disabled = displayedMonth <= currentMonth;
    previousMonthButton.setAttribute('aria-disabled', String(previousMonthButton.disabled));

    const totalCells = firstWeekday + lastDay;
    const totalRows = Math.ceil(totalCells / 7);
    let day = 1;
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex += 1) {
      const row = document.createElement('div');
      row.className = 'date-range-calendar-row';
      row.setAttribute('role', 'row');

      for (let column = 0; column < 7; column += 1) {
        const cell = document.createElement('div');
        const cellIndex = rowIndex * 7 + column;
        cell.className = 'date-range-calendar-cell';
        cell.setAttribute('role', 'gridcell');

        if (cellIndex < firstWeekday || day > lastDay) {
          cell.classList.add('date-range-day-spacer');
          cell.setAttribute('aria-disabled', 'true');
          row.appendChild(cell);
          continue;
        }

        const currentDate = new Date(year, month, day);
        const button = document.createElement('button');
        const isPast = currentDate < today;
        const isInRange = startDate && endDate && currentDate > startDate && currentDate < endDate;

        button.type = 'button';
        button.className = 'date-range-day';
        button.textContent = String(day);
        button.dataset.date = dateKey(currentDate);
        button.setAttribute('aria-label', displayDate.format(currentDate));
        button.tabIndex = -1;

        if (datesMatch(currentDate, startDate)) button.classList.add('is-start');
        if (datesMatch(currentDate, endDate)) button.classList.add('is-end');
        if (isInRange) button.classList.add('is-in-range');
        if (datesMatch(currentDate, today)) {
          button.classList.add('is-today');
          button.setAttribute('aria-current', 'date');
        }
        if (datesMatch(currentDate, startDate) || datesMatch(currentDate, endDate)) {
          button.setAttribute('aria-pressed', 'true');
        }
        if (isPast) {
          button.disabled = true;
          button.setAttribute('aria-disabled', 'true');
          button.classList.add('is-disabled');
        }

        cell.appendChild(button);
        row.appendChild(cell);
        day += 1;
      }
      days.appendChild(row);
    }

    const preferredDate = activeDate && isSameMonth(activeDate, displayedMonth)
      ? activeDate
      : (startDate && isSameMonth(startDate, displayedMonth) ? startDate : today);
    setRovingTabindex(getDateButton(preferredDate) || getFirstAvailableDateButton());
  }

  function showPicker() {
    picker.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    renderCalendar();
    requestAnimationFrame(() => focusCalendarDate(startDate || today));
  }

  function hidePicker() {
    picker.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function selectDate(selectedDate) {
    // Keep invalid dates out even if a button is manipulated outside the normal UI.
    if (selectedDate < today) return;

    if (!startDate || endDate) {
      startDate = selectedDate;
      endDate = null;
    } else if (selectedDate <= startDate) {
      startDate = selectedDate;
      endDate = null;
    } else {
      endDate = selectedDate;
    }

    arrivo.value = startDate ? dateKey(startDate) : '';
    partenza.value = endDate ? dateKey(endDate) : '';
    updateValue();

    if (endDate) {
      hidePicker();
      trigger.focus({ preventScroll: true });
    } else {
      renderCalendar();
      focusCalendarDate(startDate);
    }
  }

  trigger.addEventListener('click', function () {
    if (picker.hidden) {
      showPicker();
    } else {
      hidePicker();
    }
  });

  previousMonthButton.setAttribute('aria-label', dateRangeText.previous);
  nextMonthButton.setAttribute('aria-label', dateRangeText.next);

  picker.addEventListener('click', function (event) {
    // The selected day is redrawn below, so keep this click inside the picker.
    event.stopPropagation();
    const action = event.target.closest('[data-calendar-action]');
    const day = event.target.closest('.date-range-day');

    if (action) {
      const nextMonth = new Date(
        displayedMonth.getFullYear(),
        displayedMonth.getMonth() + (action.dataset.calendarAction === 'next' ? 1 : -1),
        1
      );
      if (nextMonth < new Date(today.getFullYear(), today.getMonth(), 1)) return;
      displayedMonth = nextMonth;
      renderCalendar();
      return;
    }

    if (day) {
      const selectedDate = parseDateKey(day.dataset.date);
      if (selectedDate) selectDate(selectedDate);
    }
  });

  picker.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      hidePicker();
      trigger.focus({ preventScroll: true });
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getPickerFocusableElements();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    const dayButton = event.target.closest('.date-range-day');
    if (!dayButton || dayButton.disabled) return;
    const currentDate = parseDateKey(dayButton.dataset.date);
    if (!currentDate) return;

    let targetDate = null;
    if (event.key === 'ArrowLeft') targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
    if (event.key === 'ArrowRight') targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    if (event.key === 'ArrowUp') targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
    if (event.key === 'ArrowDown') targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7);
    if (event.key === 'Home') targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
    if (event.key === 'End') targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (6 - ((currentDate.getDay() + 6) % 7)));
    if (event.key === 'PageUp') targetDate = addMonths(currentDate, event.shiftKey ? -12 : -1);
    if (event.key === 'PageDown') targetDate = addMonths(currentDate, event.shiftKey ? 12 : 1);

    if (targetDate) {
      event.preventDefault();
      moveFocusToDate(targetDate);
    }
  });

  document.addEventListener('click', function (event) {
    if (!field.contains(event.target)) hidePicker();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !picker.hidden) {
      hidePicker();
      trigger.focus({ preventScroll: true });
    }
  });

  form.addEventListener('submit', function (event) {
    if (startDate && endDate) return;

    event.preventDefault();
    status.classList.add('is-error');
    status.textContent = dateRangeText.missing;
    showPicker();
  });

  updateValue();
  renderCalendar();
}

/* ===================== MAPPA: CARICAMENTO ON CONSENT ===================== */
window.loadMap = function(){
  const mapContainer = document.getElementById('map-placeholder');
  if (!mapContainer) return;
  if (mapContainer.dataset.loaded === 'true') return;
  mapContainer.innerHTML = '<iframe title="Google Maps - Venerdì House" src="https://www.google.com/maps?q=40.56821,8.31988&z=19&output=embed" width="100%" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
  mapContainer.dataset.loaded = 'true';
};

/* ===================== COOKIE BANNER: COMPACT COPY ===================== */
(function () {
  const compactCookieCopy = {
    it: 'Usiamo tecnologie necessarie e, con il consenso, Google Maps.',
    en: 'We use necessary technologies and, with your consent, Google Maps.',
    fr: 'Services nécessaires et Google Maps avec votre accord.',
    de: 'Notwendige Technik und Google Maps nur mit Einwilligung.',
    es: 'Usamos tecnologías necesarias y, con tu consentimiento, Google Maps.',
    sk: 'Používame nevyhnutné technológie a so súhlasom aj Google Maps.',
    hu: 'Szükséges eszközök és Google Térkép az Ön hozzájárulásával.',
    ro: 'Tehnologii necesare și Google Maps cu acordul tău.',
    pl: 'Używamy niezbędnych technologii oraz, za Twoją zgodą, Google Maps.'
  };

  function updateCookieBannerCopy() {
    const banner = document.getElementById('cookie-banner');
    const paragraph = banner && banner.querySelector('p');
    if (!paragraph || !window.matchMedia) return;

    if (!paragraph.dataset.cookieFullHtml) {
      paragraph.dataset.cookieFullHtml = paragraph.innerHTML;
    }

    const isCompact = window.matchMedia('(max-width: 768px)').matches;
    if (isCompact && paragraph.dataset.cookieCopyMode !== 'compact') {
      const privacyLink = paragraph.querySelector('a');
      const compactText = compactCookieCopy[(document.documentElement.lang || 'it').split('-')[0]] || compactCookieCopy.it;

      paragraph.replaceChildren(document.createTextNode(compactText + ' '));
      if (privacyLink) paragraph.append(privacyLink.cloneNode(true));
      paragraph.append(document.createTextNode('.'));
      paragraph.dataset.cookieCopyMode = 'compact';
    } else if (!isCompact && paragraph.dataset.cookieCopyMode === 'compact') {
      paragraph.innerHTML = paragraph.dataset.cookieFullHtml;
      paragraph.dataset.cookieCopyMode = 'full';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateCookieBannerCopy();
    window.addEventListener('resize', updateCookieBannerCopy, { passive: true });
  });
})();

/* ===================== CONSENSO COOKIE (UNIFICATO) ===================== */
(function(){
  const CONSENT_KEY = 'cookieConsent'; // 'accepted' | 'rejected'
  const CONSENT_TS = CONSENT_KEY + '_ts';
  const MAX_AGE_DAYS = 180; // 6 mesi

  function safeStorageGet(key){
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function safeStorageSet(key, value){
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }
  function getConsent(){
    const status = safeStorageGet(CONSENT_KEY);
    const ts = parseInt(safeStorageGet(CONSENT_TS) || '0', 10);
    return { status, ts };
  }
  function setConsent(status){
    safeStorageSet(CONSENT_KEY, status);
    safeStorageSet(CONSENT_TS, Date.now().toString());
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
    const close = document.getElementById('close-cookie-banner');
    const rejectConsent = () => {
      setConsent('rejected');
      banner.style.display = 'none';
      applyConsent();
    };
    if (accept && banner) accept.addEventListener('click', () => { setConsent('accepted'); banner.style.display='none'; applyConsent(); });
    if (reject && banner) reject.addEventListener('click', rejectConsent);
    if (close && banner) close.addEventListener('click', rejectConsent);
    applyConsent();
  });
})(); 
/* =================== FINE CONSENSO COOKIE (UNIFICATO) =================== */


/* === Cookie settings button === */
(function () {
  var btn = document.getElementById('open-cookie-settings');
  var banner = document.getElementById('cookie-banner');
  if (!btn || !banner) return;

  function closeDrawerIfAny() {
    try {
      if (typeof window.closeDrawer === 'function') {
        window.closeDrawer();
        return;
      }

      var drawer = document.getElementById('nav-links');
      var toggle = document.querySelector('.menu-toggle');
      var backdrop = document.getElementById('menu-backdrop');
      var body = document.body;

      if (drawer && drawer.classList.contains('active')) {
        drawer.classList.remove('active');
      }

      if (toggle) {
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-label', t('open'));
      }

      if (backdrop && backdrop.classList.contains('show')) {
        backdrop.classList.remove('show');
      }

      body.style.overflow = '';

    } catch (e) {}
  }

  btn.addEventListener('click', function () {
    closeDrawerIfAny();

    if (banner.parentElement !== document.body) {
      document.body.appendChild(banner);
    }

    banner.style.display = 'block';
    banner.setAttribute('aria-hidden', 'false');
  }, { passive: true });

})();

/* === Cookie banner layout and floating WhatsApp mobile === */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var floating = document.getElementById('floating-whatsapp');
    var banner = document.getElementById('cookie-banner');
    var cookieSettings = document.getElementById('open-cookie-settings');
    if (!banner && !floating) return;

    function bannerVisible() {
      return !!(banner && getComputedStyle(banner).display !== 'none');
    }

    function updatePageOverlays() {
      var cookieBannerOpen = bannerVisible();
      var nearFooter = false;

      document.body.classList.toggle('is-cookie-banner-open', cookieBannerOpen);
      if (cookieBannerOpen && banner) {
        document.documentElement.style.setProperty('--cookie-banner-height', Math.ceil(banner.getBoundingClientRect().height) + 'px');
      } else {
        document.documentElement.style.removeProperty('--cookie-banner-height');
      }

      if (!floating) return;

      floating.style.setProperty('--cookie-offset', '0px');
      floating.classList.toggle('is-hidden-for-cookie', cookieBannerOpen);

      if (cookieSettings) {
        var rect = cookieSettings.getBoundingClientRect();
        nearFooter = rect.top < window.innerHeight && rect.bottom > 0;
        floating.classList.toggle('is-hidden-near-footer', nearFooter);
      }

      var hidden = cookieBannerOpen || nearFooter;
      floating.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      if (hidden) {
        floating.setAttribute('tabindex', '-1');
      } else {
        floating.removeAttribute('tabindex');
      }
    }

    if (banner && 'MutationObserver' in window) {
      new MutationObserver(updatePageOverlays).observe(banner, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    if (banner && 'ResizeObserver' in window) {
      new ResizeObserver(updatePageOverlays).observe(banner);
    }

    window.addEventListener('resize', updatePageOverlays, { passive: true });
    window.addEventListener('scroll', updatePageOverlays, { passive: true });

    updatePageOverlays();
    setTimeout(updatePageOverlays, 120);
  });
})();
/* === End cookie banner layout and floating WhatsApp mobile === */

/* === Footer current year === */
(function () {
  function updateFooterYear() {
    const currentYear = String(new Date().getFullYear());
    document.querySelectorAll('[data-current-year]').forEach(function (element) {
      element.textContent = currentYear;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateFooterYear);
  } else {
    updateFooterYear();
  }
})();
