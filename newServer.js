// const express = require("express");
// import cors from "cors";
// import express from "express";
// import auth from "./routes/auth.js";
// import user from "./routes/user.js";
// import buses from "./routes/buses.js";
// import admin from "./routes/admin.js";
// import rateLimit from "express-rate-limit";

const app = express();
const PORT = 4000;

const limiter = rateLimit({
  windowMs: 5 * (60 * 1000), // 5 minute
  max: 1, // Limit each IP to 1 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const adminLimiter = rateLimit({
  windowMs: 15 * (60 * 1000), // 15 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(express.json());
app.use(cors());
app.set("trust proxy", 1);
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const auth = require("./routes/auth.js");
const user = require("./routes/user.js");
const buses = require("./routes/buses.js");
const admin = require("./routes/admin.js");

app.use("/auth", limiter, auth);
app.use("/user", limiter, user);
app.use("/buses", limiter, buses);
app.use("/admin", adminLimiter, admin);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
