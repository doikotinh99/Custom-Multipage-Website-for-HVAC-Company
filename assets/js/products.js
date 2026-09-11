(function checkLegacyInspect() {
  const params = new URLSearchParams(window.location.search);
  const legacyInspect = params.get('inspect') || params.get('id');
  if (legacyInspect) {
    window.location.href = 'product-detail.html?id=' + encodeURIComponent(legacyInspect);
  }
})();

let currentSector = 'all';
let currentCategory = 'all';
let currentStage = 'all';
let currentAirflow = 'all';
let selectedAfue = new Set();
let selectedWidths = new Set();
let selectedBtus = new Set();
let selectedBrands = new Set();
let currentSearch = '';
let currentSort = 'default';
let currentViewMode = 'grid';
let filterRebatesOnly = false;
let openBranches = new Set();
let currentPage = 1;
const itemsPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
  initRockAutoTree();
  initFacetedFilters();
  initBrandSelect2();
  initRockAutoSearch();
  initViewModeToggle();
  initSort();
  renderBreadcrumbs();
  renderCatalog();
  initSizingCalculator();
  initQuoteModal();
  initMobileFilterDrawer();
});

function getProductSector(p) {
  const orig = (p.originalCategory || '').toLowerCase();
  return orig.includes('commercial') ? 'commercial' : 'residential';
}

function getProductStage(p) {
  const s = (p.specs && p.specs.stages) || '';
  const lower = s.toLowerCase();
  if (lower.includes('variable')) return 'variable';
  if (lower.includes('two')) return 'two';
  return 'single';
}

function getProductAirflow(p) {
  const a = (p.specs && p.specs.airflow) || '';
  const lower = a.toLowerCase();
  if (lower.includes('downflow')) return 'downflow';
  if (lower.includes('multipoise')) return 'multipoise';
  return 'upflow';
}

function getProductWidth(p) {
  const dim = (p.specs && p.specs.dimensions) || '';
  const m = dim.match(/\d+\.?\d*"/);
  return m ? m[0] : '17.5"';
}

function getProductAfue(p) {
  const eff = p.efficiency || '';
  const m = eff.match(/\d+(?:%|\s*SEER)/);
  return m ? m[0] : '80% AFUE';
}

function getProductBtu(p) {
  const name = (p.name || '').toLowerCase();
  const spot = (p.spot_text || '').toLowerCase();
  const desc = (p.promo_description || '').toLowerCase();
  const allText = name + ' ' + spot + ' ' + desc;
  const m = allText.match(/(\d{2,3})[,.]?000\s*btu/);
  if (m) return parseInt(m[1] + '000', 10);
  if (p.specs && p.specs.dimensions) {
    if (p.specs.dimensions.includes('14.5')) return 30000;
    if (p.specs.dimensions.includes('17.5')) return 40000;
    if (p.specs.dimensions.includes('21')) return 50000;
    if (p.specs.dimensions.includes('24.5')) return 60000;
  }
  return 40000;
}

function isProductRebateEligible(p) {
  const eff = (p.efficiency || '').toLowerCase();
  const promo = (p.promo_title || '').toLowerCase() + ' ' + (p.promo_description || '').toLowerCase();
  return eff.includes('92%') || eff.includes('95%') || eff.includes('96%') || eff.includes('97%') || eff.includes('98%') || eff.includes('16 seer') || promo.includes('rebate') || promo.includes('bundle');
}

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
      if (cat === 'all') {
        currentSector = 'all';
        currentCategory = 'all';
      } else if (cat === 'commercial') {
        currentSector = 'commercial';
        currentCategory = 'all';
      } else {
        currentSector = 'all';
        currentCategory = cat;
      }
      currentStage = 'all';
      currentAirflow = 'all';
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
}

