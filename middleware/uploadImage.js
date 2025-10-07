const multer = require("multer");
const { ApiError } = require("./errorHandler");

exports.uploadOneImage = (fieldName) => {
  const multerStorage = multer.memoryStorage();
  // just images allowed
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("only images", 400));
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload.single(fieldName);
};


