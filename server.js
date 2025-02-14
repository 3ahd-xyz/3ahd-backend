require("dotenv").config();
const db = require("./db/db.js");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const sendOtp = require("./utils/sendOTP.js");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const sendInviteLink = require("./sendInviteLink.js");
const verifyUser = require("./middleware/verifyUser.js");
const generateToken = require("./utils/generateToken.js");
const app = express();
const port = 4000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(cookieParser());
app.set("trust proxy", 1);

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days expiration
};

const limiter = rateLimit({
  windowMs: 60 * 5000, // 5 minute
  max: 1, // Limit each IP to 5 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to specific route
app.use("/auth/otpSend", limiter);

async function server(client, otp) {
  app.get("/auth/otpSend/:num", async (req, res) => {
    const number = req.params.num;

    if (!number) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    try {
      await sendOtp(number, otp, client);
      return res
        .status(200)
        .json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error(`Error sending OTP to ${number}:`, error);

      if (error.response && error.response.data) {
        return res.status(error.response.status || 500).json({
          error: "Failed to send OTP",
          details: error.response.data,
        });
      }

      return res.status(500).json({
        error: "An unexpected error occurred",
        details: error.message,
      });
    }
  });

  // Login Endpoint
  app.get("/auth/login/:num", async (req, res) => {
    const phoneNumber = req.params.num;
    const otpCode = req.query.otp;

    const user = {
      phoneNumber,
      role: "regular",
    };

    const userToken = generateToken(user);
    res.cookie("user-token", userToken, cookieOptions);
    res.send("Done!");

    // try {
    //   if (!phoneNumber || !otpCode) {
    //     return res.status(400).json({
    //       error:
    //         "Phone number and otp is required (localhost:3000/auth/check/0543211234?otp=123456)",
    //     });
    //   }
    //   // const result = otp.check(otpCode, phoneNumber);
    //   // if (result) {
    //   //   // const x = await db.getUserDetailsByPhoneNumber(phoneNumber);
    //   //   if (!x)
    //   //     return res.status(220).json({
    //   //       error: "this user is not in the database and need to sign up.",
    //   //     });

    //   //   res.status(200).json(x);
    //   // } else {
    //   //   res.status(420).json({ error: "wrong otp!" });
    //   // }
    // } catch (error) {
    //   res.status(500).json({ error: error.message });
    // }
  });

  app.get("/userBusId", verifyUser, async (req, res) => {
    const { phoneNumber, otpCode } = req.query;
    const userData = req.user;
    console.log("arrived");
    console.log(userData.role);
    console.log("arrived");

    // const result = otp.check(otpCode, phoneNumber);
    // if (result) {
    //   const id = await db.getUserBusId(phoneNumber);
    //   if (id == null) return res.send("null");
    //   res.send(id);
    // } else {
    //   res.status(420).json({ error: "wrong otp!" });
    // }
  });

  // app.get('/auth/otpCheck', (req, res) => {
  //     const { phoneNumber, otpCode } = req.query;
  //     if (!phoneNumber || !otpCode) {
  //         return res.status(400).send(' (phoneNumber, otp) are required in request body');
  //     }

  //     const result = otp.check(otpCode, phoneNumber);

  //     if (result) {
  //         return res.status(200).send('');
  //     } else {
  //         return res.status(400).send('wrong otp!');

  //     }
  // });

  // app.post('/user', (req, res) => {
  //     const { phoneNumber, otpCode } = req.query;
  //     if (!phoneNumber || !otpCode) {
  //         return res.status(400).send(' (phoneNumber, otp) are required in request body');
  //     }

  //     const result = otp.check(otpCode, phoneNumber);

  //     if (result) {
  //         return res.status(200).send(db.createUser(phoneNumber));
  //     } else {
  //         return res.status(400).send('wrong otp!');

  //     }
  // });

  // app.post('/admin/rwad/addBus', (req, res) => {
  //     const details = req.body;
  //     if (!details.otpCode) {
  //         return res.status(400).send(' (phoneNumber, otp) are required in request body');
  //     }

  //     const result = otp.check(details.otpCode, '0504499641');

  //     if (result) {
  //         return res.status(200).send(db.addBus(details));
  //     } else {
  //         return res.status(400).send('wrong otp!');

  //     }
  // });

  //  Sign-Up Endpoint
  app.post("/userDetails", async (req, res) => {
    const { phoneNumber, otpCode, firstName, familyName, yearOfBirth, town } =
      req.body; // All data will be available in req.body

    if (
      !phoneNumber ||
      !otpCode ||
      !firstName ||
      !familyName ||
      !yearOfBirth ||
      !town
    ) {
      return res
        .status(400)
        .send("phoneNumber and otpCode are required in request body");
    }

    // Check OTP
    // const result = otp.check(otpCode, phoneNumber);

    // if (result) {
    //   await db.addUserDetails(phoneNumber, req.body);
    //   const user = {
    //     phoneNumber,
    //     role: "regular",
    //   };

    // const userToken = generateToken(user);
    // res.cookie("user-token", userToken, cookieOptions);

    //   return res.status(200).send("success");
    // } else {
    //   return res.status(400).send("Wrong OTP!");
    // }
  });

  app.get("/buses", async (req, res) => {
    try {
      const buses = await db.getBuses();
      res.json(buses);
    } catch (e) {
      res.status(500).json({ message: "internal server error" });
    }
  });

  app.get("/getUsersByBusId/:id", verifyUser, async (req, res) => {
    const { id } = req.params;
    let data = await db.getUsersByBusId(id);
    if (data == null) res.status(404).json({ message: "bus not found" });
    res.json(data);
  });

  app.post("/setUserBusId", async (req, res) => {
    let { phoneNumber, id } = req.body;

    if (!phoneNumber || !id) {
      return res
        .status(400)
        .json({ message: "Phone number and bus ID are required." });
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format." });
    }

    try {
      let bus = await db.getBuseById(id);

      if (bus == null) {
        return res.status(404).json({ message: "Bus not found." });
      }

      await db.setUserBusId(id, phoneNumber);
      res.status(200).json({ message: "User successfully assigned to bus." });
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .json({ message: "Internal server error. Please try again later." });
    }
  });

  // app.post('/admin/addUser', async (req, res) => {
  //     let { busId } = req.body;
  //     if (!busId) return res.status(500).json({ message: "Internal Server Error" });

  //     let x = await db.getBuseById(busId);

  //     if (x == null) {
  //         return res.status(500).json({ message: "رقم الباص غير صحيح" });
  //     }
  //     try {
  //         db.busPlusPlus(busId);
  //         res.status(200).json({ message: "sent well" });

  //     } catch (err) {
  //         console.log(err)
  //         res.status(500).json({ message: "Internal Server Error" });

  //     }

  // });

  app.get("/logout", (req, res) => {
    res.clearCookie("user-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.send("Logged out Successfully!");
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = server;
