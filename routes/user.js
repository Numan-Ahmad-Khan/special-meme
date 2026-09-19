const express = require("express");
const authorization = require("../middleware/authorization");
const authentication = require("../middleware/authentication");
const User = require("../models/Users");
const Order = require("../models/Orders");
const Address = require("../models/Address");
const Config = require("../models/Config");
const Rider = require("../models/Rider");
const bcrypt = require("bcrypt");
const haversine = require("haversine-distance");
const isVerified = require("../middleware/verification");
const haversineDistance = require("haversine-distance");
const razorpay = require("../config/razorpay");
const router = express.Router();

router.get(
  "/user/me",
  authentication,
  authorization("USER"),
  async (req, res) => {
    try {
      const user = await User.findOne({
        where: { id: req.user.userId },
        attributes: { exclude: ["password"] },
      });
      if (!user) {
        return res.json({ msg: "Error not found" });
      }
      return res.json({ user });
    } catch (err) {
      console.log(err);
      res.json({ error: "Server Error" });
    }
  },
);

router.post(
  "/user/place_order",
  authentication,
  isVerified,
  authorization("USER"),
  async (req, res) => {
    try {
      const user = await User.findOne({
        where: {
          id: req.user.userId,
        },
      });

      if (!user) {
        return res.status(404).json({
          msg: "User not found",
        });
      }

      if (!user.isActive) {
        return res.status(400).json({
          msg: "User account deactivated and cannot place order.",
        });
      }

      const {
        orderName,
        orderDetails,
        couponCode,
        orderWeight,
        orderLength,
        orderBreadth,
        orderHeight,
      } = req.body || {};

      if (
        orderWeight === undefined ||
        orderLength === undefined ||
        orderBreadth === undefined ||
        orderHeight === undefined
      ) {
        return res.status(400).json({
          msg: "Order weight, length, breadth and height are required",
        });
      }

      if (
        Number(orderWeight) <= 0 ||
        Number(orderLength) <= 0 ||
        Number(orderBreadth) <= 0 ||
        Number(orderHeight) <= 0
      ) {
        return res.status(400).json({
          msg: "Order weight and dimensions must be greater than 0",
        });
      }

      const MAX_WEIGHT = 5;
      const MAX_LENGTH = 100;
      const MAX_BREADTH = 50;
      const MAX_HEIGHT = 50;

      const pickupAddress = await Address.create({
        street: req.body.pickup.street,
        longitude: req.body.pickup.longitude,
        latitude: req.body.pickup.latitude,
        landmark: req.body.pickup.landmark,
        pincode: req.body.pickup.pincode,
        addresstype: req.body.pickup.addresstype,
      });

      const dropAddress = await Address.create({
        street: req.body.drop.street,
        longitude: req.body.drop.longitude,
        latitude: req.body.drop.latitude,
        landmark: req.body.drop.landmark,
        pincode: req.body.drop.pincode,
        addresstype: req.body.drop.addresstype,
      });

      const pickup = {
        latitude: req.body.pickup.latitude,
        longitude: req.body.pickup.longitude,
      };

      const drop = {
        latitude: req.body.drop.latitude,
        longitude: req.body.drop.longitude,
      };

      const distance = +(haversine(pickup, drop) / 1000).toFixed(2);

      const config = await Config.findOne({
        where: {
          id: "SINGLETON",
        },
      });

      if (!config) {
        return res.status(500).json({
          msg: "Pricing configuration not found",
        });
      }

      const ratePerKm = Number(config.rateValueDistance);
      const weightExtraCharge = Number(config.rateValueWeight);
      const dimensionsExtraCharge = Number(config.rateValueDimensions);

      const basePrice = +(ratePerKm * distance).toFixed(2);

      let weightCharge = 0;

      if (Number(orderWeight) > MAX_WEIGHT) {
        weightCharge = weightExtraCharge;
      }

      let dimensionsCharge = 0;

      if (
        Number(orderLength) > MAX_LENGTH ||
        Number(orderBreadth) > MAX_BREADTH ||
        Number(orderHeight) > MAX_HEIGHT
      ) {
        dimensionsCharge = dimensionsExtraCharge;
      }

      const price = +(basePrice + weightCharge + dimensionsCharge).toFixed(2);

      let discountAmount = 0;
      let finalAmount = price;
      let appliedCoupon = null;

      if (couponCode) {
        const coupon = await Coupon.findOne({
          where: {
            code: couponCode.toUpperCase(),
          },
        });

        if (!coupon) {
          return res.status(400).json({
            msg: "Invalid coupon code",
          });
        }

        if (!coupon.isActive) {
          return res.status(400).json({
            msg: "Coupon is inactive",
          });
        }

        const now = new Date();

        if (coupon.startsAt && now < new Date(coupon.startsAt)) {
          return res.status(400).json({
            msg: "Coupon is not active yet",
          });
        }

        if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
          return res.status(400).json({
            msg: "Coupon has expired",
          });
        }

        if (
          coupon.usageLimit !== null &&
          coupon.usedCount >= coupon.usageLimit
        ) {
          return res.status(400).json({
            msg: "Coupon usage limit reached",
          });
        }

        if (
          coupon.minOrderAmount !== null &&
          price < Number(coupon.minOrderAmount)
        ) {
          return res.status(400).json({
            msg: `Minimum order amount is ₹${coupon.minOrderAmount}`,
          });
        }

        const previousOrder = await Order.findOne({
          where: {
            userId: req.user.userId,
            paymentStatus: "PAID",
          },
        });

        if (coupon.eligibility === "FIRST_PURCHASE" && previousOrder) {
          return res.status(400).json({
            msg: "This coupon is only available for your first purchase",
          });
        }

        if (coupon.eligibility === "EXISTING_BUYER" && !previousOrder) {
          return res.status(400).json({
            msg: "This coupon is only available for existing buyers",
          });
        }

        const previousUsage = await CouponUsage.findOne({
          where: {
            couponId: coupon.id,
            userId: req.user.userId,
          },
        });

        if (previousUsage) {
          return res.status(400).json({
            msg: "You have already used this coupon",
          });
        }

        if (coupon.discountType === "FIXED") {
          discountAmount = Number(coupon.discountValue);
        }

        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (price * Number(coupon.discountValue)) / 100;

          if (
            coupon.maxDiscountAmount !== null &&
            discountAmount > Number(coupon.maxDiscountAmount)
          ) {
            discountAmount = Number(coupon.maxDiscountAmount);
          }
        }

        if (discountAmount > price) {
          discountAmount = price;
        }

        discountAmount = +discountAmount.toFixed(2);

        finalAmount = +(price - discountAmount).toFixed(2);

        appliedCoupon = coupon;
      }

      const freeRider = await Rider.findAll({
        where: {
          status: "FREE",
        },
      });

      if (freeRider.length === 0) {
        return res.status(400).json({
          msg: "No rider available at the moment",
        });
      }

      const riderDistances = freeRider.map((rider) => {
        const riderDistance =
          haversine(
            {
              latitude: rider.latitude,
              longitude: rider.longitude,
            },
            pickup,
          ) / 1000;

        return {
          riderId: rider.id,
          distance: riderDistance,
        };
      });

      const closestRider = riderDistances.sort(
        (a, b) => a.distance - b.distance,
      )[0];

      const riderId = closestRider.riderId;

      const order = await Order.create({
        orderName: orderName,
        orderDetails: orderDetails,
        orderWeight: Number(orderWeight),
        orderLength: Number(orderLength),
        orderBreadth: Number(orderBreadth),
        orderHeight: Number(orderHeight),
        userId: req.user.userId,
        pickup: pickupAddress.id,
        drop: dropAddress.id,
        price: price,
        originalAmount: price,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        riderId: riderId,
        paymentStatus: "PENDING",
      });

      const paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        reference_id: order.id,
        description: `Payment for ${order.orderName}`,
        customer: {
          name: user.name,
          email: user.email,
        },
        notify: {
          sms: false,
          email: false,
        },
        reminder_enable: false,
      });

      await order.update({
        paymentLinkId: paymentLink.id,
        paymentLink: paymentLink.short_url,
      });

      return res.json({
        Success: "Your order has been placed successfully",
        OrderId: order.id,
        originalAmount: price,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentStatus: order.paymentStatus,
        paymentLink: paymentLink.short_url,
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  },
);
router.get(
  "/user/track_order/:id",
  authentication,
  authorization("USER"),
  async (req, res) => {
    try {
      const user = await User.findOne({ where: { id: req.user.userId } });
      if (!user) {
        return res.json({ msg: "User not found cannot place order" });
      }
      if (!user.isActive) {
        return res.json({
          msg: "User account deactivated and cannot place order.",
        });
      }
      const order = await Order.findOne({
        where: { id: req.params.id },
        attributes: [
          "id",
          "orderName",
          "status",
          "pickup",
          "drop",
          "transitDetail",
        ],
      });
      if (!order) {
        return res.json({ message: "Invalid Order ID" });
      }

      let transitData = null;
      if (order.transitDetail) {
        transitData = await Checkpoint.findOne({
          where: { id: order.transitDetail },
        });
      } else {
        transitData = null;
      }

      const dropAddress = await Address.findOne({ where: { id: order.drop } });

      let remainingDistance = null;
      if (dropAddress && transitData) {
        remainingDistance =
          haversineDistance(
            {
              latitude: dropAddress.latitude,
              longitude: dropAddress.longitude,
            },
            {
              latitude: transitData.latitude,
              longitude: transitData.longitude,
            },
          ) / 1000;
      } else {
        remainingDistance = null;
      }
      let locationResponse = null;
      if (transitData) {
        locationResponse = {
          Name: transitData.checkpointName,
          Details: transitData.checkpointDetail,
        };
      } else {
        locationResponse = {
          Name: "Not Dispatched",
          Details: "Order has not reached a transit checkpoint yet.",
        };
      }
      return res.json({
        Success: "Order Status",
        Name: order.orderName,
        Status: order.status,
        location: locationResponse,
        remainingDistance: remainingDistance,
        lastUpdateAt: order.updatedAt,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Internal server error" });
    }
  },
);

router.patch(
  "/user/change_password",
  authentication,
  authorization("USER"),
  async (req, res) => {
    try {
      const user = await User.findOne({ where: { id: req.user.userId } });
      const { oldPassword, newPassword } = req.body;
      if (oldPassword === newPassword) {
        return res.json({ msg: "Old and new password cannot be same" });
      }

      const verification = await bcrypt.compare(oldPassword, user.password);
      if (!verification) {
        return res.json({ message: "Invalid password" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      return res.json({ Success: "Password Updated" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
);

router.patch(
  "/user/change_account_status",
  authentication,
  authorization("USER"),
  async (req, res) => {
    try {
      const user = await User.findOne({ where: { id: req.user.userId } });
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.json({
          msg: "Incorrect activation type, needs to be a boolean",
        });
      }
      if (isActive === user.isActive) {
        return res.json({ msg: `Already isActive = ${isActive}` });
      }
      user.isActive = isActive;
      await user.save();
      return res.json({
        Success: "User Satus Changed",
        isActive: user.isActive,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
);
router.delete(
  "/user/delete_account",
  authentication,
  authorization("USER"),
  async (req, res) => {
    try {
      const user = await User.findOne({ where: { id: req.user.userId } });
      if (!user) {
        return res.json({ msg: "User not found" });
      }
      const id = user.id;
      const name = user.name;
      const { confirmPassword } = req.body;
      if (confirmPassword === undefined) {
        return res.json({ msg: "Please provide a password" });
      }
      console.log(user.id, user.name);
      const verification = await bcrypt.compare(confirmPassword, user.password);
      if (!verification) {
        return res.json({ message: "Invalid password, cannot delete user" });
      }
      await user.destroy();
      return res.json({
        Success: "User deleted",
        id,
        name,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  },
);
module.exports = router;
