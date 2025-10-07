const express = require("express");
const requireAuth = require("../middleware/isAuth");
const roles = require("../middleware/role");

const router = express.Router();

const { createValunteer, updateValunteer } = require("../utils/userValidation");

const userController = require("../controllers/user");

router
  .route("/create-valunteer")
  .post(
    requireAuth,
    roles.allowedTo("control"),
    createValunteer,
    userController.createValunteer
  );
router
  .route("/update-valunteer/:id")
  .put(
    requireAuth,
    roles.allowedTo("control"),
    updateValunteer,
    userController.updateValunteer
  );
router
  .route("/delete-valunteer/:id")
  .delete(
    requireAuth,
    roles.allowedTo("control"),
    userController.deleteValunteer
  );

router
  .route("/create-control")
  .post(requireAuth, roles.allowedTo("control"), userController.createControl);
  //get
  
  router
    .route("/valunteers")
    .get(
      requireAuth,
      roles.allowedTo("control"),
      userController.getAllValunteers
    );
  router
    .route("/valunteer-data")
    .get(
      requireAuth,
      roles.allowedTo("valunteer"),
      userController.getValunteerData
    );
  router
    .route("/get-valunteer/:id")
    .get(
      requireAuth,
      roles.allowedTo("control"),
      userController.getSpecificValunteer
    );
  router
    .route("/last-achievements")
    .get(
      requireAuth,
      roles.allowedTo("valunteer"),
      userController.lastAchievements
    );

module.exports = router;
