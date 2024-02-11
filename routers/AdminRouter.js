const express = require("express")
const router = express.Router()
const productMulter = require("../multer/productControll")
const controller = require("../controllers/admin/AdminController")
const userViewController = require("../controllers/admin/userController")
const productController = require("../controllers/admin/productController")
const categoryController = require("../controllers/admin/categoryController")
const orderController = require("../controllers/admin/orderController")


const { isAdmin } = require("../Authentication/Auth")


router.get("/", controller.renderAdminLogin)
router.post("/getHome", controller.adminHome)
router.get("/home", isAdmin, controller.renderAdminHome)
router.get("/logout", isAdmin, controller.adminLogout)




router.get("/usermanagement", isAdmin, userViewController.viewUser)
router.get('/blockuser/:id', isAdmin, userViewController.blockUser)
router.get("/unblockuser/:id", isAdmin, userViewController.unBlockUser)



router.get("/addproduct", isAdmin, productController.renderAddProduct)
router.post("/add-product", isAdmin, productMulter.array('image', 4), productController.addProduct)
router.get("/productList", isAdmin, productController.productList)
router.get("/editProduct", isAdmin, productController.showEdit)
router.post("/editProduct/:id", isAdmin, productMulter.array('image', 4), productController.editProduct)
router.get('/blockProduct', isAdmin, productController.blockProduct)
router.get('/unBlockProduct', isAdmin, productController.unblockProduct)



router.get("/category", isAdmin, categoryController.renderCategory)
router.post("/addcategory", isAdmin, categoryController.addCategory)
router.get("/listcategory", isAdmin, categoryController.listCategory)
router.get("/unlistcategory", isAdmin, categoryController.unListCategory)
router.get("/editCategory", isAdmin, categoryController.renderEditCategory)
router.post("/editCategory/:id", isAdmin, categoryController.editCategory)




router.get("/orders", isAdmin, orderController.orderListing)
router.get("/orderDetails", isAdmin, orderController.getOrderDetails)

module.exports = router