function syncMobileCatChips() {
  document.querySelectorAll('#mobileCatChips .mobile-cat-chip').forEach(chip => {
    const cat = chip.getAttribute('data-cat');
    let isActive = false;
    if (cat === 'all' && currentSector === 'all' && currentCategory === 'all') {
      isActive = true;
    } else if (cat === 'commercial' && currentSector === 'commercial') {
      isActive = true;
    } else if (cat === currentCategory) {
      isActive = true;
    }
    if (isActive) {
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
  if (currentSector !== 'all') count++;
  if (currentCategory !== 'all') count++;
  if (currentStage !== 'all') count++;
  if (currentAirflow !== 'all') count++;
  count += selectedAfue.size;
  count += selectedWidths.size;
  count += selectedBtus.size;
  count += selectedBrands.size;
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

  if (!treeContainer) return;

  const residentialProds = HVAC_PRODUCTS.filter(p => getProductSector(p) === 'residential');
  const commercialProds = HVAC_PRODUCTS.filter(p => getProductSector(p) === 'commercial');
  const specialityProds = HVAC_PRODUCTS.filter(p => p.category === 'parts' || (p.name && p.name.toLowerCase().includes('boiler')));
  const refrigerationProds = HVAC_PRODUCTS.filter(p => p.category === 'systems' && p.originalCategory && p.originalCategory.toLowerCase().includes('coil'));

  const isAllRootActive = currentSector === 'all' && currentCategory === 'all' && currentStage === 'all';

  let treeHtml = `
    <div class="tree-branch ${openBranches.has('branch-res') ? 'open' : ''}" id="branch-res">
      <button type="button" class="tree-branch-header ${currentSector === 'residential' && currentCategory === 'all' ? 'active' : ''}" data-action="sector" data-val="residential">
        <span class="tree-branch-title">
          <svg class="svg-icon" style="width:15px; height:15px; color:var(--electric-salmon);"><use href="#icon-home"></use></svg>
          <span>Residential</span>
        </span>
        <span style="display:flex; align-items:center; gap:6px;">
          <span class="tree-badge">${residentialProds.length}</span>
          <span class="tree-branch-indicator">&#9656;</span>
        </span>
      </button>
      <div class="tree-branch-children">
        <button type="button" class="tree-child-btn ${currentCategory === 'furnaces' ? 'active' : ''}" data-action="category" data-val="furnaces">
          <span>Furnaces &amp; Heating</span>
          <span class="tree-badge">${residentialProds.filter(p => p.category === 'furnaces').length}</span>
        </button>
        <button type="button" class="tree-child-btn ${currentCategory === 'systems' && currentSector === 'residential' ? 'active' : ''}" data-action="category" data-val="systems" data-sector="residential">
          <span>AC &amp; Heat Pumps</span>
          <span class="tree-badge">${residentialProds.filter(p => p.category === 'systems').length}</span>
        </button>
        <button type="button" class="tree-child-btn ${currentCategory === 'thermostats' ? 'active' : ''}" data-action="category" data-val="thermostats">
          <span>Controls &amp; Thermostats</span>
          <span class="tree-badge">${residentialProds.filter(p => p.category === 'thermostats').length}</span>
        </button>
        <button type="button" class="tree-child-btn ${currentCategory === 'filters' && currentSector === 'residential' ? 'active' : ''}" data-action="category" data-val="filters" data-sector="residential">
          <span>Air Filters &amp; IAQ</span>
          <span class="tree-badge">${residentialProds.filter(p => p.category === 'filters').length}</span>
        </button>
      </div>
    </div>

    <div class="tree-branch ${openBranches.has('branch-comm') ? 'open' : ''}" id="branch-comm">
      <button type="button" class="tree-branch-header ${currentSector === 'commercial' ? 'active' : ''}" data-action="sector" data-val="commercial">
        <span class="tree-branch-title">
          <svg class="svg-icon" style="width:15px; height:15px; color:var(--rich-blue-electric);"><use href="#icon-bolt"></use></svg>
          <span>Commercial</span>
        </span>
        <span style="display:flex; align-items:center; gap:6px;">
          <span class="tree-badge">${commercialProds.length}</span>
          <span class="tree-branch-indicator">&#9656;</span>
        </span>
      </button>
      <div class="tree-branch-children">
        <button type="button" class="tree-child-btn ${currentCategory === 'systems' && currentSector === 'commercial' ? 'active' : ''}" data-action="category" data-val="systems" data-sector="commercial">
          <span>Packaged RTU &amp; Boilers</span>
          <span class="tree-badge">${commercialProds.filter(p => p.category === 'systems').length}</span>
        </button>
        <button type="button" class="tree-child-btn ${currentCategory === 'filters' && currentSector === 'commercial' ? 'active' : ''}" data-action="category" data-val="filters" data-sector="commercial">
          <span>Commercial Filtration</span>
          <span class="tree-badge">${commercialProds.filter(p => p.category === 'filters').length}</span>
        </button>
        <button type="button" class="tree-child-btn ${currentCategory === 'parts' && currentSector === 'commercial' ? 'active' : ''}" data-action="category" data-val="parts" data-sector="commercial">
          <span>OEM Replacement Parts</span>
          <span class="tree-badge">${commercialProds.filter(p => p.category === 'parts').length}</span>
        </button>
      </div>
    </div>

    <div class="tree-branch ${openBranches.has('branch-spec') ? 'open' : ''}" id="branch-spec">
      <button type="button" class="tree-branch-header ${currentCategory === 'speciality' ? 'active' : ''}" data-action="category" data-val="parts">
        <span class="tree-branch-title">
          <svg class="svg-icon" style="width:15px; height:15px; color:var(--vibrant-pink);"><use href="#icon-fire"></use></svg>
          <span>Speciality Heating</span>
        </span>
        <span style="display:flex; align-items:center; gap:6px;">
          <span class="tree-badge">${specialityProds.length}</span>
          <span class="tree-branch-indicator">&#9656;</span>
        </span>
      </button>
      <div class="tree-branch-children">
        <button type="button" class="tree-child-btn" data-action="category" data-val="parts">
          <span>Boilers &amp; Radiant</span>
          <span class="tree-badge">${specialityProds.length}</span>
        </button>
      </div>
    </div>

    <div class="tree-branch ${openBranches.has('branch-ref') ? 'open' : ''}" id="branch-ref">
      <button type="button" class="tree-branch-header ${currentCategory === 'refrigeration' ? 'active' : ''}" data-action="category" data-val="systems">
        <span class="tree-branch-title">
          <svg class="svg-icon" style="width:15px; height:15px; color:var(--rich-blue-electric);"><use href="#icon-snowflake"></use></svg>
          <span>Refrigeration</span>
        </span>
        <span style="display:flex; align-items:center; gap:6px;">
          <span class="tree-badge">${refrigerationProds.length}</span>
          <span class="tree-branch-indicator">&#9656;</span>
        </span>
      </button>
      <div class="tree-branch-children">
        <button type="button" class="tree-child-btn" data-action="category" data-val="systems">
          <span>Cooling &amp; Refrigeration Units</span>
          <span class="tree-badge">${refrigerationProds.length}</span>
        </button>
      </div>
    </div>
  `;

  treeContainer.innerHTML = treeHtml;


  treeContainer.querySelectorAll('.tree-branch-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const branch = header.closest('.tree-branch');
      const action = header.getAttribute('data-action');
      const val = header.getAttribute('data-val');
      const branchId = branch ? branch.id : '';

      if (branch) {
        branch.classList.toggle('open');
        if (branch.classList.contains('open')) {
          openBranches.add(branchId);
        } else {
          openBranches.delete(branchId);
        }
      }

      if (action === 'sector') {
        currentSector = val;
        currentCategory = 'all';
        currentStage = 'all';
        currentAirflow = 'all';
      }

      currentPage = 1;
      syncMobileCatChips();
      syncFacetedCheckboxes();
      renderBreadcrumbs();
      renderCatalog();
      updateTreeActiveStyles();
      updateMobileFilterBadge();
    });
  });

  treeContainer.querySelectorAll('.tree-sub-header').forEach(header => {
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const subBranch = header.closest('.tree-sub-branch');
      const action = header.getAttribute('data-action');
      const val = header.getAttribute('data-val');
      const subId = subBranch ? subBranch.id : '';

      if (subBranch) {
        subBranch.classList.toggle('open');
        if (subBranch.classList.contains('open')) {
          openBranches.add(subId);
        } else {
          openBranches.delete(subId);
        }
      }

      if (action === 'category') {
        currentCategory = val;
        currentStage = 'all';
        currentAirflow = 'all';
      }

      currentPage = 1;
      syncMobileCatChips();
      syncFacetedCheckboxes();
      renderBreadcrumbs();
      renderCatalog();
      updateTreeActiveStyles();
      updateMobileFilterBadge();
    });
  });

  treeContainer.querySelectorAll('.tree-sub-leaf').forEach(leaf => {
    leaf.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = leaf.getAttribute('data-action');
      const val = leaf.getAttribute('data-val');

      if (action === 'stage') {
        currentCategory = 'furnaces';
        currentStage = val;
      }

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
      const action = btn.getAttribute('data-action');
      const val = btn.getAttribute('data-val');
      const sector = btn.getAttribute('data-sector');

      if (sector) currentSector = sector;
      if (action === 'category') currentCategory = val;

      currentStage = 'all';
      currentAirflow = 'all';
      currentPage = 1;

      syncMobileCatChips();
      syncFacetedCheckboxes();
      renderBreadcrumbs();
      renderCatalog();
      updateTreeActiveStyles();
      updateMobileFilterBadge();
    });
  });

  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
}

