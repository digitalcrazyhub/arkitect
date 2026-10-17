/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * COOKIE CONSENT & PRIVACY PREFERENCES MODULE (js/cookie-consent.js)
 * Fully accessible, privacy-conscious, zero-dependency consent manager.
 * ==============================================================================
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'artech_cookie_consent';
  const CURRENT_VERSION = 1;

  // Determine path to privacy-policy.html based on subdirectory
  const isInSubdir = window.location.pathname.includes('/services/');
  const privacyPolicyUrl = isInSubdir ? '../privacy-policy.html' : 'privacy-policy.html';

  /**
   * Retrieves saved consent choices from localStorage.
   * @returns {Object|null}
   */
  function getStoredConsent() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed && parsed.version === CURRENT_VERSION) {
        return parsed;
      }
    } catch (e) {
      console.warn('[CookieConsent] Failed to read from localStorage:', e);
    }
    return null;
  }

  /**
   * Saves consent choices to localStorage and dispatches an update event.
   * @param {Object} consent
   */
  function saveConsent(consent) {
    const payload = {
      version: CURRENT_VERSION,
      necessary: true,
      analytics: Boolean(consent.analytics),
      marketing: Boolean(consent.marketing),
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('[CookieConsent] Failed to save to localStorage:', e);
    }

    // Dispatch global event for external scripts/analytics to react
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: payload }));
    return payload;
  }

  let previousActiveElement = null;

  /**
   * Builds the DOM elements for Cookie Banner and Preferences Modal.
   */
  function injectConsentUI() {
    if (document.getElementById('artech-cookie-banner')) return;

    // 1. Cookie Banner
    const banner = document.createElement('div');
    banner.id = 'artech-cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie and Privacy Notice');
    banner.innerHTML = `
      <div class="container cookie-banner-container">
        <div class="cookie-banner-content">
          <p class="cookie-banner-title"><strong>Privacy & Cookie Notice</strong></p>
          <p class="cookie-banner-text">
            We use essential cookies to maintain security and form processing on this website. With your permission, we also use optional cookies to analyze traffic and enhance your browsing experience. Read our <a href="${privacyPolicyUrl}" class="cookie-policy-link">Privacy Policy</a> to learn more.
          </p>
        </div>
        <div class="cookie-banner-actions">
          <button type="button" class="btn btn-primary cookie-btn" id="cookie-accept-all">Accept All</button>
          <button type="button" class="btn btn-outline cookie-btn" id="cookie-reject-all">Reject Non-Essential</button>
          <button type="button" class="cookie-btn-link" id="cookie-open-modal">Preferences</button>
        </div>
      </div>
    `;

    // 2. Preferences Modal Backdrop & Dialog
    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'artech-cookie-modal';
    modalBackdrop.className = 'cookie-modal-backdrop';
    modalBackdrop.setAttribute('aria-hidden', 'true');
    modalBackdrop.innerHTML = `
      <div class="cookie-modal-card" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <div class="cookie-modal-header">
          <h2 class="cookie-modal-title" id="cookie-modal-title">Cookie & Privacy Preferences</h2>
          <button type="button" class="cookie-modal-close" id="cookie-modal-close-btn" aria-label="Close preferences dialog">&times;</button>
        </div>
        <div class="cookie-modal-body">
          <p class="cookie-modal-description">
            We respect your privacy. Choose which cookie categories you wish to allow during your visits. Essential cookies are required for website security and cannot be disabled.
          </p>

          <form id="cookie-preferences-form" class="cookie-category-list">
            <!-- Necessary -->
            <div class="cookie-category-item">
              <div class="cookie-category-info">
                <div class="cookie-category-header">
                  <span class="cookie-category-name">Strictly Necessary</span>
                  <span class="cookie-category-badge">Always Active</span>
                </div>
                <p class="cookie-category-desc">
                  Required for core site functions, CSRF protection on contact forms, and security authentication.
                </p>
              </div>
              <div class="cookie-category-control">
                <input type="checkbox" id="consent-necessary" checked disabled aria-label="Strictly Necessary Cookies (Always Active)">
              </div>
            </div>

            <!-- Analytics -->
            <div class="cookie-category-item">
              <div class="cookie-category-info">
                <div class="cookie-category-header">
                  <label for="consent-analytics" class="cookie-category-name">Analytics & Performance</label>
                </div>
                <p class="cookie-category-desc">
                  Enables anonymous measurement of website visits and user interactions to help us improve site performance.
                </p>
              </div>
              <div class="cookie-category-control">
                <input type="checkbox" id="consent-analytics" class="cookie-checkbox">
              </div>
            </div>

            <!-- Marketing -->
            <div class="cookie-category-item">
              <div class="cookie-category-info">
                <div class="cookie-category-header">
                  <label for="consent-marketing" class="cookie-category-name">Marketing & Media</label>
                </div>
                <p class="cookie-category-desc">
                  Permits third-party interactive embeds (such as rich maps or embedded social media previews).
                </p>
              </div>
              <div class="cookie-category-control">
                <input type="checkbox" id="consent-marketing" class="cookie-checkbox">
              </div>
            </div>
          </form>
        </div>

        <div class="cookie-modal-footer">
          <button type="button" class="btn btn-outline cookie-modal-btn" id="cookie-modal-reject-btn">Reject All</button>
          <button type="button" class="btn btn-outline cookie-modal-btn" id="cookie-modal-save-btn">Save Preferences</button>
          <button type="button" class="btn btn-primary cookie-modal-btn" id="cookie-modal-accept-btn">Accept All</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    document.body.appendChild(modalBackdrop);

    attachEventListeners(banner, modalBackdrop);
  }

  /**
   * Shows or hides the banner.
   */
  function setBannerVisible(visible) {
    const banner = document.getElementById('artech-cookie-banner');
    if (!banner) return;
    if (visible) {
      banner.classList.add('is-visible');
    } else {
      banner.classList.remove('is-visible');
    }
  }

  /**
   * Opens the Preferences Modal.
   */
  function openPreferencesModal() {
    const modal = document.getElementById('artech-cookie-modal');
    if (!modal) return;

    previousActiveElement = document.activeElement;

    // Load current values
    const current = getStoredConsent() || { analytics: false, marketing: false };
    const analyticsCheckbox = document.getElementById('consent-analytics');
    const marketingCheckbox = document.getElementById('consent-marketing');

    if (analyticsCheckbox) analyticsCheckbox.checked = Boolean(current.analytics);
    if (marketingCheckbox) marketingCheckbox.checked = Boolean(current.marketing);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cookie-modal-lock');

    // Focus close button or first interactive element
    const closeBtn = document.getElementById('cookie-modal-close-btn');
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 50);
    }
  }

  /**
   * Closes the Preferences Modal.
   */
  function closePreferencesModal() {
    const modal = document.getElementById('artech-cookie-modal');
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cookie-modal-lock');

    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  }

  /**
   * Attaches event listeners to banner, modal, and global trigger buttons.
   */
  function attachEventListeners(banner, modal) {
    // Banner Accept All
    document.getElementById('cookie-accept-all')?.addEventListener('click', () => {
      saveConsent({ analytics: true, marketing: true });
      setBannerVisible(false);
    });

    // Banner Reject Non-Essential
    document.getElementById('cookie-reject-all')?.addEventListener('click', () => {
      saveConsent({ analytics: false, marketing: false });
      setBannerVisible(false);
    });

    // Banner Open Preferences
    document.getElementById('cookie-open-modal')?.addEventListener('click', () => {
      openPreferencesModal();
    });

    // Modal Close button
    document.getElementById('cookie-modal-close-btn')?.addEventListener('click', () => {
      closePreferencesModal();
    });

    // Click outside modal card
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closePreferencesModal();
      }
    });

    // Modal Save Preferences
    document.getElementById('cookie-modal-save-btn')?.addEventListener('click', () => {
      const analyticsChecked = document.getElementById('consent-analytics')?.checked || false;
      const marketingChecked = document.getElementById('consent-marketing')?.checked || false;
      saveConsent({ analytics: analyticsChecked, marketing: marketingChecked });
      closePreferencesModal();
      setBannerVisible(false);
    });

    // Modal Accept All
    document.getElementById('cookie-modal-accept-btn')?.addEventListener('click', () => {
      saveConsent({ analytics: true, marketing: true });
      closePreferencesModal();
      setBannerVisible(false);
    });

    // Modal Reject All
    document.getElementById('cookie-modal-reject-btn')?.addEventListener('click', () => {
      saveConsent({ analytics: false, marketing: false });
      closePreferencesModal();
      setBannerVisible(false);
    });

    // Keyboard accessibility: ESC to close modal, Trap Focus
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;

      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        closePreferencesModal();
        return;
      }

      if (e.key === 'Tab' || e.keyCode === 9) {
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });

    // Listen on footer or page trigger buttons dynamically
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.cookie-pref-btn, #open-cookie-preferences');
      if (target) {
        e.preventDefault();
        openPreferencesModal();
      }
    });
  }

  /**
   * Initializes consent system on page load.
   */
  function init() {
    injectConsentUI();
    const stored = getStoredConsent();
    if (!stored) {
      // Delay presentation slightly to prevent sudden layout shift during initial paint
      setTimeout(() => {
        setBannerVisible(true);
      }, 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external scripts or manual inspection
  window.ArtechConsent = {
    get: getStoredConsent,
    save: saveConsent,
    open: openPreferencesModal,
    close: closePreferencesModal
  };
})();
