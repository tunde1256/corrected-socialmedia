// middlewares/validation.js
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Validation rules for registration
const registerValidation = [
  body('username').isLength({ min: 0, max: 50 }).withMessage('Username must be between 3 and 50 characters long'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 8 characters long'),
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Middleware to validate user ID
module.exports = {
  registerValidation,
  loginValidation,
  validate,
 
};
