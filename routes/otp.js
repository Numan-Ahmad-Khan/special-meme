const express = require("express");
const router = express.Router();

const authentication = require("../middleware/authentication");
const otpController = require("../controllers/otp.controller");

router.post(
    "/user/generate-otp",
    authentication,
    otpController.generateOTP
);

module.exports = router;