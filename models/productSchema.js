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
    category: {
        type: String,
        require: true,
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
    isBlocked: {
        type: Boolean,
        default: false,
    },
    createdOn : {
        type : String,
        required : true,
    },
});


const product = mongoose.model("product", productSchema);

module.exports = product