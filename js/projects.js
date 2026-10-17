/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * PROJECTS INTERACTION MODULE (js/projects.js)
 * Manages category filtering, counts, keyboard navigation, and the accessible
 * image lightbox with focus trap and body scroll locking.
 * ==============================================================================
 */

(function () {
  'use strict';

  function initProjects() {
    const filterButtons = document.querySelectorAll('.project-filter-btn');
    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    const galleryGrid = document.querySelector('.projects-gallery-grid');

    const lightbox = document.getElementById('project-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
    const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
    const lightboxNextBtn = document.getElementById('lightbox-next-btn');

    let currentVisibleCards = [...projectCards];
    let currentLightboxIndex = 0;
    let lastActiveElement = null;

    // -------------------------------------------------------------------------
    // 1. Category Filtering
    // -------------------------------------------------------------------------
    if (filterButtons.length && projectCards.length) {
      filterButtons.forEach((btn) => {
        btn.addEventListener('click', function () {
          const selectedFilter = this.getAttribute('data-filter') || 'all';

          // Update active button state
          filterButtons.forEach((b) => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
          });
          this.classList.add('active');
          this.setAttribute('aria-pressed', 'true');

          // Filter cards with smooth opacity transition
          if (galleryGrid) {
            galleryGrid.style.opacity = '0.5';
          }

          setTimeout(() => {
            currentVisibleCards = [];

            projectCards.forEach((card) => {
              const cardCategory = card.getAttribute('data-category');
              const isMatch = selectedFilter === 'all' || cardCategory === selectedFilter;

              if (isMatch) {
                card.classList.remove('is-hidden');
                currentVisibleCards.push(card);
              } else {
                card.classList.add('is-hidden');
              }
            });

            if (galleryGrid) {
              galleryGrid.style.opacity = '1';
            }
          }, 120);
        });
      });
    }

    // -------------------------------------------------------------------------
    // 2. Accessible Lightbox Modal
    // -------------------------------------------------------------------------
    function updateLightboxContent(index) {
      if (!currentVisibleCards.length) return;
      currentLightboxIndex = (index + currentVisibleCards.length) % currentVisibleCards.length;
      const targetCard = currentVisibleCards[currentLightboxIndex];

      const img = targetCard.querySelector('.project-card-img');
      const title = targetCard.querySelector('.project-card-title');
      const category = targetCard.querySelector('.project-card-category');
      const desc = targetCard.querySelector('.project-card-desc');

      if (lightboxImg && img) {
        lightboxImg.src = img.getAttribute('src');
        lightboxImg.alt = img.getAttribute('alt') || '';
      }
      if (lightboxTitle && title) {
        lightboxTitle.textContent = title.textContent.trim();
      }
      if (lightboxCategory) {
        if (category) {
          lightboxCategory.textContent = category.textContent.trim();
        } else {
          const rawCat = targetCard.getAttribute('data-category') || '';
          const formattedCat = rawCat
            ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1) + ' Architecture'
            : 'Architecture';
          lightboxCategory.textContent = formattedCat;
        }
      }
      if (lightboxDesc && desc) {
        lightboxDesc.textContent = desc.textContent.trim();
      }
    }

    function openLightbox(cardElement) {
      if (!lightbox) return;
      lastActiveElement = document.activeElement;

      // Find index within currently visible items
      const idx = currentVisibleCards.indexOf(cardElement);
      updateLightboxContent(idx >= 0 ? idx : 0);

      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');

      // Shift focus to close button
      if (lightboxCloseBtn) {
        setTimeout(() => lightboxCloseBtn.focus(), 100);
      }
    }

    function closeLightbox() {
      if (!lightbox || !lightbox.classList.contains('active')) return;

      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');

      if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus();
      }
    }

    // Bind triggers on each project card
    projectCards.forEach((card) => {
      // Direct click on project card opens the lightbox
      card.addEventListener('click', () => {
        openLightbox(card);
      });

      // Accessible keyboard trigger: Enter or Space
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(card);
        }
      });
    });

    // -------------------------------------------------------------------------
    // 3. Interactive 3D Tilt Effect with Specular Glare
    // -------------------------------------------------------------------------
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

    if (!prefersReducedMotion && !isTouchDevice) {
      const MAX_TILT = 11; // Max tilt degrees

      projectCards.forEach((card) => {
        const glare = card.querySelector('.project-card-glare');
        let cardRect = null;
        let isHovered = false;

        card.addEventListener('mouseenter', () => {
          isHovered = true;
          cardRect = card.getBoundingClientRect();
          card.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
          if (glare) {
            glare.style.opacity = '1';
          }
        });

        card.addEventListener('mousemove', (e) => {
          if (!isHovered) return;
          if (!cardRect) cardRect = card.getBoundingClientRect();

          const x = e.clientX - cardRect.left;
          const y = e.clientY - cardRect.top;
          const width = cardRect.width;
          const height = cardRect.height;

          // Normalized offset from center: -1 to +1
          const normX = (x / width) * 2 - 1;
          const normY = (y / height) * 2 - 1;

          const rotX = (-normY * MAX_TILT).toFixed(2);
          const rotY = (normX * MAX_TILT).toFixed(2);

          card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.025, 1.025, 1.025)`;

          if (glare) {
            const pctX = Math.round((x / width) * 100);
            const pctY = Math.round((y / height) * 100);
            glare.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 70%)`;
          }
        });

        card.addEventListener('mouseleave', () => {
          isHovered = false;
          cardRect = null;
          card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.3s ease';
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
          if (glare) {
            glare.style.opacity = '0';
          }
        });
      });
    }

    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', closeLightbox);
    }

    if (lightboxPrevBtn) {
      lightboxPrevBtn.addEventListener('click', () => {
        updateLightboxContent(currentLightboxIndex - 1);
      });
    }

    if (lightboxNextBtn) {
      lightboxNextBtn.addEventListener('click', () => {
        updateLightboxContent(currentLightboxIndex + 1);
      });
    }

    // Backdrop click
    if (lightbox) {
      const backdrop = lightbox.querySelector('.lightbox-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', closeLightbox);
      }

      // Keyboard navigation (Escape, Left, Right) & Focus Trap
      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          updateLightboxContent(currentLightboxIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          updateLightboxContent(currentLightboxIndex + 1);
        } else if (e.key === 'Tab') {
          // Focus trap within lightbox dialog
          const focusableElements = lightbox.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
          if (!focusableElements.length) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjects);
  } else {
    initProjects();
  }
})();
