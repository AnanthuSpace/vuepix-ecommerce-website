const mongoose = require('mongoose');


let categoryModel = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    isListed: {
        type: Boolean,
        default: true
    },
    categoryOffer : {
        type : Number,
        default : 0
    }
});

const category = mongoose.model('category', categoryModel)

module.exports = category