function updateTreeActiveStyles() {
  const treeContainer = document.querySelector('#rockAutoTree');
  if (!treeContainer) return;

  const isAllRoot = currentSector === 'all' && currentCategory === 'all' && currentStage === 'all';

  treeContainer.querySelectorAll('.tree-branch-header').forEach(hdr => {
    const val = hdr.getAttribute('data-val');
    if (val === currentSector && currentCategory === 'all') {
      hdr.classList.add('active');
    } else {
      hdr.classList.remove('active');
    }
  });

  treeContainer.querySelectorAll('.tree-sub-header').forEach(hdr => {
    const val = hdr.getAttribute('data-val');
    if (val === currentCategory && currentStage === 'all') {
      hdr.classList.add('active');
    } else {
      hdr.classList.remove('active');
    }
  });

  treeContainer.querySelectorAll('.tree-sub-leaf').forEach(leaf => {
    const val = leaf.getAttribute('data-val');
    if (val === currentStage) {
      leaf.classList.add('active');
    } else {
      leaf.classList.remove('active');
    }
  });

  treeContainer.querySelectorAll('.tree-child-btn').forEach(btn => {
    const val = btn.getAttribute('data-val');
    const sec = btn.getAttribute('data-sector');
    let active = false;
    if (val === currentCategory) {
      if (!sec || sec === currentSector) active = true;
    }
    if (active) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function initFacetedFilters() {
  const rebateCb = document.querySelector('#filterRebatesOnly');
  if (rebateCb) {
    rebateCb.addEventListener('change', (e) => {
      filterRebatesOnly = e.target.checked;
      currentPage = 1;
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  }

  document.querySelectorAll('.width-facet-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        selectedWidths.add(cb.value);
      } else {
        selectedWidths.delete(cb.value);
      }
      currentPage = 1;
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  });

  document.querySelectorAll('.btu-facet-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        selectedBtus.add(cb.value);
      } else {
        selectedBtus.delete(cb.value);
      }
      currentPage = 1;
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  });

  document.querySelectorAll('.eff-facet-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        selectedAfue.add(cb.value);
      } else {
        selectedAfue.delete(cb.value);
      }
      currentPage = 1;
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  });

  document.querySelectorAll('.brand-facet-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) {
        selectedBrands.add(cb.value);
      } else {
        for (const b of selectedBrands) {
          if (b.toLowerCase() === cb.value.toLowerCase()) {
            selectedBrands.delete(b);
          }
        }
      }
      syncBrandSelect2UI();
      currentPage = 1;
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  });
}

function syncFacetedCheckboxes() {
  const rebateCb = document.querySelector('#filterRebatesOnly');
  if (rebateCb) rebateCb.checked = filterRebatesOnly;

  document.querySelectorAll('.width-facet-cb').forEach(cb => {
    cb.checked = selectedWidths.has(cb.value);
  });

  document.querySelectorAll('.btu-facet-cb').forEach(cb => {
    cb.checked = selectedBtus.has(cb.value);
  });

  document.querySelectorAll('.eff-facet-cb').forEach(cb => {
    cb.checked = selectedAfue.has(cb.value);
  });

  document.querySelectorAll('.brand-facet-cb').forEach(cb => {
    let hasBrand = false;
    selectedBrands.forEach(b => {
      if (b.toLowerCase() === cb.value.toLowerCase()) hasBrand = true;
    });
    cb.checked = hasBrand;
  });

  syncBrandSelect2UI();
}

