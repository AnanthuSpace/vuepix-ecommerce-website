const express = require("express")
const router = express.Router()
const controller = require("../controllers/UserController")

router.get("/", controller.renderLogin)
router.get("/signup", controller.renderSignUp)

module.exports = router