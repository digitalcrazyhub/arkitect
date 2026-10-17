/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * NAVBAR INTERACTION MODULE (js/navbar.js)
 * Manages sticky scroll state, automatic active page detection, accessible
 * dropdown menus, mobile navigation drawer, and keyboard navigation.
 * ==============================================================================
 */

(function () {
  'use strict';

  let initialized = false;

  /**
   * Automatically detects the active page from the URL path and applies
   * active class and aria-current attributes to matching navigation links.
   */
  function updateActivePageLinks() {
    const rawPath = window.location.pathname.toLowerCase();
    // Normalize path (handle root / or /index.html)
    const isHome = rawPath === '' ||
                   rawPath.endsWith('/') ||
                   rawPath.endsWith('/index.html') ||
                   rawPath.endsWith('/arkitect/') ||
                   rawPath.endsWith('/arkitect/index.html');
    const isAbout = rawPath.includes('about.html');
    const isServicesOverview = rawPath.endsWith('/services.html') || rawPath.endsWith('services.html');
    const isServiceDetail = rawPath.includes('/services/') || (rawPath.includes('services/') && !isServicesOverview);
    const isProjects = rawPath.includes('projects.html');
    const isContact = rawPath.includes('contact.html');

    // Remove existing active states
    document.querySelectorAll('.nav-link, .mobile-nav-link, .dropdown-link, .mobile-sublink').forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    function applyActive(selector) {
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.add('active');
        el.setAttribute('aria-current', 'page');
      });
    }

    if (isHome) {
      applyActive('#nav-home, #mobile-nav-home');
    } else if (isAbout) {
      applyActive('#nav-about, #mobile-nav-about');
    } else if (isServicesOverview) {
      applyActive('#services-main-link, #mobile-nav-services, .dropdown-overview-link, .mobile-overview-link');
    } else if (isServiceDetail) {
      // Mark parent Services link active
      applyActive('#services-main-link, #mobile-nav-services');
      // Mark specific service link active
      if (rawPath.includes('healthcare.html')) {
        applyActive('a[href*="healthcare.html"]');
      } else if (rawPath.includes('residential.html')) {
        applyActive('a[href*="residential.html"]');
      } else if (rawPath.includes('commercial.html')) {
        applyActive('a[href*="commercial.html"]');
      } else if (rawPath.includes('hospitality.html')) {
        applyActive('a[href*="hospitality.html"]');
      } else if (rawPath.includes('industrial.html')) {
        applyActive('a[href*="industrial.html"]');
      } else if (rawPath.includes('institutional.html')) {
        applyActive('a[href*="institutional.html"]');
      }
    } else if (isProjects) {
      applyActive('#nav-projects, #mobile-nav-projects');
    } else if (isContact) {
      applyActive('#nav-contact, #mobile-nav-contact');
    }
  }

  /**
   * Initializes all navbar interactivity (sticky scroll, dropdowns, drawer).
   */
  function initNavbar() {
    const header = document.getElementById('site-header');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navDrawer = document.getElementById('mobile-nav-drawer');
    const servicesNavItem = document.getElementById('services-nav-item');
    const servicesMenuBtn = document.getElementById('services-menu-button');
    const servicesDropdown = document.getElementById('services-dropdown-menu');
    const mobileServicesToggle = document.getElementById('mobile-services-toggle');
    const mobileServicesGroup = document.getElementById('mobile-services-group');
    const mobileServicesMenu = document.getElementById('mobile-services-menu');

    if (!header && !menuBtn) return;
    if (initialized) {
      // Re-run active link detection if DOM was reloaded
      updateActivePageLinks();
      return;
    }
    initialized = true;

    // Detect and apply active links
    updateActivePageLinks();

    // --------------------------------------------------------------------------
    // 1. Sticky Header Scroll Enhancement
    // --------------------------------------------------------------------------
    if (header) {
      const handleScroll = () => {
        if (window.scrollY > 15) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // --------------------------------------------------------------------------
    // 2. Desktop Services Dropdown (Click & Keyboard Support)
    // --------------------------------------------------------------------------
    if (servicesNavItem && servicesMenuBtn && servicesDropdown) {
      const toggleDropdown = (forceState) => {
        const currentlyOpen = servicesNavItem.classList.contains('open');
        const nextState = typeof forceState === 'boolean' ? forceState : !currentlyOpen;

        servicesNavItem.classList.toggle('open', nextState);
        servicesMenuBtn.setAttribute('aria-expanded', String(nextState));
      };

      // Toggle on chevron button click
      servicesMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown();
      });

      // Keyboard navigation
      servicesNavItem.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && servicesNavItem.classList.contains('open')) {
          toggleDropdown(false);
          servicesMenuBtn.focus();
        } else if (e.key === 'ArrowDown' && document.activeElement === servicesMenuBtn) {
          e.preventDefault();
          toggleDropdown(true);
          const firstLink = servicesDropdown.querySelector('a');
          if (firstLink) firstLink.focus();
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!servicesNavItem.contains(e.target)) {
          if (servicesNavItem.classList.contains('open')) {
            toggleDropdown(false);
          }
        }
      });
    }

    // --------------------------------------------------------------------------
    // 3. Mobile Hamburger Menu & Drawer
    // --------------------------------------------------------------------------
    if (menuBtn && navDrawer) {
      const toggleDrawer = (isOpen) => {
        const currentlyOpen = menuBtn.getAttribute('aria-expanded') === 'true';
        const shouldOpen = typeof isOpen === 'boolean' ? isOpen : !currentlyOpen;

        menuBtn.setAttribute('aria-expanded', String(shouldOpen));
        menuBtn.classList.toggle('active', shouldOpen);
        navDrawer.setAttribute('aria-hidden', String(!shouldOpen));
        navDrawer.classList.toggle('open', shouldOpen);

        // Lock background scroll when drawer is open
        document.body.style.overflow = shouldOpen ? 'hidden' : '';
      };

      menuBtn.addEventListener('click', () => toggleDrawer());

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
          toggleDrawer(false);
          menuBtn.focus();
        }
      });

      // Close drawer when any navigation link is clicked
      const drawerLinks = navDrawer.querySelectorAll('.mobile-nav-link:not(.mobile-services-link), .mobile-sublink, .btn-block');
      drawerLinks.forEach((link) => {
        link.addEventListener('click', () => toggleDrawer(false));
      });

      // Allow clicking mobile Services link to navigate and close drawer
      const mobileServicesLink = document.getElementById('mobile-nav-services');
      if (mobileServicesLink) {
        mobileServicesLink.addEventListener('click', () => toggleDrawer(false));
      }
    }

    // --------------------------------------------------------------------------
    // 4. Mobile Services Accordion Submenu
    // --------------------------------------------------------------------------
    if (mobileServicesToggle && mobileServicesMenu && mobileServicesGroup) {
      mobileServicesToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isExpanded = mobileServicesToggle.getAttribute('aria-expanded') === 'true';
        const nextState = !isExpanded;

        mobileServicesToggle.setAttribute('aria-expanded', String(nextState));
        mobileServicesGroup.classList.toggle('open', nextState);
        mobileServicesMenu.classList.toggle('open', nextState);
      });
    }
  }

  // Lifecycle listeners
  document.addEventListener('componentsLoaded', initNavbar);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