function resetAllFilters() {
  currentSector = 'all';
  currentCategory = 'all';
  currentStage = 'all';
  currentAirflow = 'all';
  selectedAfue.clear();
  selectedWidths.clear();
  selectedBtus.clear();
  selectedBrands.clear();
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

  const bSearch = document.querySelector('#brandSearchBox');
  if (bSearch && bSearch.value) {
    bSearch.value = '';
    bSearch.dispatchEvent(new Event('input'));
  }

  syncMobileCatChips();
  syncFacetedCheckboxes();
  updateTreeActiveStyles();
  renderBreadcrumbs();
  renderCatalog();
  updateMobileFilterBadge();
}

function initBrandSelect2() {
  const container = document.querySelector('#brandSelect2');
  const control = document.querySelector('#brandSelect2Control');
  const dropdown = document.querySelector('#brandSelect2Dropdown');
  const searchInput = document.querySelector('#brandSearchBox');
  const searchClear = document.querySelector('#brandSearchClear');
  const clearAllBtn = document.querySelector('#brandSelectClearAll');
  const rendered = document.querySelector('#brandSelect2Rendered');
  const alphabetGroups = document.querySelectorAll('.brand-alphabet-group');
  const noResults = document.querySelector('#brandNoResults');

  if (!container || !control || !dropdown) return;

  document.body.appendChild(dropdown);

  function positionDropdown() {
    const rect = control.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
  }

  function openDropdown() {
    container.classList.add('open');
    control.classList.add('open');
    dropdown.classList.add('open');
    dropdown.style.display = 'flex';
    control.setAttribute('aria-expanded', 'true');
    positionDropdown();
    if (searchInput) searchInput.focus();
  }

  function closeDropdown() {
    container.classList.remove('open');
    control.classList.remove('open');
    dropdown.classList.remove('open');
    dropdown.style.display = 'none';
    control.setAttribute('aria-expanded', 'false');
  }

  function toggleDropdown() {
    if (container.classList.contains('open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  control.addEventListener('click', (e) => {
    toggleDropdown();
  });

  control.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && container.classList.contains('open')) {
      closeDropdown();
      control.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (container.classList.contains('open')) positionDropdown();
  });

  const sidebar = document.querySelector('#rockAutoSidebar');
  if (sidebar) {
    sidebar.addEventListener('scroll', () => {
      if (container.classList.contains('open')) positionDropdown();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (searchClear) {
        searchClear.style.display = q ? 'block' : 'none';
      }

      let totalVisible = 0;
      alphabetGroups.forEach(grp => {
        const items = grp.querySelectorAll('.facet-checkbox-item');
        let grpVisible = 0;
        items.forEach(item => {
          const brand = (item.getAttribute('data-brand') || '').toLowerCase();
          if (!q || brand.includes(q)) {
            item.style.display = 'flex';
            grpVisible++;
            totalVisible++;
          } else {
            item.style.display = 'none';
          }
        });
        grp.style.display = grpVisible > 0 ? 'block' : 'none';
      });

      if (noResults) {
        noResults.style.display = totalVisible === 0 ? 'block' : 'none';
      }
    });

    if (searchClear) {
      searchClear.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      });
    }
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedBrands.clear();
      syncFacetedCheckboxes();
      currentPage = 1;
      renderBreadcrumbs();
      renderCatalog();
      updateMobileFilterBadge();
    });
  }

  if (rendered) {
    rendered.addEventListener('click', (e) => {
      const rmBtn = e.target.closest('.select2-tag-remove');
      if (!rmBtn) return;
      e.stopPropagation();
      const b = rmBtn.getAttribute('data-brand');
      if (b) {
        for (const brand of selectedBrands) {
          if (brand.toLowerCase() === b.toLowerCase()) {
            selectedBrands.delete(brand);
            break;
          }
        }
        syncFacetedCheckboxes();
        currentPage = 1;
        renderBreadcrumbs();
        renderCatalog();
        updateMobileFilterBadge();
      }
    });
  }

  syncBrandSelect2UI();
}

function syncBrandSelect2UI() {
  const rendered = document.querySelector('#brandSelect2Rendered');
  const countLabel = document.querySelector('#brandSelectCount');
  const control = document.querySelector('#brandSelect2Control');

  if (countLabel) {
    const sz = selectedBrands.size;
    countLabel.textContent = sz === 0 ? '0 selected' : (sz === 1 ? '1 selected' : sz + ' selected');
  }

  if (control) {
    if (selectedBrands.size > 0) {
      control.classList.add('has-selection');
    } else {
      control.classList.remove('has-selection');
    }
  }

  if (rendered) {
    if (selectedBrands.size === 0) {
      rendered.style.display = 'none';
      rendered.innerHTML = '';
    } else {
      rendered.style.display = 'flex';
      let tagsHtml = '';
      selectedBrands.forEach(b => {
        tagsHtml += `<span class="select2-tag" data-brand="${b}"><span class="select2-tag-label">${b}</span><button type="button" class="select2-tag-remove" data-brand="${b}" aria-label="Remove ${b}">&times;</button></span>`;
      });
      rendered.innerHTML = tagsHtml;
    }
  }
}

