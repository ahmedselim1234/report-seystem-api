const mongoose = require("mongoose");
const moment = require("moment-hijri");

const supportSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    supportStatus: {
      type: String,
      enum: ["قيد المراجعه", "غير مطلوب", "الدعم في الطريق"],
      default: "غير مطلوب",
    },
    description: {
      type: String,
      required: true,
    },
    timeOfRequest: {
      type: Date,
      default: Date.now(),
    },
    hijriDate: { type: String },

    report: {
      type: mongoose.Schema.ObjectId,
      ref: "Report",
      required: true,
    },
  },
  { timestamps: true }
);

supportSchema.pre("save", function (next) {
  if (!this.hijriDate) {
    this.hijriDate = moment(this.timeOfRequest).format("iYYYY/iMM/iDD HH:mm");
  }
  next();
});

module.exports = mongoose.model("Support", supportSchema);
