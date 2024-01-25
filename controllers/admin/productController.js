const { product } = require("../../models/productSchema")



const productList = async(req,res)=>{
    await product.find({})
    .then(data=>res.render("admin/productList",{data}))
    .catch(err=>console.log("Product Listing error",err))
}

const renderAddProduct = async (req,res)=>{
    res.render("admin/addProduct")
} 

const addProduct = async (req,rs) => {
    const products = req.body
    console.log(products);
}

module.exports={
    productList,
    addProduct,
    renderAddProduct 
}