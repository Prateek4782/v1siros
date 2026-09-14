(function costPlanner() {
  const distance = document.querySelector('#distance');
  const distanceValue = document.querySelector('#distanceValue');
  const petrolCost = document.querySelector('#petrolCost');
  const electricCost = document.querySelector('#electricCost');
  const savingCost = document.querySelector('#savingCost');
  if (!distance || !distanceValue || !petrolCost || !electricCost || !savingCost) return;

  function formatRupees(value) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
  }

  function updatePlanner() {
    const km = Number(distance.value);
    // Transparent illustrative model: 30 commuting days, petrol at ₹2.33/km and electricity at ₹0.27/km.
    const petrol = Math.round(km * 30 * 2.33);
    const electric = Math.round(km * 30 * 0.27);
    distanceValue.textContent = `${km} km / day`;
    petrolCost.textContent = `₹${formatRupees(petrol)}`;
    electricCost.textContent = `₹${formatRupees(electric)}`;
    savingCost.textContent = `₹${formatRupees(petrol - electric)}`;
  }

  distance.addEventListener('input', updatePlanner);
  updatePlanner();
})();

/* ---------------------------------------------------------------------
   Hero film — responsive source swap
   Chooses the phone-shot vertical clip on narrow viewports and the
   original desktop/tablet film everywhere else. Done in JS (not a
   <source media="…"> on the <video>) because that markup-only
   approach is only evaluated once at parse time and, worse, silently
   falls through to the next <source> if the matched one 404s — which
   looks identical to "the mobile clip never showed up". Setting src
   explicitly means a failed load surfaces as a real, debuggable error
   instead of quietly rendering the desktop film on a phone.
   ------------------------------------------------------------------- */
(function heroResponsiveVideo() {
  const video = document.querySelector('.hero__video');
  if (!video || !video.dataset.mobileSrc) return;

  const mql = window.matchMedia('(max-width: 760px)');

  function applySource() {
    const isMobile = mql.matches;
    const variant = isMobile ? 'mobile' : 'desktop';
    if (video.dataset.activeVariant === variant) return;

    const wasPlaying = !video.paused;
    video.innerHTML = '';

    if (isMobile) {
      const mp4 = document.createElement('source');
      mp4.src = video.dataset.mobileSrc;
      mp4.type = 'video/mp4';
      video.appendChild(mp4);
    } else {
      const mp4 = document.createElement('source');
      mp4.src = video.dataset.desktopSrc;
      mp4.type = 'video/mp4';
      video.appendChild(mp4);
      if (video.dataset.desktopSrcWebm) {
        const webm = document.createElement('source');
        webm.src = video.dataset.desktopSrcWebm;
        webm.type = 'video/webm';
        video.appendChild(webm);
      }
    }

    video.dataset.activeVariant = variant;
    video.load();
    if (wasPlaying) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
    }
  }

  applySource();
  // Older Safari only supports addListener/removeListener; feature-detect.
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', applySource);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(applySource);
  }
})();

/* ---------------------------------------------------------------------
   Site-wide vehicle search
   A small overlay, opened from the nav search icon on any page, that
   matches on vehicle name and sends the visitor straight to that
   model's detail page. The model list mirrors the footer's "Vehicles"
   links (the only canonical name → slug mapping available in the
   markup) — add a row here if a new model is added to the footer.
   ------------------------------------------------------------------- */
(function siteSearch() {
  const VEHICLES = [
    { name: 'Nexa', slug: 'nexa' },
    { name: 'ZL', slug: 'zl' },
    { name: 'AC1', slug: 'ac1' },
    { name: 'Loder', slug: 'loder' },
  ];

  const toggle = document.querySelector('#searchToggle');
  const panel = document.querySelector('#siteSearch');
  const input = document.querySelector('#siteSearchInput');
  const closeBtn = document.querySelector('#siteSearchClose');
  const resultsEl = document.querySelector('#siteSearchResults');
  if (!toggle || !panel || !input || !resultsEl) return;

  function detailUrl(slug) {
    return `products/detail.html?model=${slug}`;
  }

  function renderResults(rawQuery) {
    const query = rawQuery.trim().toLowerCase();
    const matched = query ? VEHICLES.filter((v) => v.name.toLowerCase().includes(query)) : VEHICLES;

    if (!matched.length) {
      resultsEl.innerHTML = `<p class="site-search__empty">No vehicle matches “${rawQuery.trim()}”. Try Nexa, ZL, AC1 or Loder.</p>`;
      return;
    }

    resultsEl.innerHTML = matched
      .map(
        (v) => `<a class="site-search__result" href="${detailUrl(v.slug)}"><span>${v.name}</span><small>View model →</small></a>`
      )
      .join('');
  }

  function open() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    input.value = '';
    renderResults('');
    document.documentElement.style.overflow = 'hidden';
    window.setTimeout(() => input.focus(), 20);
  }

  function close() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    if (panel.classList.contains('is-open')) close(); else open();
  });
  closeBtn.addEventListener('click', close);
  panel.addEventListener('click', (event) => { if (event.target === panel) close(); });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) close();
  });
  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const first = resultsEl.querySelector('.site-search__result');
    if (first) window.location.href = first.getAttribute('href');
  });
})();

