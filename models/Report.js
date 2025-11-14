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

    location: { type: String, required: true },

    reason: { type: String },

    gregorianDate: { type: String },
    hijriDate: { type: String },
    // createdAt: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

// reportSchema.pre("save", function (next) {
//   if (!this.hijriDate) {
//     this.hijriDate = moment(this.createdAt).format("iYYYY/iMM/iDD HH:mm");
//   }
//   next();
// });
reportSchema.pre("save", function (next) {
  if (!this.hijriDate) {
    const m = moment(this.createdAt);

    // أسماء أيام الأسبوع بالعربي
    const days = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

    // أسماء الشهور الهجرية بالعربي
    const hijriMonths = [
      "محرم","صفر","ربيع الأول","ربيع الثاني",
      "جمادى الأولى","جمادى الآخرة","رجب",
      "شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"
    ];

    const dayName = days[m.day()];
    const hijriDay = m.iDate();            // اليوم
    const hijriMonth = hijriMonths[m.iMonth()]; // اسم الشهر
    const hijriYear = m.iYear();           // السنة

    // وقت بصيغة 12 ساعة مع (ص/م)
    const hour24 = m.hour();
    const hour12 = hour24 % 12 || 12;
    const minute = String(m.minute()).padStart(2, "0");
    const suffix = hour24 < 12 ? "ص" : "م";

    this.hijriDate = `${dayName}، ${hijriDay} ${hijriMonth} ${hijriYear} هـ في ${hour12}:${minute} ${suffix}`;
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
  if (doc.image && !doc.image.startsWith("http")) {
    const base = process.env.BASE_URL ;
    doc.image = `${base}/report/${doc.image}`;
  }
};

reportSchema.post("init", (doc) => setImageUrl(doc));
reportSchema.post("save", (doc) => setImageUrl(doc));

module.exports = mongoose.model("Report", reportSchema);
