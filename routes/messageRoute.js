const express = require("express");
const { sendMessage } = require("../controller/messageController");
const router = express.Router();

router.route("/").post(sendMessage);
module.exports = router;
