const express = require("express");

const authorization = require("../middleware/authorization");
const authentication = require("../middleware/authentication");

const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.get(
  "/admin/me",
  authentication,
  authorization("ADMIN"),
  adminController.getMe,
);

router.get(
  "/admin/order/:id",
  authentication,
  authorization("ADMIN"),
  adminController.getOrder,
);

router.patch(
  "/admin/order/change_status/:id",
  authentication,
  authorization("ADMIN"),
  adminController.changeOrderStatus,
);

router.patch(
  "/admin/order/checkpoint_update/:id",
  authentication,
  authorization("ADMIN"),
  adminController.updateCheckpoint,
);

router.get(
  "/admin/order_list",
  authentication,
  authorization("ADMIN"),
  adminController.getOrderList,
);

router.get(
  "/admin/user_list",
  authentication,
  authorization("ADMIN"),
  adminController.getUserList,
);

router.patch(
  "/admin/change_rate",
  authentication,
  authorization("ADMIN"),
  adminController.changeRate,
);

router.patch(
  "/admin/add_checkpoint",
  authentication,
  authorization("ADMIN"),
  adminController.addCheckpoint,
);

router.get(
  "/admin/test-email",
  adminController.testEmail,
);

module.exports = router;