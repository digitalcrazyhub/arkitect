/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * CENTRAL ANIMATION SYSTEM (js/animations.js)
 * GSAP 3 & ScrollTrigger with Native Fallback Resilience,
 * Accessibility (prefers-reduced-motion), and Centralized Orchestration.
 * ==============================================================================
 */

(function () {
  'use strict';

  let isInitialized = false;
  let scrollProgressEl = null;

  /**
   * Checks if user has enabled OS-level reduced motion
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Immediately marks document as animations-ready once JS executes
   */
  function markReady() {
    if (prefersReducedMotion()) {
      document.documentElement.classList.remove('animations-ready', 'js-reveal-active');
      return;
    }
    document.documentElement.classList.add('animations-ready', 'js-reveal-active');
  }

  /**
   * Reading & Scroll Progress Indicator (Sticky Header Bottom Edge)
   */
  function initScrollProgress() {
    if (prefersReducedMotion()) return;

    const header = document.getElementById('site-header');
    if (!header) return;

    if (!scrollProgressEl) {
      scrollProgressEl = document.createElement('div');
      scrollProgressEl.className = 'arch-scroll-progress';
      scrollProgressEl.setAttribute('aria-hidden', 'true');
      header.appendChild(scrollProgressEl);
    }

    let ticking = false;
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      if (scrollProgressEl) {
        scrollProgressEl.style.width = `${progress.toFixed(2)}%`;
      }
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateProgress);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateProgress();
  }

  /**
   * Primary Scroll Reveal Engine (IntersectionObserver)
   * High performance, zero inline style clashes, guarantees 100% reliability.
   */
  function initScrollReveal() {
    const selector = [
      '.reveal',
      '.reveal-up',
      '.reveal-fade',
      '.reveal-left',
      '.reveal-right',
      '.reveal-zoom',
      '.reveal-blur',
      '.image-reveal',
      '.stagger-item',
      '.arch-reveal',
      '.arch-reveal-fade',
      '.arch-reveal-left',
      '.arch-reveal-right',
      '.arch-reveal-scale',
      '.arch-reveal-mask',
      '[data-arch-reveal]'
    ].join(', ');

    const targets = document.querySelectorAll(selector);

    if (prefersReducedMotion()) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08
      }
    );

    targets.forEach((el) => {
      // Check if element is already within viewport on load
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-revealed');
      } else {
        observer.observe(el);
      }
    });
  }

  /**
   * GSAP ScrollTrigger Integration for Advanced Orchestration & Parallax
   */
  function initGsapEnhancements() {
    if (prefersReducedMotion()) return;

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    // Subtle Parallax on Desktop for Page Banner Imagery (>768px)
    if (window.innerWidth >= 768) {
      const bannerImg = document.querySelector('.page-banner-img');
      if (bannerImg) {
        gsap.to(bannerImg, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: '.page-banner',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6
          }
        });
      }
    }
  }

  /**
   * Smooth Anchor Navigation (respects sticky navbar height)
   */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const hash = this.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 84;
          const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({
            top: targetY,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
          });
        }
      });
    });
  }

  /**
   * Auto-decorates any remaining sections/cards that lack explicit markup classes
   */
  function autoDecorateFallback() {
    // Split cards
    document.querySelectorAll('.service-split-card').forEach((sc) => {
      if (!sc.classList.contains('card-lift')) sc.classList.add('card-lift');
    });

    // Project cards
    document.querySelectorAll('.project-card').forEach((pc) => {
      if (!pc.classList.contains('card-lift')) pc.classList.add('card-lift');
    });

    // Feature / process / contact cards
    document.querySelectorAll('.feature-card, .process-card, .contact-card, .value-card').forEach((c) => {
      if (!c.classList.contains('card-lift')) c.classList.add('card-lift');
    });
  }

  /**
   * Main Initialization Orchestration
   */
  function init() {
    markReady();
    autoDecorateFallback();
    initScrollProgress();
    initScrollReveal();
    initGsapEnhancements();
    initSmoothAnchors();
    isInitialized = true;
  }

  // Handle dynamic component loading from js/components.js
  document.addEventListener('componentsLoaded', () => {
    initScrollProgress();
    initScrollReveal();
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  });

  // Execute on DOM readiness
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Window load refresh
  window.addEventListener('load', () => {
    initScrollReveal();
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  });
})();
