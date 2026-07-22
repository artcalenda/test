/**
 * Card input formatting and validation
 * Handles real-time card number, expiry, and CVV formatting
 */

(function() {
  'use strict';

  // Card number input formatting
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      // Remove all non-digits
      let value = e.target.value.replace(/\D/g, '');
      
      // Limit to 19 digits
      value = value.slice(0, 19);
      
      // Add spaces every 4 digits
      let formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      
      e.target.value = formatted;
    });
  }

  // Expiry date input formatting (MM/YY)
  const expiryInput = document.getElementById('expiryDate');
  if (expiryInput) {
    expiryInput.addEventListener('input', function(e) {
      // Remove all non-digits
      let value = e.target.value.replace(/\D/g, '');
      
      // Limit to 4 digits
      value = value.slice(0, 4);
      
      // Format as MM/YY
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      
      e.target.value = value;
    });

    // Validate month on blur
    expiryInput.addEventListener('blur', function(e) {
      const [month] = e.target.value.split('/');
      if (month && (parseInt(month) < 1 || parseInt(month) > 12)) {
        e.target.value = '';
        alert('Invalid month. Please enter a month between 01 and 12.');
      }
    });
  }

  // CVV input formatting (numbers only)
  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function(e) {
      // Remove all non-digits
      e.target.value = e.target.value.replace(/\D/g, '');
      
      // Limit to 4 digits
      e.target.value = e.target.value.slice(0, 4);
    });
  }

  // Cardholder name input (letters and spaces only)
  const nameInput = document.getElementById('cardholderName');
  if (nameInput) {
    nameInput.addEventListener('input', function(e) {
      // Remove all non-letter and non-space characters
      e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    });
  }
})();
