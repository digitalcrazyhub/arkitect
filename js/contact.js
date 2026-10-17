/**
 * ==============================================================================
 * ARTECH DESIGN WEBSITE (Aspirations Architects Engineers)
 * CONTACT PAGE INTERACTIVITY & FORM HANDLER (js/contact.js)
 * ==============================================================================
 */

(function () {
  'use strict';

  /**
   * Initializes contact page functionality when DOM is ready
   */
  function initContactPage() {
    initAddressCopy();
    initContactForm();
  }

  /**
   * Copies the verified office address to the user's clipboard
   */
  function initAddressCopy() {
    const copyBtn = document.getElementById('copy-address-btn');
    if (!copyBtn) return;

    const addressText = 'New No. 17, Old No. 5, 1st Floor, Aryagowder Road, West Mambalam, Chennai – 600 033, Tamil Nadu, India';

    copyBtn.addEventListener('click', async function () {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(addressText);
        } else {
          // Fallback for older browser contexts
          const tempInput = document.createElement('textarea');
          tempInput.value = addressText;
          tempInput.style.position = 'fixed';
          tempInput.style.opacity = '0';
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Address Copied!</span>
        `;
        copyBtn.setAttribute('aria-label', 'Office address copied to clipboard');

        setTimeout(function () {
          copyBtn.innerHTML = originalHtml;
          copyBtn.setAttribute('aria-label', 'Copy office address to clipboard');
        }, 3000);
      } catch (err) {
        console.warn('[Contact] Could not copy address automatically:', err);
      }
    });
  }

  /**
   * Initializes contact form validation, submission, and accessible error handling
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusAlert = document.getElementById('form-status');
    const submitBtn = document.getElementById('contact-submit-btn');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

    // Form inputs
    const fullnameInput = document.getElementById('contact-fullname');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const companyInput = document.getElementById('contact-company');
    const serviceInput = document.getElementById('contact-service');
    const locationInput = document.getElementById('contact-location');
    const messageInput = document.getElementById('contact-message');
    const privacyInput = document.getElementById('contact-privacy');
    const charCounter = document.getElementById('char-counter');

    // Live character counter for message textarea
    if (messageInput && charCounter) {
      const updateCounter = function () {
        const length = messageInput.value.length;
        charCounter.textContent = `${length} / 3000`;
        if (length > 3000) {
          charCounter.style.color = '#C0392B';
        } else {
          charCounter.style.color = '';
        }
      };
      messageInput.addEventListener('input', updateCounter);
      updateCounter();
    }

    /**
     * Helper to show or clear individual field error
     */
    function setFieldError(input, errorElementId, message) {
      const errorEl = document.getElementById(errorElementId);
      if (!errorEl) return;

      if (message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        input.setAttribute('aria-invalid', 'true');
        errorEl.textContent = message;
      } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        input.removeAttribute('aria-invalid');
        errorEl.textContent = '';
      }
    }

    /**
     * Clears error for a field without marking valid yet
     */
    function clearFieldError(input, errorElementId) {
      const errorEl = document.getElementById(errorElementId);
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.textContent = '';
      }
    }

    /**
     * Validates full name
     */
    function validateFullname() {
      const val = fullnameInput.value.trim();
      if (!val) {
        setFieldError(fullnameInput, 'fullname-error', 'Please enter your full name.');
        return false;
      }
      if (val.length < 2) {
        setFieldError(fullnameInput, 'fullname-error', 'Full name must be at least 2 characters.');
        return false;
      }
      if (val.length > 100) {
        setFieldError(fullnameInput, 'fullname-error', 'Full name cannot exceed 100 characters.');
        return false;
      }
      setFieldError(fullnameInput, 'fullname-error', '');
      return true;
    }

    /**
     * Validates email address format
     */
    function validateEmail() {
      const val = emailInput.value.trim();
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!val) {
        setFieldError(emailInput, 'email-error', 'Please enter your email address.');
        return false;
      }
      if (!emailRegex.test(val)) {
        setFieldError(emailInput, 'email-error', 'Please enter a valid email address (e.g. name@example.com).');
        return false;
      }
      setFieldError(emailInput, 'email-error', '');
      return true;
    }

    /**
     * Validates phone number format (accommodating international & Indian landlines/mobiles)
     */
    function validatePhone() {
      const val = phoneInput.value.trim();
      const digitsOnly = val.replace(/[^0-9]/g, '');
      const phoneRegex = /^[+]?[0-9\s()./-]{7,25}$/;

      if (!val) {
        setFieldError(phoneInput, 'phone-error', 'Please enter your contact phone number.');
        return false;
      }
      if (digitsOnly.length < 7 || digitsOnly.length > 16 || !phoneRegex.test(val)) {
        setFieldError(phoneInput, 'phone-error', 'Please enter a valid phone number (e.g. 044 2481 8999 or +91 98400 12345).');
        return false;
      }
      setFieldError(phoneInput, 'phone-error', '');
      return true;
    }

    /**
     * Validates service dropdown selection
     */
    function validateService() {
      const val = serviceInput.value;
      if (!val) {
        setFieldError(serviceInput, 'service-error', 'Please select an architectural service category.');
        return false;
      }
      setFieldError(serviceInput, 'service-error', '');
      return true;
    }

    /**
     * Validates project location
     */
    function validateLocation() {
      if (!locationInput) return true;
      const val = locationInput.value.trim();
      if (!val) {
        setFieldError(locationInput, 'location-error', 'Please enter the project location.');
        return false;
      }
      if (val.length > 120) {
        setFieldError(locationInput, 'location-error', 'Project location cannot exceed 120 characters.');
        return false;
      }
      setFieldError(locationInput, 'location-error', '');
      return true;
    }

    /**
     * Validates message requirements
     */
    function validateMessage() {
      const val = messageInput.value.trim();
      if (!val) {
        setFieldError(messageInput, 'message-error', 'Please provide details about your project requirements or message.');
        return false;
      }
      if (val.length < 10) {
        setFieldError(messageInput, 'message-error', 'Please provide at least 10 characters describing your project requirements.');
        return false;
      }
      if (val.length > 3000) {
        setFieldError(messageInput, 'message-error', 'Project requirements cannot exceed 3000 characters.');
        return false;
      }
      setFieldError(messageInput, 'message-error', '');
      return true;
    }

    /**
     * Validates privacy policy acknowledgement checkbox
     */
    function validatePrivacy() {
      if (!privacyInput.checked) {
        setFieldError(privacyInput, 'privacy-error', 'You must acknowledge the privacy notice to submit your enquiry.');
        return false;
      }
      setFieldError(privacyInput, 'privacy-error', '');
      return true;
    }

    // Attach real-time validation on blur & input
    if (fullnameInput) {
      fullnameInput.addEventListener('blur', validateFullname);
      fullnameInput.addEventListener('input', function () {
        if (fullnameInput.classList.contains('is-invalid')) validateFullname();
      });
    }

    if (emailInput) {
      emailInput.addEventListener('blur', validateEmail);
      emailInput.addEventListener('input', function () {
        if (emailInput.classList.contains('is-invalid')) validateEmail();
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('blur', validatePhone);
      phoneInput.addEventListener('input', function () {
        if (phoneInput.classList.contains('is-invalid')) validatePhone();
      });
    }

    if (serviceInput) {
      serviceInput.addEventListener('change', validateService);
    }

    if (locationInput) {
      locationInput.addEventListener('blur', validateLocation);
      locationInput.addEventListener('input', function () {
        if (locationInput.classList.contains('is-invalid')) validateLocation();
      });
    }

    if (messageInput) {
      messageInput.addEventListener('blur', validateMessage);
      messageInput.addEventListener('input', function () {
        if (messageInput.classList.contains('is-invalid')) validateMessage();
      });
    }

    if (privacyInput) {
      privacyInput.addEventListener('change', validatePrivacy);
    }

    /**
     * Displays a top status notification alert
     */
    function showStatusMessage(type, message) {
      if (!statusAlert) return;

      statusAlert.hidden = false;
      statusAlert.className = `form-status-alert alert-${type}`;

      const iconSvg = type === 'success'
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

      statusAlert.innerHTML = `
        ${iconSvg}
        <div class="status-alert-body">
          <strong>${type === 'success' ? 'Enquiry Submitted Successfully' : 'Notice'}</strong>
          <p style="margin: 4px 0 0 0;">${message}</p>
        </div>
      `;

      // Scroll into view gently so user immediately sees the status
      statusAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Clears the top status notification alert
     */
    function clearStatusMessage() {
      if (!statusAlert) return;
      statusAlert.hidden = true;
      statusAlert.innerHTML = '';
      statusAlert.className = 'form-status-alert';
    }

    /**
     * Form Submit Listener
     */
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      clearStatusMessage();

      // Run all client validations
      const isNameValid = validateFullname();
      const isEmailValid = validateEmail();
      const isPhoneValid = validatePhone();
      const isServiceValid = validateService();
      const isLocationValid = validateLocation();
      const isMessageValid = validateMessage();
      const isPrivacyValid = validatePrivacy();

      if (!isNameValid || !isEmailValid || !isPhoneValid || !isServiceValid || !isLocationValid || !isMessageValid || !isPrivacyValid) {
        showStatusMessage('error', 'Please correct the highlighted form errors before submitting your enquiry.');

        // Focus first invalid element for keyboard accessibility
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      // Enter loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-submitting');
        if (btnText) {
          btnText.textContent = 'Submitting Enquiry...';
        }
      }

      const formData = new FormData(form);

      // Acquire fresh Google reCAPTCHA v3 token if configured
      const recaptchaSiteKey = window.ARTECH_RECAPTCHA_KEY || (document.getElementById('contact-recaptcha-sitekey') ? document.getElementById('contact-recaptcha-sitekey').value : '');
      if (typeof window.grecaptcha !== 'undefined' && recaptchaSiteKey) {
        try {
          const token = await new Promise((resolve) => {
            window.grecaptcha.ready(async () => {
              try {
                const t = await window.grecaptcha.execute(recaptchaSiteKey, { action: 'contact_submit' });
                resolve(t);
              } catch (e) {
                resolve('');
              }
            });
          });
          if (token) {
            formData.set('recaptcha_token', token);
            formData.set('g-recaptcha-response', token);
          }
        } catch (recaptchaErr) {
          console.warn('[Contact] reCAPTCHA execution error:', recaptchaErr);
        }
      }

      try {
        const response = await fetch('backend/api/contact.php', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        const result = await response.json().catch(() => null);

        if (response.ok && result && result.success) {
          // Success State
          showStatusMessage('success', result.message || 'Thank you for reaching out to Aspirations Architects Engineers. Your enquiry has been received successfully. Our team will review your project requirements and get in touch shortly.');

          // Reset form fields
          form.reset();

          // Clear validation classes
          const validatedInputs = form.querySelectorAll('.is-valid, .is-invalid');
          validatedInputs.forEach(function (el) {
            el.classList.remove('is-valid', 'is-invalid');
            el.removeAttribute('aria-invalid');
          });

          // Reset char counter
          if (charCounter) {
            charCounter.textContent = '0 / 3000';
          }
        } else if (response.status === 422 && result && result.errors) {
          // Server validation errors
          showStatusMessage('error', result.message || 'Please correct the highlighted errors.');

          // Map server-side errors to inline error elements
          for (const fieldName in result.errors) {
            const inputEl = form.querySelector(`[name="${fieldName}"]`);
            if (inputEl) {
              setFieldError(inputEl, `${fieldName}-error`, result.errors[fieldName]);
            }
          }

          const firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid) {
            firstInvalid.focus();
          }
        } else if (response.status === 429) {
          // Rate limited
          showStatusMessage('error', result && result.message ? result.message : 'Too many enquiries submitted from your network. Please wait a few minutes before trying again.');
        } else {
          // General server error
          const errorMsg = (result && result.message) ? result.message : 'An unexpected server error occurred. Please try again or reach out directly to aspirations@arkitect.in or 044 2481 8999.';
          showStatusMessage('error', errorMsg);
        }
      } catch (networkError) {
        console.error('[Contact] Network or dispatch error:', networkError);
        showStatusMessage('error', 'Unable to reach the server. Please check your network connection or reach out to us directly at aspirations@arkitect.in or 044 2481 8999.');
      } finally {
        // Restore submit button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-submitting');
          if (btnText) {
            btnText.textContent = 'Send Enquiry';
          }
        }
      }
    });
  }

  // Execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactPage);
  } else {
    initContactPage();
  }
})();
