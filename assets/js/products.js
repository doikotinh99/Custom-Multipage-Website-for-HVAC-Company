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
let currentViewMode = 'grid';
let filterRebatesOnly = false;
let openBranches = new Set(['systems', 'filters', 'parts']);
let currentPage = 1;
const itemsPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
  initRockAutoTree();
  initFacetedFilters();
  initRockAutoSearch();
  initViewModeToggle();
  initSort();
  renderBreadcrumbs();
  renderCatalog();
  initSizingCalculator();
  initQuoteModal();
  initMobileFilterDrawer();
});

function initMobileFilterDrawer() {
  const toggleBtn = document.querySelector('#mobileFilterToggle');
  const closeBtn = document.querySelector('#drawerCloseBtn');
  const backdrop = document.querySelector('#drawerBackdrop');
  const applyBtn = document.querySelector('#applyDrawerBtn');
  const mobileChips = document.querySelectorAll('#mobileCatChips .mobile-cat-chip');

  function openDrawer() {
    document.body.classList.add('rockauto-drawer-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.body.classList.remove('rockauto-drawer-open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      closeDrawer();
      const catalogSection = document.querySelector('#productsCatalogSection');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('rockauto-drawer-open')) {
      closeDrawer();
    }
  });

  mobileChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.getAttribute('data-cat');
      currentCategory = cat;
      currentBrand = 'all';
      currentPage = 1;
      syncMobileCatChips();
      syncFacetedCheckboxes();
      updateTreeActiveStyles();
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  });
}

