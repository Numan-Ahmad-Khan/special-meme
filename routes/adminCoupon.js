const express = require("express");

const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

const adminCouponController = require("../controllers/adminCoupon.controller");

const router = express.Router();

router.post(
  "/admin/add_coupon",
  authentication,
  authorization("ADMIN"),
  adminCouponController.addCoupon,
);

module.exports = router;