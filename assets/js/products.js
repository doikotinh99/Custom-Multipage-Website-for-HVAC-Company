(function checkLegacyInspect() {
  const params = new URLSearchParams(window.location.search);
  const legacyInspect = params.get('inspect') || params.get('id');
  if (legacyInspect) {
    window.location.href = 'product-detail.html?id=' + encodeURIComponent(legacyInspect);
  }
})();

let currentCategory = 'all';
let currentBrand = 'all';
let currentSearch = '';
let currentSort = 'default';

document.addEventListener('DOMContentLoaded', () => {
  initCatalogToolbar();
  renderCatalog();
  initSizingCalculator();
  initQuoteModal();
});

function generateStarHtml(rating) {
  const rounded = Math.round(rating);
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      starsHtml += '<span class="star-filled">&#9733;</span>';
    } else {
      starsHtml += '<span class="star-empty">&#9733;</span>';
    }
  }
  return starsHtml;
}

function renderCatalog() {
  const grid = document.querySelector('#productsCatalogGrid');
  const countBadge = document.querySelector('#catalogCountBadge');
  const emptyState = document.querySelector('#catalogEmptyState');
  if (!grid) return;

  let filtered = HVAC_PRODUCTS.filter(product => {
    
    if (currentCategory !== 'all' && product.category !== currentCategory) {
      return false;
    }
    
    if (currentBrand !== 'all' && product.brand.toLowerCase() !== currentBrand.toLowerCase()) {
      return false;
    }
    
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchName = (product.name || '').toLowerCase().includes(q);
      const matchBrand = (product.brand || '').toLowerCase().includes(q);
      const matchCat = (product.category || '').toLowerCase().includes(q);
      const matchSpot = (product.spot_text || '').toLowerCase().includes(q);
      const matchPh1 = (product.placeholders?.TextPlaceHolder1 || '').toLowerCase().includes(q);
      const matchPh2 = (product.placeholders?.TextPlaceHolder2 || '').toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCat && !matchSpot && !matchPh1 && !matchPh2) {
        return false;
      }
    }
    return true;
  });

  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => (Number(a.price_from) || 0) - (Number(b.price_from) || 0));
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => (Number(b.price_from) || 0) - (Number(a.price_from) || 0));
  } else if (currentSort === 'rating-desc') {
    filtered.sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });
  } else if (currentSort === 'name-asc') {
    filtered.sort((a, b) => (a.brand + ' ' + a.name).localeCompare(b.brand + ' ' + b.name));
  }

  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} of ${HVAC_PRODUCTS.length} products`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  } else {
    if (emptyState) emptyState.style.display = 'none';
  }

  grid.innerHTML = filtered.map(product => {
    const priceText = product.variants && product.variants.length > 0
      ? `From $${Number(product.price_from).toFixed(2)}`
      : (product.price_from ? `$${Number(product.price_from).toFixed(2)}` : 'Request Quote');

    const promoNotice = product.is_promo && product.promo_text
      ? `<div style="background:rgba(255,0,127,0.12); border:1px solid rgba(255,0,127,0.3); border-radius:4px; padding:4px 8px; font-size:0.75rem; color:#ff6584; margin-bottom:10px; font-weight:700;">${product.promo_text}</div>`
      : '';

    const variantBadge = product.variants && product.variants.length > 0
      ? `<div style="font-size:0.75rem; color:var(--rich-blue-electric); margin-bottom:8px; font-weight:600;">${product.variants.length} Sizes/Options Available</div>`
      : '';

    return `
      <article class="card card-interactive product-listing-card" data-category="${product.category}" style="display:flex; flex-direction:column; overflow:hidden; padding:0; background:rgba(14,30,64,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:12px; transition:transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;">
        <div class="product-card-thumb" style="background:#ffffff; padding:16px; text-align:center; position:relative; border-bottom:1px solid rgba(255,255,255,0.08); height:210px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
          <span class="card-tag ${product.tagClass}" style="position:absolute; top:12px; left:12px; z-index:2; box-shadow:0 2px 8px rgba(0,0,0,0.18); font-size:0.72rem; padding:4px 10px;">${product.tag}</span>
          <a href="product-detail.html?id=${product.id}" style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;" aria-label="View ${product.name}">
            <img src="${product.primaryImage}" alt="${product.name}" style="max-height:100%; max-width:100%; width:auto; height:auto; object-fit:contain; transition:transform 0.35s ease;" onerror="this.src='assets/images/ac-main.svg';" />
          </a>
        </div>

        <div class="product-card-body" style="padding:20px; display:flex; flex-direction:column; flex-grow:1;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:6px;">
            <span style="font-size:0.76rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--rich-blue-electric); font-weight:800;">${product.brand}</span>
            <span style="font-size:0.95rem; font-weight:800; color:#fff;">${priceText}</span>
          </div>

          <h3 class="product-card-title" style="font-size:1.1rem; color:#fff; margin-bottom:8px; line-height:1.3;">
            <a href="product-detail.html?id=${product.id}" style="color:#fff; text-decoration:none; transition:color 0.2s;">
              ${product.name}
            </a>
          </h3>

          <div class="star-rating-display" style="margin-bottom:10px;">
            ${generateStarHtml(product.avgRating)}
            <span class="rating-score-num">${product.avgRating}</span>
            <span class="rating-count-text">(${product.reviewCount} ${product.reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>

          <p class="product-card-desc" style="font-size:0.85rem; color:var(--text-light); line-height:1.5; margin-bottom:12px; flex-grow:1;">
            ${product.spot_text || product.placeholders.TextPlaceHolder1}
          </p>

          ${promoNotice}
          ${variantBadge}

          <div class="product-card-footer" style="margin-top:auto; display:flex; gap:8px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.06);">
            <a href="product-detail.html?id=${product.id}" class="btn btn-salmon btn-sm" style="flex:1; text-align:center; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
              <svg class="svg-icon" style="width:14px; height:14px;"><use href="#icon-eye"></use></svg>
              Details &amp; Reviews &rarr;
            </a>
            <button type="button" class="btn btn-outline btn-sm btn-request-quote" data-product-name="${product.brand} - ${product.name}">
              Quote
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('.btn-request-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.querySelector('#quoteModal');
      const modalProductName = document.querySelector('#modalProductName');
      const modalProductField = document.querySelector('#modalProductField');
      const pName = btn.getAttribute('data-product-name') || 'Selected HVAC Equipment';

      if (modalProductName) modalProductName.textContent = pName;
      if (modalProductField) modalProductField.value = pName;
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
}

function initCatalogToolbar() {
  const searchInput = document.querySelector('#catalogSearchInput');
  const searchClear = document.querySelector('#catalogSearchClear');
  const sortSelect = document.querySelector('#catalogSortSelect');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const brandPills = document.querySelectorAll('.brand-filter-pill');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim();
      if (searchClear) {
        searchClear.style.display = currentSearch.length > 0 ? 'block' : 'none';
      }
      renderCatalog();
    });
  }

  if (searchClear && searchInput) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      searchClear.style.display = 'none';
      renderCatalog();
      searchInput.focus();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCatalog();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      renderCatalog();
    });
  });

  brandPills.forEach(pill => {
    pill.addEventListener('click', () => {
      brandPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentBrand = pill.getAttribute('data-brand') || 'all';
      renderCatalog();
    });
  });
}

