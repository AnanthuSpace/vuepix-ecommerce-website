const { User } = require('../../models/userSchema')





const viewUser = (req, res) => {
    User.find({})
        .then((data) => {
            console.log(data);
            res.render("admin/userManagement",{data});
        })
        .catch((error) => {
            console.error("Finding error:", error);
            res.render("error", { errorMessage: "Error finding users" });
        });
};


const blockUser = (req,res)=>{
    User.findByIdAndUpdate(req.params.id, {isBlocked: 1},{new:true})
    .then((data)=>{
        console.log(data);
        res.redirect("/admin/userManagement");
    })
}

const unBlockUser = (req,res)=>{
    User.findByIdAndUpdate(req.params.id, {isBlocked: 0},{new:true})
    .then((data)=>{
        console.log(data);
        res.redirect("/admin/userManagement");
    })
}


module.exports ={
    viewUser,
    blockUser,
    unBlockUser
}