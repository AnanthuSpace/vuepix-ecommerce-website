const { User } = require("../../models/userSchema")



const renderProfile = async (req,res)=>{
    try {

        const userId = req.session.user
            await User.findOne({ _id:userId })
            .then(data=>res.render("user/profile", {user:data}))
            .catch(err=>console.log("profile entering error ", err.message))

    } catch (error) {
        console.log(error.message);
    }
}

const editUser = async (req,res)=>{
    try {
        const userId = req.session.user
        const { name, phone} = req.body
        console.log(name,phone);
        await User.findByIdAndUpdate(
            userId,
            {
                $set:{
                    username:name,
                    phone:phone
                }
            }
            )
            res.redirect("/profile")
    } catch (error) {
        console.log(error.message);
    }
}


const renderAddAddress = async (req,res)=>{
    try {
        res.render("user/addAddress")
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    renderProfile,
    editUser,
    renderAddAddress
}