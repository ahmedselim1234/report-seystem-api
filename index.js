const connectDB = require("./config/database");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const morgan = require("morgan");
const mountRoures = require("./routes/index");
const { ApiError, HandleError } = require("./middleware/errorHandler");
const cron = require("node-cron");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8000;

app.use("/report", express.static(path.join(__dirname, "uploads/reports")));

//setup to delete images after specefic  time
const uploadsDir = path.join(__dirname, "uploads/reports");
const IMAGE_EXPIRY_MINUTES = 1 * 60 * 24 * 30 * 6; //6 months

// cron.schedule("* * * * *", () => {
//   console.log("⏰ Checking for expired images...");
//   const files = fs.readdirSync(uploadsDir);

//   files.forEach(file => {
//     const filePath = path.join(uploadsDir, file);
//     const stats = fs.statSync(filePath);
//     const now = Date.now();
//     const expiry = IMAGE_EXPIRY_MINUTES * 60 * 1000;

//     if (now - stats.mtimeMs > expiry) {
//       fs.unlinkSync(filePath);
//       console.log(`🗑️ Deleted expired image: ${file}`);
//     }
//   });
// });

//security



const applySecurity = require("./middleware/security");
app.use(cookieParser());
applySecurity(app);

app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

mountRoures(app);

app.use((req, res, next) => {
  next(new ApiError("this page is not exist", 404));
});

app.use(HandleError);

process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection", err.message);
  process.exit(1);
});

connectDB().then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
});
