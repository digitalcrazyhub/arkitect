/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * REUSABLE INFINITE LOGO MARQUEE MODULE (js/logo-carousel.js)
 * Manages two-row infinite smooth marquee animation tracks moving in opposite directions.
 * ==============================================================================
 */

(function () {
  'use strict';

  function initLogoMarquee() {
    const tracks = document.querySelectorAll('.marquee-track');
    if (!tracks.length) return;

    tracks.forEach((track) => {
      const content = track.querySelector('.marquee-content');
      if (!content) return;

      // Duplicate inner content to ensure an unbroken loop on ultra-wide viewports
      const originalItems = Array.from(content.children);
      if (originalItems.length > 0) {
        // Clone once to guarantee double width for CSS translateX(-50%)
        originalItems.forEach((item) => {
          const clone = item.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          content.appendChild(clone);
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogoMarquee);
  } else {
    initLogoMarquee();
  }
})();
