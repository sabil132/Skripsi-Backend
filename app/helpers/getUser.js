const jwtDecode = require('jwt-decode')
const { User } = require('../models')

const responseFormatter = require('./responseFormatter')

const getUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwtDecode(token);

    const user = await User.findOne({
      where: { id:payload.id },
      attributes: { exclude: ['password'] },
    });

    return user;
    
  } catch (error) {
    res.status(500).json(responseFormatter.error(null, error.message, res.statusCode))
  }
}

module.exports = getUser