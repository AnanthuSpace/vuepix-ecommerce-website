const express = require("express")
const router = express.Router()

const { isLogged, isBlocked } = require('../Authentication/Auth')
const controller = require("../controllers/user/UserController")
const productController = require("../controllers/user/productController")
const cartController = require("../controllers/user/cartController")
const profileController = require("../controllers/user/userProfile")
const orderController = require("../controllers/user/orderController")
const wishlistController = require("../controllers/user/wishlistController")
const walletController = require("../controllers/user/walletController")



// Users Basic Actions 
router.get("/", controller.renderGuest)
router.get("/login", controller.renderLogin)
router.get("/signup", controller.renderSignUp)
router.post("/userCreate", controller.createUser);
router.get("/VuePix", controller.renderHome)
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
router.get("/search", productController.searchProducts)
router.get("/filter", productController.filterProduct)
router.post("/sortProducts", productController.getSortProducts)



// Cart controll
router.get("/cart", isLogged, isBlocked, cartController.renderCart)
router.post("/cart", isLogged, isBlocked, cartController.addToCart)
router.get("/deleteItem", isLogged, isBlocked, cartController.deleteCartItem)
router.post("/changeQuantity", isLogged, isBlocked, cartController.changeQuantity)




// Profile routes
router.get('/profile', isLogged, isBlocked, profileController.renderProfile)
router.post('/editUserDetails', isLogged, isBlocked, profileController.editUser)
router.get("/addAddress", isLogged, isBlocked, profileController.renderAddAddress)
router.post("/addAddress", isLogged, isBlocked, profileController.addAddress)
router.get("/editAddress", isLogged, isBlocked, profileController.getEditAddress)
router.post("/editAddress", isLogged, isBlocked, profileController.editAddress)
router.get("/deleteAddress", isLogged, isBlocked, profileController.deleteAddress)
router.post("/changepassword", isLogged, isBlocked, profileController.changePass)
router.post('/verifyReferalCode', isLogged, isBlocked, profileController.verifyReferelCode)
router.post('/addAddressCheout', isLogged, isBlocked, profileController.addAddressCheckout)



// Order controll
router.get('/checkout', isLogged, isBlocked, orderController.checkout)
router.post('/applyCoupon', isLogged, isBlocked, orderController.applyCoupon)
router.post('/orderPlaced', isLogged, isBlocked, orderController.placeOrder)
router.get('/orderDetails', isLogged, isBlocked, orderController.orderDetails)
router.get("/cancelOrder", isLogged, isBlocked, orderController.cancelOrder)
router.post('/verifyPayment', isLogged, isBlocked, orderController.verify)
router.get("/return", isLogged, isBlocked, orderController.returnOrder)
router.post("/cancelCoupon", isLogged, isBlocked, orderController.cancelCoupon)
router.post('/continuePayment', isLogged, isBlocked, orderController.continuePayment)



// wishlist
router.get("/wishlist", isLogged, isBlocked, wishlistController.getWishlistPage)
router.post("/addToWishlist", isLogged, isBlocked, wishlistController.addToWishlist)
router.get("/deleteWishlist", isLogged, isBlocked, wishlistController.deleteItemWishlist)



// Wallet
router.post("/addMoney", isLogged, isBlocked, walletController.addMoneyToWallet)
router.post('/verify-payment', isLogged, isBlocked, walletController.verify_payment)



module.exports = router