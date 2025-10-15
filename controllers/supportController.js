const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const Report = require("../models/Report");
const Support = require("../models/Support");

// control

//ok
exports.sendSupport = asyncHandler(async (req, res, next) => {
  const { supportId } = req.params;
  console.log(supportId)

  const support = await Support.findById(supportId);
  console.log(support);

  if (!support) {
    return res.status(404).json({ message: " لايوجد بلاغ " });
  }
  support.supportStatus = "الدعم في الطريق";
  support.save();
  return res.status(200).json({ message: "تم ارسال الدعم ", support });
});

//ok
exports.deleteSupport = asyncHandler(async (req, res, next) => {
  const { supportId } = req.params;
  console.log(supportId)

  const support = await Support.findByIdAndDelete(supportId);
  console.log(support);

  if (!support) {
    return res.status(404).json({ message: " لايوجد طلب دعم  " });
  }

  return res.status(200).json({ message: "تم حذف الطلب  " });
});

 
 //ok
exports.getAllSupports = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Support.countDocuments();

  const supports = await Support.find()
    .populate("requester", "name memberShipNumber")
    .populate("report", "locaion phone numberOfReport")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);


  return res.status(200).json({
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    data: supports || [],
  });
});

//ok
//valunteer
exports.orderSupport = asyncHandler(async (req, res, next) => {
  const { reportId } = req.params;
  const { description } = req.body;
  const requester = req.user.id;

  const report = await Report.findById(reportId);
  if (!report) {
    return res.status(404).json({ message: " لا يوجد بلاغ " });
  }
  console.log(report);

  const support = await Support.findOne({ report: reportId });
  console.log(support);

  if (support) {
    return res.status(404).json({ message: " تم طلب الدعم من قبل " });
  }

  const newSupport = await Support.create({
    requester,
    supportStatus: "قيد المراجعه",
    description,
    report: reportId,
  });

  return res.status(200).json({ message: "تم  طلب الدعم ", newSupport });
});
