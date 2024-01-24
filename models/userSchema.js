const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require:true,
        unique: true
    },
    phone: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    isBlocked:{
        type:String,
        require:true,
        default:0,
    },
})


const User = mongoose.model("user", userSchema);
module.exports = {
    User
}