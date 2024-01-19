const express = require("express")
const userRoute = require("./routers/UserRouter")
const adminRoute = require("./routers/AdminRouter")


const app = new express()

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/", userRoute)
// app.use("/admin", adminRoute)

app.listen(3000, () => console.log("server running"))