function syncMobileCatChips() {
  document.querySelectorAll('#mobileCatChips .mobile-cat-chip').forEach(chip => {
    const cat = chip.getAttribute('data-cat');
    if (cat === currentCategory) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function updateMobileFilterBadge() {
  const badge = document.querySelector('#mobileFilterBadge');
  if (!badge) return;
  let count = 0;
  if (currentCategory !== 'all') count++;
  if (currentBrand !== 'all') count++;
  if (filterRebatesOnly) count++;
  if (currentSearch) count++;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function initRockAutoTree() {
  const treeContainer = document.querySelector('#rockAutoTree');
  const resetBtn = document.querySelector('#treeResetBtn');
  const crumbRootBtn = document.querySelector('#crumbRootBtn');
  const emptyResetBtn = document.querySelector('#resetEmptyFiltersBtn');

  if (!treeContainer) return;

  const categories = [
    {
      id: 'systems',
      title: 'Cooling & Heating Systems',
      icon: 'icon-snowflake',
      filter: 'systems'
    },
    {
      id: 'filters',
      title: 'Air Filters & IAQ',
      icon: 'icon-sparkles',
      filter: 'filters'
    },
    {
      id: 'thermostats',
      title: 'Controls & Thermostats',
      icon: 'icon-smartphone',
      filter: 'thermostats'
    },
    {
      id: 'parts',
      title: 'OEM Replacement Parts',
      icon: 'icon-tools',
      filter: 'parts'
    }
  ];

  let treeHtml = '';

  categories.forEach(cat => {
    const catProducts = HVAC_PRODUCTS.filter(p => p.category === cat.filter);
    const brandsMap = {};
    catProducts.forEach(p => {
      if (!brandsMap[p.brand]) brandsMap[p.brand] = [];
      brandsMap[p.brand].push(p);
    });

    const isOpen = openBranches.has(cat.id);

    let childrenHtml = `
      <div class="tree-branch-children">
        <button type="button" class="tree-child-btn ${currentCategory === cat.filter && currentBrand === 'all' ? 'active' : ''}" data-cat="${cat.filter}" data-brand="all">
          <span>All ${cat.title}</span>
          <span class="tree-badge">${catProducts.length}</span>
        </button>
    `;

    for (const [bName, bProds] of Object.entries(brandsMap)) {
      const isBrandActive = currentCategory === cat.filter && currentBrand.toLowerCase() === bName.toLowerCase();
      childrenHtml += `
        <button type="button" class="tree-child-btn ${isBrandActive ? 'active' : ''}" data-cat="${cat.filter}" data-brand="${bName}">
          <span>${bName}</span>
          <span class="tree-badge">${bProds.length}</span>
        </button>
      `;
    }

    childrenHtml += `</div>`;

    treeHtml += `
      <div class="tree-branch ${isOpen ? 'open' : ''}" id="branch-${cat.id}">
        <button type="button" class="tree-branch-header ${currentCategory === cat.filter ? 'active' : ''}" data-cat="${cat.filter}">
          <span class="tree-branch-title">
            <svg class="svg-icon" style="width:15px; height:15px;"><use href="#${cat.icon}"></use></svg>
            <span>${cat.title}</span>
          </span>
          <span style="display:flex; align-items:center; gap:6px;">
            <span class="tree-badge">${catProducts.length}</span>
            <span class="tree-branch-indicator">&#9656;</span>
          </span>
        </button>
        ${childrenHtml}
      </div>
    `;
  });

  treeContainer.innerHTML = treeHtml;

  treeContainer.querySelectorAll('.tree-branch-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const branch = header.closest('.tree-branch');
      const cat = header.getAttribute('data-cat');
      const branchId = branch.id.replace('branch-', '');

      branch.classList.toggle('open');
      if (branch.classList.contains('open')) {
        openBranches.add(branchId);
      } else {
        openBranches.delete(branchId);
      }

      currentCategory = cat;
      currentBrand = 'all';
      currentPage = 1;
      syncMobileCatChips();
      syncFacetedCheckboxes();
      renderBreadcrumbs();
      renderCatalog();
      updateTreeActiveStyles();
      updateMobileFilterBadge();
    });
  });

  treeContainer.querySelectorAll('.tree-child-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCategory = btn.getAttribute('data-cat');
      currentBrand = btn.getAttribute('data-brand');
      currentPage = 1;
      syncMobileCatChips();
      syncFacetedCheckboxes();
      renderBreadcrumbs();
      renderCatalog();
      updateTreeActiveStyles();
      updateMobileFilterBadge();
    });
  });

  function resetAll() {
    currentCategory = 'all';
    currentBrand = 'all';
    currentSearch = '';
    filterRebatesOnly = false;
    currentSort = 'default';
    currentPage = 1;

    const sInput = document.querySelector('#catalogSearchInput');
    if (sInput) sInput.value = '';
    const sClear = document.querySelector('#catalogSearchClear');
    if (sClear) sClear.style.display = 'none';

    const sMobile = document.querySelector('#catalogSearchInputMobile');
    if (sMobile) sMobile.value = '';
    const sMobileClear = document.querySelector('#catalogSearchClearMobile');
    if (sMobileClear) sMobileClear.style.display = 'none';

    const rCb = document.querySelector('#filterRebatesOnly');
    if (rCb) rCb.checked = false;

    document.querySelectorAll('.brand-facet-cb, .cat-facet-cb').forEach(cb => cb.checked = false);

    const sortSel = document.querySelector('#catalogSortSelect');
    if (sortSel) sortSel.value = 'default';

    syncMobileCatChips();
    syncFacetedCheckboxes();
    renderBreadcrumbs();
    renderCatalog();
    updateTreeActiveStyles();
    updateMobileFilterBadge();
  }

  if (resetBtn) resetBtn.addEventListener('click', resetAll);
  if (crumbRootBtn) crumbRootBtn.addEventListener('click', resetAll);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAll);
}

