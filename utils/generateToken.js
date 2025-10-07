const jwt = require("jsonwebtoken");

exports.accessToken = (user) =>
  jwt.sign(
    {
      userInfo: {
        id: user._id,
        role: user.role,
        name: user.name,
        firstControl: user.firstControl,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
