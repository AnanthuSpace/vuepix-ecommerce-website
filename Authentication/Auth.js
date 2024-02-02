const User = require("../models/userSchema")


const isLogged = (req, res, next) => {
    if (req.session.user) {
        User.findById({ email: req.session.user }).lean()
            .then((data) => {
                if (data.isBlocked == false) {
                    next()
                } else {
                    res.redirect("/login")
                }
            })
    } else {
        res.redirect("/login")
    }
}


const isAdmin = (req, res, next) => {
    if (req.session.admin) {
        User.findOne({ isAdmin: true })
            .then((data) => {
                if (data) {
                    next();
                } else {
                    res.redirect("/admin/login");
                }
            })
            .catch((error) => {
                console.error("Error in isAdmin middleware:", error);
                res.status(500).send("Internal Server Error");
            });
    } else {
        res.redirect("/admin/login");
    }
};


module.exports = {
    isLogged,
    isAdmin
}