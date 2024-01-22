const express = require("express")
const router = express.Router()
const controller = require("../controllers/AdminController")

router.get("/", controller.renderAdminLogin)
router.post("/getHome", controller.adminHome)
router.get("/home", controller.renderAdminHome)

module.exports = router