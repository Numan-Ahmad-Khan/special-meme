const express = require("express");

const authorization = require("../middleware/authorization");
const authentication = require("../middleware/authentication");

const riderController = require("../controllers/rider.controller");

const router = express.Router();

router.get(
    "/rider/me",
    authentication,
    authorization("RIDER"),
    riderController.getMe
);

router.get(
    "/rider/update_order",
    authentication,
    authorization("RIDER"),
    riderController.updateOrder
);

module.exports = router;