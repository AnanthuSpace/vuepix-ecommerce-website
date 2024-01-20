const User = require("../models/userSchema")


const isLogged = (req, res, next)=>{
    if(req.session.user){
        User.findById({_id: req.session.user }).lean()
        .then((data)=>{
            if(data.isBlocked == false){
                next()
            } else {
                res.redirect("/login")
            }
        })
    }else {
        res.redirect("/login")
    }
}




module.exports = {
    isLogged,
    
}