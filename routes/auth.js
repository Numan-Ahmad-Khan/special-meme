const express = require("express");

const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/auth/signup", authController.signup);

router.post("/auth/login", authController.login);

router.post("/auth/rider/signup", authController.riderSignup);

router.post("/auth/rider/login", authController.riderLogin);

module.exports = router;