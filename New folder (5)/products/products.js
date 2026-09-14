const SIROS_MODELS = [
  ['nexa','Nexa','12×10',51000], ['zl','ZL','12×10',53000], ['zl-pro','ZL Pro','12×10',55000],
  ['ac1','AC1','12×12',68000], ['iq','IQ','12×12',69000], ['cruze','Cruze','12×12',71000],
  ['e4','E4','12×12',71000], ['cruz-pro','Cruz Pro','12×12',71000], ['ol','OL','12×12',68000],
  ['ola','OLA','12×12',69000], ['iq-pro','IQ Pro','12×12',71000], ['loder','Loder','12×12',null]
].map(([slug,name,tyre,base], index) => ({
  slug, name, tyre, base, index: index + 1,
  rates: base === null ? [] : [
    ['Lead · 72V 45AH', '120 km / charge', base + 9000], ['Lead · 72V 32AH', '90 km / charge', base],
    ['Lead · 60V 32AH', '70 km / charge', base - 2500], ['Lead · 48V 32AH', '50 km / charge', base - 5000],
    ['Lithium · 60V 32AH', '80 km / charge', base + 13000], ['Lithium · 60V 45AH', '110 km / charge', base + 22000]
  ]
}));
const inr = value => `₹${new Intl.NumberFormat('en-IN').format(value)}`;
const SIROS_ICONS = {
  battery: '<svg viewBox="0 0 64 64"><rect x="20" y="8" width="24" height="42" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="27" y="4" width="10" height="6" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M34 18 L26 32 H32 L28 44 L40 28 H33 Z" fill="currentColor" stroke="none"/></svg>',
  clock: '<svg viewBox="0 0 64 64"><circle cx="32" cy="34" r="21" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="34" x2="32" y2="21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="32" y1="34" x2="41" y2="34" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="25" y1="8" x2="30" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="39" y1="8" x2="34" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  display: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M20 40 A16 16 0 0 1 44 40" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="40" x2="38" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="40" r="2.2" fill="currentColor"/></svg>',
  tyre: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="6.5" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="10" x2="32" y2="17" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="47" x2="32" y2="54" stroke="currentColor" stroke-width="2.5"/><line x1="10" y1="32" x2="17" y2="32" stroke="currentColor" stroke-width="2.5"/><line x1="47" y1="32" x2="54" y2="32" stroke="currentColor" stroke-width="2.5"/><line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" stroke-width="2.5"/><line x1="43" y1="43" x2="48" y2="48" stroke="currentColor" stroke-width="2.5"/><line x1="48" y1="16" x2="43" y2="21" stroke="currentColor" stroke-width="2.5"/><line x1="21" y1="43" x2="16" y2="48" stroke="currentColor" stroke-width="2.5"/></svg>',
  alarm: '<svg viewBox="0 0 64 64"><path d="M32 8 L50 15 V30 C50 42 42 50 32 56 C22 50 14 42 14 30 V15 Z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M25 30 a7 7 0 1 1 14 0" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="24" y="30" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>',
  range: '<svg viewBox="0 0 64 64"><path d="M40 16 A18 18 0 1 0 40 48" fill="none" stroke="currentColor" stroke-width="2.5"/><polyline points="40,10 40,16 34,16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="40,48 40,54 34,54" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  payload: '<svg viewBox="0 0 64 64"><path d="M24 24 a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 24 h28 l3 28 a4 4 0 0 1 -4 4 H19 a4 4 0 0 1 -4 -4 Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>',
  headlamp: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="14" ry="16" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="8" x2="32" y2="14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="14" x2="22" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="14" x2="42" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  disc: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="21" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="9" x2="32" y2="17" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="47" x2="32" y2="55" stroke="currentColor" stroke-width="2.5"/><line x1="9" y1="32" x2="17" y2="32" stroke="currentColor" stroke-width="2.5"/><line x1="47" y1="32" x2="55" y2="32" stroke="currentColor" stroke-width="2.5"/></svg>',
  usb: '<svg viewBox="0 0 64 64"><rect x="26" y="8" width="12" height="8" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="32" y1="16" x2="32" y2="44" stroke="currentColor" stroke-width="2.5"/><path d="M20 44 v6 h24 v-6" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="20" y1="44" x2="20" y2="34" stroke="currentColor" stroke-width="2.5"/><line x1="44" y1="44" x2="44" y2="34" stroke="currentColor" stroke-width="2.5"/></svg>',
  reverse: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="23" fill="none" stroke="currentColor" stroke-width="2.5"/><text x="32" y="41" font-size="24" font-weight="700" font-family="Manrope, Arial, sans-serif" text-anchor="middle" fill="currentColor">R</text></svg>'
};
const siFi = (icon, labelHtml) => `<li class="siros-features__item"><span class="siros-features__ring">${SIROS_ICONS[icon]}</span><span class="siros-features__label">${labelHtml}</span></li>`;
const buildFeatureIcons = model => {
  const tyreLabel = model.tyre.replace('x', '×') + ' in';
  const items = [
    siFi('battery', '<b>Battery Warranty</b><small>Li-ion 3 yrs &middot; Lead 1 yr</small>'),
    siFi('clock', '<b>Charging</b><small>Li-ion 3–4 hrs &middot; Lead 7–8 hrs</small>'),
    siFi('display', '<b>LED Display</b>'),
    siFi('tyre', `<b>Tyre</b><small>${tyreLabel}</small>`),
    siFi('alarm', '<b>Anti-Theft Alarm</b>'),
    siFi('range', '<b>Range</b><small>50–140 km*</small>'),
    siFi('payload', '<b>Payload</b><small>150 kg</small>'),
    siFi('headlamp', '<b>LED Headlamp</b><small>with DRL</small>'),
    siFi('disc', '<b>Front Disc Brake</b>'),
    siFi('usb', '<b>USB Charging</b>'),
    siFi('reverse', '<b>Reverse Mode</b>'),
  ];
  return `<div class="siros-features__head"><p class="siros-features__eyebrow">Salient features</p><h2 class="siros-features__title">What comes standard.</h2></div><ul class="siros-features__grid">${items.join('')}</ul>`;
};
const revealFeatureIcons = container => {
  const items = container.querySelectorAll('.siros-features__item');
  if (!items.length) return;
  items.forEach((el, i) => el.style.setProperty('--d', (i % 6) * 0.06 + 's'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduced) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.2 });
  items.forEach(el => io.observe(el));
};
const grid = document.querySelector('#productGrid');
if (grid) grid.innerHTML = SIROS_MODELS.map(model => {
  const tag = model.slug === 'loder' ? 'Electric utility vehicle' : 'Electric scooter';
  const startPrice = model.rates.length ? Math.min(...model.rates.map(r => r[2])) : model.base;
  const priceLine = startPrice ? `<strong>${inr(startPrice)}</strong><em>· EMI available</em>` : `<strong>On enquiry</strong>`;
  return `<div class="product-card product-card--${model.slug}">
    <div class="product-card__top">
      <span class="product-card__number">${String(model.index).padStart(2, '0')}</span>
      <span class="product-card__tag">${tag}</span>
    </div>
    <div class="product-card__media">
      <img src="assets/products/${model.slug}.jpg" alt="SIROS ${model.name}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{innerHTML:'Product imagery&lt;br&gt;coming soon'}))" />
    </div>
    <h3>${model.name}</h3>
    <ul class="product-card__specs">
      <li><span>Range</span><b>50–140 km*</b></li>
      <li><span>Battery</span><b>Lead & lithium</b></li>
      <li><span>Tyre</span><b>${model.tyre}</b></li>
    </ul>
    <div class="product-card__price">
      <span>Starting at</span>
      ${priceLine}
    </div>
    <a class="product-card__cta" href="products/detail.html?model=${model.slug}">View full specification <i aria-hidden="true">→</i></a>
  </div>`;
}).join('');
const detail = document.querySelector('#productDetail');
if (detail) {
  const slug = new URLSearchParams(location.search).get('model');
  const model = SIROS_MODELS.find(item => item.slug === slug) || SIROS_MODELS[0];
  document.title = `SIROS ${model.name} — EV World`;
  document.querySelector('#detailKicker').textContent = `SIROS electric vehicle / ${String(model.index).padStart(2, '0')}`;
  document.querySelector('#detailName').innerHTML = `${model.name}<span>Electric, for the everyday.</span>`;
  document.querySelector('#detailIntro').textContent = `Explore ${model.name} configurations and choose the battery range that fits your everyday route.`;
  document.querySelector('.detail-cta').href = `mailto:info@sirosvehicles.com?subject=${encodeURIComponent(`${model.name} price enquiry`)}`;
  document.querySelector('#emiLink').href = `mailto:info@sirosvehicles.com?subject=${encodeURIComponent(`${model.name} EMI enquiry`)}`;
  const rateStart = model.rates.length ? inr(Math.min(...model.rates.map(rate => rate[2]))) : 'On enquiry';
  const range = model.rates.length ? '50–140 km*' : 'Up to 140 km*';
  document.querySelector('#detailSpecs').innerHTML = `<div><span>Tyre size</span><strong>${model.tyre}</strong></div><div><span>Range choices</span><strong>${range}</strong></div><div><span>Battery choices</span><strong>Lead & lithium</strong></div><div><span>Charging</span><strong>Li-ion: 3–4 hrs** &middot; Lead: 7–8 hrs**</strong></div><div><span>${model.rates.length ? 'Rates start at' : 'Current rate'}</span><strong>${rateStart}</strong></div>`;
  document.querySelector('#rateRows').innerHTML = model.rates.length ? model.rates.map(([battery, range, rate]) => `<tr><td>${battery}</td><td>${range}</td><td>${inr(rate)}</td></tr>`).join('') : '<tr><td colspan="3">Loder pricing is confirmed directly by SIROS.</td></tr>';
  const featureIconsEl = document.querySelector('#featureIcons');
  if (featureIconsEl) {
    featureIconsEl.innerHTML = buildFeatureIcons(model);
    revealFeatureIcons(featureIconsEl);
  }
}
