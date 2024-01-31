const Product = require("../../models/productSchema")



const getProductDetails = async (req, res) => {
    try {
        const user = req.session.user
        console.log(user);
        const productId = req.query.id
        console.log(productId);
        const findProduct = await Product.findOne({ _id: productId });
        const products = await Product.find({})
        console.log(findProduct._id);
        if (user) {
            res.render("user/productDetails", { data: findProduct, user: user, products })
        } else {
            res.render("user/productDetails", { data: findProduct })
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    getProductDetails
}