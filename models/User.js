const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstControl: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["control", "valunteer"],
      default: "valunteer",
    },
    name: {
      type: String,
      minlength: [3, "اسم قصير"],
    },
    password: {
      type: String,
      minlength: [6, "باسوورد قصير"],
    },
    memberShipNumber: {
      type: Number,
    },
    identityNumber: {
      type: Number,
      minlength: [10, "رقم هوية غير صالح"],
      unique: true,
      required: true,
    },
    totalPointsInMonth: {
      type: Number,
      default: 0,
    },
    totalPointsInYear: {
      type: Number,
      default: 0,
    },
    // الحقول الإضافية للتحكم في التصفير
    currentMonth: { type: Number, default: new Date().getMonth() + 1 },
    currentYear: { type: Number, default: new Date().getFullYear() },

    bloodTypebirthDate: {
      type: Date,
    },

    myReports: [
      {
        report: {
          type: mongoose.Schema.ObjectId,
          ref: "Report",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    phone: {
      type: String,
    },
    bloodType: {
      type: String,
    },
    region: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.memberShipNumber) {
    const currentYear = new Date().getFullYear();
    const startNumber = 250000 + 1;

    // نجيب أكبر رقم موجود
    const lastUser = await this.constructor
      .findOne({})
      .sort({ memberShipNumber: -1 })
      .exec();

    if (!lastUser || !lastUser.memberShipNumber) {
      this.memberShipNumber = startNumber;
    } else {
      this.memberShipNumber = lastUser.memberShipNumber + 1;
    }
  }
  next();
});

userSchema.methods.addPoints = async function (points) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // reset points لو شهر جديد
  if (this.currentMonth !== month || this.currentYear !== year) {
    this.totalPointsInMonth = 0;
    this.currentMonth = month;
  }

  // reset points لو سنة جديدة
  if (this.currentYear !== year) {
    this.totalPointsInYear = 0;
    this.currentYear = year;
  }

  // بعد الـ reset نزود النقاط
  this.totalPointsInMonth += points;
  this.totalPointsInYear += points;

  return this.save();
};
module.exports = mongoose.model("User", userSchema);
