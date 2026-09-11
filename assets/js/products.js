const HVAC_PRODUCTS = [
  {
    id: 'furnace-pro-98',
    name: 'Best Comfort ArcticPro™ 98 Gas Furnace',
    category: 'furnace',
    tag: 'Ultra Heating',
    tagClass: 'tag-salmon',
    efficiency: '98.7% AFUE',
    primaryImage: 'assets/images/furnace-main.svg',
    primaryCaption: 'Front Exterior View',
    thumbnails: [
      { img: 'assets/images/furnace-main.svg', label: 'Exterior', caption: 'Full Front Casing & Touch Display' },
      { img: 'assets/images/furnace-internal.svg', label: 'Heat Core', caption: 'Stainless Steel Secondary Heat Exchanger' },
      { img: 'assets/images/smart-thermostat.svg', label: 'Smart UI', caption: 'Communicating Wi-Fi Comfort Control' },
      { img: 'assets/images/install-view.svg', label: 'Installed', caption: 'Basement Clean-Fit Chicago Installation' }
    ],
    placeholders: {
      TextPlaceHolder1: 'Energy Star Most Efficient 2026 - Up to 98.7% AFUE Variable Speed Modulating',
      TextPlaceHolder2: 'Chicago Winter Cold Climate Rated down to -30°F with Dual Fuel Backup Ready',
      TextPlaceHolder3: 'Lifetime Heat Exchanger Limited Warranty + 10-Year Unit Replacement Guarantee',
      TextPlaceHolder4: 'Smart Wi-Fi Communicating Diagnostic Hub with Auto Filter Alert System'
    },
    specs: {
      airflow: 'Variable-Speed ECM Blower Motor',
      soundLevel: 'Whisper-Quiet 52 dBA Operating Level',
      stages: 'Fully Modulating Gas Valve (40% to 100% Capacity)',
      dimensions: '34" H x 21" W x 29.5" D'
    }
  },
  {
    id: 'ac-breeze-24',
    name: 'Best Comfort ChillMaster™ 24 Inverter AC',
    category: 'ac',
    tag: 'Max Cooling',
    tagClass: 'tag-blue',
    efficiency: '24.5 SEER2',
    primaryImage: 'assets/images/ac-main.svg',
    primaryCaption: 'Outdoor Condenser View',
    thumbnails: [
      { img: 'assets/images/ac-main.svg', label: 'Condenser', caption: 'Heavy-Gauge Louvered Steel Outdoor Unit' },
      { img: 'assets/images/ac-compressor.svg', label: 'Compressor', caption: 'Inverter Twin-Rotary Variable Compressor' },
      { img: 'assets/images/smart-thermostat.svg', label: 'Smart App', caption: 'Real-Time Chicago Peak-Energy Management' },
      { img: 'assets/images/install-view.svg', label: 'Yard Mount', caption: 'Anti-Vibration Composite Base Pad Install' }
    ],
    placeholders: {
      TextPlaceHolder1: 'Ultra-High Efficiency 24.5 SEER2 Inverter Cooling for Extreme Humid Summers',
      TextPlaceHolder2: 'Twin-Rotary Variable Speed Compressor Operating as Low as 54 dBA',
      TextPlaceHolder3: '10-Year Compressor & Functional Parts Warranty with On-Site Chicago Service',
      TextPlaceHolder4: 'Integrated Dehumidification Sensor & Next-Gen Smart Home Voice Control'
    },
    specs: {
      airflow: 'Swept-Wing High-Velocity Fan Blade',
      soundLevel: '54 dBA Quiet Performance',
      stages: 'Variable Speed Inverter Capacity 25% - 100%',
      dimensions: '42" H x 35" W x 35" D'
    }
  },
  {
    id: 'heatpump-dual-22',
    name: 'Best Comfort PolarFlex™ Inverter Heat Pump',
    category: 'heatpump',
    tag: 'Year-Round Hybrid',
    tagClass: 'tag-pink',
    efficiency: '22 SEER2 / 10 HSPF2',
    primaryImage: 'assets/images/heatpump-main.svg',
    primaryCaption: 'PolarFlex All-Season Heat Pump',
    thumbnails: [
      { img: 'assets/images/heatpump-main.svg', label: 'Overview', caption: 'Heavy-Duty Anti-Corrosion Galvanized Casing' },
      { img: 'assets/images/ac-compressor.svg', label: 'Inverter', caption: 'Enhanced Vapor Injection Low-Temp Compressor' },
      { img: 'assets/images/smart-thermostat.svg', label: 'Dual-Fuel', caption: 'Auto-Switching Hybrid Thermostat Interface' },
      { img: 'assets/images/install-view.svg', label: 'Wall Bracket', caption: 'Elevated Snow-Clearance Bracket Mounting' }
    ],
    placeholders: {
      TextPlaceHolder1: '100% Heating Capacity at -5°F, Operational down to -22°F for Midwest Freezes',
      TextPlaceHolder2: 'State of Illinois Clean Energy & ComEd Heat Pump Rebate Qualified (Up to $2,000)',
      TextPlaceHolder3: '12-Year Unit Replacement Warranty Included with Annual Comfort Membership',
      TextPlaceHolder4: 'Smart Multi-Zone Temperature Sync with Humidity and IAQ Monitoring'
    },
    specs: {
      airflow: 'Brushless DC High-Efficiency Motor',
      soundLevel: '56 dBA Sound-Dampening Blanket',
      stages: 'Full Range Inverter Modulating',
      dimensions: '38" H x 36" W x 36" D'
    }
  },
  {
    id: 'boiler-titan-95',
    name: 'Best Comfort HydroMax™ Condensing Boiler',
    category: 'boiler',
    tag: 'Hydronic Heat',
    tagClass: 'tag-salmon',
    efficiency: '95.5% AFUE',
    primaryImage: 'assets/images/furnace-internal.svg',
    primaryCaption: 'HydroMax Wall-Hung Boiler',
    thumbnails: [
      { img: 'assets/images/furnace-internal.svg', label: 'Unit Front', caption: 'Compact Space-Saving Wall-Hung Design' },
      { img: 'assets/images/furnace-main.svg', label: 'Burner Tube', caption: 'Premix Low-NOx Stainless Steel Combustion' },
      { img: 'assets/images/smart-thermostat.svg', label: 'Outdoor Sensor', caption: 'Outdoor Reset Thermostat Automation' },
      { img: 'assets/images/install-view.svg', label: 'Radiant Loop', caption: 'Chicago Radiator & In-Floor PEX System' }
    ],
    placeholders: {
      TextPlaceHolder1: '95.5% AFUE Wall-Hung Hydronic Condensing Boiler for Baseboard & Radiators',
      TextPlaceHolder2: 'Turndown Ratio 10:1 to match exact heat load with minimal gas consumption',
      TextPlaceHolder3: '15-Year Limited Heat Exchanger Warranty for Residential Installations',
      TextPlaceHolder4: 'Direct Venting PVC/CPVC with Outdoor Temperature Reset Automation'
    },
    specs: {
      airflow: 'Hydronic Circulator Pump Control',
      soundLevel: 'Whisper-Quiet 48 dBA',
      stages: '10:1 Modulating Premix Gas Burner',
      dimensions: '29" H x 17.5" W x 14.5" D'
    }
  },
  {
    id: 'iaq-purifier-uv',
    name: 'Best Comfort PureAir™ Whole-Home IAQ System',
    category: 'iaq',
    tag: 'Clean Air',
    tagClass: 'tag-blue',
    efficiency: 'MERV 16 + UV-C',
    primaryImage: 'assets/images/smart-thermostat.svg',
    primaryCaption: 'Whole-Home Air Purification Unit',
    thumbnails: [
      { img: 'assets/images/smart-thermostat.svg', label: 'Control Hub', caption: 'Real-Time Air Quality & PM2.5 Index Display' },
      { img: 'assets/images/furnace-internal.svg', label: 'UV-C Lamp', caption: 'Hospital-Grade Germicidal UV-C Sterilization' },
      { img: 'assets/images/furnace-main.svg', label: 'Filter Media', caption: 'Hospital-Grade Carbon Clean MERV 16 Cartridge' },
      { img: 'assets/images/install-view.svg', label: 'Duct Mount', caption: 'Direct Return-Air Duct In-Line Integration' }
    ],
    placeholders: {
      TextPlaceHolder1: 'Captures 99.9% of Airborne Viruses, Mold Spores, Pollen, and Pet Dander',
      TextPlaceHolder2: 'Zero Ozone Emission Certified with Activated Carbon Odor Neutralization',
      TextPlaceHolder3: '5-Year Complete System Electronics and Housing Limited Warranty',
      TextPlaceHolder4: 'Automatic Filter Life Sensor with Smartphone Push Reminders'
    },
    specs: {
      airflow: 'Low Pressure Drop Media Design',
      soundLevel: 'Silent Operation In-Duct',
      stages: '3-Stage Filtration: MERV16 + UV-C + Carbon',
      dimensions: '21" H x 25" W x 7" D'
    }
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initProductShowcase();
  initCategoryFilters();
  initQuoteModal();
});

