const express = require("express")
const session = require("express-session")
// const morgan = require('morgan');
const userRoute = require("./routers/UserRouter")
const adminRoute = require("./routers/AdminRouter")
const nocache = require("nocache")
require("./DB/db_connection")
const PORT = process.env.PORT || 3000
const dotenv = require("dotenv")

dotenv.config()

const app = new express()
// app.use(morgan('dev'));

app.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true
    })
)

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(nocache())


app.use("/admin", adminRoute)
app.use("/", userRoute)
app.get('*', function (req, res) {
    res.redirect("/pageNotFound");
});

app.listen(PORT, () => console.log(`Server Running on http://localhost:${PORT}`))