const getRawBody = require("raw-body");
const contentType = require("content-type");
const xss = require("xss");
const toobusy = require("toobusy-js");
// const Tokens = require("csrf");
const helmet = require("helmet");

// csrf

 
// handle sanitize manualy and xss
const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return xss(input);
  }

  if (typeof input === "object" && input !== null) {
    const result = Array.isArray(input) ? [] : {};
    for (const key in input) {
      if (key.includes("$") || key.includes(".")) continue;
      result[key] = sanitizeInput(input[key]);
    }
    return result;
  }

  return input;
};



//-----------------------
const applySecurity = (app) => {
  // 1)raw-body
  app.use((req, res, next) => {
    if (!["POST", "PUT", "PATCH"].includes(req.method)) return next();

    const type = req.headers["content-type"] || "";
    if (!type.includes("application/json")) return next();

    getRawBody(
      req,
      {
        length: req.headers["content-length"],
        limit: "10kb",
        encoding: contentType.parse(req).parameters.charset || "utf-8",
      },
      (err, string) => {
        if (err) return next(err);
        req.rawBody = string;
        try {
          req.body = JSON.parse(string); // عشان تفضل تقدر تستخدم req.body
        } catch (e) {
          return res.status(400).json({ message: "Invalid JSON" });
        }
        next();
      }
    );
  });

  // 2)sanitize and xss

  app.use((req, res, next) => {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query);
    if (req.params) req.params = sanitizeInput(req.params);
    next();
  });

  //3)mintor the busy of event loop
  app.use(function (req, res, next) {
    if (toobusy()) {
      res.status(503).json({ message: "I'm busy right now, sorry." });
    } else {
      next();
    }
  });

  //4)rate limit handle it in auth file

  //5)csrf middleware => very important
  // the value of csrf_token => must be updated in header of the request to can access any route
  //   app.use(csrfProtection);

  //6) hpp

  //7)helmet 
  app.use(helmet());
};

module.exports = applySecurity;
