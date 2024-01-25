const express = require("express")
const router = express.Router()
const productMulter = require("../multer/productControll")
const controller = require("../controllers/admin/AdminController")
const userViewController = require("../controllers/admin/userController")
const productController = require("../controllers/admin/productController")



router.get("/", controller.renderAdminLogin)
router.get("/home", controller.renderAdminHome)
router.post("/getHome", controller.adminHome)
router.get("/categories", controller.renderCategories)
router.get("/productList", controller.renderProductList)
router.get("/logout", controller.adminLogout)




router.get("/usermanagement", userViewController.viewUser)
router.get('/blockuser/:id', userViewController.blockUser)
router.get("/unblockuser/:id", userViewController.unBlockUser)


router.get("/addproduct", productController.renderAddProduct)
router.post("/add-product",productMulter.array('image',4), productController.addProduct)



module.exports = router