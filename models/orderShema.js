const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    product: {
        type: Array,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    address: {
        type: Array,
        required: true
    },
    payment: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    status : {
        type : String,
        required : true
    },
    createdOn: {
        type: Date,
        required: true,
    },
    overAllOffer: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        require: true
    },
    date: {
        type: String,
    },
    shipping: {
        type: Number,
        required: true
    }
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order