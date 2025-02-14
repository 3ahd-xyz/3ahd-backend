const jwt = require("jsonwebtoken");

function generateToken(data) {
  const userToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
  return userToken;
}

module.exports = generateToken;