function updateTreeActiveStyles() {
  document.querySelectorAll('.tree-branch-header').forEach(h => {
    const cat = h.getAttribute('data-cat');
    if (cat === currentCategory) {
      h.classList.add('active');
    } else {
      h.classList.remove('active');
    }
  });

  document.querySelectorAll('.tree-child-btn').forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    const brand = btn.getAttribute('data-brand');
    if (cat === currentCategory && brand.toLowerCase() === currentBrand.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function initFacetedFilters() {
  const rebatesCb = document.querySelector('#filterRebatesOnly');
  if (rebatesCb) {
    rebatesCb.addEventListener('change', (e) => {
      filterRebatesOnly = e.target.checked;
      currentPage = 1;
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  }

  document.querySelectorAll('.brand-facet-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const checkedBrands = Array.from(document.querySelectorAll('.brand-facet-cb:checked')).map(c => c.value);
      if (checkedBrands.length === 1) {
        currentBrand = checkedBrands[0];
      } else if (checkedBrands.length > 1) {
        currentBrand = 'multi:' + checkedBrands.join(',');
      } else {
        currentBrand = 'all';
      }
      updateTreeActiveStyles();
      currentPage = 1;
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  });

  document.querySelectorAll('.cat-facet-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const checkedCats = Array.from(document.querySelectorAll('.cat-facet-cb:checked')).map(c => c.value);
      if (checkedCats.length === 1) {
        currentCategory = checkedCats[0];
      } else if (checkedCats.length > 1) {
        currentCategory = 'multi:' + checkedCats.join(',');
      } else {
        currentCategory = 'all';
      }
      syncMobileCatChips();
      updateTreeActiveStyles();
      currentPage = 1;
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  });
}

function syncFacetedCheckboxes() {
  document.querySelectorAll('.brand-facet-cb').forEach(cb => {
    if (currentBrand === 'all') {
      cb.checked = false;
    } else if (currentBrand.startsWith('multi:')) {
      const arr = currentBrand.replace('multi:', '').split(',');
      cb.checked = arr.includes(cb.value);
    } else {
      cb.checked = cb.value.toLowerCase() === currentBrand.toLowerCase();
    }
  });

  document.querySelectorAll('.cat-facet-cb').forEach(cb => {
    if (currentCategory === 'all') {
      cb.checked = false;
    } else if (currentCategory.startsWith('multi:')) {
      const arr = currentCategory.replace('multi:', '').split(',');
      cb.checked = arr.includes(cb.value);
    } else {
      cb.checked = cb.value === currentCategory;
    }
  });
}

function initRockAutoSearch() {
  const sDesktop = document.querySelector('#catalogSearchInput');
  const sDesktopClear = document.querySelector('#catalogSearchClear');
  const sMobile = document.querySelector('#catalogSearchInputMobile');
  const sMobileClear = document.querySelector('#catalogSearchClearMobile');

  function handleSearchInput(value) {
    currentSearch = value.trim();
    currentPage = 1;
    if (sDesktop && sDesktop.value !== value) sDesktop.value = value;
    if (sMobile && sMobile.value !== value) sMobile.value = value;

    const hasVal = Boolean(currentSearch);
    if (sDesktopClear) sDesktopClear.style.display = hasVal ? 'block' : 'none';
    if (sMobileClear) sMobileClear.style.display = hasVal ? 'block' : 'none';

    updateMobileFilterBadge();
    renderBreadcrumbs();
    renderCatalog();
  }

  function clearSearch() {
    currentSearch = '';
    currentPage = 1;
    if (sDesktop) sDesktop.value = '';
    if (sMobile) sMobile.value = '';
    if (sDesktopClear) sDesktopClear.style.display = 'none';
    if (sMobileClear) sMobileClear.style.display = 'none';

    updateMobileFilterBadge();
    renderBreadcrumbs();
    renderCatalog();
  }

  if (sDesktop) {
    sDesktop.addEventListener('input', (e) => handleSearchInput(e.target.value));
  }
  if (sMobile) {
    sMobile.addEventListener('input', (e) => handleSearchInput(e.target.value));
  }
  if (sDesktopClear) {
    sDesktopClear.addEventListener('click', () => {
      clearSearch();
      if (sDesktop) sDesktop.focus();
    });
  }
  if (sMobileClear) {
    sMobileClear.addEventListener('click', () => {
      clearSearch();
      if (sMobile) sMobile.focus();
    });
  }
}

function initViewModeToggle() {
  const btnGrid = document.querySelector('#viewBtnGrid');
  const btnList = document.querySelector('#viewBtnList');

  if (btnGrid && btnList) {
    btnGrid.addEventListener('click', () => {
      currentViewMode = 'grid';
      btnGrid.classList.add('active');
      btnList.classList.remove('active');
      renderCatalog();
    });

    btnList.addEventListener('click', () => {
      currentViewMode = 'list';
      btnList.classList.add('active');
      btnGrid.classList.remove('active');
      renderCatalog();
    });
  }
}

function initSort() {
  const sortSelect = document.querySelector('#catalogSortSelect');
  if (!sortSelect) return;
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    renderCatalog();
  });
}

