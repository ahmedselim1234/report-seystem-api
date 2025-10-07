const express = require("express");
const requireAuth = require("../middleware/isAuth");
const roles = require("../middleware/role");
const {createValunteer}=require("../utils/userValidation")

const router = express.Router();

const authController = require("../controllers/auth");

router
  .route("/login")
  .post(
    authController.login
  );

 
  module.exports = router;
