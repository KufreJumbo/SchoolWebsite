// Main JavaScript for Sagab Schools
// Modular, accessible, and dependency-free (ES6+).

(() => {
  'use strict';

  const Utils = {
    qs: (selector, scope = document) => scope.querySelector(selector),
    qsa: (selector, scope = document) => Array.from(scope.querySelectorAll(selector)),
    createId: (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 10)}`,
    isMobileNav: () => window.innerWidth < 960,
    getFocusable: (scope) => Utils.qsa(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      scope
    ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')),
  };

  const Navigation = (() => {
    let navToggle;
    let siteNav;
    let body;
    let lastFocused;

    const trapFocus = (event) => {
      if (!Utils.isMobileNav() || !document.body.classList.contains('nav-open')) return;
      if (event.key !== 'Tab') return;

      const focusable = Utils.getFocusable(siteNav);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const openNav = () => {
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      lastFocused = document.activeElement;

      const focusable = Utils.getFocusable(siteNav);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    };

    const closeNav = () => {
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      Dropdowns.closeAll();

      if (lastFocused) {
        lastFocused.focus();
      }
    };

    const toggleNav = () => {
      if (document.body.classList.contains('nav-open')) {
        closeNav();
      } else {
        openNav();
      }
    };

    const handleDocumentClick = (event) => {
      if (!Utils.isMobileNav()) return;
      if (siteNav.contains(event.target) || navToggle.contains(event.target)) return;
      if (document.body.classList.contains('nav-open')) {
        closeNav();
      }
    };

    const handleResize = () => {
      if (!Utils.isMobileNav() && document.body.classList.contains('nav-open')) {
        closeNav();
      }
    };

    const init = () => {
      body = document.body;
      navToggle = Utils.qs('.nav-toggle');
      siteNav = Utils.qs('#site-nav');
      if (!navToggle || !siteNav) return;

      navToggle.addEventListener('click', toggleNav);
      document.addEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeNav();
        }
        trapFocus(event);
      });
      window.addEventListener('resize', handleResize);
    };

    return { init, closeNav };
  })();

  const Dropdowns = (() => {
    let toggles = [];

    const closeAll = () => {
      toggles.forEach((toggle) => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.closest('.nav-item')?.classList.remove('submenu-open');
      });
    };

    const toggleSubmenu = (toggle) => {
      const parent = toggle.closest('.nav-item');
      const isOpen = parent?.classList.contains('submenu-open');

      closeAll();
      if (!isOpen) {
        parent?.classList.add('submenu-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    };

    const handleKeydown = (event, toggle) => {
      const parent = toggle.closest('.nav-item');
      const submenu = parent?.querySelector('.submenu');
      const submenuLinks = submenu ? Utils.qsa('a', submenu) : [];

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        toggleSubmenu(toggle);
        submenuLinks[0]?.focus();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeAll();
        toggle.focus();
      }
    };

    const init = () => {
      toggles = Utils.qsa('.submenu-toggle');
      if (!toggles.length) return;

      toggles.forEach((toggle) => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-haspopup', 'true');

        toggle.addEventListener('click', (event) => {
          event.preventDefault();
          toggleSubmenu(toggle);
        });

        toggle.addEventListener('keydown', (event) => handleKeydown(event, toggle));
      });
    };

    return { init, closeAll };
  })();

  const Tabs = (() => {
    const init = () => {
      const tabGroups = Utils.qsa('[data-tabs]');
      tabGroups.forEach((group) => {
        const tabList = group.querySelector('[role="tablist"]') || group;
        const tabs = Utils.qsa('[role="tab"]', tabList);
        const panels = Utils.qsa('[role="tabpanel"]', group);

        if (!tabs.length || !panels.length) return;

        const activateTab = (tab) => {
          tabs.forEach((t) => {
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
          });

          panels.forEach((panel) => {
            panel.hidden = true;
          });

          const targetId = tab.getAttribute('data-tab-target');
          const target = targetId ? group.querySelector(targetId) : null;

          tab.setAttribute('aria-selected', 'true');
          tab.removeAttribute('tabindex');
          if (target) {
            target.hidden = false;
          }
        };

        tabs.forEach((tab, index) => {
          tab.setAttribute('tabindex', index === 0 ? '0' : '-1');
          tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
          const panelId = tab.getAttribute('data-tab-target');
          if (panelId) {
            const panel = group.querySelector(panelId);
            if (panel) {
              panel.hidden = index !== 0;
              panel.setAttribute('role', 'tabpanel');
            }
          }

          tab.addEventListener('click', () => activateTab(tab));
          tab.addEventListener('keydown', (event) => {
            const currentIndex = tabs.indexOf(tab);
            let nextIndex = null;

            if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
            if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = tabs.length - 1;

            if (nextIndex !== null) {
              event.preventDefault();
              tabs[nextIndex].focus();
              activateTab(tabs[nextIndex]);
            }
          });
        });
      });
    };

    return { init };
  })();

  const Accordions = (() => {
    const init = () => {
      const accordions = Utils.qsa('[data-accordion]');
      accordions.forEach((accordion) => {
        const triggers = Utils.qsa('[data-accordion-trigger]', accordion);
        const single = accordion.getAttribute('data-accordion-single') === 'true';

        triggers.forEach((trigger) => {
          const panelId = trigger.getAttribute('aria-controls') || trigger.getAttribute('data-accordion-target');
          let panel = panelId ? Utils.qs(`#${panelId}`, accordion) : null;

          if (!panel) {
            panel = trigger.nextElementSibling;
          }

          if (panel && !panel.id) {
            panel.id = Utils.createId('accordion-panel');
          }

          if (panel && !trigger.hasAttribute('aria-controls')) {
            trigger.setAttribute('aria-controls', panel.id);
          }

          trigger.setAttribute('aria-expanded', 'false');
          if (panel) {
            panel.hidden = true;
          }

          trigger.addEventListener('click', () => {
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';

            if (single) {
              triggers.forEach((other) => {
                other.setAttribute('aria-expanded', 'false');
                const otherPanel = Utils.qs(`#${other.getAttribute('aria-controls')}`, accordion);
                if (otherPanel) otherPanel.hidden = true;
              });
            }

            trigger.setAttribute('aria-expanded', String(!isOpen));
            if (panel) panel.hidden = isOpen;
          });
        });
      });
    };

    return { init };
  })();

  const Forms = (() => {
    const showError = (field, message) => {
      let errorEl = null;
      const errorId = field.getAttribute('aria-describedby');
      if (errorId) {
        errorEl = document.getElementById(errorId);
      }

      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.className = 'field-error';
        errorEl.id = Utils.createId('error');
        errorEl.setAttribute('role', 'alert');
        field.insertAdjacentElement('afterend', errorEl);
        field.setAttribute('aria-describedby', errorEl.id);
      }

      errorEl.textContent = message;
      field.setAttribute('aria-invalid', 'true');
    };

    const clearError = (field) => {
      const errorId = field.getAttribute('aria-describedby');
      if (errorId) {
        const errorEl = document.getElementById(errorId);
        if (errorEl && errorEl.classList.contains('field-error')) {
          errorEl.textContent = '';
        }
      }
      field.removeAttribute('aria-invalid');
    };

    const validateField = (field) => {
      if (field.disabled || field.type === 'submit') return true;

      const validity = field.validity;
      if (validity.valid) {
        clearError(field);
        return true;
      }

      let message = 'Please complete this field.';
      if (validity.valueMissing) message = 'This field is required.';
      if (validity.typeMismatch) message = 'Please enter a valid value.';
      if (validity.tooShort) message = `Please enter at least ${field.minLength} characters.`;
      if (validity.tooLong) message = `Please enter no more than ${field.maxLength} characters.`;
      if (validity.patternMismatch) message = 'Please match the requested format.';

      showError(field, message);
      return false;
    };

    const init = () => {
      const forms = Utils.qsa('form[data-validate]');
      forms.forEach((form) => {
        const fields = Utils.qsa('input, textarea, select', form);

        fields.forEach((field) => {
          field.addEventListener('blur', () => validateField(field));
          field.addEventListener('input', () => clearError(field));
        });

        form.addEventListener('submit', (event) => {
          let isValid = true;
          fields.forEach((field) => {
            if (!validateField(field)) {
              isValid = false;
            }
          });
          if (!isValid) {
            event.preventDefault();
            fields.find((field) => field.getAttribute('aria-invalid') === 'true')?.focus();
          }
        });
      });
    };

    return { init };
  })();

  const Lightbox = (() => {
    let overlay;
    let imageEl;
    let captionEl;
    let items = [];
    let currentIndex = 0;

    const buildOverlay = () => {
      overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close">×</button>
          <button class="lightbox-prev" aria-label="Previous">‹</button>
          <figure>
            <img class="lightbox-image" alt="">
            <figcaption class="lightbox-caption"></figcaption>
          </figure>
          <button class="lightbox-next" aria-label="Next">›</button>
        </div>
      `;

      document.body.appendChild(overlay);
      imageEl = overlay.querySelector('.lightbox-image');
      captionEl = overlay.querySelector('.lightbox-caption');

      overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target.classList.contains('lightbox-close')) {
          close();
        }
      });

      overlay.querySelector('.lightbox-prev').addEventListener('click', () => move(-1));
      overlay.querySelector('.lightbox-next').addEventListener('click', () => move(1));
    };

    const open = (index) => {
      if (!overlay) buildOverlay();
      currentIndex = index;
      const item = items[currentIndex];
      if (!item) return;

      imageEl.src = item.href;
      imageEl.alt = item.getAttribute('data-lightbox-alt') || '';
      captionEl.textContent = item.getAttribute('data-lightbox-caption') || '';
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      if (!overlay) return;
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    const move = (direction) => {
      if (!items.length) return;
      currentIndex = (currentIndex + direction + items.length) % items.length;
      open(currentIndex);
    };

    const handleKeydown = (event) => {
      if (!overlay || !overlay.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    };

    const init = () => {
      const galleries = Utils.qsa('[data-lightbox]');
      if (!galleries.length) return;

      galleries.forEach((gallery) => {
        const galleryItems = Utils.qsa('[data-lightbox-item]', gallery);
        galleryItems.forEach((item, index) => {
          item.addEventListener('click', (event) => {
            event.preventDefault();
            items = galleryItems;
            open(index);
          });
        });
      });

      document.addEventListener('keydown', handleKeydown);
    };

    return { init };
  })();

  const Filtering = (() => {
    const init = () => {
      const sections = Utils.qsa('[data-filter]');
      sections.forEach((section) => {
        const buttons = Utils.qsa('[data-filter-value]', section);
        const items = Utils.qsa('[data-filter-item]', section);

        const filterItems = (value) => {
          items.forEach((item) => {
            const categories = (item.getAttribute('data-category') || '').split(' ');
            const show = value === 'all' || categories.includes(value);
            item.hidden = !show;
          });
        };

        buttons.forEach((button) => {
          button.setAttribute('aria-pressed', 'false');
          button.addEventListener('click', () => {
            buttons.forEach((btn) => btn.setAttribute('aria-pressed', 'false'));
            button.setAttribute('aria-pressed', 'true');
            filterItems(button.getAttribute('data-filter-value'));
          });
        });

        const defaultButton = buttons[0];
        if (defaultButton) {
          defaultButton.setAttribute('aria-pressed', 'true');
          filterItems(defaultButton.getAttribute('data-filter-value'));
        }
      });
    };

    return { init };
  })();

  
  const HeroSlider = (() => {
    let slider;
    let slides = [];
    let prevBtn;
    let nextBtn;
    let overlays;
    let heroIntro;
    let heroTitle;
    let heroLede;
    let dotsWrap;
    let dots = [];
    let timer;
    let index = 0;

    const syncDots = () => {
      if (!dots.length) return;
      dots.forEach((dot, idx) => {
        const isActive = idx === index;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    const animateHeroText = () => {
      if (!heroIntro) return;
      heroIntro.classList.remove('is-text-animating');
      void heroIntro.offsetWidth;
      heroIntro.classList.add('is-text-animating');
    };

    const updateHeroText = (slideIndex, animate = true) => {
      const activeSlide = slides[slideIndex];
      if (!activeSlide || !heroTitle || !heroLede) return;

      const title = activeSlide.getAttribute('data-hero-title');
      const lede = activeSlide.getAttribute('data-hero-lede');
      if (title) heroTitle.textContent = title;
      if (lede) heroLede.textContent = lede;

      if (animate) animateHeroText();
    };

    const activate = (nextIndex) => {
      if (!slides.length) return;
      slides[index].classList.remove('is-active');
      slides[index].setAttribute('aria-hidden', 'true');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      slides[index].setAttribute('aria-hidden', 'false');
      syncDots();
      updateHeroText(index);

      if (overlays) {
        overlays.classList.remove('is-animating');
        void overlays.offsetWidth;
        overlays.classList.add('is-animating');
      }
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => activate(index + 1), 6000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const init = () => {
      slider = Utils.qs('[data-hero-slider]');
      if (!slider) return;
      slides = Utils.qsa('.hero-slide', slider);
      if (!slides.length) return;

      overlays = Utils.qs('[data-hero-overlays]');
      prevBtn = Utils.qs('[data-hero-prev]');
      nextBtn = Utils.qs('[data-hero-next]');
      dotsWrap = Utils.qs('[data-hero-dots]');
      heroIntro = Utils.qs('.hero-intro');
      heroTitle = Utils.qs('#hero-title');
      heroLede = Utils.qs('.hero-lede');

      slides.forEach((slide, idx) => {
        slide.setAttribute('aria-hidden', idx === index ? 'false' : 'true');
      });

      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        dots = slides.map((_, idx) => {
          const dot = document.createElement('button');
          dot.className = 'hero-dot';
          dot.type = 'button';
          dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
          dot.addEventListener('click', () => {
            activate(idx);
            start();
          });
          dotsWrap.appendChild(dot);
          return dot;
        });
        syncDots();
      }

      overlays?.classList.add('is-animating');
      updateHeroText(index, false);
      animateHeroText();

      prevBtn?.addEventListener('click', () => {
        activate(index - 1);
        start();
      });

      nextBtn?.addEventListener('click', () => {
        activate(index + 1);
        start();
      });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);

      start();
    };

    return { init };
  })();

  const OrgsCarousel = (() => {
    let carousel;
    let track;
    let prevBtn;
    let nextBtn;
    let timer;

    const scrollByCard = (direction) => {
      if (!track) return;
      const card = track.querySelector('.org-card');
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0);
      track.scrollBy({
        left: (cardWidth + gap) * direction,
        behavior: 'smooth',
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => scrollByCard(1), 4500);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const init = () => {
      carousel = Utils.qs('[data-orgs-carousel]');
      if (!carousel) return;
      track = Utils.qs('.orgs-track', carousel);
      if (!track) return;

      prevBtn = Utils.qs('[data-orgs-prev]', carousel);
      nextBtn = Utils.qs('[data-orgs-next]', carousel);

      prevBtn?.addEventListener('click', () => {
        scrollByCard(-1);
        start();
      });

      nextBtn?.addEventListener('click', () => {
        scrollByCard(1);
        start();
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);

      start();
    };

    return { init };
  })();

  const Testimonials = (() => {
    let carousel;
    let items = [];
    let prevBtn;
    let nextBtn;
    let dotsContainer;
    let timer;
    let index = 0;

    const setActive = (nextIndex) => {
      if (!items.length) return;
      items[index].classList.remove('is-active');
      index = (nextIndex + items.length) % items.length;
      items[index].classList.add('is-active');

      if (dotsContainer) {
        const dots = Utils.qsa('button', dotsContainer);
        dots.forEach((dot, idx) => {
          dot.classList.toggle('is-active', idx === index);
          dot.setAttribute('aria-pressed', idx === index ? 'true' : 'false');
        });
      }
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => setActive(index + 1), 7000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const buildDots = () => {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      items.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show testimonial ${idx + 1}`);
        dot.setAttribute('aria-pressed', idx === index ? 'true' : 'false');
        dot.classList.toggle('is-active', idx === index);
        dot.addEventListener('click', () => {
          setActive(idx);
          start();
        });
        dotsContainer.appendChild(dot);
      });
    };

    const init = () => {
      carousel = Utils.qs('[data-testimonial-carousel]');
      if (!carousel) return;
      items = Utils.qsa('.testimonial', carousel);
      if (!items.length) return;

      prevBtn = Utils.qs('[data-testimonial-prev]', carousel);
      nextBtn = Utils.qs('[data-testimonial-next]', carousel);
      dotsContainer = Utils.qs('[data-testimonial-dots]');

      items.forEach((item, idx) => {
        item.classList.toggle('is-active', idx === index);
      });

      buildDots();

      prevBtn?.addEventListener('click', () => {
        setActive(index - 1);
        start();
      });

      nextBtn?.addEventListener('click', () => {
        setActive(index + 1);
        start();
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);

      start();
    };

    return { init };
  })();

  const App = {
    init() {
      Navigation.init();
      Dropdowns.init();
      Tabs.init();
      Accordions.init();
      Forms.init();
      Lightbox.init();
      Filtering.init();
      HeroSlider.init();
      OrgsCarousel.init();
      Testimonials.init();
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
})();




