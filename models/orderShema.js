const mongoose = require("mongoose")



const productSchema = new mongoose.Schema({

    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    offer: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        require: true,
    },
    images: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    unit: {
        type: Number,
        required: true
    }
});



const orderSchema = new mongoose.Schema({
    product:[productSchema],
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