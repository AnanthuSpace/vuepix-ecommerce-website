const express = require("express")
const router = express.Router()
const controller = require("../controllers/UserController")


router.get("/", controller.renderGuest)
router.get("/login", controller.renderLogin)
router.get("/signup", controller.renderSignUp)
router.get("/otp", controller.otpVerification)
router.post("/userCreate", controller.createUser);
router.get("/Home", controller.renderHome)
router.post("/userVerification", controller.userVerification)
router.get("/logout", controller.logout)

module.exports = router