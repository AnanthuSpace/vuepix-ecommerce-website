const mongoose = require("mongoose")

const adminSchema = mongoose.Schema({
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
    }
})


const Admin = mongoose.model("admin", adminSchema);
module.exports = {
    Admin
}