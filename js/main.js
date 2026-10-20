// Main JavaScript for Sagab Schools
// Modular, accessible, and dependency-free (ES6+).

(() => {
  'use strict';

  const Utils = {
    qs: (selector, scope = document) => scope.querySelector(selector),
    qsa: (selector, scope = document) => Array.from(scope.querySelectorAll(selector)),
    createId: (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 10)}`,
    isMobileNav: () => window.innerWidth < 1100,
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
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

    const syncNavState = () => {
      const isOpen = body.classList.contains('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

      if (Utils.isMobileNav()) {
        siteNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        if (isOpen) siteNav.removeAttribute('inert');
        else siteNav.setAttribute('inert', '');
      } else {
        siteNav.removeAttribute('aria-hidden');
        siteNav.removeAttribute('inert');
      }
    };

    const trapFocus = (event) => {
      if (!Utils.isMobileNav() || !document.body.classList.contains('nav-open')) return;
      if (event.key !== 'Tab') return;

      const focusable = [navToggle, ...Utils.getFocusable(siteNav)];
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
      lastFocused = document.activeElement;
      syncNavState();

      const focusable = Utils.getFocusable(siteNav);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    };

    const closeNav = (restoreFocus = true) => {
      const wasOpen = document.body.classList.contains('nav-open');
      document.body.classList.remove('nav-open');
      Dropdowns.closeAll();
      syncNavState();

      if (wasOpen && restoreFocus && lastFocused) {
        lastFocused.focus();
      }
      lastFocused = null;
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
        closeNav(false);
      }
      syncNavState();
    };

    const init = () => {
      body = document.body;
      navToggle = Utils.qs('.nav-toggle');
      siteNav = Utils.qs('#site-nav');
      if (!navToggle || !siteNav) return;

      navToggle.addEventListener('click', toggleNav);
      siteNav.addEventListener('click', (event) => {
        if (Utils.isMobileNav() && event.target.closest('a')) closeNav(false);
      });
      document.addEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
          closeNav();
        }
        trapFocus(event);
      });
      window.addEventListener('resize', handleResize);
      syncNavState();
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
      toggles = Utils.qsa('.submenu-toggle, .submenu-trigger');
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

      document.addEventListener('click', (event) => {
        if (!event.target.closest('.has-submenu')) closeAll();
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

  // Homepage hero slideshow. Each photo stays up while its progress bar fills
  // (a CSS animation); when the bar completes, the next photo cross-fades in.
  const HeroSlider = (() => {
    const FADE_MS = 1600; // keep in step with --hero-fade-duration in style.css
    const loads = new Map();
    const leaveTimers = new Map();
    let hero;
    let slides = [];
    let steps = [];
    let toggle;
    let counter;
    let index = 0;
    let requested = 0;
    let fadeMs = FADE_MS;

    const pad = (number) => String(number).padStart(2, '0');

    // Only the first photo is in the markup; the rest load one slide ahead so
    // they never compete with the opening image.
    const loadSlide = (slide) => {
      const src = slide.dataset.bg;
      if (!src) return Promise.resolve();
      if (!loads.has(slide)) {
        const image = new Image();
        image.src = src;
        loads.set(slide, image.decode()
          .catch(() => {})
          .then(() => {
            slide.style.backgroundImage = `url("${src}")`;
          }));
      }
      return loads.get(slide);
    };

    const syncControls = () => {
      steps.forEach((step, stepIndex) => {
        const isCurrent = stepIndex === index;
        step.classList.toggle('is-active', isCurrent);
        if (isCurrent) step.setAttribute('aria-current', 'true');
        else step.removeAttribute('aria-current');
      });
      counter.textContent = `${pad(index + 1)} / ${pad(slides.length)}`;
    };

    const show = (target) => {
      requested = (target + slides.length) % slides.length;
      const next = requested;
      if (next === index) return;

      loadSlide(slides[next]).then(() => {
        // A later click may have asked for a different photo while this one loaded.
        if (next !== requested || next === index) return;

        const outgoing = slides[index];
        const incoming = slides[next];

        outgoing.classList.remove('is-active');
        outgoing.classList.add('is-leaving');
        window.clearTimeout(leaveTimers.get(outgoing));
        leaveTimers.set(outgoing, window.setTimeout(() => outgoing.classList.remove('is-leaving'), fadeMs));

        window.clearTimeout(leaveTimers.get(incoming));
        if (incoming.classList.contains('is-leaving')) {
          // Restart its slow zoom instead of resuming it part-way through.
          incoming.classList.remove('is-leaving');
          void incoming.offsetWidth;
        }
        incoming.classList.add('is-active');

        index = next;
        syncControls();
        loadSlide(slides[(index + 1) % slides.length]);
      });
    };

    const setPaused = (paused) => {
      hero.classList.toggle('is-paused', paused);
      toggle.dataset.state = paused ? 'paused' : 'playing';
      toggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    };

    const buildControls = () => {
      const controls = document.createElement('div');
      controls.className = 'hero-controls';

      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'hero-toggle';
      toggle.addEventListener('click', () => setPaused(!hero.classList.contains('is-paused')));

      const stepList = document.createElement('div');
      stepList.className = 'hero-steps';
      stepList.setAttribute('role', 'group');
      stepList.setAttribute('aria-label', 'Hero photos');
      steps = slides.map((_, slideIndex) => {
        const step = document.createElement('button');
        step.type = 'button';
        step.className = 'hero-step';
        step.setAttribute('aria-label', `Show photo ${slideIndex + 1} of ${slides.length}`);
        step.append(document.createElement('span'));
        step.addEventListener('click', () => show(slideIndex));
        stepList.append(step);
        return step;
      });

      // The active bar fills over one slide's duration; when it completes, move on.
      stepList.addEventListener('animationend', (event) => {
        if (event.animationName === 'sg-hero-progress') show(index + 1);
      });

      counter = document.createElement('span');
      counter.className = 'hero-count';
      counter.setAttribute('aria-hidden', 'true');

      controls.append(toggle, stepList, counter);
      hero.insertBefore(controls, Utils.qs('.hero-scroll', hero));
    };

    const init = () => {
      hero = Utils.qs('.homepage-hero');
      const slider = hero ? Utils.qs('[data-hero-slider]', hero) : null;
      if (!slider) return;
      slides = Utils.qsa('.hero-slide', slider);
      if (slides.length < 2) return;

      fadeMs = Utils.prefersReducedMotion() ? 0 : FADE_MS;
      index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
      requested = index;
      slides[index].classList.add('is-active');

      buildControls();
      setPaused(false);
      syncControls();

      // Freeze the slideshow while the hero is scrolled out of view.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
          hero.classList.toggle('is-offscreen', !entry.isIntersecting);
        }).observe(hero);
      }

      const preloadNext = () => loadSlide(slides[(index + 1) % slides.length]);
      if (document.readyState === 'complete') preloadNext();
      else window.addEventListener('load', preloadNext, { once: true });
    };

    return { init };
  })();

  // Depth for the homepage hero: the photo drifts against the mouse and lags
  // behind the scroll, while the headline eases away as you scroll past.
  const HeroMotion = (() => {
    const init = () => {
      const hero = Utils.qs('.homepage-hero');
      const slider = hero ? Utils.qs('.hero-slider', hero) : null;
      const content = hero ? Utils.qs('.hero-content', hero) : null;
      if (!slider || !content || Utils.prefersReducedMotion()) return;

      const wideScreen = window.matchMedia('(min-width: 900px)');
      const pointer = { x: 0, y: 0 };
      const eased = { x: 0, y: 0 };
      let height = hero.offsetHeight;
      let lastProgress = -1;
      let frame = null;

      const render = () => {
        frame = null;
        eased.x += (pointer.x - eased.x) * 0.08;
        eased.y += (pointer.y - eased.y) * 0.08;
        const settling = Math.abs(pointer.x - eased.x) > 0.002 || Math.abs(pointer.y - eased.y) > 0.002;
        const progress = Math.min(Math.max(window.scrollY / height, 0), 1);
        if (!settling && progress === lastProgress) return;
        lastProgress = progress;

        slider.style.translate = `${(eased.x * -14).toFixed(2)}px ${(progress * height * 0.22 - eased.y * 10).toFixed(2)}px`;
        content.style.translate = `0 ${(progress * -60).toFixed(2)}px`;
        content.style.opacity = wideScreen.matches ? Math.max(1 - progress * 1.2, 0).toFixed(3) : '';
        if (settling) request();
      };

      const request = () => {
        if (!frame) frame = window.requestAnimationFrame(render);
      };

      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', () => {
        height = hero.offsetHeight;
        lastProgress = -1;
        request();
      });

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        hero.addEventListener('pointermove', (event) => {
          if (event.pointerType !== 'mouse') return;
          const rect = hero.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          request();
        });
        hero.addEventListener('pointerleave', () => {
          pointer.x = 0;
          pointer.y = 0;
          request();
        });
      }

      request();
    };

    return { init };
  })();

  // Background photos marked data-parallax drift a little slower than the page.
  const Parallax = (() => {
    const init = () => {
      const items = Utils.qsa('[data-parallax]');
      if (!items.length || Utils.prefersReducedMotion() || !('IntersectionObserver' in window)) return;

      const visible = new Set();
      let frame = null;

      const render = () => {
        frame = null;
        const viewportCentre = window.innerHeight / 2;
        visible.forEach((item) => {
          const box = item.parentElement.getBoundingClientRect();
          const speed = parseFloat(item.dataset.parallax) || 0.12;
          // The photo overhangs its frame by 14% top and bottom (style.css).
          const limit = box.height * 0.13;
          const shift = (viewportCentre - (box.top + box.height / 2)) * speed;
          item.style.translate = `0 ${Math.max(-limit, Math.min(limit, shift)).toFixed(1)}px`;
        });
      };

      const request = () => {
        if (!frame && visible.size) frame = window.requestAnimationFrame(render);
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        request();
      });

      items.forEach((item) => observer.observe(item));
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', request);
    };

    return { init };
  })();

  // Scroll reveals. Blocks marked data-reveal (or every child of a
  // data-reveal-group) animate in as they reach the viewport; blocks arriving
  // together are staggered top-to-bottom, left-to-right.
  const Reveals = (() => {
    const STAGGER_MS = 90;
    const MAX_STAGGER_STEPS = 6;
    const FIRST_BATCH_DELAY_MS = 250; // let the page banner lead on arrival

    const sitsInClippingFrame = (img, item) => {
      for (let node = img.parentElement; node; node = node.parentElement) {
        const { overflowX } = window.getComputedStyle(node);
        if (overflowX === 'hidden' || overflowX === 'clip') return true;
        if (node === item) return false;
      }
      return false;
    };

    // Image-led blocks open like a curtain. When the photo sits in a clipping
    // frame it can also settle from a gentle zoom without spilling out.
    const tagMedia = (item) => {
      const isMedia = item.matches('figure, picture')
        || Array.from(item.children).some((child) => child.matches('img, picture, figure'));
      if (!isMedia) return;
      const img = item.querySelector('img');
      item.setAttribute('data-reveal-media', img && sitsInClippingFrame(img, item) ? 'zoom' : 'wipe');
    };

    // Wraps each word of a data-split heading so the words can rise in turn.
    const splitWords = (element) => {
      let count = 0;
      const walk = (node) => {
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            walk(child);
            return;
          }
          if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;

          const fragment = document.createDocumentFragment();
          child.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
            if (!part) return;
            if (!part.trim()) {
              fragment.append(part);
              return;
            }
            const word = document.createElement('span');
            word.className = 'sg-word';
            word.style.setProperty('--w', count);
            word.textContent = part;
            fragment.append(word);
            count += 1;
          });
          child.replaceWith(fragment);
        });
      };
      walk(element);
    };

    const init = () => {
      Utils.qsa('[data-reveal-group]').forEach((group) => {
        Array.from(group.children).forEach((child) => {
          if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
        });
      });

      const items = Utils.qsa('[data-reveal]');
      if (!items.length) return;
      // Nothing is hidden unless .reveal-ready is set, so these visitors
      // simply see the finished page.
      if (Utils.prefersReducedMotion() || !('IntersectionObserver' in window)) return;

      items.forEach(tagMedia);
      Utils.qsa('[data-split]').forEach(splitWords);
      document.body.classList.add('reveal-ready');

      let firstBatch = true;
      const observer = new IntersectionObserver((entries) => {
        const baseDelay = firstBatch ? FIRST_BATCH_DELAY_MS : 0;
        firstBatch = false;

        const arriving = entries.filter((entry) => entry.isIntersecting);
        arriving.forEach((entry) => {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });

        // Only blocks actually on screen are staggered; ones already scrolled
        // past (a jump to a lower section, a reload part-way down) just appear.
        arriving
          .filter((entry) => entry.boundingClientRect.bottom > 0)
          .sort((a, b) => {
            const rowA = Math.round(a.boundingClientRect.top / 24);
            const rowB = Math.round(b.boundingClientRect.top / 24);
            return (rowA - rowB) || (a.boundingClientRect.left - b.boundingClientRect.left);
          })
          .forEach((entry, order) => {
            const delay = baseDelay + Math.min(order, MAX_STAGGER_STEPS) * STAGGER_MS;
            entry.target.style.setProperty('--reveal-delay', `${delay}ms`);
          });
      }, {
        // The huge top margin counts everything above the screen as arrived, so
        // nothing is left invisible behind a jump; below the screen, blocks wait
        // until they are 8% clear of the bottom edge.
        rootMargin: '100000px 0px -8% 0px',
      });

      items.forEach((item) => observer.observe(item));
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

  const InterfaceEnhancements = (() => {
    const markCurrentPage = () => {
      const currentPath = window.location.pathname.replace(/\/$/, '/index.html');
      Utils.qsa('.site-nav a[href]').forEach((link) => {
        const url = new URL(link.href, window.location.href);
        if (url.pathname === currentPath) link.setAttribute('aria-current', 'page');
      });
    };

    const initHeaderState = () => {
      const header = Utils.qs('.site-header');
      if (!header) return;
      const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
      update();
      window.addEventListener('scroll', update, { passive: true });
    };

    const init = () => {
      markCurrentPage();
      initHeaderState();
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
      HeroMotion.init();
      Parallax.init();
      OrgsCarousel.init();
      Testimonials.init();
      InterfaceEnhancements.init();
      Reveals.init();
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    try {
      window.SagabComponents?.render();
    } catch (error) {
      console.error('Sagab shared components failed to render.', error);
    }

    // Page features must still initialize if an optional shell mount is absent.
    App.init();
  });
})();




