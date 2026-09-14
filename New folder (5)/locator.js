const formatINR = (value) => `₹${new Intl.NumberFormat('en-IN').format(value)}`;

/* ---------------------------------------------------------------------
   EMI calculator
   ------------------------------------------------------------------- */
(function emiCalculator() {
  const slider = document.querySelector('#emiPrice');
  const output = document.querySelector('#emiPriceValue');
  const tenureEl = document.querySelector('#emiTenure');
  const resultEl = document.querySelector('#emiResult');
  if (!slider || !tenureEl || !resultEl || typeof SIROS_EMI_TABLE === 'undefined') return;

  // Which tenure is selected persists across price changes where possible,
  // so nudging the price slider doesn't silently reset the visitor's choice.
  let selectedMonths = null;

  function bandFor(price) {
    return SIROS_EMI_TABLE.find((b) => b.price === price);
  }

  function renderTenure(band) {
    const available = band.plans.map((p) => p.months);
    if (!available.includes(selectedMonths)) {
      selectedMonths = available[0];
    }
    tenureEl.innerHTML = band.plans
      .map(
        (p) => `<button type="button" data-months="${p.months}" class="${p.months === selectedMonths ? 'is-active' : ''}" aria-pressed="${p.months === selectedMonths}">${p.months} mo</button>`
      )
      .join('');
  }

  function renderResult(band) {
    const plan = band.plans.find((p) => p.months === selectedMonths) || band.plans[0];
    const tornNote = band.plans.length < 3
      ? `<p class="emi__result-note">The source sheet is torn at ${formatINR(band.price)} — only the ${band.plans[0].months}-month plan survived. Ask SIROS for the others.</p>`
      : '';

    resultEl.innerHTML = `
      <span class="emi__result-label">You'll pay · ${plan.months}-month plan</span>
      <div class="emi__result-amount">${formatINR(plan.emi)}<span>per month</span></div>
      <div class="emi__result-stats">
        <div class="emi__result-stat">
          <span class="emi__result-stat-label">On-road price</span>
          <span class="emi__result-stat-value">${formatINR(band.price)}</span>
        </div>
        <div class="emi__result-stat">
          <span class="emi__result-stat-label">Down payment</span>
          <span class="emi__result-stat-value">${formatINR(plan.dp)}</span>
        </div>
      </div>
      ${tornNote}`;
  }

  function render() {
    const price = Number(slider.value);
    output.textContent = formatINR(price);

    const band = bandFor(price);
    if (!band) {
      tenureEl.innerHTML = '';
      resultEl.innerHTML = '<p class="emi__result-empty">No reference plan recorded for this price yet — ask SIROS directly.</p>';
      return;
    }

    renderTenure(band);
    renderResult(band);
  }

  slider.addEventListener('input', render);
  tenureEl.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-months]');
    if (!btn) return;
    selectedMonths = Number(btn.dataset.months);
    render();
  });

  render();
})();

/* ---------------------------------------------------------------------
   Dealer search — all 28 dealers are visible by default, grouped by
   state (Rajasthan, then Madhya Pradesh) so the section never opens
   on an empty box. Typing a town/firm name or picking a single state
   collapses that grouping into one flat, filtered list.
   ------------------------------------------------------------------- */
