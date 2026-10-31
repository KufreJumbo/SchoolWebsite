// Canonical shared header and footer for every Sagab Schools page.
// Kept as a classic script so it also works in direct file previews.
(() => {
  'use strict';

  const ownScript = document.currentScript
    || Array.from(document.scripts).find((script) => script.src.includes('/components/site-shell.js'));
  const siteRoot = new URL('../', ownScript?.src || window.location.href);

  const SOCIAL_ICONS = [
    {
      label: 'Facebook',
      handle: 'sagabcollege',
      href: 'https://web.facebook.com/sagabcollege',
      path: 'M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.5-.1-2.5-.1-2.5 0-4.3 1.5-4.3 4.4V11H7.2v3H10v8h3.5z',
    },
    {
      label: 'TikTok',
      handle: '@sagab.schools',
      href: 'https://www.tiktok.com/@sagab.schools?_r=1&_t=ZS-97VYuEHw3Me',
      path: 'M16.6 3c.2 1.7 1.2 3.2 2.7 4.1v3.2a8.1 8.1 0 0 1-2.7-.6v5.5a6.2 6.2 0 1 1-5.4-6.1v3.2a3.1 3.1 0 1 0 2.2 3V3h3.2z',
    },
    {
      label: 'LinkedIn',
      handle: 'Sagab College &amp; Montessori',
      href: 'https://www.linkedin.com/company/sagab-college-montessori/',
      path: 'M6.5 8.3H3.2V21h3.3V8.3zM4.8 3a1.9 1.9 0 1 0 0 3.8A1.9 1.9 0 0 0 4.8 3zM21 13.7c0-3.8-2-5.6-4.7-5.6-2.2 0-3.1 1.2-3.7 2V8.3H9.3V21h3.3v-6.3c0-1.7.3-3.3 2.4-3.3 2.1 0 2.1 1.9 2.1 3.4V21H21v-7.3z',
    },
    {
      label: 'YouTube',
      handle: '@SAGAB_Schools',
      href: 'https://www.youtube.com/@SAGAB_Schools',
      path: 'M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8zM10 15.2V8.8l5.5 3.2-5.5 3.2z',
    },
  ];

  const renderSocialLinks = (linkClass) => SOCIAL_ICONS.map(({ label, href, path }) => `
    <a class="${linkClass}" href="${href}" aria-label="${label}" title="${label}"${href === '#' ? '' : ' target="_blank" rel="noopener"'}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>
    </a>
  `).join('');

  const templates = {
    header: `
      <header class="site-header">
        <a class="skip-link" href="#main-content">Skip to main content</a>
        <div class="header-inner">
          <a class="brand" href="/index.html">
            <img class="brand-logo" src="/images/logo.png" alt="Sagab Schools logo">
            <span class="brand-title">Sagab Schools</span>
          </a>

          <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
            <span class="nav-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>
          </button>

          <nav id="site-nav" class="site-nav" aria-label="Primary">
            <ul class="nav-list">
              <li class="nav-item has-submenu">
                <button type="button" class="nav-link submenu-trigger" aria-expanded="false" aria-controls="submenu-about">About <span class="submenu-indicator" aria-hidden="true">&#9662;</span></button>
                <ul id="submenu-about" class="submenu" aria-label="About submenu">
                  <li><a href="/pages/overview.html">Overview</a></li>
                  <li><a href="/pages/proprietress.html">Proprietress' Message</a></li>
                  <li><a href="/pages/governors.html">Board of Governors</a></li>
                  <li><a href="/pages/staff.html">Our Staff</a></li>
                  <li><a href="/pages/career.html">Career Opportunities</a></li>
                  <li><a href="/pages/facilities.html">Facilities</a></li>
                </ul>
              </li>
              <li class="nav-item has-submenu">
                <button type="button" class="nav-link submenu-trigger" aria-expanded="false" aria-controls="submenu-academics">Academics <span class="submenu-indicator" aria-hidden="true">&#9662;</span></button>
                <ul id="submenu-academics" class="submenu" aria-label="Academics submenu">
                  <li><a href="/pages/curriculum.html">Curriculum</a></li>
                  <li><a href="/pages/calendar.html">School Calendar</a></li>
                  <li><a href="/pages/prefects.html">Prefects</a></li>
                  <li><a href="https://sagab.schulup.com" target="_blank" rel="noopener noreferrer">Portal</a></li>
                </ul>
              </li>
              <li class="nav-item has-submenu">
                <button type="button" class="nav-link submenu-trigger" aria-expanded="false" aria-controls="submenu-admissions">Admissions <span class="submenu-indicator" aria-hidden="true">&#9662;</span></button>
                <ul id="submenu-admissions" class="submenu" aria-label="Admissions submenu">
                  <li><a href="/pages/admission-process.html">Admission Process</a></li>
                  <li><a href="/pages/tuition.html">Tuition &amp; Fees</a></li>
                  <li><a href="/pages/summer-school.html">Summer School</a></li>
                </ul>
              </li>
              <li class="nav-item has-submenu">
                <button type="button" class="nav-link submenu-trigger" aria-expanded="false" aria-controls="submenu-life">School Life <span class="submenu-indicator" aria-hidden="true">&#9662;</span></button>
                <ul id="submenu-life" class="submenu" aria-label="School Life submenu">
                  <li><a href="/pages/counselling.html">Counselling &amp; Mentoring</a></li>
                  <li><a href="/pages/hostel.html">Hostel Life</a></li>
                  <li><a href="/pages/extracurricular.html">Extra-Curricular</a></li>
                  <li><a href="/pages/parents.html">PTA &amp; PTF</a></li>
                  <li><a href="/pages/alumni.html">Alumni Network</a></li>
                </ul>
              </li>
              <li class="nav-item"><a class="nav-link" href="/pages/news.html">News and Events</a></li>
              <li class="nav-item"><a class="nav-link" href="/pages/contact.html">Contact</a></li>
            </ul>

            <div class="mobile-nav-socials" aria-label="Sagab Schools social media">
              <span>Follow us</span>
              <div class="social-links">${renderSocialLinks('social-link')}</div>
            </div>
          </nav>

          <div class="header-actions" aria-label="Header actions">
            <div class="social-links" aria-label="Social links">${renderSocialLinks('social-link')}</div>
            <a class="apply-btn" href="/pages/admission-process.html">Apply Now</a>
          </div>
        </div>
      </header>
    `,
    footer: `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-top">
            <div class="footer-branding">
              <div class="footer-logo">
                <img src="/images/logo.png" alt="Sagab Schools logo">
                <div>
                  <span class="footer-brand-title">Sagab Schools</span>
                  <span class="footer-brand-subtitle">Excellence in Education</span>
                </div>
              </div>
              <p class="footer-description">
                Nurturing tomorrow's leaders through innovative education, character development, and a commitment to excellence in everything we do.
              </p>
              <div class="footer-social" aria-label="Social links">${renderSocialLinks('footer-social-link')}</div>
            </div>

            <div class="footer-links-col">
              <h3>Quick Links</h3>
              <ul class="footer-links">
                <li><a href="/pages/admission-process.html">Admission Process</a></li>
                <li><a href="/pages/tuition.html">School Fees</a></li>
                <li><a href="/pages/calendar.html">School Calendar</a></li>
                <li><a href="/pages/curriculum.html">Curriculum</a></li>
                <li><a href="/pages/hostel.html">Hostel</a></li>
                <li><a href="https://sagab.schulup.com" target="_blank" rel="noopener noreferrer">Portal</a></li>
                <li><a href="/pages/contact.html">Contact Us</a></li>
              </ul>
            </div>

            <div class="footer-contact-col">
              <h3>Contact Info</h3>
              <ul class="footer-contact">
                <li>
                  <span class="contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"></path></svg>
                  </span>
                  <span><strong>College:</strong><br>Plot 40/46 Bolajoko Oruku Street, off Odumbo Street, Solomade Estate, Ikorodu, Lagos State.<br><br><strong>Montessori:</strong><br>17, Kudirat Bakare Street, Beside Sagab College, Off Abiodun Ogunleye Street, Solomade Estate, Ikorodu, Lagos.</span>
                </li>
                <li>
                  <span class="contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M6.6 10.8a14.9 14.9 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.7 3.8.7.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.7 3.8.1.4 0 .8-.3 1.1z"></path></svg>
                  </span>
                  <span><a href="tel:+2347066297062">+234 706 629 7062</a><br><a href="tel:+2348023376476">+234 802 337 6476</a><br><a href="tel:+2348023135025">+234 802 313 5025</a></span>
                </li>
                <li>
                  <span class="contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2 8 5 8-5"></path></svg>
                  </span>
                  <span><a href="mailto:info@sagabschools.com">info@sagabschools.com</a></span>
                </li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <span>&copy; 2026 Sagab Schools. All rights reserved.</span>
            <div class="footer-legal">
              <a href="/sitemap.xml">Site Map</a>
            </div>
          </div>
        </div>
      </footer>
    `,
  };

  const resolveSitePaths = (fragment) => {
    fragment.querySelectorAll('[href^="/"], [src^="/"]').forEach((element) => {
      const attribute = element.hasAttribute('href') ? 'href' : 'src';
      const value = element.getAttribute(attribute);
      if (value?.startsWith('/') && !value.startsWith('//')) {
        element.setAttribute(attribute, new URL(value.slice(1), siteRoot).href);
      }
    });
  };

  const resolveDocumentSitePaths = () => {
    const siteBase = (() => {
      const current = new URL(window.location.href);
      const path = current.pathname;
      if (path.includes('/pages/')) return new URL('../', current.href).href;
      return new URL('.', current.href).href;
    })();

    document.querySelectorAll('[href^="/"], [src^="/"]').forEach((element) => {
      if (element.dataset.rootResolved === 'true') return;
      const attribute = element.hasAttribute('href') ? 'href' : 'src';
      const value = element.getAttribute(attribute);
      if (!value || value.startsWith('//') || !value.startsWith('/')) return;

      const resolved = new URL(value.slice(1), siteBase).href;
      element.setAttribute(attribute, resolved);
      element.dataset.rootResolved = 'true';
    });
  };

  const render = () => {
    Object.entries(templates).forEach(([name, markup]) => {
      const mount = document.querySelector(`[data-component="${name}"]`);
      if (!mount) return;

      const template = document.createElement('template');
      template.innerHTML = markup.trim();
      const fragment = template.content.cloneNode(true);
      resolveSitePaths(fragment);
      mount.replaceWith(fragment);
    });
  };

  // Any page element marked data-social="Facebook" etc. gets that account's link, icon and handle.
  const fillSocialSlots = () => {
    document.querySelectorAll('[data-social]').forEach((element) => {
      const social = SOCIAL_ICONS.find(({ label }) => label === element.dataset.social);
      if (!social) return;
      element.setAttribute('href', social.href);
      if (social.href !== '#') {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener');
      }
      const icon = element.querySelector('[data-social-icon]');
      if (icon) icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${social.path}"></path></svg>`;
      const handle = element.querySelector('[data-social-handle]');
      if (handle) handle.innerHTML = social.handle;
    });
  };

  window.SagabComponents = Object.freeze({ render, siteRoot: siteRoot.href });
  render();
  resolveDocumentSitePaths();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fillSocialSlots);
  } else {
    fillSocialSlots();
  }
})();
