const userRoures = require("./userRoutes");
const authRoures = require("./authRoutes");
const reportRoures = require("./report");
const supportRoures = require("./support");

const mountRouts = (app) => {
  app.use("/api/v1/user", userRoures);
  app.use("/api/v1/auth", authRoures);
  app.use("/api/v1/report", reportRoures);
  app.use("/api/v1/support", supportRoures);
};

module.exports = mountRouts;
