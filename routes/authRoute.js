const express = require("express");
const router = express.Router();
const { login } = require("../controller/authController");

router.route("/login").post(login);
// router.route("/logout").post(logout);
module.exports = router;