function renderBreadcrumbs() {
  const container = document.querySelector('#rockAutoBreadcrumbs');
  if (!container) return;

  const categoryNames = {
    systems: 'Cooling & Heating Systems',
    filters: 'Air Filters & IAQ',
    thermostats: 'Controls & Thermostats',
    parts: 'OEM Replacement Parts'
  };

  let html = `
    <button type="button" class="breadcrumb-root-btn" id="crumbRootBtn">
      <svg class="svg-icon" style="width:14px; height:14px;"><use href="#icon-home"></use></svg>
      <span>Catalog Root</span>
    </button>
  `;

  if (currentCategory !== 'all') {
    if (currentCategory.startsWith('multi:')) {
      html += `
        <span class="breadcrumb-sep">&gt;</span>
        <span class="breadcrumb-crumb-chip">
          Multiple Categories
          <button type="button" onclick="clearCategoryFilter()">&times;</button>
        </span>
      `;
    } else {
      const cLabel = categoryNames[currentCategory] || currentCategory;
      html += `
        <span class="breadcrumb-sep">&gt;</span>
        <span class="breadcrumb-crumb-chip">
          ${cLabel}
          <button type="button" onclick="clearCategoryFilter()">&times;</button>
        </span>
      `;
    }
  }

  if (currentBrand !== 'all') {
    if (currentBrand.startsWith('multi:')) {
      html += `
        <span class="breadcrumb-sep">&gt;</span>
        <span class="breadcrumb-crumb-chip">
          Multiple Brands
          <button type="button" onclick="clearBrandFilter()">&times;</button>
        </span>
      `;
    } else {
      html += `
        <span class="breadcrumb-sep">&gt;</span>
        <span class="breadcrumb-crumb-chip">
          ${currentBrand}
          <button type="button" onclick="clearBrandFilter()">&times;</button>
        </span>
      `;
    }
  }

  if (filterRebatesOnly) {
    html += `
      <span class="breadcrumb-sep">&gt;</span>
      <span class="breadcrumb-crumb-chip" style="border-color:rgba(52,211,153,0.4); background:rgba(52,211,153,0.12);">
        Rebates Eligible
        <button type="button" onclick="clearRebatesFilter()">&times;</button>
      </span>
    `;
  }

  if (currentSearch) {
    html += `
      <span class="breadcrumb-sep">&gt;</span>
      <span class="breadcrumb-crumb-chip" style="border-color:rgba(255,101,80,0.4); background:rgba(255,101,80,0.12);">
        Query: "${currentSearch}"
        <button type="button" onclick="clearSearchFilter()">&times;</button>
      </span>
    `;
  }

  container.innerHTML = html;

  const rootBtn = container.querySelector('#crumbRootBtn');
  if (rootBtn) {
    rootBtn.addEventListener('click', () => {
      document.querySelector('#treeResetBtn')?.click();
    });
  }
}

window.clearCategoryFilter = function() {
  currentCategory = 'all';
  currentPage = 1;
  syncMobileCatChips();
  syncFacetedCheckboxes();
  updateTreeActiveStyles();
  renderBreadcrumbs();
  renderCatalog();
  updateMobileFilterBadge();
};

window.clearBrandFilter = function() {
  currentBrand = 'all';
  currentPage = 1;
  syncFacetedCheckboxes();
  updateTreeActiveStyles();
  renderBreadcrumbs();
  renderCatalog();
  updateMobileFilterBadge();
};

