const { check, body } = require("express-validator");
const User = require("../models/User");
const validatorMiddleware = require("../middleware/validatorMiddleware");

exports.createValunteer = [
  check("name")
    .notEmpty()
    .withMessage("name required")
    .isLength({ min: 3 })
    .withMessage("too short")
    .isLength({ max: 32 })
    .withMessage("too long"),

  check("identityNumber")
    .notEmpty()
    .withMessage("identityNumber required!")
    .isLength({ min: 10 })
    .withMessage("رقم هوية غير صالح")
    .isLength({ max: 10 })
    .withMessage("رقم هوية غير صالح")
    .custom(async (value) => {
      const existingUser = await User.findOne({ identityNumber: value });
      if (existingUser) {
        throw new Error("رقم الهويه موجود بالفعل ");
      }
      return true;
    }),

  ,
  check("bloodType").notEmpty().withMessage("bloodType required!"),

  check("phone")
    .notEmpty()
    .withMessage("phone required!")
    .isMobilePhone(["ar-SA"])
    .withMessage(" enter valid phone "),

  check("region").notEmpty().withMessage("region required!"),

  check("birthDate")
    .notEmpty()
    .withMessage("Birth date is required")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Birth date must be a valid date in YYYY-MM-DD format")
    .custom((value) => {
      const birth = new Date(value);
      const now = new Date();
      if (birth > now) {
        throw new Error("Birth date cannot be in the future");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.updateValunteer = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("too short")
    .isLength({ max: 32 })
    .withMessage("too long"),

  check("identityNumber")
    .optional()
    .isLength({ min: 10 })
    .withMessage("رقم هوية غير صالح")
    .isLength({ max: 10 })
    .withMessage("رقم هوية غير صالح")
    .custom(async (value) => {
      const existingUser = await User.findOne({ identityNumber: value });
      if (existingUser) {
        throw new Error("رقم الهويه موجود بالفعل ");
      }
      return true;
    }),

  check("bloodType").optional(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-SA"])
    .withMessage("ادخل رقم جوال صالح"),

  check("region").optional(),
  validatorMiddleware,
];