function initProductShowcase() {
  const primaryBox = document.querySelector('#primaryImageBox');
  const primaryImg = document.querySelector('#primaryProductImg');
  const viewStatusBadge = document.querySelector('#currentViewStatus');
  const thumbnailBoxes = document.querySelectorAll('.thumbnail-box');

  if (!primaryBox || !thumbnailBoxes.length) return;

  thumbnailBoxes.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      thumbnailBoxes.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      const targetImgSrc = thumb.getAttribute('data-img-src');
      const viewLabel = thumb.getAttribute('data-view-label') || `Angle ${index + 1}`;
      const captionText = thumb.getAttribute('data-caption') || '';

      if (primaryImg) {
        primaryImg.style.opacity = '0';
        primaryImg.style.transform = 'scale(0.95)';

        setTimeout(() => {
          primaryImg.src = targetImgSrc;
          primaryImg.alt = `${viewLabel} - ${captionText}`;
          primaryImg.style.opacity = '1';
          primaryImg.style.transform = 'scale(1)';
        }, 180);
      }

      if (viewStatusBadge) {
        viewStatusBadge.innerHTML = `<svg class="svg-icon"><use href="#icon-eye"></use></svg> View: ${viewLabel} &bull; <span style="color:#fff; font-weight:normal; margin-left:4px;">${captionText}</span>`;
      }
    });
  });
}

