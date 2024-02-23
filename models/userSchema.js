const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
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
    isBlocked: {
        type: Boolean,
        default: false
    },
    cart:{
        type:Array,
    },
    wishlist: {
        type: Array
    },
    referalCode: {
        type: String,
        required: true,
    },
    redeemed: {
        type: Boolean,
        default: false,
    },
    redeemedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        }
    ],
})


const User = mongoose.model("user", userSchema);
module.exports = {
    User
}