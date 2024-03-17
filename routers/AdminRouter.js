const express = require("express")
const router = express.Router()
const productMulter = require("../multer/productControll")
const controller = require("../controllers/admin/AdminController")
const userViewController = require("../controllers/admin/userController")
const productController = require("../controllers/admin/productController")
const categoryController = require("../controllers/admin/categoryController")
const orderController = require("../controllers/admin/orderController")
const couponController = require("../controllers/admin/couponController")
const bannerController = require("../controllers/admin/bannerController")
const salesReportController = require("../controllers/admin/salesReport")


const { isAdmin } = require("../Authentication/Auth")


// Admin basic actions
router.get("/", controller.renderAdminLogin)
router.post("/getHome", controller.adminHome)
router.get("/home", isAdmin, controller.renderAdminHome)
router.get("/logout", isAdmin, controller.adminLogout)
router.post("/chart", isAdmin, controller.getChartData);



// User Management
router.get("/usermanagement", isAdmin, userViewController.viewUser)
router.get('/blockuser/:id', isAdmin, userViewController.blockUser)
router.get("/unblockuser/:id", isAdmin, userViewController.unBlockUser)


// Product management
router.get("/addproduct", isAdmin, productController.renderAddProduct)
router.post("/add-product", isAdmin, productMulter.array('image', 4), productController.addProduct)
router.get("/productList", isAdmin, productController.productList)
router.get("/editProduct", isAdmin, productController.showEdit)
router.post("/editProduct/:id", isAdmin, productMulter.array('image', 4), productController.editProduct)
router.get('/blockProduct', isAdmin, productController.blockProduct)
router.get('/unBlockProduct', isAdmin, productController.unblockProduct)
router.post("/addProductOffer", isAdmin, productController.addProductOffer)
router.post("/removeProductOffer", isAdmin, productController.removeProductOffer)



// Category Management
router.get("/category", isAdmin, categoryController.renderCategory)
router.post("/addcategory", isAdmin, categoryController.addCategory)
router.get("/listcategory", isAdmin, categoryController.listCategory)
router.get("/unlistcategory", isAdmin, categoryController.unListCategory)
router.get("/editCategory", isAdmin, categoryController.renderEditCategory)
router.post("/editCategory/:id", isAdmin, categoryController.editCategory)
router.post("/addCategoryOffer", isAdmin, categoryController.addCategoryOffer)
router.post("/removeCategoryOffer", isAdmin, categoryController.removerCategoryOffer)



// Order Management
router.get("/orders", isAdmin, orderController.orderListing)
router.get("/orderDetailsAdmin", isAdmin, orderController.getOrderDetails)
router.get("/changeStatus", isAdmin, orderController.changeOrderStatus)


// Coupen Management
router.get("/coupon", isAdmin, couponController.getCouponPageAdmin)
router.post("/createCoupon", isAdmin, couponController.createCoupon)
router.post("/deleteCoupon", isAdmin, couponController.deleteCoupon)



// SalesReport Managment
router.get("/salesReport", isAdmin, salesReportController.getSalesReportPage)
router.get("/salesToday", isAdmin, salesReportController.salesToday)
router.get("/salesWeekly", isAdmin, salesReportController.salesWeekly)
router.get("/salesMonthly", isAdmin, salesReportController.salesMonthly)
router.get("/salesYearly", isAdmin, salesReportController.salesYearly)
router.get("/dateWiseFilter", isAdmin, salesReportController.dateWiseFilter)
router.post("/generatePdf", isAdmin, salesReportController.generatePdf)
router.post("/downloadExcel", isAdmin, salesReportController.downloadExcel)


// Banner Management
router.get("/banner", isAdmin, bannerController.getBanner)
router.get("/addBanner", isAdmin, bannerController.getAddBannerPage)
router.post("/addBanner", isAdmin, productMulter.single("images"), bannerController.postAddBanner)
router.get("/editBanner", isAdmin, bannerController.getEditBannerPage)
router.post("/editBanner", isAdmin, productMulter.single("images"), bannerController.postEditBanner)
router.get("/deleteBanner", isAdmin, bannerController.deleteBanner)


module.exports = router