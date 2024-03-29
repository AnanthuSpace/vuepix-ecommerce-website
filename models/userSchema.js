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
    cart: {
        type: Array,
        required: true
    },
    wishlist: {
        type: Array,
        required: true
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
    wallet: {
        type: Number,
        default: 0
    },
    history: {
        type: Array
    },
    createdOn: {
        type: Date,
        required: true,
    }
})


const User = mongoose.model("user", userSchema);
module.exports = {
    User
}