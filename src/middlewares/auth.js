const jwt = require("jsonwebtoken");
const { APIError } = require("../utils/errors");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    next(new APIError("Please authenticate", 401));
  }
};

module.exports = auth;
