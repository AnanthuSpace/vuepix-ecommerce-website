const express = require("express")
const router = express.Router()
const productMulter = require("../multer/productControll")
const controller = require("../controllers/admin/AdminController")
const userViewController = require("../controllers/admin/userController")
const productController = require("../controllers/admin/productController")
const categoryController = require("../controllers/admin/categoryController")





router.get("/", controller.renderAdminLogin)
router.get("/home", controller.renderAdminHome)
router.post("/getHome", controller.adminHome)
router.get("/logout", controller.adminLogout)




router.get("/usermanagement", userViewController.viewUser)
router.get('/blockuser/:id', userViewController.blockUser)
router.get("/unblockuser/:id", userViewController.unBlockUser)



router.get("/addproduct", productController.renderAddProduct)
router.post("/add-product",productMulter.array('image',4), productController.addProduct)
router.get("/productList", productController.productList)
router.get("/editProduct", productController.showEdit)
router.post("/editProduct/:id", productMulter.array('image',4),productController.editProduct)
router.get('/blockProduct' , productController.blockProduct)
router.get('/unBlockProduct' , productController.unblockProduct)



router.get("/category", categoryController.renderCategory)
router.post("/addcategory", categoryController.addCategory)
router.get("/listcategory",categoryController.listCategory)
router.get("/unlistcategory", categoryController.unListCategory)
router.get("/editCategory", categoryController.renderEditCategory)
router.post("/editCategory/:id", categoryController.editCategory)



module.exports = router