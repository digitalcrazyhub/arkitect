/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * CLIENT TESTIMONIALS SLIDER MODULE (js/testimonial.js)
 * Manages testimonial slide transitions, keyboard navigation, touch swipe,
 * and authentic client reference showcase.
 * ==============================================================================
 */

(function () {
  'use strict';

  /**
   * Verified Testimonials Data Store
   * Note: As per project rules, testimonials are published only when authorized
   * by clients. When empty or pending verification, the UI displays the neutral
   * architectural reference showcase notice.
   */
  const TESTIMONIALS_CONFIG = {
    // Set to true once verified client quotes with written authorization are provided
    active: false,
    items: [
      /* Example schema for future client authorization:
      {
        quote: "Aspirations Architects Engineers delivered exceptional structural coordination and thoughtful spatial planning for our facility.",
        clientName: "Client Representative",
        designation: "Managing Director",
        organization: "Healthcare Facility Project"
      }
      */
    ]
  };

  function initTestimonialsSlider() {
    const sliderContainer = document.getElementById('testimonials-slider');
    if (!sliderContainer) return;

    const slides = Array.from(sliderContainer.querySelectorAll('.testimonial-slide'));
    const prevBtn = document.getElementById('testimonial-prev-btn');
    const nextBtn = document.getElementById('testimonial-next-btn');
    const dots = Array.from(document.querySelectorAll('.testimonial-dot'));
    const counterCurrent = document.getElementById('testimonial-current-num');

    if (!slides.length) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function goToSlide(index) {
      if (index >= totalSlides) {
        currentIndex = 0;
      } else if (index < 0) {
        currentIndex = totalSlides - 1;
      } else {
        currentIndex = index;
      }

      slides.forEach((slide, idx) => {
        const isActive = idx === currentIndex;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });

      dots.forEach((dot, idx) => {
        const isActive = idx === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });

      if (counterCurrent) {
        counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => goToSlide(idx));
    });

    // Keyboard navigation
    sliderContainer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentIndex + 1);
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    sliderContainer.addEventListener(
      'touchend',
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0) {
            goToSlide(currentIndex + 1);
          } else {
            goToSlide(currentIndex - 1);
          }
        }
      },
      { passive: true }
    );

    // Initialise slide 0
    goToSlide(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialsSlider);
  } else {
    initTestimonialsSlider();
  }
})();
