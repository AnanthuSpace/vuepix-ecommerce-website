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
    }
});

const category = mongoose.model('category', categoryModel)

module.exports = category