/* ---------------------------------------------------------------------
   Hero film — loop crossfade
   The source clip is a single continuous take (parts assembling into
   the finished vehicle) that hard-cuts back to its first frame when it
   loops. Rather than let that cut show, we hold on the finished frame
   for a beat and dip through the paper colour before the rebuild
   starts again — the same trick a film edit uses to hide a splice.
   ------------------------------------------------------------------- */
(function heroLoopMask() {
  const video = document.querySelector('.hero__video');
  const mask = document.querySelector('.hero__loopmask');
  if (!video || !mask) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const HOLD_FROM = 7.55; // seconds — start masking before the hard cut
  const RELEASE_BY = 0.5; // seconds — release the mask just after restart

  video.addEventListener('timeupdate', () => {
    const t = video.currentTime;
    if (t >= HOLD_FROM) {
      mask.classList.add('is-visible');
    } else if (t < RELEASE_BY) {
      window.setTimeout(() => mask.classList.remove('is-visible'), 260);
    }
  });
})();

/* ---------------------------------------------------------------------
   Scroll reveal — section choreography
   Reuses the existing `.reveal` keyframe, but gates it behind
   IntersectionObserver instead of firing on load, so type and imagery
   arrive as the visitor scrolls to them rather than all at once.
   ------------------------------------------------------------------- */
(function scrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('is-inview'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );

  targets.forEach((el) => observer.observe(el));

  // Safety net: reveal animations are cosmetic, never load-bearing. If the
  // observer somehow never fires for an element, force it visible after a
  // short delay rather than leaving real content stuck at opacity:0.
  window.setTimeout(() => {
    targets.forEach((el) => el.classList.add('is-inview'));
  }, 2500);
})();

/* ---------------------------------------------------------------------
   Reveal — section choreography lives above; the dealer locator itself
   (search, state filter, grouped/flat rendering, card stagger) is
   handled entirely in locator.js, next to the SIROS_DEALERS data it
   depends on.
   ------------------------------------------------------------------- */

/* ---------------------------------------------------------------------
   Mobile menu — hamburger toggle + slide panel. Previously nav__links
   just had display:none under 760px with no replacement at all.
   ------------------------------------------------------------------- */
(function mobileMenu() {
  const toggle = document.querySelector('#navToggle');
  const menu = document.querySelector('#mobileMenu');
  if (!toggle || !menu) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();

/* ---------------------------------------------------------------------
   FAQ accordion — one open at a time, smooth height via the
   grid-template-rows 0fr/1fr technique (see styles.css .faq__answer).
   ------------------------------------------------------------------- */
(function faqAccordion() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector('.faq__question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      items.forEach((other) => other.querySelector('.faq__question').setAttribute('aria-expanded', 'false'));
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
})();

/* ---------------------------------------------------------------------
   Product carousel — arrow buttons scroll the track by one card's
   width (+ gap) at a time, snapping via CSS scroll-snap; buttons
   disable at each end so it's obvious when there's nothing more
   to scroll to in that direction.
   ------------------------------------------------------------------- */
(function productCarousel() {
  const track = document.querySelector('#productGrid');
  const prevBtn = document.querySelector('#productPrev');
  const nextBtn = document.querySelector('#productNext');
  if (!track || !prevBtn || !nextBtn) return;

  function cardStep() {
    const card = track.querySelector('.product-card');
    if (!card) return track.clientWidth * 0.9;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function updateArrows() {
    const max = track.scrollWidth - track.clientWidth - 1;
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft >= max;
  }

  prevBtn.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: 'smooth' }));
  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);

  // Cards render asynchronously (products.js runs after this file), so
  // wait a tick before measuring scrollWidth for the first time.
  window.setTimeout(updateArrows, 50);
})();
