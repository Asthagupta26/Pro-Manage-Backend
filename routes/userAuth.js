const express = require("express");
const router = express.Router();
const authController = require("../controller/userAuth");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.put("/update/name", authController.updateUserName);
router.put("/update/userDetails", authController.updateUserDetails);


module.exports = router;