window.clearRebatesFilter = function() {
  filterRebatesOnly = false;
  currentPage = 1;
  const cb = document.querySelector('#filterRebatesOnly');
  if (cb) cb.checked = false;
  renderBreadcrumbs();
  renderCatalog();
  updateMobileFilterBadge();
};

window.clearSearchFilter = function() {
  currentSearch = '';
  currentPage = 1;
  const sDesktop = document.querySelector('#catalogSearchInput');
  if (sDesktop) sDesktop.value = '';
  const sDesktopClear = document.querySelector('#catalogSearchClear');
  if (sDesktopClear) sDesktopClear.style.display = 'none';
  const sMobile = document.querySelector('#catalogSearchInputMobile');
  if (sMobile) sMobile.value = '';
  const sMobileClear = document.querySelector('#catalogSearchClearMobile');
  if (sMobileClear) sMobileClear.style.display = 'none';
  renderBreadcrumbs();
  renderCatalog();
  updateMobileFilterBadge();
};

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
    if (currentCategory !== 'all') {
      if (currentCategory.startsWith('multi:')) {
        const cats = currentCategory.replace('multi:', '').split(',');
        if (!cats.includes(product.category)) return false;
      } else {
        if (product.category !== currentCategory) return false;
      }
    }

    if (currentBrand !== 'all') {
      if (currentBrand.startsWith('multi:')) {
        const brands = currentBrand.replace('multi:', '').split(',').map(b => b.toLowerCase());
        if (!brands.includes(product.brand.toLowerCase())) return false;
      } else {
        if (product.brand.toLowerCase() !== currentBrand.toLowerCase()) return false;
      }
    }

    if (filterRebatesOnly) {
      const isRebate = (product.tag && product.tag.toLowerCase().includes('rebate')) ||
                       (product.promo_description && product.promo_description.toLowerCase().includes('rebate')) ||
                       (product.name && (product.name.includes('Furnace') || product.name.includes('Boiler') || product.name.includes('Condenser') || product.name.includes('Heat Pump')));
      if (!isRebate) return false;
    }

    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchName = (product.name || '').toLowerCase().includes(q);
      const matchBrand = (product.brand || '').toLowerCase().includes(q);
      const matchCat = (product.category || '').toLowerCase().includes(q);
      const matchSpot = (product.spot_text || '').toLowerCase().includes(q);
      const matchEff = (product.efficiency || '').toLowerCase().includes(q);
      const matchTag = (product.tag || '').toLowerCase().includes(q);
      const matchPh1 = (product.placeholders?.TextPlaceHolder1 || '').toLowerCase().includes(q);
      const matchPh2 = (product.placeholders?.TextPlaceHolder2 || '').toLowerCase().includes(q);
      const matchSpecAir = (product.specs?.airflow || '').toLowerCase().includes(q);
      const matchSpecDim = (product.specs?.dimensions || '').toLowerCase().includes(q);
      
      if (!matchName && !matchBrand && !matchCat && !matchSpot && !matchEff && !matchTag && !matchPh1 && !matchPh2 && !matchSpecAir && !matchSpecDim) {
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

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  if (currentPage < 1) {
    currentPage = 1;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginated = filtered.slice(startIndex, endIndex);

  if (countBadge) {
    if (totalItems === 0) {
      countBadge.textContent = 'Showing 0 products';
    } else {
      countBadge.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalItems} products`;
    }
  }

  if (totalItems === 0) {
    grid.innerHTML = '';
    renderPagination(0, 0);
    if (emptyState) emptyState.style.display = 'block';
    return;
  } else {
    if (emptyState) emptyState.style.display = 'none';
  }

  if (currentViewMode === 'grid') {
    grid.className = 'grid-3';
    grid.innerHTML = paginated.map(product => {
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
          <div class="product-card-thumb" style="background:#ffffff; padding:16px; text-align:center; position:relative; border-bottom:1px solid rgba(255,255,255,0.08); height:200px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
            <span class="card-tag ${product.tagClass}" style="position:absolute; top:10px; left:10px; z-index:2; box-shadow:0 2px 8px rgba(0,0,0,0.18); font-size:0.72rem; padding:4px 9px;">${product.tag}</span>
            <a href="product-detail.html?id=${product.id}" style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;" aria-label="View ${product.name}">
              <img src="${product.primaryImage}" alt="${product.name}" style="max-height:100%; max-width:100%; width:auto; height:auto; object-fit:contain; transition:transform 0.35s ease;" onerror="this.src='assets/images/ac-main.svg';" />
            </a>
          </div>

          <div class="product-card-body" style="padding:18px; display:flex; flex-direction:column; flex-grow:1;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:6px;">
              <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--rich-blue-electric); font-weight:800;">${product.brand}</span>
              <span style="font-size:0.95rem; font-weight:800; color:#fff;">${priceText}</span>
            </div>

            <h3 class="product-card-title" style="font-size:1.05rem; color:#fff; margin-bottom:8px; line-height:1.3;">
              <a href="product-detail.html?id=${product.id}" style="color:#fff; text-decoration:none; transition:color 0.2s;">
                ${product.name}
              </a>
            </h3>

            <div class="star-rating-display" style="margin-bottom:10px;">
              ${generateStarHtml(product.avgRating)}
              <span class="rating-score-num">${product.avgRating}</span>
              <span class="rating-count-text">(${product.reviewCount} ${product.reviewCount === 1 ? 'review' : 'reviews'})</span>
            </div>

            <p class="product-card-desc" style="font-size:0.83rem; color:var(--text-light); line-height:1.5; margin-bottom:12px; flex-grow:1;">
              ${product.spot_text || product.placeholders?.TextPlaceHolder1 || ''}
            </p>

            ${promoNotice}
            ${variantBadge}

            <div class="product-card-footer" style="margin-top:auto; display:flex; gap:8px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.06);">
              <a href="product-detail.html?id=${product.id}" class="btn btn-salmon btn-sm" style="flex:1; text-align:center; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                <svg class="svg-icon" style="width:14px; height:14px;"><use href="#icon-eye"></use></svg>
                View Specs
              </a>
              <button type="button" class="btn btn-outline btn-sm btn-request-quote" data-product-name="${product.brand} - ${product.name}">
                Quote
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  } else {
    grid.className = 'product-list-view';
    grid.innerHTML = paginated.map(product => {
      const priceText = product.variants && product.variants.length > 0
        ? `From $${Number(product.price_from).toFixed(2)}`
        : (product.price_from ? `$${Number(product.price_from).toFixed(2)}` : 'Wholesale Quote');

      const shortId = product.id.substring(0, 8).toUpperCase();

      return `
        <article class="product-list-row" data-category="${product.category}">
          <div class="list-row-thumb">
            <a href="product-detail.html?id=${product.id}" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
              <img src="${product.primaryImage}" alt="${product.name}" onerror="this.src='assets/images/ac-main.svg';" />
            </a>
          </div>

          <div class="list-row-info">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="list-row-brand">${product.brand}</span>
              <span class="list-row-partno">SKU: #${shortId}</span>
            </div>
            <h3 class="list-row-title">
              <a href="product-detail.html?id=${product.id}">${product.name}</a>
            </h3>
            <div class="star-rating-display">
              ${generateStarHtml(product.avgRating)}
              <span class="rating-score-num">${product.avgRating}</span>
              <span class="rating-count-text">(${product.reviewCount} reviews)</span>
            </div>
            <div class="list-row-badges">
              <span class="list-badge ${product.tagClass}">${product.tag}</span>
              ${product.efficiency ? `<span class="list-badge-eff">${product.efficiency}</span>` : ''}
            </div>
          </div>

          <div class="list-row-specs">
            <div class="spec-mini-item">
              <strong>Airflow / Stage:</strong>
              <span>${product.specs?.stages || 'Standard'}</span>
            </div>
            <div class="spec-mini-item">
              <strong>Sound Rating:</strong>
              <span>${product.specs?.soundLevel || 'Quiet Low-dB'}</span>
            </div>
            <div class="spec-mini-item">
              <strong>Dimensions:</strong>
              <span>${product.specs?.dimensions || 'Standard Housing'}</span>
            </div>
            <div class="spec-mini-item">
              <strong>Orientation:</strong>
              <span>${product.specs?.airflow || 'Multi-Position'}</span>
            </div>
          </div>

          <div class="list-row-actions">
            <div class="list-row-price">${priceText}</div>
            <a href="product-detail.html?id=${product.id}" class="btn btn-salmon btn-sm" style="width:100%; justify-content:center; gap:6px;">
              <svg class="svg-icon" style="width:14px; height:14px;"><use href="#icon-eye"></use></svg>
              View Specs
            </a>
            <button type="button" class="btn btn-outline btn-sm btn-request-quote" style="width:100%; justify-content:center;" data-product-name="${product.brand} - ${product.name}">
              Instant Quote
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  renderPagination(totalItems, totalPages);

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

function initQuoteModal() {
  const modal = document.querySelector('#quoteModal');
  const closeBtn = document.querySelector('#closeQuoteModal');
  const form = document.querySelector('#modalQuoteForm');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const alertBox = form.querySelector('.form-alert');
      const submitBtn = form.querySelector('button[type="submit"]');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';
      }

      setTimeout(() => {
        if (alertBox) {
          alertBox.style.display = 'block';
          alertBox.className = 'form-alert success';
          alertBox.innerHTML = '<svg class="svg-icon" style="color:#34d399; margin-right:6px;"><use href="#icon-check-circle"></use></svg> <strong>Quote Request Received!</strong> A certified Chicago HVAC specialist will contact you with exact installation rebate pricing within 15 minutes.';
        }
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Quote Request';
        }

        setTimeout(() => {
          closeModal();
          if (alertBox) alertBox.style.display = 'none';
        }, 2200);
      }, 700);
    });
  }
}

