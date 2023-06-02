const responseFormatter = require('../helpers/responseFormatter')
const { validationResult } = require('express-validator')


module.exports = errorValidationHandler = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ 
    [err.path]: err.msg 
  }))
  return res.status(422).json(responseFormatter.error(null, extractedErrors, res.statusCode))
}