function initQuoteModal() {
  const modal = document.querySelector('#quoteModal');
  const closeBtn = document.querySelector('#closeQuoteModal');
  const modalProductName = document.querySelector('#modalProductName');
  const modalProductField = document.querySelector('#modalProductField');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  const modalForm = document.querySelector('#modalQuoteForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const alertBox = modalForm.querySelector('.form-alert');
      const submitBtn = modalForm.querySelector('button[type="submit"]');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Calculating Quote...';
      }

      setTimeout(() => {
        if (alertBox) {
          alertBox.className = 'form-alert success';
          alertBox.innerHTML = '<svg class="svg-icon" style="color:#34d399; margin-right:6px;"><use href="#icon-check-circle"></use></svg> <strong>Estimate Sent!</strong> We have reserved your Chicago rebate package. Our HVAC specialist will contact you shortly.';
        }
        modalForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Free Quote Request';
        }
      }, 700);
    });
  }
}

function initSizingCalculator() {
  const slider = document.querySelector('#homeSizeSlider');
  const sqftDisplay = document.querySelector('#calcSquareFootageDisplay');
  const coolingEl = document.querySelector('#calcCoolingTonnage');
  const heatingEl = document.querySelector('#calcHeatingBTU');
  const savingsEl = document.querySelector('#calcAnnualSavings');
  const rebateEl = document.querySelector('#calcRebateAmount');

  if (!slider) return;

  function updateEstimates(val) {
    if (sqftDisplay) sqftDisplay.textContent = Number(val).toLocaleString() + ' sq ft';

    let cooling = '2.0 Tons';
    let heating = '45,000 BTU';
    let savings = '$380 / yr';
    let rebate = '$1,000+';

    if (val <= 1400) {
      cooling = '2.0 Tons';
      heating = '45,000 BTU';
      savings = '$380 / yr';
      rebate = '$1,000+';
    } else if (val <= 2000) {
      cooling = '2.5 Tons';
      heating = '60,000 BTU';
      savings = '$490 / yr';
      rebate = '$1,200+';
    } else if (val <= 2600) {
      cooling = '3.0 Tons';
      heating = '70,000 BTU';
      savings = '$620 / yr';
      rebate = '$1,400+';
    } else if (val <= 3300) {
      cooling = '3.5 Tons';
      heating = '85,000 BTU';
      savings = '$760 / yr';
      rebate = '$1,800+';
    } else if (val <= 4000) {
      cooling = '4.0 Tons';
      heating = '100,000 BTU';
      savings = '$920 / yr';
      rebate = '$2,000+';
    } else {
      cooling = '5.0 Tons (Dual Zone)';
      heating = '120,000 BTU';
      savings = '$1,180 / yr';
      rebate = '$2,500+';
    }

    if (coolingEl) coolingEl.textContent = cooling;
    if (heatingEl) heatingEl.textContent = heating;
    if (savingsEl) savingsEl.textContent = savings;
    if (rebateEl) rebateEl.textContent = rebate;
  }

  slider.addEventListener('input', (e) => {
    updateEstimates(e.target.value);
  });
}
