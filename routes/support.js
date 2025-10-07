const express = require("express");
const requireAuth = require("../middleware/isAuth");
const roles = require("../middleware/role");

const router = express.Router();

const supportController = require("../controllers/supportController");
//valunteer
router
  .route("/order-support/:reportId")
  .post(
    requireAuth,
    roles.allowedTo("valunteer"),
    supportController.orderSupport
  );

// control

router
  .route("/send-support/:supportId")
  .post(requireAuth, roles.allowedTo("control"), supportController.sendSupport);
router
  .route("/get-supports")
  .get(requireAuth, roles.allowedTo("control"), supportController.getAllSupports);

module.exports = router;