function initSizingCalculator() {
  const slider = document.querySelector('#homeSqftSlider');
  const valDisplay = document.querySelector('#sqftDisplay');
  const coolingEl = document.querySelector('#calcCoolingSize');
  const heatingEl = document.querySelector('#calcHeatingSize');
  const savingsEl = document.querySelector('#calcEstSavings');
  const rebateEl = document.querySelector('#calcEstRebate');

  if (!slider) return;

  function updateEstimates(val) {
    if (valDisplay) valDisplay.textContent = Number(val).toLocaleString() + ' sq ft';

    let cooling = '2.5 Tons';
    let heating = '60,000 BTU';
    let savings = '$490 / yr';
    let rebate = '$1,200+';

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

function renderPagination(totalItems, totalPages) {
  const container = document.querySelector('#catalogPagination');
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';

  let html = '';

  const isPrevDisabled = currentPage === 1;
  html += `
    <button type="button" class="pagination-btn pagination-prev ${isPrevDisabled ? 'disabled' : ''}" ${isPrevDisabled ? 'disabled' : ''} data-page="${currentPage - 1}" aria-label="Previous Page">
      &larr; Prev
    </button>
  `;

  for (let p = 1; p <= totalPages; p++) {
    const isActive = p === currentPage;
    html += `
      <button type="button" class="pagination-btn ${isActive ? 'active' : ''}" data-page="${p}" aria-label="Page ${p}" ${isActive ? 'aria-current="page"' : ''}>
        ${p}
      </button>
    `;
  }

  const isNextDisabled = currentPage === totalPages;
  html += `
    <button type="button" class="pagination-btn pagination-next ${isNextDisabled ? 'disabled' : ''}" ${isNextDisabled ? 'disabled' : ''} data-page="${currentPage + 1}" aria-label="Next Page">
      Next &rarr;
    </button>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pageNum = parseInt(btn.getAttribute('data-page'), 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
        currentPage = pageNum;
        renderCatalog();
        const catalogSec = document.querySelector('#productsCatalogSection');
        if (catalogSec) {
          catalogSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}
