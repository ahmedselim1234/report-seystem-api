// const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("express-async-handler");

exports.login = asyncHandler(async (req, res, next) => {
  const { role, name, password, identity } = req.body;

  if (!role) {
    return res.json({ message: "role is required" });
  }

  if (role === "valunteer") {
    if (!identity) return res.json({ message: "identity is required" });

    const valunteer = await User.findOne({ identityNumber: identity });

    if (!valunteer) {
      return res.status(404).json({ message: "رقم الهوية غير مسجل في النظام" });
    }

    const accessToken = generateToken.accessToken(valunteer);
    return res.json({ accessToken, valunteer });
  }

  if (role === "control") {
    if (!name || !password) return res.json({ message: "fill all fields " });

    const control = await User.findOne({ name: name, password: password });

    if (!control) {
      return res.status(404).json({ message: "غير موجود " });
    }

    const accessToken = generateToken.accessToken(control);
    return res.json({ accessToken, control });
  }
});

exports.logout = (req, res, next) => {
  res.clearCookie("accessToken", {
    HttpOnly: true,
    sameSite: "none",
  });
  res.json({ message: "logged out" });
};
