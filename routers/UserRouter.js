const express = require("express")
const router = express.Router()
const controller = require("../controllers/UserController")
const { isLogged } = require("../Authentication/Auth")

router.get("/", controller.renderGuest)
router.get("/login", controller.renderLogin)
router.get("/signup", controller.renderSignUp)
router.get("/otp", controller.otpVerification)
router.post("/userCreate", controller.createUser);
router.get("/Home", controller.renderHome)
router.post("/verify", controller.verifyOtp)
router.post("/userVerification", controller.userVerification)
router.get("/logout", isLogged,controller.logout)

module.exports = router