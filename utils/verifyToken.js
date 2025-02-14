const jwt = require("jsonwebtoken");

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error("Failed to verify the token");
  }
}

module.exports = verifyToken;
