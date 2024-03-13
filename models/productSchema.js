const mongoose = require('mongoose');


let productSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories"
    },
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    regularPrice: {
        type: Number,
        requrie: true
    },
    salesPrice: {
        type: Number,
        require: true
    },
    unit: {
        type: Number,
        require: true
    },
    images: {
        type: Array,
        require: true
    },
    category: {
        type: String,
        require: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    createdOn: {
        type: String,
        required: true,
    },
    productOffer: {
        type: Number,
        default: 0
    },
    categoryOffer: {
        type: Number,
        default: 0
    }
});


const product = mongoose.model("product", productSchema);

module.exports = product