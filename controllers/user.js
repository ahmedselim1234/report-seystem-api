const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Report = require("../models/Report");

//access by   control ------------------------------------
//ok
exports.createValunteer = asyncHandler(async (req, res, next) => {
  const { name, identityNumber, phone, birthDate, bloodType, region } =
    req.body;

  if (
    !name ||
    !identityNumber ||
    !phone ||
    !birthDate ||
    !bloodType ||
    !region
  ) {
    return res.status(400).json({ message: "املاء كل البيانات " });
  }

  //sure if identityNumber exsit

  if (identityNumber.length !== 10) {
    return res.status(400).json({ message: "رقم هويه غير صالح" });
  }

  const user = await User.create(req.body);

  return res.status(201).json({ data: user });
});

//ok
exports.updateValunteer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, identityNumber, phone } = req.body;

  const valunteer = await User.findById(id);
  if (!valunteer) {
    return res.status(404).json({ message: "المتطوع غير موجود " });
  }

  if (name) valunteer.name = name;
  if (identityNumber) valunteer.identityNumber = identityNumber;
  if (phone) valunteer.phone = phone;

  await valunteer.save();
  return res
    .status(201)
    .json({ message: "تم التعديل بنجاح ", data: valunteer });
});


//ok
exports.getAllValunteersForExport = asyncHandler(async (req, res) => {
  const valunteers = await User.find({ role: "valunteer" })
    .select("-password -__v");

  res.status(200).json({
    total: valunteers.length,
    valunteers,
  });
});

//ok
exports.getAllValunteers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;   
  const limit = parseInt(req.query.limit) || 10; 
  const skip = (page - 1) * limit;               

  // count total volunteers
  const total = await User.countDocuments({ role: "valunteer" });

  // get paginated volunteers
  const valunteers = await User.find({ role: "valunteer" })
    .skip(skip)
    .limit(limit);

  if (!valunteers.length) {
    return res.status(404).json({ message: "لا يوجد متطوعين" });
  }

  // send response
  return res.status(200).json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    valunteers,
  });
});

//ok
exports.deleteValunteer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const valunteer = await User.findByIdAndDelete(id);

  if (!valunteer) {
    return res.status(404).json({ message: "المتطوع غير موجود" });
  }

  res.status(200).json({
    status: "success",
    message: "تم حذف المتطوع بنجاح",
    data: valunteer,
  });
});


exports.createControl = asyncHandler(async (req, res, next) => {
  const { name, password, identityNumber } = req.body;

  if (req.user.firstControl === true) {
    if (!name || !password || !identityNumber) {
      return res.status(400).json({ message: "املاء كل البيانات " });
    }

    if (identityNumber.length !== 10) {
      return res.status(400).json({ message: "رقم هويه غير صالح" });
    }

    console.log(req.user);

    const user = await User.create(req.body);

    return res.status(201).json({ data: user });
  }
  return res.status(401).json({ message: "غير مسموح " });
});

exports.getSpecificValunteer = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);

    const user = await User.findOne({ _id: id, role: "valunteer" })
      .populate("myReports")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "المتطوع غير موجود",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

//access by   valunteer ------------------------------------

//ok
exports.getValunteerData = asyncHandler(async (req, res, next) => {
  try {
    const id = req.user.id;
    console.log(id);

    const user = await User.findOne({ _id: id, role: "valunteer" })
      .populate("myReports")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "المتطوع غير موجود",
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

//ok
exports.lastAchievements = asyncHandler(async (req, res, next) => {
  const id = req.user.id;

  const user = await User.findById(id)
    .populate({
      path: "myReports.report",
      select: "numberOfReport  noteOfClose points  ",
    })
    .select("name memberShipNumber myReports");

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "المتطوع غير موجود",
    });
  }

  const sortedReports = user.myReports
    .sort((a, b) => b.joinedAt - a.joinedAt)
    .slice(0, 3)
    .map((r) => ({
      numberOfReport: r.report?.numberOfReport,
      points: r.report?.points,
      noteOfClose: r.report?.noteOfClose,
      joinedAt: r.joinedAt,
    }));

  res.status(200).json({
    status: "success",
    data: {
      volunteer: {
        id: user._id,
        name: user.name,
        memberShipNumber: user.memberShipNumber,
      },
      lastReports: sortedReports,
    },
  });
});
