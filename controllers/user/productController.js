const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")



const getProductDetails = async (req, res) => {
    try {
        const user = req.session.user
        const productId = req.query.id
        const findProduct = await Product.findOne({ _id: productId });
        const products = await Product.find({})
        if (user) {
            res.render("user/productDetails", { data: findProduct, user: user, products })
        } else {
            res.render("user/productDetails", { data: findProduct })
        }
    } catch (error) {
        console.log(error.message);
    }
}



const getShop = async (req, res) => {
    try {
        const user = req.session.user
        const count = await Product.countDocuments({ isBlocked: false });
        const products = await Product.find({ isBlocked: false });
        const cat = await Category.find({ isListed: true })
        console.log(products);
        res.render("user/shop", { products, user, count, cat })

    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    getProductDetails,
    getShop
}