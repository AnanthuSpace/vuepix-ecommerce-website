const { User } = require("../models/userSchema")
const Admin = require("../models/adminSchema")

const isLogged = (req, res, next) => {
    if (req.session.user) {
        console.log(req.session.user);
        // User.findById({ _id: req.session.user })
        //     .then((data) => {
        //         if (data.isBlocked == false) {
                    next()
            //     } else {
            //         res.redirect("/login")
            //     }
            // })
    } else {
        res.redirect("/login")
    }
}


const isAdmin = (req, res, next) => {
    if (req.session.admin) {
        Admin.findOne({})
            .then((data) => {
                if (data) {
                    next();
                } else {
                    res.redirect("/admin");
                }
            })
            .catch((error) => {
                console.error("Error in isAdmin middleware:", error);
                res.status(500).send("Internal Server Error");
            });
    } else {
        res.redirect("/admin");
    }
};


const isBlocked = async(req, res, next) => {
    if (req.session.user) {
        const userId = await User.findOne({_id:req.session.user})
        if (userId.isBlocked===true) {
            delete req.session.user
            res.render("user/userLogin",{message:"Blocked by admin"})
        } else {
            next()
        }
    } else {
        next()
    }
}

module.exports = {
    isLogged,
    isAdmin,
    isBlocked
}