function loadProductIntoShowcase(productId) {
  const product = HVAC_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const titleEl = document.querySelector('#showcaseProductTitle');
  const metaEl = document.querySelector('#showcaseProductMeta');
  const effBadge = document.querySelector('#showcaseEfficiencyBadge');
  const primaryImg = document.querySelector('#primaryProductImg');
  const viewStatusBadge = document.querySelector('#currentViewStatus');

  if (titleEl) titleEl.textContent = product.name;
  if (metaEl) metaEl.innerHTML = `Category: <strong>${product.category.toUpperCase()}</strong> &bull; Chicago Tested Model: <strong>${product.id}</strong>`;
  if (effBadge) effBadge.textContent = product.efficiency;

  if (primaryImg) {
    primaryImg.src = product.thumbnails[0].img;
    primaryImg.alt = product.name;
  }
  if (viewStatusBadge) {
    viewStatusBadge.innerHTML = `<svg class="svg-icon"><use href="#icon-eye"></use></svg> View: ${product.thumbnails[0].label} &bull; <span style="color:#fff; font-weight:normal; margin-left:4px;">${product.thumbnails[0].caption}</span>`;
  }

  const thumbContainer = document.querySelector('#showcaseThumbnailsRow');
  if (thumbContainer) {
    thumbContainer.innerHTML = '';
    product.thumbnails.forEach((t, i) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.className = `thumbnail-box ${i === 0 ? 'active' : ''}`;
      thumbBtn.setAttribute('data-img-src', t.img);
      thumbBtn.setAttribute('data-view-label', t.label);
      thumbBtn.setAttribute('data-caption', t.caption);
      thumbBtn.innerHTML = `
        <img src="${t.img}" alt="${t.label}" />
        <span class="thumbnail-caption">${t.label}</span>
      `;
      thumbContainer.appendChild(thumbBtn);
    });

    initProductShowcase();
  }

  const p1 = document.querySelector('#textPlaceHolder1');
  const p2 = document.querySelector('#textPlaceHolder2');
  const p3 = document.querySelector('#textPlaceHolder3');
  const p4 = document.querySelector('#textPlaceHolder4');

  if (p1) p1.textContent = product.placeholders.TextPlaceHolder1;
  if (p2) p2.textContent = product.placeholders.TextPlaceHolder2;
  if (p3) p3.textContent = product.placeholders.TextPlaceHolder3;
  if (p4) p4.textContent = product.placeholders.TextPlaceHolder4;

  const showcaseEl = document.querySelector('#productShowcaseSection');
  if (showcaseEl) {
    showcaseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  if (!filterBtns.length || !productCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  document.querySelectorAll('.btn-inspect-product').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pId = btn.getAttribute('data-product-id');
      if (pId) loadProductIntoShowcase(pId);
    });
  });
}

function initQuoteModal() {
  const modal = document.querySelector('#quoteModal');
  const closeBtn = document.querySelector('#closeQuoteModal');
  const modalProductName = document.querySelector('#modalProductName');
  const modalProductField = document.querySelector('#modalProductField');

  if (!modal) return;

  document.querySelectorAll('.btn-request-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pName = btn.getAttribute('data-product-name') || 'Selected HVAC Unit';
      if (modalProductName) modalProductName.textContent = pName;
      if (modalProductField) modalProductField.value = pName;

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

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
