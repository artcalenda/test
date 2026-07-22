/**
 * Request validation middleware
 * Uses express-validator for input validation
 */

const { body, validationResult } = require('express-validator');

// Credit card validation rules
const creditCardValidationRules = () => [
  body('cardNumber')
    .trim()
    .matches(/^\d{13,19}$/)
    .withMessage('Card number must be 13-19 digits'),
  body('expiryDate')
    .trim()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Expiry date must be in MM/YY format'),
  body('cvv')
    .trim()
    .matches(/^\d{3,4}$/)
    .withMessage('CVV must be 3 or 4 digits'),
  body('cardholderName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Cardholder name must be at least 2 characters'),
];

// Promo code validation rules
const promoCodeValidationRules = () => [
  body('promoCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Promo code must be 3-20 characters, alphanumeric'),
];

// Validation error handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  creditCardValidationRules,
  promoCodeValidationRules,
  validateRequest,
};
