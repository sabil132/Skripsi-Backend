const { check } = require('express-validator')

module.exports = {
  createValidator: [
    check('name')
      .not().isEmpty().withMessage('Name cannot be empty'),
    check('placeOfBirth')
      .not().isEmpty().withMessage('Place of birth cannot be empty'),
    check('dateOfBirth')
      .not().isEmpty().withMessage('Date of birth cannot be empty'),
    check('status')
      .not().isEmpty().withMessage('Status cannot be empty')
      .bail()
      .custom((value) => {
        if(['Single', 'Married', 'Widow', 'Widower'].includes(value)) {
          return true
        }
        throw new Error('Status must be Single, Married, Widow, or Widower')
      }),
    check('gender')
      .not().isEmpty().withMessage('Gender cannot be empty')
      .bail()
      .custom((value) => {
        if(['Male', 'Female'].includes(value)) {
          return true
        }
        throw new Error('Gender must be Male or Female')
      }),
    check('dateEntry')
      .not().isEmpty().withMessage('Date entry cannot be empty'),
    check('phone')
      .not().isEmpty().withMessage('Phone cannot be empty')
      .bail()
      .isNumeric().withMessage('Phone must be a number'),
    check('email')
      .not().isEmpty().withMessage('Email cannot be empty')
      .bail()
      .isEmail().withMessage('Email must be a valid email'),
    check('role')
      .not().isEmpty().withMessage('Role cannot be empty')
      .bail()
      .custom((value) => {
        if(['Administrator', 'Staff'].includes(value)) {
          return true
        }
        throw new Error('Gender must be Administrator or Staff')
      }),
    check('position_id')
      .not().isEmpty().withMessage('Position cannot be empty')
      .bail()
      .isNumeric().withMessage('Position must be a number'),
    check('unit_id')
      .not().isEmpty().withMessage('Unit cannot be empty')
      .bail()
      .isNumeric().withMessage('Unit must be a number'),
  ],
  updateValidator: [
    check('name')
      .not().isEmpty().withMessage('Name cannot be empty'),
    check('placeOfBirth')
      .not().isEmpty().withMessage('Place of birth cannot be empty'),
    check('dateOfBirth')
      .not().isEmpty().withMessage('Date of birth cannot be empty'),
    check('status')
      .not().isEmpty().withMessage('Status cannot be empty')
      .bail()
      .custom((value) => {
        if(['Single', 'Married', 'Widow', 'Widower'].includes(value)) {
          return true
        }
        throw new Error('Status must be Single, Married, Widow, or Widower')
      }),
    check('gender')
      .not().isEmpty().withMessage('Gender cannot be empty')
      .bail()
      .custom((value) => {
        if(['Male', 'Female'].includes(value)) {
          return true
        }
        throw new Error('Gender must be Male, Female')
      }),
    check('phone')
      .not().isEmpty().withMessage('Phone cannot be empty')
      .bail()
      .isNumeric().withMessage('Phone must be a number'),
    check('email')
      .not().isEmpty().withMessage('Email cannot be empty')
      .bail()
      .isEmail().withMessage('Email must be a valid email'),
      check('role')
      .not().isEmpty().withMessage('Role cannot be empty')
      .bail()
      .custom((value) => {
        if(['Administrator', 'Staff'].includes(value)) {
          return true
        }
        throw new Error('Gender must be Administrator or Staff')
      }),
    check('position_id')
      .not().isEmpty().withMessage('Position cannot be empty')
      .bail()
      .isNumeric().withMessage('Position must be a number'),
    check('unit_id')
      .not().isEmpty().withMessage('Unit cannot be empty')
      .bail()
      .isNumeric().withMessage('Unit must be a number'),
  ]
}