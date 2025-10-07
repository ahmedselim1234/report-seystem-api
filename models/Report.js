const mongoose = require("mongoose");
const moment = require("moment-hijri");

const reportSchema = new mongoose.Schema(
  {
    numberOfReport: { type: Number },

    shareValunteers: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: ["معتمد", "ملغي", "قيد التنفيذ", "مكتمل", "جديد"],
      default: "جديد",
    },

    valunteers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    numberOfValunteers: { type: Number, required: true, default: 5 },

    reasonOfCancel: { type: String },

    noteOfClose: { type: String },

    closerOfReport: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    name: { type: String, required: true },
    phone: { type: String, required: true },

    reportType: { type: String, required: true },
    points: { type: Number, required: true },

    image: { type: String },

    locaion: { type: String, required: true },

    reason: { type: String },

    gregorianDate: { type: String },
    hijriDate: { type: String },
    createdAt: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

reportSchema.pre("save", function (next) {
  if (!this.hijriDate) {
    this.hijriDate = moment(this.createdAt).format("iYYYY/iMM/iDD HH:mm");
  }
  next();
});

reportSchema.pre("save", async function (next) {
  if (!this.numberOfReport) {
    const lastReport = await this.constructor
      .findOne({})
      .sort({ numberOfReport: -1 })
      .exec();

    this.numberOfReport = lastReport ? lastReport.numberOfReport + 1 : 1;
  }
  next();
});

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/report/${doc.image}`;
    doc.image = imageUrl;
  }
};
reportSchema.post("init", (doc) => {
  setImageUrl(doc);
});
reportSchema.post("save", (doc) => {
  setImageUrl(doc);
});

module.exports = mongoose.model("Report", reportSchema);
