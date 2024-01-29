const express = require("express")
const router = express.Router()
const controller = require("../controllers/user/UserController")


router.get("/", controller.renderLogin)
router.get("/login", controller.renderLogin)
router.get("/signup", controller.renderSignUp)
router.post("/userCreate", controller.createUser);
router.get("/Home", controller.renderHome)
router.get("/verifyOtp", controller.getVerifyOtp)
router.post("/verifyOtp", controller.verifyOtp)
router.post("/userVerification", controller.userVerification)
router.get("/resendOtp", controller.resendOTP)
router.get("/logout" ,controller.logout)
router.get('/forgot', controller.renderForgotPass)
router.post('/forgotEmailVerify',controller.verifyForgotEmail)
router.get('/forgotOtp', controller.getVerifyForgot)
router.post('/forgotOtp', controller.verifyForgotOtp)
router.get('/repassword', controller.renderRePass)
router.post("/newpass", controller.newPass)

module.exports = router