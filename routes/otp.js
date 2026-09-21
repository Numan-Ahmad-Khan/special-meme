const express = require("express");
const router = express.Router();
const rateLimiter = require("../middleware/rateLimiter");
const authentication = require("../middleware/authentication");
const otpController = require("../controllers/otp.controller");

router.post(
    "/user/generate-otp",
    authentication,
    rateLimiter("otp", 3, 600),
    otpController.generateOTP
);

module.exports = router;