
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
    this.isOperational = true;
  }
}

const HandleError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "err";
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-use-before-define
    HandleErrorInDev(err, res);
  } else {
    // eslint-disable-next-line no-use-before-define
    HandleErrorInProd(err, res);
  }
};

// eslint-disable-next-line arrow-body-style
const HandleErrorInDev = (err, res) => {
  return res.status(err.statusCode).json({ 
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
// eslint-disable-next-line arrow-body-style
const HandleErrorInProd = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = { ApiError, HandleError };