const verifyToken = require("../utils/verifyToken");

const verifyUser = (req, res, next) => {
  const userToken = req.cookies["user-token"];
  if (!userToken) {
    res.status(401).json("Access denied. No token provided.");
  }
  try {
    const userData = verifyToken(userToken);
    req.user = userData;
    next();
  } catch (error) {
    res.status(403).json("Access Denied. Unauthorized");
  }
};

module.exports = verifyUser;
