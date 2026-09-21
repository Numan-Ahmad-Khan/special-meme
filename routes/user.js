const express = require("express");

const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const isVerified = require("../middleware/verification");
const rateLimiter = require("../middleware/rateLimiter");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.get(
  "/user/me",
  authentication,
  authorization("USER"),
  userController.getMe,
);

router.post(
  "/user/place_order",
  authentication,
  isVerified,
  rateLimiter("order", 5, 600),
  authorization("USER"),
  userController.placeOrder,
);

router.get(
  "/user/track_order/:id",
  authentication,
  authorization("USER"),
  userController.trackOrder,
);

router.patch(
  "/user/change_password",
  authentication,
  authorization("USER"),
  userController.changePassword,
);

router.patch(
  "/user/change_account_status",
  authentication,
  authorization("USER"),
  userController.changeAccountStatus,
);

router.delete(
  "/user/delete_account",
  authentication,
  authorization("USER"),
  userController.deleteAccount,
);

module.exports = router;