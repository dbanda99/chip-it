(() => {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  // -----------------------------------------
  // Basic helpers
  // -----------------------------------------
  function setCurrentYear() {
    const year = new Date().getFullYear();
    qsa('[data-current-year]').forEach((el) => (el.textContent = String(year)));
  }

  function enhanceShell() {
    const header = qs('body > header');
    const nav = qs('.navbar', header || document);
    const footer = qs('body > footer');

    if (header) header.classList.add('site-header');
    if (nav) {
      nav.classList.add('site-navbar');
      nav.setAttribute('aria-label', nav.getAttribute('aria-label') || 'Primary navigation');

    }

    if (!footer || footer.dataset.enhanced === 'true') return;
    footer.dataset.enhanced = 'true';
    footer.className = 'site-footer footer-custom';
    footer.innerHTML = `
      <div class="container">
        <div class="site-footer__top">
          <div class="site-footer__brand">
            <a class="site-footer__logo" href="index.html" aria-label="Chip-IT home">
              <picture>
                <source type="image/webp" srcset="images/optimized/White-Logo-64.webp 64w" />
                <img src="images/optimized/White-Logo-64.png" width="42" height="42" alt="" decoding="async" />
              </picture>
              <span>Chip-IT</span>
            </a>
            <p>Local IT support for repairs, troubleshooting, data recovery, websites, and online invitations.</p>
            <div class="site-footer__social" aria-label="Social links">
              <a href="https://www.facebook.com/profile.php?id=61574150940398" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              <a href="https://www.instagram.com/officialchipit?igsh=MXUwenYzZWJueGJ4eg%3D%3D&utm_source=qr" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
              <a href="https://www.linkedin.com/in/davidbanda89?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
            </div>
          </div>

          <nav class="site-footer__nav" aria-label="Footer navigation">
            <div>
              <h2>Explore</h2>
              <a href="services.html">Services</a>
              <a href="quote.html">Instant quote</a>
              <a href="booking.html">Booking</a>
              <a href="portfolio.html">Work</a>
            </div>
            <div>
              <h2>Services</h2>
              <a href="services.html">Computer repair</a>
              <a href="services.html">Data backup</a>
              <a href="services.html">Remote support</a>
              <a href="services.html">Websites</a>
            </div>
            <div>
              <h2>Local</h2>
              <span>Rio Bravo, TX</span>
              <span>El Cenizo, TX</span>
              <span>Laredo area</span>
              <a href="about-us.html">About Chip-IT</a>
            </div>
          </nav>
        </div>

        <div class="site-footer__bottom">
          <p>Copyright &copy; <span data-current-year>2025</span> - David Banda</p>
          <div>
            <span>Clear estimates</span>
            <span>Privacy-minded support</span>
          </div>
        </div>
      </div>
    `;
  }

  function setActiveNav() {
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    qsa('.navbar .nav-link').forEach((a) => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (!href || href.startsWith('http')) return;
      if (href === current) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });
  }

  // -----------------------------------------
  // Reveal animations (supports dynamic inserts)
  // -----------------------------------------
  let revealObserver = null;

  function getRevealObserver() {
    if (revealObserver) return revealObserver;
    if (!('IntersectionObserver' in window)) return null;

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            revealObserver.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    );

    return revealObserver;
  }

  function refreshReveal() {
    const els = qsa('.reveal').filter((el) => !el.classList.contains('is-visible'));
    if (!els.length) return;

    const obs = getRevealObserver();
    if (!obs) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    els.forEach((el) => obs.observe(el));
  }

  // -----------------------------------------
  // Back to top
  // -----------------------------------------
  function initBackToTop() {
    const existing = qs('#backToTopBtn');
    if (existing) return;

    const btn = document.createElement('button');
    btn.id = 'backToTopBtn';
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    btn.setAttribute('aria-label', 'Back to top');
    btn.textContent = '↑';
    document.body.appendChild(btn);

    const onScroll = () => {
      if (window.scrollY > 600) btn.style.display = 'inline-flex';
      else btn.style.display = 'none';
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // -----------------------------------------
  // Sticky CTA bar (mobile)
  // -----------------------------------------
  function initStickyCTA() {
    // Optional: disable by adding <body data-cta="off">
    if (document.body && document.body.getAttribute('data-cta') === 'off') return;
    if (qs('.chipit-cta-bar')) return;

    // Configure these once you want real call/text buttons.
    const CONTACT = {
      phoneE164: '',      // Example: +19561234567
      whatsappE164: '',   // Example: +19561234567
    };

    const actions = [
      { href: 'quote.html', label: 'Quote', cls: 'cta-primary', icon: 'bi-lightning-charge' },
      { href: 'booking.html', label: 'Book', cls: 'cta-secondary', icon: 'bi-calendar2-check' },
      { href: 'services.html', label: 'Services', cls: 'cta-secondary', icon: 'bi-tools' },
    ];

    const digitsOnly = (s) => String(s || '').replace(/[^\d]/g, '');

    if (CONTACT.whatsappE164) {
      actions.unshift({
        href: `https://wa.me/${digitsOnly(CONTACT.whatsappE164)}`,
        label: 'Text',
        cls: 'cta-secondary',
        icon: 'bi-whatsapp',
        external: true
      });
    }

    if (CONTACT.phoneE164) {
      actions.unshift({
        href: `tel:${CONTACT.phoneE164}`,
        label: 'Call',
        cls: 'cta-secondary',
        icon: 'bi-telephone',
        external: true
      });
    }

    const finalActions = actions.slice(0, 4);

    const bar = document.createElement('nav');
    bar.className = 'chipit-cta-bar d-md-none';
    bar.setAttribute('aria-label', 'Quick actions');

    finalActions.forEach((a) => {
      const link = document.createElement('a');
      link.href = a.href;
      link.className = a.cls;
      link.setAttribute('aria-label', a.label);

      const icon = document.createElement('i');
      icon.className = `bi ${a.icon}`;

      const span = document.createElement('span');
      span.textContent = a.label;

      link.appendChild(icon);
      link.appendChild(span);

      if (a.external) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      bar.appendChild(link);
    });

    document.body.appendChild(bar);
  }

  // -----------------------------------------
  // Chatling + SW + Homepage video optimizations
  // -----------------------------------------
  function loadChatlingWhenIdle() {
    // Optional: disable by adding <body data-chatling="off">
    if (document.body && document.body.getAttribute('data-chatling') === 'off') return;
    if (window.__chipitChatLoaded) return;

    const load = () => {
      if (window.__chipitChatLoaded) return;
      window.__chipitChatLoaded = true;

      window.chtlConfig = { chatbotId: '7741564378' };

      const s = document.createElement('script');
      s.async = true;
      s.type = 'text/javascript';
      s.src = 'https://chatling.ai/js/embed.js';
      s.setAttribute('data-id', '7741564378');
      document.head.appendChild(s);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(load, { timeout: 2500 });
    } else {
      setTimeout(load, 1500);
    }
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  function optimizeHomepageVideo() {
    const video = qs('#bgVideo');
    if (!video) return;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection && navigator.connection.saveData;

    if (reduceMotion || saveData) {
      video.pause();
      video.removeAttribute('autoplay');
      video.style.display = 'none';
      return;
    }

    video.preload = 'metadata';
  }

  // -----------------------------------------
  // Init
  // -----------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    enhanceShell();
    setCurrentYear();
    setActiveNav();
    refreshReveal();
    initBackToTop();
    initStickyCTA();
    optimizeHomepageVideo();
    registerServiceWorker();
    loadChatlingWhenIdle();
  });

  // Allow dynamic pages to re-run reveal observer
  document.addEventListener('chipit:reveal:refresh', () => refreshReveal());
})();
