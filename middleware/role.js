const asyncHandler = require("express-async-handler");

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    //access registered user by req.user.id
    if (!req.user.role || !roles.includes(req.user.role)) {
      return next(new Error("you un authorized!"));
    }
    next();
  });
