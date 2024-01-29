const Product = require("../../models/productSchema")
const category = require("../../models/categorySchema")


const renderAddProduct = async (req,res)=>{
    try {
        const cat = await category.find({})
        res.render("admin/addProduct",{cat:cat})
    } catch (error) {
        console.log(error.message);
    }
} 


const productList = async(req,res)=>{
    await Product.find({})
    .then(data=>res.render("admin/productList",{data}))
    .catch(err=>console.log("Product Listing error",err))
}



const addProduct = async (req,res) => {
    try {
    const products =req.body
    console.log(req.body);
    const existingProduct = await Product.findOne({ name: products.product_name})

    if(!existingProduct){
        const images = []
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
                }
            }


            const newProduct = new Product({
                name: products.product_name,
                discription: products.description,
                regularPrice: products.regular_price,
                salesPrice: products.sale_price,
                unit: products.units
            })

            await newProduct.save()
            console.log("saved successfully");
            res.redirect("/admin/addproduct")
    } else {
        res.json("failed");
    }
    }catch (error) {
        console.log(error.message);
    }
}


module.exports={
    productList,
    addProduct,
    renderAddProduct 
}