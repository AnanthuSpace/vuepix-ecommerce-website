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

const filterProduct = async (req, res) => {
    try {
        const user = req.session.user;
        const category = req.query.category;
        const findCategory = category ? await Category.findOne({ _id: category }) : null;

        const query = {
            isBlocked: false,
        };

        if (findCategory) {
            query.category = findCategory.name;
        }

        const findProducts = await Product.find(query);
        const categories = await Category.find({ isListed: true });

        let itemsPerPage = 6;
        let currentPage = parseInt(req.query.page) || 1;
        let startIndex = (currentPage - 1) * itemsPerPage;
        let endIndex = startIndex + itemsPerPage;
        let totalPages = Math.ceil(findProducts.length / 6);
        const currentProduct = findProducts.slice(startIndex, endIndex);

        res.render("user/shop", {
            user: user,
            product: currentProduct,
            category: categories,
            totalPages,
            currentPage,
            selectedCategory: category || null,
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};
  



const getSortProducts = async (req, res) => {
    try {
        let option = req.body.option;
        let data;

        if (option == "highToLow") {
            data = await Product.find({ isBlocked: false }).sort({ salesPrice: -1 });
        } else if (option == "lowToHigh") {
            data = await Product.find({ isBlocked: false }).sort({ salesPrice: 1 });
        } else if (option == "releaseDate") {
            data = await Product.find({ isBlocked: false }).sort({ createdOn: -1 });
        }

        res.json({
            status: true,
            data: {
                currentProduct: data,
            }
        });

    } catch (error) {
        console.log(error.message);
        res.json({ status: false, error: error.message });
    }
};




module.exports = {
    getProductDetails,
    getShop,
    searchProducts,
    filterProduct,
    getSortProducts
}