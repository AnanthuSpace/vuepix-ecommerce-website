const mongoose = require('mongoose');


let productSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true,
    },
    regularPrice: {
        type: String,
        requrie: true
    },
    salesPrice: {
        type: String,
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
    isBlocked: {
        type: Boolean,
        default: false,
    }
});


const product = mongoose.model("product", productSchema);

module.exports = product