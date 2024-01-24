const express = require("express")
const router = express.Router()
const controller = require("../controllers/admin/AdminController")
const userViewController = require("../controllers/admin/userController")



router.get("/", controller.renderAdminLogin)
router.get("/home", controller.renderAdminHome)
router.post("/getHome", controller.adminHome)
router.get("/addproduct", controller.renderAddProduct)
router.get("/categories", controller.renderCategories)
router.get("/productList", controller.renderProductList)
router.get("/", controller.adminLogout)




router.get("/usermanagement", userViewController.viewUser)
router.get('/blockuser/:id', userViewController.blockUser)
router.get("/unblockuser/:id", userViewController.unBlockUser)



module.exports = router