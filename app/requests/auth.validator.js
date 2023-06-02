const { check } = require('express-validator')

module.exports = {
  loginValidator: [
    check('email')
      .notEmpty().withMessage('Email is required')
      .bail()
      .isEmail().withMessage('Email must be a valid email'),
    check('password')
      .notEmpty().withMessage('Password is required')
  ],
  PasswordValidator: [
    check('password')
      .notEmpty().withMessage('Password is required')
      .bail()
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('confirmPassword')
      .notEmpty().withMessage('Confirm password is required')
      .bail()
      .isLength({ min: 6 }).withMessage('Confirm password must be at least 6 characters')
      .bail()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Confirm password does not match')
        }
        return true
      })
  ],
}