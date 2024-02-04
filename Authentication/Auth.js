const User = require("../models/userSchema")
const Admin = require("../models/adminSchema")

const isLogged = (req, res, next)=>{
    if(req.session.user){
        User.findById({_id : req.session.user}).lean()
        .then((data)=>{
            if(data.isBlocked == false){
                next()
            }else{
                res.redirect("/login")
            }
        })
    }else{
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


module.exports = {
    isLogged,
    isAdmin
}