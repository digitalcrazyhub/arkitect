/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * SKELETON LOADING & SHIMMER MODULE (js/skeleton.js)
 * Provides subtle shimmer placeholders for asynchronously loading images and media.
 * Removes effect immediately upon load/error with zero permanent display.
 * ==============================================================================
 */

(function () {
  'use strict';

  // Check user motion preference
  const isReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Applies skeleton shimmer to an image's media container while it is loading.
   * @param {HTMLImageElement} img
   */
  function setupImageSkeleton(img) {
    if (!img || !(img instanceof HTMLImageElement)) return;

    // Exclude hero background images and brand logos from skeleton loading
    if (img.classList.contains('hero-bg-img') || img.classList.contains('brand-logo-img')) {
      return;
    }

    // If image is already completely loaded, do nothing
    if (img.complete && img.naturalWidth !== 0) {
      return;
    }

    // Determine target container (prefer existing media wrapper / frame)
    const container =
      img.closest(
        '.image-zoom-frame, .project-card-media, .service-split-media, .about-service-media, .facility-type-media, .related-service-media, .feature-card-media, .service-intro-media-frame, .services-approach-media-frame, .testimonial-media-frame, .about-story-media-frame, .philosophy-feature-row, .page-banner-media, .lightbox-media-container'
      ) || img.parentElement;

    if (!container) return;

    if (!isReducedMotion()) {
      container.classList.add('skeleton-shimmer');
      container.classList.add('skeleton-loading');
      img.classList.add('skeleton-img-pending');
    }

    const cleanUp = () => {
      container.classList.remove('skeleton-shimmer');
      container.classList.remove('skeleton-loading');
      img.classList.remove('skeleton-img-pending');
      img.classList.add('skeleton-img-loaded');
      img.removeEventListener('load', onImageDone);
      img.removeEventListener('error', onImageDone);
    };

    const onImageDone = () => {
      cleanUp();
    };

    img.addEventListener('load', onImageDone, { once: true });
    img.addEventListener('error', onImageDone, { once: true });

    // Safety timeout: ensure skeleton never gets stuck if image fails to fire event
    setTimeout(() => {
      if (container.classList.contains('skeleton-shimmer')) {
        cleanUp();
      }
    }, 6000);
  }

  /**
   * Scans document for images that have not completed loading.
   */
  function initSkeletons() {
    const images = document.querySelectorAll('img');
    images.forEach(setupImageSkeleton);

    // Watch for dynamically loaded / changed images (like lightbox modal)
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
            const src = lightboxImg.getAttribute('src');
            // Ignore placeholder data URIs
            if (src && !src.startsWith('data:image/svg+xml')) {
              setupImageSkeleton(lightboxImg);
            }
          }
        });
      });
      observer.observe(lightboxImg, { attributes: true, attributeFilter: ['src'] });
    }
  }

  // Listen to componentsLoaded event for dynamically loaded components
  document.addEventListener('componentsLoaded', () => {
    initSkeletons();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSkeletons);
  } else {
    initSkeletons();
  }
})();
