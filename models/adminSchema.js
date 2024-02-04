const mongoose = require("mongoose")

const adminSchema = mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    isAdmin: {
        type: Boolean,
        default: true
    }
})


const Admin = mongoose.model("admin", adminSchema);
module.exports = Admin
