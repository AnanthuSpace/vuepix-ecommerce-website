const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
// const cropImg = require("../../config/crop")


const renderAddProduct = async (req, res) => {
    try {
        const cat = await Category.find({})
        res.render("admin/addProduct", { cat: cat })
    } catch (error) {
        console.log(error.message);
    }
}



const addProduct = async (req, res) => {
    try {


        req.body.units = parseInt(req.body.units);
        req.body.regular_price = parseInt(req.body.regular_price)
        req.body.regular_price = parseInt(req.body.sale_price)



        const products = req.body
        console.log(req.body);
        // await cropImg.crop(req);
        const existingProduct = await Product.findOne({ name: products.product_name })
        if (!existingProduct) {
            const images = []
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    images.push(req.files[i].filename);
                }
            }


            const newProduct = new Product({
                name: products.product_name,
                description: products.description,
                regularPrice: products.regular_price,
                salesPrice: products.sale_price,
                unit: products.units,
                category: products.category,
                images: images
            })

            await newProduct.save()
            console.log("saved successfully");
            res.redirect("/admin/addproduct")
        } else {
            res.json("failed");
        }
    } catch (error) {
        console.log(error.message);
    }
}


// Render product list

const productList = async (req, res) => {
    await Product.find({})
        .then(data => res.render("admin/productList", { data }))
        .catch(err => console.log("Product Listing error", err))
}



const showEdit = async (req, res) => {
    try {
        const id = req.query.id
        const findProduct = await Product.findOne({ _id: id })
        const category = await Category.find({ isListed: true })
        res.render("admin/editProduct", { product: findProduct, cat: category })
    } catch (error) {
        console.log(error.message);
    }
}


const editProduct = async (req, res) => {
    try {

        req.body.unit = parseInt(req.body.unit);
        req.body.regular_price = parseInt(req.body.regular_price)
        req.body.regular_price = parseInt(req.body.sale_price)

        const id = req.params.id
        const products = req.body
        const productImage = []
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                productImage.push(req.files[i].filename);
            }
        }
        console.log(req.files)
        if (req.files.length > 0) {

            await Product.findByIdAndUpdate(id, {
                name: products.name,
                description: products.description,
                regularPrice: products.regularPrice,
                salesPrice: products.salesPrice,
                unit: products.unit,
                category: products.category,
                images: productImage,
            }, { new: true })
            console.log("product updated");
            console.log(products.unit);
            res.redirect("/admin/productList")
        } else {
            console.log("no change in image")
            await Product.findByIdAndUpdate(id, {
                name: products.name,
                description: products.description,
                regularPrice: products.regularPrice,
                salesPrice: products.salesPrice,
                unit: products.unit,
                category: products.category
            }, { new: true })
            console.log("product updated");
            console.log(products.unit); 
            res.redirect("/admin/productList")
        }
    } catch (error) {
        console.log(error.message);
    }
}


const blockProduct = async (req, res) => {
    try {
        let id = req.query.id
        await Product.updateOne({ _id: id }, { $set: { isBlocked: true } })
        console.log("product blocked")
        res.redirect("/admin/productList")
    } catch (error) {
        console.log(error.message);
    }
}


const unblockProduct = async (req, res) => {
    try {
        let id = req.query.id
        await Product.updateOne({ _id: id }, { $set: { isBlocked: false } })
        console.log("product unblocked")
        res.redirect("/admin/productList")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    productList,
    addProduct,
    renderAddProduct,
    showEdit,
    editProduct,
    blockProduct,
    unblockProduct
}