const express = require("express");
const { sendNewCouponEmail } = require("../services/emailService");
const User = require("../models/User");

const router = express.Router();

const Coupon = require("../models/Coupon");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

router.post(
  "/admin/add_coupon",
  authentication,
  authorization("ADMIN"),
  async (req, res) => {
    try {
      const {
        name,
        details,
        code,
        discountType,
        discountValue,
        eligibility,
        minOrderAmount,
        maxDiscountAmount,
        startsAt,
        expiresAt,
        usageLimit,
      } = req.body;

      if (!name || !details || !code || !discountType || !discountValue) {
        return res.status(400).json({
          message: "Required coupon details are missing",
        });
      }

      if (!["FIXED", "PERCENTAGE"].includes(discountType)) {
        return res.status(400).json({
          message: "Invalid discount type",
        });
      }

      if (
        eligibility &&
        !["ALL", "FIRST_PURCHASE", "EXISTING_BUYER"].includes(eligibility)
      ) {
        return res.status(400).json({
          message: "Invalid coupon eligibility",
        });
      }

      if (
        discountType === "PERCENTAGE" &&
        (discountValue <= 0 || discountValue > 100)
      ) {
        return res.status(400).json({
          message: "Percentage discount must be between 1 and 100",
        });
      }

      if (discountType === "FIXED" && discountValue <= 0) {
        return res.status(400).json({
          message: "Discount value must be greater than 0",
        });
      }

      const existingCoupon = await Coupon.findOne({
        where: {
          code: code.toUpperCase(),
        },
      });

      if (existingCoupon) {
        return res.status(409).json({
          message: "Coupon code already exists",
        });
      }

      const coupon = await Coupon.create({
        name,
        details,
        code: code.toUpperCase(),
        discountType,
        discountValue,
        eligibility: eligibility || "ALL",
        minOrderAmount: minOrderAmount || null,
        maxDiscountAmount: maxDiscountAmount || null,
        startsAt: startsAt || null,
        expiresAt: expiresAt || null,
        usageLimit: usageLimit || null,
        usedCount: 0,
        isActive: true,
      });

      if (coupon.eligibility === "ALL") {
        const users = await User.findAll({
          where: {
            isActive: true,
          },
        });

        for (const user of users) {
          try {
            await sendNewCouponEmail(user, coupon);
          } catch (error) {
            console.error(
              `Failed to send coupon email to ${user.email}:`,
              error.message,
            );
          }
        }
      }

      return res.status(201).json({
        message: "Coupon created successfully",
        coupon,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },
);
