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
            res.render("user/productDetails", { data: findProduct ,products})
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
        const category = await Category.find({ isListed: true })
        console.log(products);


        let itemsPerPage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(products.length / 6)
        const currentProduct = products.slice(startIndex, endIndex)

        res.render("user/shop", { product:currentProduct , user, count,  category, totalPages, currentPage})

    } catch (error) {
        console.log(error.message);
    }
}



const searchProducts = async (req, res) => {
    try {
        const user = req.session.user
        let search = req.query.search
        const categories = await Category.find({ isListed: true })

        const searchResult = await Product.find({
            $or: [
                {
                    name: { $regex: ".*" + search + ".*", $options: "i" },
                }
            ],
            isBlocked: false,
        }).lean()

        let itemsPerPage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(searchResult.length / 6)
        const currentProduct = searchResult.slice(startIndex, endIndex)


        res.render("user/shop",
            {
                user: user,
                product: currentProduct,
                category: categories,
                totalPages,
                currentPage
            })

    } catch (error) {
        console.log(error.message);
    }
}
  

module.exports = {
    getProductDetails,
    getShop,
    searchProducts
}