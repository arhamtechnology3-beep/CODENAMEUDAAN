/**
 * CODENAME UDAAN — Interactive Script
 * Features: Lead Capture, Dynamic Modals, EMI Calculator, Floor Plan Switcher, Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Constants & Config ---
  const SALES_PHONE = '9619124440';
  const SALES_EMAIL = 'udaancodname@gmail.com';
  const WHATSAPP_BASE = `https://wa.me/91${SALES_PHONE}`;
  // Paste Google Apps Script Web App URL after deploying integrations/google-apps-script/Code.gs
  // Example: 'https://script.google.com/macros/s/AKfycbx.../exec'
  const LEAD_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzwq4mSxHld2BBv640Mp4FhARkwBFkI_4OniQd9ynxYgRiBcnTAl44qaHUDF4gWG12d/exec';

  // --- Sticky Header on Scroll ---
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // --- Mobile Navigation Toggle ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isOpen = navLinks.classList.contains('mobile-open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close on clicking link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // --- Hero Cinema Slider (21st.dev inspired) ---
  const heroSection = document.getElementById('hero');
  const heroSlider = document.getElementById('heroSlider');
  if (heroSlider && heroSection) {
    const slides = heroSlider.querySelectorAll('.hero-slide');
    const thumbs = heroSection.querySelectorAll('.hero-thumb');
    const prevBtn = document.getElementById('heroSidePrevBtn');
    const nextBtn = document.getElementById('heroSideNextBtn');
    const progressFill = document.getElementById('heroProgressFill');
    const slideCurrent = document.getElementById('heroSlideCurrent');
    const slideLabel = document.getElementById('heroSlideLabel');
    let currentIndex = 0;
    let slideTimer = null;
    const totalSlides = slides.length;
    const SLIDE_MS = 5000;

    const padIndex = (n) => String(n).padStart(2, '0');

    const restartProgress = () => {
      if (!progressFill) return;
      progressFill.classList.remove('is-running');
      // Force reflow so animation restarts cleanly
      void progressFill.offsetWidth;
      progressFill.classList.add('is-running');
    };

    const showSlide = (index) => {
      currentIndex = (index + totalSlides) % totalSlides;
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
      });
      thumbs.forEach((thumb, i) => {
        const active = i === currentIndex;
        thumb.classList.toggle('active', active);
        thumb.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (slideCurrent) slideCurrent.textContent = padIndex(currentIndex + 1);
      if (slideLabel) {
        slideLabel.textContent = slides[currentIndex].getAttribute('data-label') || `Slide ${currentIndex + 1}`;
      }
      restartProgress();
    };

    const nextSlide = () => showSlide(currentIndex + 1);
    const prevSlide = () => showSlide(currentIndex - 1);

    const startTimer = () => {
      stopTimer();
      restartProgress();
      slideTimer = setInterval(nextSlide, SLIDE_MS);
    };

    const stopTimer = () => {
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
      }
      if (progressFill) progressFill.classList.remove('is-running');
    };

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
        startTimer();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
        startTimer();
      });
    }

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        const slideIdx = parseInt(thumb.getAttribute('data-slide'), 10);
        showSlide(slideIdx);
        startTimer();
      });
    });

    let touchStartX = 0;
    let touchEndX = 0;

    heroSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextSlide();
        else prevSlide();
        startTimer();
      }
    }, { passive: true });

    heroSection.addEventListener('mouseenter', stopTimer);
    heroSection.addEventListener('mouseleave', startTimer);

    showSlide(0);
    startTimer();
  }

  // --- Animated Number Counter Effect ---
  const counterElements = document.querySelectorAll('.stat-num[data-target]');
  if (counterElements.length > 0) {
    // Set initial 0 states
    counterElements.forEach(el => {
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      el.textContent = `${prefix}0${suffix}`;
    });

    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1800;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeOut * target);

        el.textContent = `${prefix}${currentCount}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = `${prefix}${target}${suffix}`;
          el.classList.add('counted');
        }
      };

      requestAnimationFrame(updateCounter);
    };

    let hasAnimated = false;
    const statsSection = document.querySelector('.stats-banner');

    if ('IntersectionObserver' in window && statsSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            counterElements.forEach(el => animateCounter(el));
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2
      });

      observer.observe(statsSection);
    } else {
      counterElements.forEach(el => animateCounter(el));
    }
  }

  // --- Active Nav Link on Scroll ---
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const targetNav = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        targetNav?.classList.add('active');
      } else {
        targetNav?.classList.remove('active');
      }
    });
  }, { passive: true });

  // --- Floor Plan Tabs ---
  const planTabs = document.querySelectorAll('.plan-tab-btn');
  const planContents = document.querySelectorAll('.plan-tab-content');

  planTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      planTabs.forEach(t => t.classList.remove('active'));
      planContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.getAttribute('data-target');
      document.getElementById(target)?.classList.add('active');
    });
  });

  // --- EMI Calculator ---
  const loanAmountInput = document.getElementById('loanAmount');
  const loanTenureInput = document.getElementById('loanTenure');
  const loanRateInput = document.getElementById('loanRate');

  const loanAmountVal = document.getElementById('loanAmountVal');
  const loanTenureVal = document.getElementById('loanTenureVal');
  const loanRateVal = document.getElementById('loanRateVal');

  const emiDisplay = document.getElementById('calculatedEmi');
  const totalInterestDisplay = document.getElementById('calculatedInterest');
  const totalPayableDisplay = document.getElementById('calculatedTotal');

  function formatINR(val) {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(Math.round(val));
  }

  function calculateEMI() {
    if (!loanAmountInput || !loanTenureInput || !loanRateInput) return;

    const principal = parseFloat(loanAmountInput.value);
    const years = parseFloat(loanTenureInput.value);
    const rate = parseFloat(loanRateInput.value);

    // Displays
    loanAmountVal.textContent = `₹ ${(principal / 100000).toFixed(1)} Lakhs`;
    loanTenureVal.textContent = `${years} Years`;
    loanRateVal.textContent = `${rate.toFixed(2)}%`;

    const monthlyRate = (rate / 12) / 100;
    const months = years * 12;

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    if (emiDisplay) emiDisplay.textContent = `₹ ${formatINR(emi)}`;
    if (totalInterestDisplay) totalInterestDisplay.textContent = `₹ ${formatINR(totalInterest)}`;
    if (totalPayableDisplay) totalPayableDisplay.textContent = `₹ ${formatINR(totalPayment)}`;
  }

  if (loanAmountInput && loanTenureInput && loanRateInput) {
    loanAmountInput.addEventListener('input', calculateEMI);
    loanTenureInput.addEventListener('input', calculateEMI);
    loanRateInput.addEventListener('input', calculateEMI);
    calculateEMI();
  }

  // --- Universal Lead Capture Modal ---
  const leadModal = document.getElementById('leadModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalFormType = document.getElementById('modalFormType');
  const modalSubmitBtn = document.getElementById('modalSubmitBtn');

  function openLeadModal(title, subtitle, formType, btnText) {
    if (!leadModal) return;
    if (modalTitle) modalTitle.textContent = title || 'Enquire Now';
    if (modalSubtitle) modalSubtitle.textContent = subtitle || 'Get complete pricing, floor plans & project brochure instantly.';
    if (modalFormType) modalFormType.value = formType || 'General Enquiry';
    if (modalSubmitBtn) modalSubmitBtn.textContent = btnText || 'Submit & Unlock Details';
    leadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLeadModal() {
    if (!leadModal) return;
    leadModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeLeadModal);
  }

  if (leadModal) {
    leadModal.addEventListener('click', (e) => {
      if (e.target === leadModal) closeLeadModal();
    });
  }

  // Trigger buttons with custom context
  document.querySelectorAll('[data-action="open-modal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const title = btn.getAttribute('data-title') || 'Download Project Brochure';
      const sub = btn.getAttribute('data-sub') || 'Enter your details to receive instant PDF brochure & floor plans.';
      const type = btn.getAttribute('data-type') || 'Brochure Download';
      const submitText = btn.getAttribute('data-btn') || 'Download Now';
      openLeadModal(title, sub, type, submitText);
    });
  });

  // --- Gallery expand + filter (21st.dev style) ---
  const galleryExpand = document.getElementById('galleryExpand');
  const galleryCards = galleryExpand
    ? Array.from(galleryExpand.querySelectorAll('.gallery-card'))
    : [];
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');

  function setActiveGalleryCard(card) {
    galleryCards.forEach(item => item.classList.remove('is-active'));
    if (card && !card.classList.contains('is-hidden')) {
      card.classList.add('is-active');
    }
  }

  if (galleryExpand && galleryCards.length) {
    galleryCards.forEach(card => {
      card.addEventListener('mouseenter', () => setActiveGalleryCard(card));
      card.addEventListener('focus', () => setActiveGalleryCard(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    galleryExpand.addEventListener('mouseleave', () => {
      const visible = galleryCards.find(card => !card.classList.contains('is-hidden'));
      setActiveGalleryCard(visible || galleryCards[0]);
    });
  }

  if (galleryFilterBtns.length && galleryCards.length) {
    galleryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter') || 'all';

        galleryFilterBtns.forEach(item => {
          item.classList.remove('active');
          item.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        galleryCards.forEach(card => {
          const category = card.getAttribute('data-category');
          const show = filter === 'all' || category === filter;
          card.classList.toggle('is-hidden', !show);
        });

        const firstVisible = galleryCards.find(card => !card.classList.contains('is-hidden'));
        setActiveGalleryCard(firstVisible);
      });
    });
  }

  // --- Lightbox for Floor Plans & Images ---
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, alt) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    const captionText = alt || 'Codename Udaan Architecture View';
    lightboxImg.alt = captionText;
    if (lightboxCaption) {
      lightboxCaption.textContent = captionText;
    }
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  document.querySelectorAll('[data-action="lightbox"]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (el.classList.contains('is-locked') || el.closest('.is-locked')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const src = el.getAttribute('data-src') || el.getAttribute('src');
      const alt = el.getAttribute('data-alt') || el.getAttribute('alt');
      openLightbox(src, alt);
    });
  });

  // --- Floor plan lock / unlock after lead form submit ---
  const FLOOR_PLAN_UNLOCK_KEY = 'codename_udaan_floor_plans_unlocked';

  function areFloorPlansUnlocked() {
    try {
      return localStorage.getItem(FLOOR_PLAN_UNLOCK_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function unlockFloorPlans(showMessage = false) {
    try {
      localStorage.setItem(FLOOR_PLAN_UNLOCK_KEY, '1');
    } catch (err) {
      console.warn('Could not persist floor plan unlock:', err);
    }

    document.querySelectorAll('[data-plan-lock]').forEach((wrap) => {
      wrap.classList.remove('is-locked');
      wrap.classList.add('is-unlocked');
      wrap.style.cursor = 'zoom-in';
      const overlay = wrap.querySelector('.plan-lock-overlay');
      if (overlay) overlay.setAttribute('aria-hidden', 'true');
    });

    if (showMessage) {
      showToast('Floor plans unlocked. You can now view the high-res layouts.');
    }
  }

  function applyFloorPlanLockState() {
    if (areFloorPlansUnlocked()) {
      unlockFloorPlans(false);
    }
  }

  applyFloorPlanLockState();

  // Escape key closes any modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLeadModal();
      closeLightbox();
    }
  });

  // --- Toast Notification ---
  const toast = document.getElementById('toastMsg');
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // --- Lead Form Submissions & Storage ---
  function saveLead(leadData) {
    try {
      const existing = JSON.parse(localStorage.getItem('codename_udaan_leads') || '[]');
      existing.push(leadData);
      localStorage.setItem('codename_udaan_leads', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }

  const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function setFieldError(input, message) {
    if (!input) return;
    const wrap = input.closest('.phone-input-wrap');
    const group = input.closest('.form-group') || input.parentElement;
    let errorEl = input.getAttribute('aria-describedby')
      ? document.getElementById(input.getAttribute('aria-describedby'))
      : group?.querySelector('.form-error');

    if (!errorEl && group) {
      errorEl = document.createElement('span');
      errorEl.className = 'form-error';
      errorEl.setAttribute('role', 'alert');
      group.appendChild(errorEl);
    }

    input.classList.toggle('is-invalid', Boolean(message));
    input.classList.toggle('is-valid', !message && Boolean(input.value.trim()));
    if (wrap) {
      wrap.classList.toggle('is-invalid', Boolean(message));
      wrap.classList.toggle('is-valid', !message && Boolean(input.value.trim()));
    }
    if (errorEl) errorEl.textContent = message || '';
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.form-error').forEach((el) => { el.textContent = ''; });
    form.querySelectorAll('.is-invalid, .is-valid').forEach((el) => {
      el.classList.remove('is-invalid', 'is-valid');
    });
  }

  function normalizeIndianMobile(raw) {
    if (!raw) return '';
    let digits = String(raw).replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(-10);
    }
    if (digits.length > 10) {
      digits = digits.slice(-10);
    }
    return digits;
  }

  function validateIndianMobile(raw) {
    const cleanPhone = normalizeIndianMobile(raw);
    if (!cleanPhone) {
      return { valid: false, value: '', message: 'Please enter your 10-digit mobile number.' };
    }
    if (cleanPhone.length !== 10) {
      return { valid: false, value: cleanPhone, message: 'Mobile number must be exactly 10 digits.' };
    }
    if (!INDIAN_MOBILE_REGEX.test(cleanPhone)) {
      return { valid: false, value: cleanPhone, message: 'Enter a valid Indian mobile number starting with 6–9.' };
    }
    return { valid: true, value: cleanPhone, message: '' };
  }

  function validateEmail(raw, { required = true } = {}) {
    const email = (raw || '').trim();
    if (!email) {
      return {
        valid: !required,
        value: '',
        message: required ? 'Please enter your email address.' : ''
      };
    }
    if (!EMAIL_REGEX.test(email)) {
      return { valid: false, value: email, message: 'Please enter a valid email address (e.g. name@gmail.com).' };
    }
    return { valid: true, value: email, message: '' };
  }

  // Digits-only phone inputs across all forms
  document.querySelectorAll('input[name="phone"]').forEach((input) => {
    input.addEventListener('input', () => {
      const cleaned = normalizeIndianMobile(input.value).slice(0, 10);
      if (input.value !== cleaned) input.value = cleaned;
      if (cleaned.length === 10) {
        const result = validateIndianMobile(cleaned);
        setFieldError(input, result.valid ? '' : result.message);
      } else if (cleaned.length > 0) {
        setFieldError(input, '');
        input.classList.remove('is-valid');
        input.closest('.phone-input-wrap')?.classList.remove('is-valid');
      } else {
        setFieldError(input, '');
      }
    });

    input.addEventListener('blur', () => {
      if (!input.value.trim()) return;
      const result = validateIndianMobile(input.value);
      setFieldError(input, result.valid ? '' : result.message);
    });
  });

  document.querySelectorAll('input[name="email"]').forEach((input) => {
    input.addEventListener('blur', () => {
      const required = input.hasAttribute('required');
      if (!input.value.trim() && !required) {
        setFieldError(input, '');
        return;
      }
      const result = validateEmail(input.value, { required });
      setFieldError(input, result.valid ? '' : result.message);
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        const result = validateEmail(input.value, { required: input.hasAttribute('required') });
        if (result.valid) setFieldError(input, '');
      }
    });
  });

  async function submitLeadToBackend(leadRecord) {
    if (!LEAD_WEBHOOK_URL) {
      throw new Error('Lead webhook is not configured. Add LEAD_WEBHOOK_URL in js/app.js.');
    }

    const payload = {
      ...leadRecord,
      source: window.location.href,
      page: window.location.pathname || '/',
      userAgent: navigator.userAgent
    };

    // text/plain avoids CORS preflight; Apps Script still parses JSON body
    const response = await fetch(LEAD_WEBHOOK_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    // Apps Script may return opaque/redirected responses; treat HTTP 200 family as success
    if (!response.ok && response.type !== 'opaque') {
      throw new Error(`Lead webhook failed (${response.status}).`);
    }

    // Best-effort JSON parse when readable
    try {
      const text = await response.text();
      if (text) {
        const data = JSON.parse(text);
        if (data && data.ok === false) {
          throw new Error(data.message || 'Lead webhook rejected the submission.');
        }
      }
    } catch (parseErr) {
      if (parseErr instanceof SyntaxError) {
        // Non-JSON success body is fine for Apps Script redirects
        return true;
      }
      throw parseErr;
    }

    return true;
  }

  async function handleLeadSubmission(e, formType) {
    e.preventDefault();
    const form = e.target;
    clearFormErrors(form);

    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const emailInput = form.querySelector('[name="email"]');
    const name = nameInput?.value.trim() || '';
    const config = form.querySelector('[name="configuration"]')?.value || '1 or 2 BHK';
    const visitDate = form.querySelector('[name="visit_date"]')?.value || '';
    const visitTime = form.querySelector('[name="visit_time"]')?.value || '';
    const submitBtn = form.querySelector('[type="submit"]');

    let hasError = false;
    let firstInvalid = null;

    if (!name) {
      setFieldError(nameInput, 'Please enter your full name.');
      hasError = true;
      firstInvalid = firstInvalid || nameInput;
    } else {
      setFieldError(nameInput, '');
    }

    const phoneResult = validateIndianMobile(phoneInput?.value);
    if (!phoneResult.valid) {
      setFieldError(phoneInput, phoneResult.message);
      hasError = true;
      firstInvalid = firstInvalid || phoneInput;
    } else {
      setFieldError(phoneInput, '');
    }

    const emailRequired = Boolean(emailInput?.hasAttribute('required'));
    const emailResult = emailInput
      ? validateEmail(emailInput.value, { required: emailRequired })
      : { valid: true, value: SALES_EMAIL, message: '' };

    if (emailInput && !emailResult.valid) {
      setFieldError(emailInput, emailResult.message);
      hasError = true;
      firstInvalid = firstInvalid || emailInput;
    } else if (emailInput) {
      setFieldError(emailInput, '');
    }

    if (hasError) {
      firstInvalid?.focus();
      return;
    }

    const cleanPhone = phoneResult.value;
    const email = emailResult.value || SALES_EMAIL;

    const leadRecord = {
      name,
      phone: cleanPhone,
      phoneE164: `+91${cleanPhone}`,
      email,
      config,
      formType: formType || 'Website Lead',
      visitDate,
      visitTime,
      timestamp: new Date().toISOString()
    };

    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.innerHTML = '<span>Sending...</span>';
    }

    let delivered = false;
    try {
      await submitLeadToBackend(leadRecord);
      delivered = true;
    } catch (err) {
      console.error('Lead delivery failed:', err);
      // Keep local backup + WhatsApp fallback so the enquiry is never lost
      delivered = false;
    }

    saveLead(leadRecord);
    closeLeadModal();
    form.reset();
    clearFormErrors(form);
    unlockFloorPlans(false);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.innerHTML = originalBtnHtml;
    }

    if (delivered) {
      showToast(`Thank you, ${name}! Details sent to our sales desk. Floor plans unlocked.`);
    } else {
      showToast(`Thank you, ${name}! Floor plans unlocked. Please continue on WhatsApp so our advisor gets your details.`);
    }

    const waText = encodeURIComponent(
      `Hello! I just submitted an inquiry for Codename Udaan (Shahad West, Kalyan).\nName: ${name}\nPhone: +91 ${cleanPhone}\nEmail: ${email}\nInterested In: ${config}\nPurpose: ${formType}`
    );
    const waUrl = `${WHATSAPP_BASE}?text=${waText}`;

    setTimeout(() => {
      const confirmWa = confirm(
        delivered
          ? 'Would you like to also connect on WhatsApp for instant pricing & brochure?'
          : 'Lead email/sheet sync is pending. Connect on WhatsApp now so our sales desk receives your enquiry instantly?'
      );
      if (confirmWa) {
        window.open(waUrl, '_blank');
      }
    }, 800);
  }

  // Attach submit handlers
  const modalForm = document.getElementById('modalLeadForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => handleLeadSubmission(e, modalFormType?.value || 'Modal Lead Form'));
  }

  const visitForm = document.getElementById('visitLeadForm');
  if (visitForm) {
    visitForm.addEventListener('submit', (e) => handleLeadSubmission(e, 'VIP Site Visit Booking'));
  }
});
