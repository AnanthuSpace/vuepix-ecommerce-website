const express = require("express")
const router = express.Router()

const { isLogged } = require('../Authentication/Auth')
const controller = require("../controllers/user/UserController")
const productController = require("../controllers/user/productController")
const cartController = require("../controllers/user/cartController")
const profileController = require("../controllers/user/userProfile")
const orderController = require("../controllers/user/orderController")



router.get("/", controller.renderLogin)
router.get("/login", controller.renderLogin)
router.get("/signup", controller.renderSignUp)
router.post("/userCreate", controller.createUser);
router.get("/Home", controller.renderHome)
router.get("/verifyOtp", controller.getVerifyOtp)
router.post("/verifyOtp", controller.verifyOtp)
router.post("/userVerification", controller.userVerification)
router.get("/resendOtp", controller.resendOTP)
router.get("/logout", isLogged, controller.logout)
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
router.get("/cart", isLogged, cartController.renderCart)
router.post("/cart", isLogged, cartController.addToCart)
router.get("/deleteItem", isLogged, cartController.deleteCartItem)
router.post("/changeQuantity", isLogged, cartController.changeQuantity)




// Profile routes
router.get('/profile', isLogged, profileController.renderProfile)
router.post('/editUserDetails', isLogged, profileController.editUser)
router.get("/addAddress", isLogged, profileController.renderAddAddress)
router.post("/addAddress", isLogged, profileController.addAddress)
router.get("/editAddress", isLogged, profileController.getEditAddress)
router.post("/editAddress", isLogged, profileController.editAddress)
router.get('/orderDetails', isLogged, profileController.orderDetails)



// Order controll
router.get('/checkout', isLogged, orderController.checkout)
router.post('/orderPlaced', isLogged, orderController.placeOrder)


module.exports = router