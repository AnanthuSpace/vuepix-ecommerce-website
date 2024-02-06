const express = require("express")
const router = express.Router()

const {isLogged} = require('../Authentication/Auth')
const controller = require("../controllers/user/UserController")
const productController = require("../controllers/user/productController")
const cartController = require("../controllers/user/cartController")



router.get("/", controller.renderLogin)
router.get("/login", controller.renderLogin)
router.get("/signup", controller.renderSignUp)
router.post("/userCreate", controller.createUser);
router.get("/Home", controller.renderHome)
router.get("/verifyOtp", controller.getVerifyOtp)
router.post("/verifyOtp", controller.verifyOtp)
router.post("/userVerification", controller.userVerification)
router.get("/resendOtp", controller.resendOTP)
router.get("/logout", isLogged,controller.logout)
router.get('/forgot', controller.renderForgotPass)
router.post('/forgotEmailVerify', controller.verifyForgotEmail)
router.get('/forgotOtp', controller.getVerifyForgot)
router.post('/forgotOtp', controller.verifyForgotOtp)
router.get('/repassword', controller.renderRePass)
router.post("/newpass", controller.newPass)
router.get("/pageNotFound", controller.pageNotFound)



// Products actions
router.get("/productDetails", productController.getProductDetails)
router.get("/shop", productController.getShop)



// Cart controll
router.get("/cart", isLogged,cartController.renderCart)
router.post("/cart/:id", isLogged,cartController.addToCart)



module.exports = router