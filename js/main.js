/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * MAIN APPLICATION & HOMEPAGE ORCHESTRATION (js/main.js)
 * Manages dynamic year, smooth scrolling, and homepage initialization.
 * ==============================================================================
 */

(function () {
  'use strict';

  /**
   * Sets dynamic copyright year in footer.
   */
  function initDynamicYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  /**
   * Smooth scrolling for internal anchor links.
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Lifecycle Initialization
  function init() {
    initDynamicYear();
    initSmoothScroll();
  }

  document.addEventListener('componentsLoaded', initDynamicYear);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
