const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
// const cropImg = require("../../config/crop")


const renderAddProduct = async (req, res) => {
    try {
        const cat = await Category.find({})
        res.render("admin/addProduct", { cat: cat , productActive:true})
    } catch (error) {
        console.log(error.message);
    }
}



const addProduct = async (req, res) => {
    try {


        req.body.units = parseInt(req.body.units);
        req.body.regular_price = parseInt(req.body.regular_price)
        req.body.sale_price = parseInt(req.body.sale_price)



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
                salesPrice: products.regular_price,
                unit: products.units,
                category: products.category,
                images: images,
                createdOn: new Date(),
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
    try {
        const pro = await Product.find({})
        console.log(pro);

        let itemsPerPage = 3
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(pro.length / 3)
        const currentProduct = pro.slice(startIndex, endIndex)

        res.render("admin/productList", { data: currentProduct, totalPages, currentPage, productActive:true })
    } catch (error) {
        console.log(error.message);
    }

    // .then(data => res.render("admin/productList", { data }))
    // .catch(err => console.log("Product Listing error", err))
}



const showEdit = async (req, res) => {
    try {
        const id = req.query.id
        const findProduct = await Product.findOne({ _id: id })
        const category = await Category.find({ isListed: true })
        res.render("admin/editProduct", { product: findProduct, cat: category , productActive:true})
    } catch (error) {
        console.log(error.message);
    }
}


const editProduct = async (req, res) => {
    try {

        req.body.unit = parseInt(req.body.unit);
        req.body.regular_price = parseInt(req.body.regular_price)
        req.body.sale_price = parseInt(req.body.sale_price)

        const id = req.params.id
        const products = req.body
        console.log(products);
        const productImage = []
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                productImage.push(req.files[i].filename);
            }
        }
        console.log(req.files)
        if (req.files.length > 0) {

            await Product.findByIdAndUpdate(id, {

                name: products.product_name,
                description: products.description,
                regularPrice: products.regular_price,
                salesPrice: products.regular_price,
                unit: products.unit,
                category: products.category,
                createdOn: new Date(),
                images: productImage,
                categoryOffer : 0

            }, { new: true })
            console.log("product updated");
            console.log(products.unit);
            res.redirect("/admin/productList")
        } else {
            console.log("no change in image")
            await Product.findByIdAndUpdate(id, {
                name: products.product_name,
                description: products.description,
                regularPrice: products.regular_price,
                salesPrice: products.regular_price,
                unit: products.unit,
                category: products.category,
                createdOn: new Date(),
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




const addProductOffer = async (req, res) => {
    try {
        // console.log(req.body);
        const { productId, percentage } = req.body
        const findProduct = await Product.findOne({ _id: productId })
        // console.log(findProduct);

        if(findProduct.categoryOffer==0){
        findProduct.salesPrice = findProduct.salesPrice - Math.floor(findProduct.regularPrice * (percentage / 100))
        findProduct.productOffer = parseInt(percentage)
        await findProduct.save()
        }else{
            res.json({status: false})
        }
        res.json({ status: true })

    } catch (error) {
        console.log(error.message);
    }
}



const removeProductOffer = async (req, res) => {
    try {
        // console.log(req.body);
        const {productId} = req.body
        const findProduct = await Product.findOne({_id : productId})
        // console.log(findProduct);
        const percentage = findProduct.productOffer
        findProduct.salesPrice = findProduct.salesPrice + Math.floor(findProduct.regularPrice * (percentage / 100))
        findProduct.productOffer = 0
        await findProduct.save()
        res.json({status : true})
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
    unblockProduct,
    addProductOffer,
    removeProductOffer,
}