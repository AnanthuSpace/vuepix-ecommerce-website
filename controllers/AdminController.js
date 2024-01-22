const { User } = require("../models/userSchema")
const bcrypt = require("bcrypt")


// Render admin login page

const renderAdminLogin = async (req, res) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/getHome')
        } else {
            res.render('admin/adminLogin')
        }
    } catch (error) {
        res.render("adminHome");
    }
}


// Get admin home page

const adminHome = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (email === "admin@gmail.com" && password === "123") {
            // req.session.admin = email;
            // res.cookie("sessionId", req.sessionID, { httpOnly: true });
            res.redirect("/admin/home");
            return;
        } else {
            console.log("Invalid User id and password");
            res.render("admin/adminLogin");
        }
    } catch (error) {
        console.error("Login error:", error);
        res.render("admin/adminLogin");
    }
};

const renderAdminHome = async (req,res)=>{
    res.render("admin/adminHome")
}

module.exports = {
    renderAdminLogin,
    adminHome,
    renderAdminHome
}