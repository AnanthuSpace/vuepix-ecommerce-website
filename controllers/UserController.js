const { User } = require("../models/userDB")


// Login page rendering

const renderLogin = async (req,res)=>{
          res.render("user/userLogin");
}
const renderSignUp = async (req,res)=>{
    res.render("user/signUp")
}


module.exports= {
    renderLogin,
    renderSignUp
}