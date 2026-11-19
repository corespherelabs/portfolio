'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ========================
  // CONFIG
  // ========================
  const NAV_OFFSET = 70;
  const SECTIONS = ['home', 'about', 'skills', 'projects', 'journey', 'services', 'github', 'contact'];

  // ========================
  // ELEMENT REFS
  // ========================
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.querySelector('.hamburger');
  const mobileMenu  = document.querySelector('.mobile-menu');
  const backToTop   = document.querySelector('.back-to-top');
  const copyEmailBtn = document.querySelector('.copy-email-btn');
  const toast       = document.getElementById('copy-toast');
  const yearEl      = document.getElementById('footer-year');

  // ========================
  // UTILITY
  // ========================

  /**
   * Returns true when the user prefers reduced motion.
   * @returns {boolean}
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Closes the mobile menu cleanly.
   */
  function closeMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  /**
   * Opens the mobile menu.
   */
  function openMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus first focusable element inside menu
    const firstFocusable = getFocusableElements(mobileMenu)[0];
    if (firstFocusable) firstFocusable.focus();
  }

  /**
   * Returns all focusable elements inside a container.
   * @param {HTMLElement} container
   * @returns {HTMLElement[]}
   */
  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.closest('[hidden]') && !el.closest('[aria-hidden="true"]'));
  }

  // ========================
  // SCROLL HANDLING
  // ========================

  let ticking = false;

  /**
   * Central scroll handler — updates navbar state and back-to-top visibility.
   */
  function handleScroll() {
    const scrollY = window.scrollY;

    // Navbar scroll state
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back-to-top visibility
    if (backToTop) {
      if (scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  }

  // Single rAF-throttled scroll listener
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Run once on load to set initial state
  handleScroll();

  // ========================
  // NAVBAR ACTIVE STATE
  // ========================

  /**
   * Sets the active class on nav links matching the given section id.
   * @param {string} sectionId
   */
  function setActiveNavLink(sectionId) {
    const selector = `.nav-links a[href="#${sectionId}"], .mobile-menu a[href="#${sectionId}"]`;
    // Remove active from all nav links
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
      a.classList.remove('active');
    });
    // Add active to matching links
    document.querySelectorAll(selector).forEach(a => {
      a.classList.add('active');
    });
  }

  // IntersectionObserver for active section — rootMargin ensures the section
  // must be in the middle portion of the viewport to be considered "active".
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveNavLink(entry.target.id);
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  });

  SECTIONS.forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  // ========================
  // MOBILE NAV
  // ========================

  if (hamburger && mobileMenu) {
    // Toggle on hamburger click
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on any link click inside mobile menu
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Keyboard handling inside mobile menu
    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusableElements(mobileMenu);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
          // Shift+Tab: if at first element, wrap to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if at last element, wrap to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  // Close mobile menu on Escape key globally
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // ========================
  // SMOOTH SCROLLING
  // ========================

  /**
   * Smoothly scrolls to the element identified by hash, offset by navbar height.
   * @param {string} hash — e.g. "#about"
   */
  function smoothScrollToHash(hash) {
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // Intercept all anchor clicks with internal href
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      smoothScrollToHash(href);
    });
  });

  // On page load: if URL has a hash, scroll to it after a small delay
  if (window.location.hash) {
    setTimeout(() => {
      smoothScrollToHash(window.location.hash);
    }, 150);
  }

  // ========================
  // SCROLL REVEAL
  // ========================

  const revealSelectors = [
    '[data-reveal]',
    '.feature-card',
    '.skill-category',
    '.project-card',
    '.service-card',
    '.timeline-item'
  ];

  const revealElements = Array.from(
    document.querySelectorAll(revealSelectors.join(', '))
  );

  if (prefersReducedMotion()) {
    // Immediately reveal all elements for users who prefer reduced motion
    revealElements.forEach(el => el.classList.add('revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ========================
  // BACK TO TOP
  // ========================

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========================
  // TOAST
  // ========================

  let toastTimeout = null;

  /**
   * Shows a toast notification with the given message.
   * @param {string} message
   * @param {number} [duration=2500]
   */
  function showToast(message, duration = 2500) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // ========================
  // COPY EMAIL
  // ========================

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = copyEmailBtn.dataset.email;
      if (!email) return;

      const originalText = copyEmailBtn.textContent;

      function onSuccess() {
        showToast('Email copied to clipboard! ✓');
        copyEmailBtn.textContent = 'Copied! ✓';
        setTimeout(() => {
          copyEmailBtn.textContent = originalText;
        }, 2000);
      }

      function onError() {
        showToast('Could not copy email');
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(onSuccess).catch(() => {
          // Fallback if clipboard API rejects
          fallbackCopy(email, onSuccess, onError);
        });
      } else {
        // Fallback for older browsers / file:// restrictions
        fallbackCopy(email, onSuccess, onError);
      }
    });
  }

  /**
   * Fallback copy using a hidden textarea and execCommand.
   * @param {string} text
   * @param {Function} onSuccess
   * @param {Function} onError
   */
  function fallbackCopy(text, onSuccess, onError) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const success = document.execCommand('copy');
      if (success) {
        onSuccess();
      } else {
        onError();
      }
    } catch (err) {
      onError();
    } finally {
      document.body.removeChild(textarea);
    }
  }

  // ========================
  // FOOTER YEAR
  // ========================

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ========================
  // TERMINAL CURSOR
  // ========================

  // Inject blinking cursor CSS
  const cursorStyle = document.createElement('style');
  cursorStyle.textContent = `
    .terminal-cursor {
      display: inline-block;
      width: 7px;
      height: 1em;
      background: #6366F1;
      margin-left: 2px;
      vertical-align: text-bottom;
      animation: cursor-blink 1.1s step-end infinite;
    }
    @keyframes cursor-blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
  `;
  document.head.appendChild(cursorStyle);

  // Append the cursor span to the last line of the terminal body
  const terminalBody = document.querySelector('.terminal-body');
  if (terminalBody) {
    const lines = terminalBody.children;
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = '_';
      lastLine.appendChild(cursor);
    }
  }

  // ========================
  // CARD TILT
  // ========================

  /**
   * Applies a subtle perspective tilt to project cards on mousemove.
   */
  function initCardTilt() {
    const cards = document.querySelectorAll('.project-card');
    if (prefersReducedMotion() || !cards.length) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect  = card.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const dx    = e.clientX - cx;
        const dy    = e.clientY - cy;
        // Normalise to -1 … +1, then scale to max 4°
        const maxDeg = 4;
        const rotX   = -(dy / (rect.height / 2)) * maxDeg;
        const rotY   =  (dx / (rect.width  / 2)) * maxDeg;
        card.style.transition = 'transform 0.1s ease';
        card.style.transform  = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.4s ease';
        card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  initCardTilt();

  // ========================
  // INIT — final run-once tasks
  // ========================

  // Run handleScroll once immediately so navbar + back-to-top are in
  // the correct state if the page is loaded mid-scroll (e.g. browser
  // restores scroll position).
  handleScroll();

});
