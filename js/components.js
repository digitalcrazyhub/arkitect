/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * COMPONENT LOADER MODULE (js/components.js)
 * Loads reusable HTML fragments (navbar.html, footer.html) via native fetch().
 * Automatically resolves relative paths when loaded from subdirectories.
 * ==============================================================================
 */

(function () {
  'use strict';

  /**
   * Loads an external HTML component into a designated DOM container.
   * @param {string} url - Relative path to the component HTML file.
   * @param {string} containerId - Target DOM container ID.
   * @returns {Promise<boolean>} True if loaded successfully.
   */
  async function loadComponent(url, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: status ${response.status}`);
      }
      const html = await response.text();
      container.innerHTML = html;
      return true;
    } catch (error) {
      console.warn(`[ComponentLoader] Could not fetch ${url}. Preserving fallback content.`, error);
      return false;
    }
  }

  /**
   * Initializes all global components.
   */
  async function initComponents() {
    const isLocalFile = window.location.protocol === 'file:';
    if (isLocalFile) {
      console.info('[ComponentLoader] Running under file:// protocol. Reusable components require HTTP server (e.g. http://localhost/arkitect/). Keeping fallback content intact.');
      document.dispatchEvent(new CustomEvent('componentsLoaded'));
      return;
    }

    // Determine path depth relative to root
    const isInSubdir = window.location.pathname.includes('/services/');
    const basePath = isInSubdir ? '../' : '';

    // Load navbar and footer concurrently
    await Promise.allSettled([
      loadComponent(basePath + 'components/navbar.html', 'navbar-placeholder'),
      loadComponent(basePath + 'components/footer.html', 'footer-placeholder')
    ]);

    // If inside a subdirectory, normalize relative links and assets inside injected components
    if (isInSubdir) {
      const adjustContainer = (id) => {
        const container = document.getElementById(id);
        if (!container) return;

        // Adjust images (e.g. assets/images/logo/... -> ../assets/images/logo/...)
        container.querySelectorAll('img[src^="assets/"]').forEach((img) => {
          img.setAttribute('src', '../' + img.getAttribute('src'));
        });

        // Adjust links
        container.querySelectorAll('a[href]').forEach((link) => {
          const href = link.getAttribute('href');
          if (
            href.startsWith('index.html') ||
            href.startsWith('about.html') ||
            href.startsWith('services.html') ||
            href.startsWith('projects.html') ||
            href.startsWith('contact.html') ||
            href.startsWith('privacy-policy.html') ||
            href.startsWith('terms-of-service.html')
          ) {
            link.setAttribute('href', '../' + href);
          } else if (href.startsWith('services/')) {
            // In subdirectory, links to sibling services become healthcare.html, residential.html, etc.
            link.setAttribute('href', href.replace(/^services\//, ''));
          }
        });
      };

      adjustContainer('navbar-placeholder');
      adjustContainer('footer-placeholder');
    }

    // Dispatch custom event to notify dependent scripts (navbar.js, footer handlers)
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
  } else {
    initComponents();
  }
})();
