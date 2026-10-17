/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * HERO CAROUSEL MODULE (js/carousel.js)
 * Controls the 4-slide hero presentation, syncs counters, dots, touch swipe & autoplay.
 * ==============================================================================
 */

(function () {
  'use strict';

  function initHeroCarousel() {
    const section = document.getElementById('hero-carousel-section');
    if (!section) return;

    const slides = Array.from(section.querySelectorAll('.hero-slide'));
    const dots = Array.from(section.querySelectorAll('.hero-dot'));
    const prevBtn = document.getElementById('hero-prev-btn');
    const nextBtn = document.getElementById('hero-next-btn');
    const currentNumEl = document.getElementById('hero-current-num');

    if (!slides.length) return;

    const totalSlides = slides.length; // Exactly 4 slides
    let currentIndex = 0;
    let autoplayTimer = null;
    const AUTOPLAY_INTERVAL = 6000;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /**
     * Updates slide visibility, dot indicators, and counter display.
     * @param {number} newIndex
     */
    function goToSlide(newIndex) {
      if (newIndex >= totalSlides) {
        currentIndex = 0;
      } else if (newIndex < 0) {
        currentIndex = totalSlides - 1;
      } else {
        currentIndex = newIndex;
      }

      // Update slide active state and accessibility attributes
      slides.forEach((slide, idx) => {
        const isActive = idx === currentIndex;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });

      // Update dot indicators
      dots.forEach((dot, idx) => {
        const isActive = idx === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });

      // Update counter (format: "01", "02", etc.)
      if (currentNumEl) {
        currentNumEl.textContent = String(currentIndex + 1).padStart(2, '0');
      }
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    // Autoplay controls
    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayTimer = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    // Event Listeners for Nav Arrows
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoplay();
      });
    }

    // Event Listeners for Dot Indicators
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startAutoplay();
      });
    });

    // Pause on interaction / hover
    section.addEventListener('mouseenter', stopAutoplay);
    section.addEventListener('mouseleave', startAutoplay);
    section.addEventListener('focusin', stopAutoplay);
    section.addEventListener('focusout', startAutoplay);

    // Keyboard navigation (Arrow keys)
    section.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoplay();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoplay();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    section.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    section.addEventListener(
      'touchend',
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 50) {
          if (diffX < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          startAutoplay();
        }
      },
      { passive: true }
    );

    // Initialise slide 0
    goToSlide(0);
    startAutoplay();
  }

  /**
   * ==============================================================================
   * FEATURED PROJECTS HORIZONTAL CAROUSEL
   * Infinite seamless looping, 2s autoplay, touch swipe, hover/visibility pause,
   * card touch summary reveal, and keyboard controls.
   * ==============================================================================
   */
  function initFeaturedProjectsCarousel() {
    const section = document.getElementById('projects-section');
    if (!section) return;

    const viewport = document.getElementById('projects-carousel-viewport');
    const track = document.getElementById('projects-carousel-track');
    const prevBtn = document.getElementById('projects-prev-btn');
    const nextBtn = document.getElementById('projects-next-btn');

    if (!viewport || !track) return;

    // Collect original slides
    const originalSlides = Array.from(track.querySelectorAll('.project-slide-card'));
    const totalOriginals = originalSlides.length;
    if (totalOriginals === 0) return;

    const AUTOPLAY_INTERVAL = 2000;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Clone slides before and after to create a seamless infinite loop buffer
    const cloneCount = totalOriginals;
    const prependFragment = document.createDocumentFragment();
    const appendFragment = document.createDocumentFragment();

    originalSlides.forEach((slide) => {
      const cloneBefore = slide.cloneNode(true);
      cloneBefore.classList.add('is-clone');
      cloneBefore.setAttribute('aria-hidden', 'true');
      cloneBefore.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
      prependFragment.appendChild(cloneBefore);

      const cloneAfter = slide.cloneNode(true);
      cloneAfter.classList.add('is-clone');
      cloneAfter.setAttribute('aria-hidden', 'true');
      cloneAfter.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
      appendFragment.appendChild(cloneAfter);
    });

    track.insertBefore(prependFragment, track.firstChild);
    track.appendChild(appendFragment);

    let currentIndex = cloneCount; // Start at first original slide
    let isAnimating = false;
    let animationSafetyTimer = null;
    let autoplayTimer = null;
    let isHovered = false;
    let isInteracting = false;
    let isSuppressClick = false;

    /**
     * Calculates the step distance (single card width + gap) in pixels.
     * Uses layout offsetWidth for robust performance immune to CSS transforms.
     */
    function getSlideStep() {
      const allSlides = track.querySelectorAll('.project-slide-card');
      if (allSlides.length === 0) return 0;
      const gap = parseFloat(window.getComputedStyle(track).gap) || 28;
      const cardWidth = allSlides[0].offsetWidth;
      if (cardWidth > 0) {
        return cardWidth + gap;
      }
      if (allSlides.length >= 2) {
        const step = allSlides[1].getBoundingClientRect().left - allSlides[0].getBoundingClientRect().left;
        if (step > 0) return step;
      }
      return 500;
    }

    /**
     * Updates track transform position.
     * @param {boolean} animated
     */
    function updatePosition(animated = true) {
      const step = getSlideStep();
      const offset = currentIndex * step;

      if (!animated || prefersReducedMotion) {
        track.style.transition = 'none';
      } else {
        track.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
      }

      track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    }

    /**
     * Handles wrapping of clone slides back to original slides without visual jump.
     */
    function finishTransition() {
      clearTimeout(animationSafetyTimer);

      if (currentIndex >= cloneCount + totalOriginals) {
        currentIndex = currentIndex - totalOriginals;
        updatePosition(false);
        track.offsetHeight; // Force reflow
      } else if (currentIndex < cloneCount) {
        currentIndex = currentIndex + totalOriginals;
        updatePosition(false);
        track.offsetHeight; // Force reflow
      }

      isAnimating = false;
    }

    /**
     * Advance to next slide.
     */
    function nextSlide() {
      if (isAnimating) {
        finishTransition();
      }
      isAnimating = true;
      currentIndex++;
      updatePosition(true);

      clearTimeout(animationSafetyTimer);
      animationSafetyTimer = setTimeout(finishTransition, 680);
    }

    /**
     * Move to previous slide.
     */
    function prevSlide() {
      if (isAnimating) {
        finishTransition();
      }
      isAnimating = true;
      currentIndex--;
      updatePosition(true);

      clearTimeout(animationSafetyTimer);
      animationSafetyTimer = setTimeout(finishTransition, 680);
    }

    /**
     * Listen to transitionend on track.
     */
    track.addEventListener('transitionend', (e) => {
      if (e.target !== track || e.propertyName !== 'transform') return;
      finishTransition();
    });

    // Autoplay Controls (2-second interval)
    function startAutoplay() {
      if (prefersReducedMotion || totalOriginals <= 1) return;
      stopAutoplay();
      if (isHovered || isInteracting || document.hidden) return;
      autoplayTimer = setInterval(() => {
        nextSlide();
      }, AUTOPLAY_INTERVAL);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    // Navigation Buttons (Desktop + Mobile Click)
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
        stopAutoplay();
        startAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
        stopAutoplay();
        startAutoplay();
      });
    }

    // Pause on Hover / Focus
    viewport.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoplay();
    });

    viewport.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoplay();
    });

    viewport.addEventListener('focusin', () => {
      isHovered = true;
      stopAutoplay();
    });

    viewport.addEventListener('focusout', () => {
      isHovered = false;
      startAutoplay();
    });

    // Pause when page / tab is hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    // Keyboard Navigation (ArrowLeft / ArrowRight)
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        stopAutoplay();
        startAutoplay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        stopAutoplay();
        startAutoplay();
      }
    });

    // Unified Pointer Dragging (Desktop Mouse Drag + Mobile Touch Drag)
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerCurrentX = 0;
    let pointerStartTranslate = 0;
    let isPointerDown = false;
    let isDragging = false;

    viewport.addEventListener('pointerdown', (e) => {
      // Allow only primary button (left mouse click) or touch
      if (e.button !== 0) return;

      // Don't drag if user clicked directly on a navigation button
      if (e.target.closest('#projects-prev-btn, #projects-next-btn')) return;

      if (isAnimating) {
        finishTransition();
      }

      isPointerDown = true;
      isDragging = false;
      isInteracting = true;
      stopAutoplay();

      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      pointerCurrentX = e.clientX;

      const step = getSlideStep();
      pointerStartTranslate = -currentIndex * step;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;

      const dx = e.clientX - pointerStartX;
      const dy = e.clientY - pointerStartY;

      if (!isDragging) {
        // Touch device: if user is scrolling vertically, cancel drag
        if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
          isPointerDown = false;
          startAutoplay();
          return;
        }

        // Start horizontal drag once threshold passed
        if (Math.abs(dx) > 8) {
          isDragging = true;
          viewport.classList.add('is-dragging');
          track.classList.add('is-dragging');
          try {
            if (viewport.setPointerCapture) {
              viewport.setPointerCapture(e.pointerId);
            }
          } catch (_) {}
        }
      }

      if (isDragging) {
        e.preventDefault();
        pointerCurrentX = e.clientX;
        track.style.transition = 'none';
        track.style.transform = `translate3d(${pointerStartTranslate + dx}px, 0, 0)`;
      }
    }, { passive: false });

    function handlePointerUp(e) {
      if (!isPointerDown) return;
      isPointerDown = false;
      isInteracting = false;

      if (isDragging) {
        isDragging = false;
        viewport.classList.remove('is-dragging');
        track.classList.remove('is-dragging');

        try {
          if (viewport.releasePointerCapture) {
            viewport.releasePointerCapture(e.pointerId);
          }
        } catch (_) {}

        const dx = pointerCurrentX - pointerStartX;
        isSuppressClick = true;
        setTimeout(() => {
          isSuppressClick = false;
        }, 250);

        // Advance or snap back based on drag distance
        if (Math.abs(dx) > 50) {
          if (dx < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        } else {
          updatePosition(true);
        }
      }

      startAutoplay();
    }

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    // Suppress link navigation when card was dragged
    track.addEventListener('click', (e) => {
      if (isSuppressClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const card = e.target.closest('.project-slide-card');
      if (!card) return;

      // If user clicked direct link/button, allow navigation
      if (e.target.closest('a, button')) return;

      // On touch / card tap, toggle active state to reveal summary
      const isAlreadyActive = card.classList.contains('active');
      track.querySelectorAll('.project-slide-card.active').forEach((c) => c.classList.remove('active'));
      if (!isAlreadyActive) {
        card.classList.add('active');
      }
    });

    // Horizontal Trackpad / Mouse Wheel Scroll Support
    let isWheelThrottled = false;
    viewport.addEventListener('wheel', (e) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX > 30 && absX > absY) {
        e.preventDefault();
        if (isWheelThrottled) return;
        isWheelThrottled = true;
        if (e.deltaX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        stopAutoplay();
        startAutoplay();
        setTimeout(() => {
          isWheelThrottled = false;
        }, 400);
      }
    }, { passive: false });

    // Handle Window Resize with debounced repositioning
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updatePosition(false);
      }, 100);
    });

    // Initialize initial position and start autoplay
    updatePosition(false);
    startAutoplay();
  }

  function initAllCarousels() {
    initHeroCarousel();
    initFeaturedProjectsCarousel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCarousels);
  } else {
    initAllCarousels();
  }
})();
