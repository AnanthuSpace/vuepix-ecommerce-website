const express = require("express")
const session = require("express-session")
const userRoute = require("./routers/UserRouter")
const nocache = require("nocache")
require("./DB/db_connection")

const app = new express()

app.use(
    session({
        secret: "mykey",
        resave: false,
        saveUninitialized: true
    })
)

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(nocache())

app.use("/", userRoute)

app.listen(3000, () => console.log("server running"))