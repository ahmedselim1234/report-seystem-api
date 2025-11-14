const express = require("express");
const requireAuth = require("../middleware/isAuth");
const roles = require("../middleware/role");
const upload = require("../middleware/uploadImage");
// const {sanitizeRequest} = require("../middleware/security");

const router = express.Router();

const reportController = require("../controllers/report");

//for control
router
  .route("/create-report")
  .post(
    requireAuth,
    roles.allowedTo("control"),
    upload.uploadOneImage("image"),
    //  sanitizeRequest,
    reportController.createReport
  );

router
  .route("/sure-report/:id")
  .post(requireAuth, roles.allowedTo("control"), reportController.sureReport);

router
  .route("/cancel-report/:id")
  .put(requireAuth, roles.allowedTo("control"), reportController.cancelReport);

router
  .route("/update-number-of-valunteers/:id")
  .put(
    requireAuth,
    roles.allowedTo("control"),
    reportController.updateNumberOfValunteers
  );

router
  .route("/delete-report/:id")
  .delete(
    requireAuth,
    roles.allowedTo("control"),
    reportController.deleteReport
  );

router
  .route("/get-reports")
  .get(requireAuth, roles.allowedTo("control"), reportController.getReports);

router
  .route("/countrol-counts")
  .get(
    requireAuth,
    roles.allowedTo("control"),
    reportController.countsForControl
  );
// router
//   .route("/avtive-valunteers")
//   .get(
//     requireAuth,
//     roles.allowedTo("control"),
//     reportController.activeValunteers
//   );

//for valunteer
router
  .route("/get-avalable-reports")
  .get(
    requireAuth,
    roles.allowedTo("valunteer"),
    reportController.getAvalableReorts
  );

router
  .route("/accept-report/:id")
  .put(
    requireAuth,
    roles.allowedTo("valunteer"),
    reportController.acceptReport
  );

router
  .route("/accept-report/:id")
  .put(
    requireAuth,
    roles.allowedTo("valunteer"),
    reportController.acceptReport
  );

router
  .route("/myreports")
  .get(
    requireAuth,
    roles.allowedTo("valunteer"),
    reportController.getMyReports
  );
router
  .route("/counts-of-valunteer")
  .get(
    requireAuth,
    roles.allowedTo("valunteer"),
    reportController.countsOfValunteer
  );

router
  .route("/finish-report/:id")
  .put(
    requireAuth,
    roles.allowedTo("valunteer"),
    reportController.finishReport
  );
//just one order support

module.exports = router;
