const crypto = require("crypto");

const Order = require("../models/Orders");
const Coupon = require("../models/Coupon");
const CouponUsage = require("../models/CouponUsage");

const webhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({
        message: "Invalid webhook signature",
      });
    }

    console.log("Webhook signature verified");

    const webhookData = JSON.parse(req.body.toString());

    console.log("Webhook event:", webhookData.event);

    if (webhookData.event === "payment_link.paid") {
      const paymentLink = webhookData.payload.payment_link.entity;

      const orderId = paymentLink.reference_id;

      const order = await Order.findByPk(orderId);

      if (!order) {
        console.log("Order not found:", orderId);

        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (order.paymentStatus === "PAID") {
        console.log(`Order ${order.id} is already PAID`);

        return res.status(200).json({
          message: "Order already processed",
        });
      }

      await order.update({
        paymentStatus: "PAID",
      });

      console.log(`Order ${order.id} payment marked as PAID`);

      if (order.couponCode) {
        const coupon = await Coupon.findOne({
          where: {
            code: order.couponCode,
          },
        });

        if (coupon) {
          const existingUsage = await CouponUsage.findOne({
            where: {
              couponId: coupon.id,
              userId: order.userId,
              orderId: order.id,
            },
          });

          if (!existingUsage) {
            await CouponUsage.create({
              id: crypto.randomUUID(),
              couponId: coupon.id,
              userId: order.userId,
              orderId: order.id,
              discountAmount: order.discountAmount,
            });

            await coupon.increment("usedCount", {
              by: 1,
            });

            console.log(`Coupon ${coupon.code} usage recorded`);
          } else {
            console.log(`Coupon already recorded for order ${order.id}`);
          }
        }
      }
    }

    return res.status(200).json({
      message: "Webhook processed successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  webhook,
};