(function dealerLocator() {
  const searchInput = document.querySelector('#dealerSearch');
  const stateSelect = document.querySelector('#dealerState');
  const resultsEl = document.querySelector('#dealerResults');
  const metaEl = document.querySelector('#dealerMeta');
  if (!searchInput || !resultsEl || typeof SIROS_DEALERS === 'undefined') return;

  const STATE_NAMES = { rj: 'Rajasthan', mp: 'Madhya Pradesh' };
  const STATE_ORDER = ['rj', 'mp'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMql = window.matchMedia('(max-width: 760px)');

  function matches(dealer, query) {
    if (!query) return true;
    const haystack = [dealer.firm, dealer.contact, dealer.town, dealer.address, dealer.pin]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  }

  function dealerCard(dealer, index) {
    const title = dealer.town || dealer.firm || 'SIROS dealer';
    const showFirmLine = dealer.firm && dealer.firm !== title;
    const mapQuery = encodeURIComponent(
      [dealer.firm, dealer.address, dealer.pin].filter(Boolean).join(', ')
    );
    const delay = reducedMotion ? '' : `style="--i:${(index % 8) * 45}ms"`;
    return `
      <div class="dealer-card" ${delay}>
        <div class="dealer-card__top">
          <h3>${title}</h3>
          <span class="dealer-card__state">${STATE_NAMES[dealer.state] || dealer.state}</span>
        </div>
        ${showFirmLine || dealer.contact ? `<p class="dealer-card__contact">${[dealer.firm, dealer.contact].filter(Boolean).join(' · ')}</p>` : ''}
        ${dealer.address ? `<address>${dealer.address}${dealer.pin ? ` — ${dealer.pin}` : ''}</address>` : ''}
        <div class="dealer-card__row">
          <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" rel="noopener">Get directions <span>↗</span></a>
        </div>
      </div>`;
  }

  function groupBlock(stateCode, dealers) {
    const start = groupBlock._offset || 0;
    const html = `
      <div class="locator__group">
        <div class="locator__group-head">
          <h3>${STATE_NAMES[stateCode] || stateCode}</h3>
          <span>${dealers.length} dealer${dealers.length === 1 ? '' : 's'}</span>
        </div>
        <div class="locator__results">${dealers.map((d, i) => dealerCard(d, start + i)).join('')}</div>
      </div>`;
    groupBlock._offset = start + dealers.length;
    return html;
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const state = stateSelect.value;
    const browsingAll = !query && state === 'all';

    // On phones, dumping all 28 dealers before anyone has typed anything is
    // just a long scroll of cards nobody asked for. Ask for a search or a
    // state first there; desktop keeps the full grouped browse-everything view.
    if (browsingAll && mobileMql.matches) {
      metaEl.textContent = '28 dealers across Rajasthan & Madhya Pradesh';
      resultsEl.innerHTML = `
        <div class="locator__empty">
          <strong>Search to find your nearest dealer</strong>
          Type a town, firm or dealer name above, or choose a state, to see matching dealers.
        </div>`;
      return;
    }

    const matched = SIROS_DEALERS.filter((d) => (state === 'all' || d.state === state) && matches(d, query));

    if (!matched.length) {
      metaEl.textContent = 'No matches';
      resultsEl.innerHTML = `
        <div class="locator__empty">
          <strong>No dealers found</strong>
          Try a different spelling, or search by state instead of town.
        </div>`;
      return;
    }

    metaEl.textContent = query || state !== 'all'
      ? `${matched.length} dealer${matched.length === 1 ? '' : 's'} found`
      : `${matched.length} dealers across ${STATE_ORDER.filter((s) => matched.some((d) => d.state === s)).map((s) => STATE_NAMES[s]).join(' & ')}`;

    // Group by state only in the unfiltered, "browse everything" view —
    // a single state or an active search reads better as one flat list.
    if (browsingAll) {
      groupBlock._offset = 0;
      resultsEl.innerHTML = STATE_ORDER
        .map((code) => matched.filter((d) => d.state === code))
        .filter((group) => group.length)
        .map((group) => groupBlock(group[0].state, group))
        .join('');
    } else {
      resultsEl.innerHTML = `<div class="locator__results">${matched.map((d, i) => dealerCard(d, i)).join('')}</div>`;
    }
  }

  searchInput.addEventListener('input', render);
  stateSelect.addEventListener('change', render);
  if (typeof mobileMql.addEventListener === 'function') {
    mobileMql.addEventListener('change', render);
  } else if (typeof mobileMql.addListener === 'function') {
    mobileMql.addListener(render);
  }
  render();
})();
