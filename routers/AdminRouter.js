const express = require("express")
const router = express.Router()
const controller = require("../controllers/AdminController")



router.get("/", controller.renderAdminLogin)
router.get("/home", controller.renderAdminHome)
router.post("/getHome", controller.adminHome)
router.get("/addproduct", controller.renderAddProduct)
router.get("/categories", controller.renderCategories)



module.exports = router