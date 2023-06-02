require('dotenv').config();
const jwt = require('jsonwebtoken');

const responseFormatter = require("../helpers/responseFormatter");

const authJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (authHeader){
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SIGNATURE_KEY;
    jwt.verify(token, secretKey, (err, user) => {
      if(err){
        return res.status(403).json(responseFormatter.error(null, err.message, res.statusCode));
      }

      req.user = user
      next();
    })
  }else{
    return res.status(401).json(responseFormatter.error(null, "Unauthorized", res.statusCode));
  }
}

module.exports = authJWT;
