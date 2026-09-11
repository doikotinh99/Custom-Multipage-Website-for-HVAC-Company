document.addEventListener('DOMContentLoaded', () => {
  initScrollProgressBar();
  initMobileNav();
  initAccordions();
  highlightActiveNav();
  initQuickEstimateForm();
  initScrollAnimations();
  initButtonRipple();
});

function initScrollProgressBar() {
  let bar = document.querySelector('.scroll-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    document.body.prepend(bar);
  }

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }, { passive: true });
}

function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-backdrop');
  const closeBtn = document.querySelector('.mobile-close-btn');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

function initAccordions() {
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');

    if (!header || !content) return;

    if (item.classList.contains('active')) {
      content.style.maxHeight = content.scrollHeight + 'px';
      header.setAttribute('aria-expanded', 'true');
    } else {
      header.setAttribute('aria-expanded', 'false');
    }

    header.addEventListener('click', () => {
      const isAlreadyActive = item.classList.contains('active');
      const parentWrapper = item.closest('.accordion-wrapper');

      if (parentWrapper && parentWrapper.dataset.singleOpen === 'true') {
        parentWrapper.querySelectorAll('.accordion-item').forEach(sibling => {
          if (sibling !== item && sibling.classList.contains('active')) {
            sibling.classList.remove('active');
            const sibContent = sibling.querySelector('.accordion-content');
            const sibHeader = sibling.querySelector('.accordion-header');
            if (sibContent) sibContent.style.maxHeight = null;
            if (sibHeader) sibHeader.setAttribute('aria-expanded', 'false');
          }
        });
      }

      if (isAlreadyActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  window.addEventListener('resize', () => {
    document.querySelectorAll('.accordion-item.active .accordion-content').forEach(content => {
      content.style.maxHeight = content.scrollHeight + 'px';
    });
  });
}

function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === pageName || (pageName === '' && href === 'index.html')) {
      link.classList.add('active');
    } else if (href !== '#' && href && !href.startsWith('http')) {
      link.classList.remove('active');
    }
  });
}

function initQuickEstimateForm() {
  const form = document.querySelector('#quickEstimateForm');
  if (!form) return;

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
        alertBox.className = 'form-alert success';
        alertBox.innerHTML = '<svg class="svg-icon" style="color:#34d399; margin-right:6px;"><use href="#icon-check-circle"></use></svg> <strong>Thank you!</strong> Your request has been dispatched to our Chicago dispatch team. A certified technician will call you within 15 minutes!';
      }
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Service Now';
      }
    }, 800);
  });
}

function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.card, .section-header, .product-showcase-box, .product-card, .service-feature-card, .info-card, .trust-item, .comparison-table, .contact-card-box, .contact-info-panel'
  );

  document.querySelectorAll('.grid-2, .grid-3, .grid-4, .trust-bar-grid').forEach(grid => {
    Array.from(grid.children).forEach((child, index) => {
      child.classList.add('reveal');
      const delayClass = `delay-${((index % 4) + 1) * 100}`;
      child.classList.add(delayClass);
    });
  });

  targets.forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
  });

  const heroContent = document.querySelector('.hero-content');
  const heroCard = document.querySelector('.hero-estimate-card');
  if (heroContent) {
    heroContent.classList.add('reveal-left');
    setTimeout(() => heroContent.classList.add('revealed'), 100);
  }
  if (heroCard) {
    heroCard.classList.add('reveal-right');
    setTimeout(() => heroCard.classList.add('revealed'), 250);
  }

  const pageHeroInner = document.querySelector('.page-hero-inner');
  if (pageHeroInner) {
    pageHeroInner.classList.add('reveal');
    setTimeout(() => pageHeroInner.classList.add('revealed'), 100);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      el.classList.add('revealed');
    });
  }
}

function initButtonRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.width = '20px';
      ripple.style.height = '20px';
      ripple.style.background = 'rgba(255, 255, 255, 0.4)';
      ripple.style.borderRadius = '50%';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.transform = 'translate(-50%, -50%) scale(0)';
      ripple.style.animation = 'rippleAnim 0.6s ease-out';
      ripple.style.pointerEvents = 'none';

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  if (!document.getElementById('rippleKeyframes')) {
    const style = document.createElement('style');
    style.id = 'rippleKeyframes';
    style.textContent = `
      @keyframes rippleAnim {
        to { transform: translate(-50%, -50%) scale(15); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
