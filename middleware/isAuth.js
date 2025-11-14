const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const requireAuth = asyncHandler(async (req, res, next) => {
  // check if token exists
  const authheader = req.headers.authorization || req.headers.Authorization;
  if (!authheader || !authheader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "غير مسموح" });
  }

  const token = authheader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // check if user exists
  const user = await User.findById(decoded.userInfo.id);
  if (!user) {
    return res.status(401).json({ message: "غير مسموح لهذا المستخدم" });
  }

  req.user = decoded.userInfo;
  next();
});

module.exports = requireAuth;