function initRockAutoSearch() {
  const searchInput = document.querySelector('#catalogSearchInput');
  const searchClear = document.querySelector('#catalogSearchClear');
  const searchMobile = document.querySelector('#catalogSearchInputMobile');
  const searchMobileClear = document.querySelector('#catalogSearchClearMobile');

  function handleSearch(val) {
    currentSearch = val.trim();
    currentPage = 1;
    if (searchInput && searchInput.value !== val) searchInput.value = val;
    if (searchMobile && searchMobile.value !== val) searchMobile.value = val;

    if (searchClear) searchClear.style.display = currentSearch.length > 0 ? 'block' : 'none';
    if (searchMobileClear) searchMobileClear.style.display = currentSearch.length > 0 ? 'block' : 'none';

    renderCatalog();
    renderBreadcrumbs();
    updateMobileFilterBadge();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  }
  if (searchMobile) {
    searchMobile.addEventListener('input', (e) => handleSearch(e.target.value));
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      handleSearch('');
      if (searchInput) searchInput.focus();
    });
  }
  if (searchMobileClear) {
    searchMobileClear.addEventListener('click', () => {
      handleSearch('');
      if (searchMobile) searchMobile.focus();
    });
  }
}

function initViewModeToggle() {
  const gridBtn = document.querySelector('#viewBtnGrid');
  const listBtn = document.querySelector('#viewBtnList');
  const grid = document.querySelector('#productsCatalogGrid');

  if (!gridBtn || !listBtn || !grid) return;

  gridBtn.addEventListener('click', () => {
    currentViewMode = 'grid';
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
    // Ensure grid layout classes
    grid.classList.remove('product-list-view');
    if (!grid.classList.contains('grid-3')) grid.classList.add('grid-3');
    grid.classList.add('grid-view');
    renderCatalog();
  });

  listBtn.addEventListener('click', () => {
    currentViewMode = 'list';
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
    // Switch to list layout, remove grid classes
    grid.classList.remove('grid-view');
    grid.classList.remove('grid-3');
    grid.classList.add('product-list-view');
    renderCatalog();
  });
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
  const trailContainer = document.querySelector('#breadcrumbTrail');
  if (!trailContainer) return;

  let crumbs = [];
  crumbs.push({ label: 'Heating & Cooling Equipment', action: 'root' });

  if (currentSector === 'residential') {
    crumbs.push({ label: 'Residential', action: 'sector', val: 'residential' });
  } else if (currentSector === 'commercial') {
    crumbs.push({ label: 'Commercial', action: 'sector', val: 'commercial' });
  }

  if (currentCategory !== 'all') {
    let catLabel = currentCategory;
    if (currentCategory === 'furnaces') catLabel = 'Furnaces & Heating';
    if (currentCategory === 'systems') catLabel = 'Air Conditioning & Systems';
    if (currentCategory === 'filters') catLabel = 'Air Filters & IAQ';
    if (currentCategory === 'thermostats') catLabel = 'Controls & Thermostats';
    if (currentCategory === 'parts') catLabel = 'OEM Replacement Parts';
    crumbs.push({ label: catLabel, action: 'category', val: currentCategory });
  }

  if (currentStage !== 'all') {
    let stageLabel = currentStage === 'single' ? 'Single Stage' : currentStage === 'two' ? 'Two Stage' : 'Two Stage Variable';
    crumbs.push({ label: stageLabel, action: 'stage', val: currentStage });
  }

  if (selectedWidths.size > 0) {
    selectedWidths.forEach(w => {
      crumbs.push({ label: w + ' Width', action: 'width', val: w });
    });
  }

  if (selectedBtus.size > 0) {
    selectedBtus.forEach(b => {
      crumbs.push({ label: Number(b).toLocaleString() + ' BTU', action: 'btu', val: b });
    });
  }

  if (selectedAfue.size > 0) {
    selectedAfue.forEach(a => {
      crumbs.push({ label: a === '80%' ? '80% AFUE' : '92%+ AFUE', action: 'afue', val: a });
    });
  }

  if (selectedBrands.size > 0) {
    selectedBrands.forEach(b => {
      crumbs.push({ label: b, action: 'brand', val: b });
    });
  }

  if (filterRebatesOnly) {
    crumbs.push({ label: 'Rebates Qualified', action: 'rebate' });
  }

  if (currentSearch) {
    crumbs.push({ label: '"' + currentSearch + '"', action: 'search' });
  }

  let html = '';
  crumbs.forEach((c, idx) => {
    const isLast = idx === crumbs.length - 1;
    if (idx > 0) {
      html += `<span class="crumb-separator">&rsaquo;</span>`;
    }
    if (isLast && crumbs.length > 1) {
      html += `<span class="crumb-current" aria-current="page">${c.label}</span>`;
    } else {
      html += `
        <button type="button" class="crumb-link" data-action="${c.action}" data-val="${c.val || ''}">
          ${c.label}
        </button>
      `;
    }
  });

  if (crumbs.length > 1) {
    html += `
      <button type="button" class="crumb-link" id="crumbClearAllBtn" style="color:var(--electric-salmon); margin-left:6px;" aria-label="Clear All Filters">
        Clear All &times;
      </button>
    `;
  }

  trailContainer.innerHTML = html;

  trailContainer.querySelectorAll('.crumb-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.getAttribute('data-action');
      const val = btn.getAttribute('data-val');

      if (btn.id === 'crumbClearAllBtn' || act === 'root') {
        resetAllFilters();
        return;
      }
      if (act === 'sector') {
        currentCategory = 'all';
        currentStage = 'all';
        currentAirflow = 'all';
      } else if (act === 'category') {
        currentStage = 'all';
        currentAirflow = 'all';
      } else if (act === 'stage') {
        currentStage = 'all';
      } else if (act === 'width') {
        selectedWidths.delete(val);
      } else if (act === 'btu') {
        selectedBtus.delete(val);
      } else if (act === 'afue') {
        selectedAfue.delete(val);
      } else if (act === 'brand') {
        selectedBrands.delete(val);
      } else if (act === 'rebate') {
        filterRebatesOnly = false;
      } else if (act === 'search') {
        currentSearch = '';
        const sInput = document.querySelector('#catalogSearchInput');
        if (sInput) sInput.value = '';
      }

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

function filterProducts() {
  return HVAC_PRODUCTS.filter(p => {
    const sec = getProductSector(p);
    if (currentSector !== 'all' && sec !== currentSector) {
      return false;
    }

    if (currentCategory !== 'all') {
      if (currentCategory === 'furnaces') {
        const isFurnace = p.category === 'furnaces' || (p.category === 'systems' && (p.name.toLowerCase().includes('furnace') || p.name.toLowerCase().includes('boiler'))) || (p.category === 'parts' && p.originalCategory.toLowerCase().includes('furnace'));
        if (!isFurnace) return false;
      } else if (p.category !== currentCategory) {
        return false;
      }
    }

    if (currentStage !== 'all') {
      const stage = getProductStage(p);
      if (stage !== currentStage) return false;
    }

    if (currentAirflow !== 'all') {
      const airflow = getProductAirflow(p);
      if (airflow !== currentAirflow) return false;
    }

    if (selectedAfue.size > 0) {
      const eff = (p.efficiency || '').toLowerCase();
      let match = false;
      if (selectedAfue.has('80%') && eff.includes('80%')) match = true;
      if (selectedAfue.has('high') && !eff.includes('80%') && !eff.includes('standard')) match = true;
      if (!match) return false;
    }

    if (selectedWidths.size > 0) {
      const w = getProductWidth(p);
      if (!selectedWidths.has(w)) return false;
    }

    if (selectedBtus.size > 0) {
      const btu = getProductBtu(p);
      let match = false;
      for (const targetStr of selectedBtus) {
        const target = parseInt(targetStr, 10);
        if (Math.abs(btu - target) <= 5000) {
          match = true;
          break;
        }
      }
      if (!match) return false;
    }

    if (selectedBrands.size > 0) {
      let match = false;
      for (const b of selectedBrands) {
        const bLower = b.toLowerCase();
        if (p.brand.toLowerCase() === bLower) {
          match = true;
          break;
        }
        if (p.category === 'parts' || p.is_part) {
          const text = ((p.name || '') + ' ' + (p.spot_text || '') + ' ' + (p.originalCategory || '')).toLowerCase();
          if (text.includes('universal') || text.includes(bLower)) {
            match = true;
            break;
          }
        }
      }
      if (!match) return false;
    }

    if (filterRebatesOnly && !isProductRebateEligible(p)) {
      return false;
    }

    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchBrand = (p.brand || '').toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      const matchTag = (p.tag || '').toLowerCase().includes(q);
      const matchSpot = (p.spot_text || '').toLowerCase().includes(q);
      const matchEff = (p.efficiency || '').toLowerCase().includes(q);
      let matchSpecs = false;
      if (p.specs) {
        matchSpecs = Object.values(p.specs).some(val => (val || '').toLowerCase().includes(q));
      }
      if (!matchName && !matchBrand && !matchCat && !matchTag && !matchSpot && !matchEff && !matchSpecs) {
        return false;
      }
    }

    return true;
  });
}

function sortProducts(prods) {
  const sorted = [...prods];
  if (currentSort === 'price-low' || currentSort === 'price-asc') {
    sorted.sort((a, b) => (a.price_from || 0) - (b.price_from || 0));
  } else if (currentSort === 'price-high' || currentSort === 'price-desc') {
    sorted.sort((a, b) => (b.price_from || 0) - (a.price_from || 0));
  } else if (currentSort === 'rating' || currentSort === 'rating-desc') {
    sorted.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
  } else if (currentSort === 'name-asc') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

function renderCatalog() {
  const grid = document.querySelector('#productsCatalogGrid');
  const emptyState = document.querySelector('#catalogEmptyState');
  const countDisplay = document.querySelector('#catalogResultCount');
  if (!grid) return;

  const filtered = filterProducts();
  const sorted = sortProducts(filtered);
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (currentPage > totalPages) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sorted.slice(startIndex, startIndex + itemsPerPage);

  if (countDisplay) {
    if (totalItems === 0) {
      countDisplay.textContent = '0 items found';
    } else {
      const from = startIndex + 1;
      const to = Math.min(startIndex + itemsPerPage, totalItems);
      countDisplay.textContent = 'Showing ' + from + '-' + to + ' of ' + totalItems + ' items';
    }
  }

  if (totalItems === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    renderPagination(0, 0);
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  if (currentViewMode === 'list') {
    grid.innerHTML = paginatedItems.map(p => {
      const hasRebate = isProductRebateEligible(p);
      const stage = getProductStage(p);
      const airflow = getProductAirflow(p);
      const width = getProductWidth(p);
      const stageLabel = stage === 'single' ? 'Single Stage' : stage === 'two' ? 'Two Stage' : 'Variable';
      const airflowLabel = airflow === 'downflow' ? 'Downflow' : 'Upflow';
      const sector = getProductSector(p);

      return `
        <article class="product-list-row" data-id="${p.id}">
          <div class="list-row-top">
            <div class="list-row-thumb">
              <img src="${p.primaryImage}" alt="${p.name}" loading="lazy">
            </div>
            <div class="list-row-info">
              <div class="list-row-brand">${p.brand} &bull; <span style="text-transform:capitalize;">${sector}</span></div>
              <h3 class="list-row-title"><a href="product-detail.html?id=${p.id}" style="text-decoration:none; color:inherit;">${p.name}</a></h3>
              <div style="font-size: 0.8rem; color: #b0c4de; margin-top:4px;">${p.spot_text || p.primaryCaption || 'Smart thermostat with remote access and scheduling'}</div>
              <div class="list-row-badges">
                ${hasRebate ? '<span class="card-tag" style="background:#ff1e8e; color:#fff; padding:3px 9px; border-radius:3px; font-size:0.7rem; font-weight:800;">SPRING SALE</span>' : ''}
                <span class="list-badge-eff">${p.efficiency || 'High-Efficiency'}</span>
              </div>
            </div>
          </div>
          <div class="list-row-specs">
            <div class="spec-mini-item"><strong>Stage</strong><span>${stageLabel}</span></div>
            <div class="spec-mini-item"><strong>Airflow</strong><span>${airflowLabel}</span></div>
            <div class="spec-mini-item"><strong>Width</strong><span>${width}</span></div>
            <div class="spec-mini-item"><strong>BTU</strong><span>${p.btu || 'N/A'}</span></div>
          </div>
          <div class="list-row-actions">
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">From</div>
              <div class="list-row-price">${p.price_from ? '$' + p.price_from.toLocaleString() : '$149.99'}</div>
            </div>
            <div style="display:flex; gap:8px;">
              <a href="product-detail.html?id=${p.id}" class="btn" style="background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.2); padding:6px 12px; border-radius:4px; font-size:0.8rem; display:flex; align-items:center; gap:4px;">
                <svg class="svg-icon" style="width:14px; height:14px;"><use href="#icon-eye"></use></svg>
                Specs
              </a>
              <button type="button" class="btn btn-request-quote" data-id="${p.id}" data-name="${p.name}" style="background:#ff523b; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:0.8rem; font-weight:800;">Quote</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  } else {
    grid.innerHTML = paginatedItems.map(p => {
      const hasRebate = isProductRebateEligible(p);
      const stage = getProductStage(p);
      const airflow = getProductAirflow(p);
      const width = getProductWidth(p);
      const stageLabel = stage === 'single' ? 'Single Stage' : stage === 'two' ? 'Two Stage' : 'Variable Modulating';
      const airflowLabel = airflow === 'downflow' ? 'Down Flow' : 'Up Flow';
      const sector = getProductSector(p);

      return `
        <article class="product-card" data-id="${p.id}" style="display:flex; flex-direction:column; height:100%;">
          <div class="product-card-thumb" style="position:relative; background:#fff; padding:12px; border-radius: var(--radius-sm) var(--radius-sm) 0 0;">
            <img src="${p.primaryImage}" alt="${p.name}" loading="lazy" style="width:100%; height:180px; object-fit:contain;">
            ${hasRebate ? '<span class="card-rebate-tag" style="position:absolute; top:8px; left:8px; background:#ff1e8e; color:#fff; font-size:0.7rem; font-weight:800; padding:4px 8px; border-radius:3px; z-index:2;">SPRING SALE - 15% OFF</span>' : '<span class="card-tag" style="position:absolute; top:8px; left:8px; background:#ff1e8e; color:#fff; font-size:0.7rem; font-weight:800; padding:4px 8px; border-radius:3px; z-index:2;">SPRING SALE - 15% OFF</span>'}
            <span class="card-brand-overlay" style="position:absolute; bottom:8px; right:8px; background:rgba(8,17,38,0.7); color:#00d4ff; font-weight:900; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; padding:4px 8px; border-radius:3px; z-index:2;">${p.brand}</span>
          </div>

          <div class="product-card-body" style="padding:16px; flex:1; display:flex; flex-direction:column;">
            <div style="margin-bottom:8px;">
              <span style="color:#fff; font-weight:800; font-size:1.1rem;">From ${p.price_from ? '$' + p.price_from.toLocaleString() : '$149.99'}</span>
            </div>
            
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px; font-weight:600;">
              Product: ${p.category || 'Equipment'} &nbsp;|&nbsp; Series #: ${p.series || 'Standard'}
            </div>
            
            <h3 class="product-card-title" style="font-size:1.1rem; font-weight:800; line-height:1.3; margin-bottom:10px; color:#fff;">${p.name}</h3>
            
            <div class="card-stars" style="display:flex; align-items:center; gap:6px; color:#ff9800; font-size:0.85rem; font-weight:800; margin-bottom:12px;">
              <div style="display:flex; gap:2px;">
                <svg class="svg-icon" style="width:12px; height:12px;"><use href="#icon-star"></use></svg>
                <svg class="svg-icon" style="width:12px; height:12px;"><use href="#icon-star"></use></svg>
                <svg class="svg-icon" style="width:12px; height:12px;"><use href="#icon-star"></use></svg>
                <svg class="svg-icon" style="width:12px; height:12px;"><use href="#icon-star"></use></svg>
                <svg class="svg-icon" style="width:12px; height:12px;"><use href="#icon-star"></use></svg>
              </div>
              <span>${p.avgRating || 4.7}</span>
              <span style="color:#8a9bb8; font-weight:400; font-size:0.8rem;">(${p.reviewCount || 3} reviews)</span>
            </div>

            <div style="font-size:0.75rem; color:#00d4ff; font-weight:700; margin-bottom:8px; line-height:1.4;">
              SPECS: <span style="color:#b0c4de; font-weight:400;">${p.category || 'Equipment'} - ${stageLabel} - ${airflowLabel} - ${p.btu || 'N/A'} BTU ${p.brand}</span>
            </div>

            <p class="product-card-spot" style="color:#b0c4de; font-size:0.85rem; line-height:1.4; margin-bottom:16px;">${p.spot_text || p.primaryCaption || 'Smart thermostat with remote access and scheduling'}</p>
            
            <div style="margin-top:auto; font-size:0.8rem; color:#00d4ff; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:12px; margin-bottom:12px;">
              3 Sizes/Options Available
            </div>
            
            <div class="product-card-footer" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:0; border:none; background:transparent;">
              <a href="product-detail.html?id=${p.id}" class="btn" style="background:#ff523b; color:#fff; font-weight:800; border:none; display:flex; align-items:center; justify-content:center; gap:6px; padding:8px; border-radius:6px;">
                <svg class="svg-icon" style="width:16px; height:16px;"><use href="#icon-eye"></use></svg>
                View Specs
              </a>
              <button type="button" class="btn btn-request-quote" data-id="${p.id}" data-name="${p.name}" style="background:transparent; color:#fff; font-weight:800; border:1px solid rgba(255,255,255,0.2); padding:8px; border-radius:6px; transition:all 0.2s;">Quote</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  renderPagination(totalItems, totalPages);

  grid.querySelectorAll('.btn-request-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pName = btn.getAttribute('data-name');
      openQuoteModalWithProduct(pName);
    });
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

function initSizingCalculator() {
  const sqftInput = document.querySelector('#calcSqftRange');
  const sqftDisplay = document.querySelector('#calcSqftVal');
  const coolingResult = document.querySelector('#calcCoolingTons');
  const heatingResult = document.querySelector('#calcHeatingBtu');
  const savingsResult = document.querySelector('#calcEstSavings');
  const rebateResult = document.querySelector('#calcRebateEst');

  if (!sqftInput) return;

  function updateEstimates(val) {
    if (sqftDisplay) sqftDisplay.textContent = Number(val).toLocaleString() + ' sq ft';

    let cooling = '2.5 Tons';
    let heating = '60,000 BTU';
    let savings = '$490 / yr';
    let rebate = '$1,200+';

    if (val <= 1400) {
      cooling = '2.0 Tons';
      heating = '45,000 BTU';
      savings = '$380 / yr';
      rebate = '$800+';
    } else if (val <= 2000) {
      cooling = '2.5 Tons';
      heating = '60,000 BTU';
      savings = '$490 / yr';
      rebate = '$1,200+';
    } else if (val <= 2600) {
      cooling = '3.0 - 3.5 Tons';
      heating = '75,000 BTU';
      savings = '$610 / yr';
      rebate = '$1,600+';
    } else if (val <= 3200) {
      cooling = '4.0 Tons';
      heating = '90,000 BTU';
      savings = '$740 / yr';
      rebate = '$2,000+';
    } else {
      cooling = '5.0 Tons / Dual Zone';
      heating = '110,000+ BTU';
      savings = '$920 / yr';
      rebate = '$2,500+';
    }

    if (coolingResult) coolingResult.textContent = cooling;
    if (heatingResult) heatingResult.textContent = heating;
    if (savingsResult) savingsResult.textContent = savings;
    if (rebateResult) rebateResult.textContent = rebate;
  }

  sqftInput.addEventListener('input', (e) => {
    updateEstimates(e.target.value);
  });
}

function openQuoteModalWithProduct(productName) {
  const modal = document.querySelector('#quoteModal');
  const noteInput = document.querySelector('#quoteNotes');
  if (!modal) return;

  if (noteInput && productName) {
    noteInput.value = 'Interested in certified equipment: ' + productName + '. Please include Chicago ComEd/Nicor rebates and installation warranty.';
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function initQuoteModal() {
  const modal = document.querySelector('#quoteModal');
  const closeBtn = document.querySelector('#quoteModalClose');
  const cancelBtn = document.querySelector('#quoteCancelBtn');
  const form = document.querySelector('#quoteRequestForm');
  const triggerBtns = document.querySelectorAll('.trigger-quote-modal');

  if (!modal) return;

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : 'Send Request';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Quote Submitted!';
        }

        const successMsg = document.createElement('div');
        successMsg.className = 'form-success-alert';
        successMsg.style.cssText = 'background:rgba(0,212,255,0.15); border:1px solid var(--rich-blue-electric); color:#fff; padding:12px 16px; border-radius:6px; margin-top:14px; text-align:center; font-weight:700;';
        successMsg.textContent = 'Thank you! A certified Chicago HVAC specialist will contact you with your custom equipment estimate within 15 minutes.';
        form.appendChild(successMsg);

        setTimeout(() => {
          form.reset();
          successMsg.remove();
          if (submitBtn) submitBtn.textContent = origText;
          closeModal();
        }, 3200);
      }, 1000);
    });
  }
}
