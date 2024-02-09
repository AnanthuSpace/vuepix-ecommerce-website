const { User } = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Address = require("../../models/addressSchema")


const checkout = async(req,res)=>{
    try {
        res.render("user/checkout")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    checkout,
}