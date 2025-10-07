const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const Report = require("../models/Report");
const reportPoints = require("../Data/data");

// by control

exports.createReport = asyncHandler(async (req, res, next) => {
  const { name, phone, reportType, locaion } = req.body;

  if (!name || !phone || !reportType || !locaion) {
    return res.status(400).json({ message: "املأ كل البيانات " });
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
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "../uploads/reports", filename);

    fs.writeFileSync(filePath, req.file.buffer);

    image = filename;
  }

  const report = await Report.create({
    name,
    phone,
    reportType,
    locaion,
    image, // هيبقى null لو مفيش صورة
    points,
    gregorianDate: gregorianArabic,
  });

  return res.status(201).json({ report });
});

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

exports.cancelReport = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const { id } = req.params;

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

exports.deleteReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const report = await Report.findByIdAndDelete(id);

  if (!report) {
    return res.status(404).json({ message: "report not found " });
  }
  return res.status(200).json({ message: "report deleted successfully" });
});

exports.getReports = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const reports = await Report.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Report.countDocuments();

  res.status(200).json({
    page,
    totalPages: Math.ceil(total / limit),
    totalReports: total,
    reports,
  });
});

exports.updateNumberOfValunteers = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { numberOfValunteers } = req.body;

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

exports.getSuredReports = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const reports = await Report.find({ status: "معتمد" })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  console.log(reports);

  console.log(reports.length);
  const total = reports.length;

  if (!reports) {
    return res.status(404).json({ message: " لا يوجد بلاغات" });
  }

  res.status(200).json({
    page,
    totalPages: Math.ceil(total / limit),
    totalReports: total,
    reports,
  });
});

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
    return res.status(400).json({ message: "المستخدم مشارك بالفعل" });
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

exports.getMyReports = asyncHandler(async (req, res, next) => {
  const id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const user = await User.findById(id).populate({
    path: "myReports",
    // select: "name status points createdAt",
    options: {
      skip: skip,
      limit: limit,
      sort: { createdAt: -1 },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "لا يوجد مستخدم" });
  }

  const totalReports = user.myReports.length;

  res.status(200).json({
    success: true,
    page,
    limit,
    totalReports,
    myReports: user.myReports,
  });
});

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

// GET /reports/in-progress/:userId
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

  res.status(200).json({
    status: "success",
    inProgressreports: inProgressreports.length,
    completedReports: completedReports.length,
  });
});
