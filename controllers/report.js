const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const Report = require("../models/Report");
const Support = require("../models/Support");
const reportPoints = require("../Data/data");
const path = require("path");
const fs = require("fs");

// by control
//ok

exports.createReport = asyncHandler(async (req, res, next) => {
  const { name, phone, reportType, location } = req.body;

  if (!name || !phone || !reportType || !location) {
    return res.status(400).json({ message: "املأ كل البيانات" });
  }

  if (!reportPoints.hasOwnProperty(reportType)) {
    return res.status(400).json({ message: "نوع البلاغ غير صحيح" });
  }

  const date = new Date();
  const gregorianArabic = new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);

  let image = null;
  const points = reportPoints[reportType];

  if (req.file) {
    const safeName = req.file.originalname
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "");
    const filename = Date.now() + "-" + safeName;
    const filePath = path.join(__dirname, "../uploads/reports", filename);

    fs.writeFileSync(filePath, req.file.buffer);
    image = filename;
  }

  const report = await Report.create({
    name,
    phone,
    reportType,
    location,
    image,
    points,
    gregorianDate: gregorianArabic,
  });

  res.status(201).json({ report });
});

//ok
exports.sureReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const report = await Report.findByIdAndUpdate(
    id,
    { status: "معتمد" },
    { new: true, runValidators: true }
  );

  if (!report) {
    return res.status(404).json({ message: "report not found " });
  }

  return res.status(200).json({ report });
});
//ok
exports.cancelReport = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const { id } = req.params;

  console.log(reason, id);

  if (!reason) {
    return res.status(400).json({ message: "عليك ادخال السبب" });
  }

  const report = await Report.findByIdAndUpdate(
    id,
    { reasonOfCancel: reason, status: "ملغي" },
    { new: true, runValidators: true }
  );

  if (!report) {
    return res.status(404).json({ message: "report not found " });
  }

  return res.status(200).json({ report });
});
//ok
exports.deleteReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const report = await Report.findByIdAndDelete(id);

  if (!report) {
    return res.status(404).json({ message: "report not found " });
  }
  return res.status(200).json({ message: "report deleted successfully" });
});

//ok
exports.getReports = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  // const limit = parseInt(req.query.limit) || 20;
  const limit = parseInt(req.query.limit) ||20;
  const skip = (page - 1) * limit;

  const reports = await Report.find()
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate("valunteers", "name phone memberId")

  const total = await Report.countDocuments();

  res.status(200).json({
    page,
    totalPages: Math.ceil(total / limit),
    totalReports: total,
    reports,
  });
});

//ok
exports.updateNumberOfValunteers = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { numberOfValunteers } = req.body;
  console.log(id, numberOfValunteers);

  if (!numberOfValunteers) {
    return res
      .status(404)
      .json({ message: "enter numberOfValunteers to update" });
  }

  const report = await Report.findByIdAndUpdate(
    id,
    { numberOfValunteers },
    { new: true, runValidators: true }
  );

  if (!report) {
    return res.status(404).json({ message: "report not found " });
  }
  return res
    .status(200)
    .json({ message: "report updated successfully", report });
});
//ok
exports.countsForControl = asyncHandler(async (req, res, next) => {
  const totalReports = await Report.countDocuments();
  const completedReports = await Report.find({ status: "مكتمل" });
  const canceledReports = await Report.find({ status: "ملغي" });

  res.status(200).json({
    totalReports,
    completedReports: completedReports.length,
    canceledReports: canceledReports.length,
  });
});

//for valunteer


//ok

exports.getAvalableReorts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const totalReports = await Report.countDocuments({
    $or: [
      { status: "معتمد" },
      {
        status: "قيد التنفيذ",
        $expr: { $lt: ["$shareValunteers", "$numberOfValunteers"] },
      },
    ],
  });


  const reports = await Report.find({
    $or: [
      { status: "معتمد" },
      {
        status: "قيد التنفيذ",
        $expr: { $lt: ["$shareValunteers", "$numberOfValunteers"] },
      },
    ],
  })
    .populate("valunteers", "name")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });


  const totalPages = Math.ceil(totalReports / limit);

  res.status(200).json({
    page,
    totalPages,
    totalReports,
    reports,
  });
});

//ok
exports.acceptReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log(req.user.id);
  const report = await Report.findById(id);
  if (!report) {
    return res.status(404).json({ message: " لا يوجد بلاغ " });
  }

  if (report.shareValunteers >= report.numberOfValunteers) {
    return res.status(400).json({ message: "ناسف عدد المباشرين اكتمل " });
  }

  if (!report.valunteers.includes(req.user.id)) {
    report.valunteers.push(req.user.id);
    report.shareValunteers += 1;
  } else {
    return res.status(400).json({ message: "انت مشارك بالفعل" });
  }

  const user = await User.findById(req.user.id);
  console.log(user);
  if (!user) {
    return res.status(404).json({ message: " لا يوجد مستخدم " });
  }
  // add reports to user
  user.myReports.push({
    report: report._id,
    joinedAt: new Date(),
  });
  await user.addPoints(report.points);
  user.save();

  report.status = "قيد التنفيذ";
  report.save();
  return res.status(200).json({ message: "تم قبول البلاغ", report, user });
});
//ok
exports.getMyReports = asyncHandler(async (req, res, next) => {
  const id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const user = await User.findById(id).populate({
    path: "myReports.report",
    populate: [
      {
        path: "valunteers",
        select: "name ",
      },
      {
        path: "closerOfReport",
        select: "name ",
      },
    ],
  });

  if (!user) {
    return res.status(404).json({ message: "لا يوجد مستخدم" });
  }

  // ✅ ترتيب + pagination
  const sortedReports = user.myReports
    .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
    .slice(skip, skip + limit);

  const totalReports = user.myReports.length;
    const totalPages = Math.ceil(totalReports / limit);

  res.status(200).json({
    success: true,
    page,
    limit,
    totalReports,
    myReports: sortedReports,
    totalPages
  });
});

//ok
exports.finishReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { noteOfClose } = req.body;
  const finisherId = req.user.id;
  if (!noteOfClose) {
    return res.status(400).json({ message: "ادخل ملاحظه الاغلاق" });
  }
  const report = await Report.findById(id);
  if (!report) {
    return res.status(404).json({ message: " لا يوجد بلاغ" });
  }
  if (report.status === "مكتمل") {
    return res.status(400).json({ message: "تم اكمال البلاغ" });
  }
  report.status = "مكتمل";
  report.noteOfClose = noteOfClose;
  report.closerOfReport = finisherId;
  report.save();
  return res.status(200).json({ message: "تم اكمال البلاغ", report });
});

//ok
exports.countsOfValunteer = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  console.log(userId);

  const inProgressreports = await Report.find({
    status: "قيد التنفيذ",
    valunteers: userId,
  });
  const completedReports = await Report.find({
    status: "مكتمل",
    valunteers: userId,
  });

  const reports = await Report.find({
    $or: [
      { status: "معتمد" },
      {
        status: "قيد التنفيذ",
        $expr: { $lt: ["$shareValunteers", "$numberOfValunteers"] },
      },
    ],
  });

  res.status(200).json({
    status: "success",
    inProgressreports: inProgressreports.length,
    completedReports: completedReports.length,
    availableReports: reports.length,
    // totalPointsInMonth:
  });
});
