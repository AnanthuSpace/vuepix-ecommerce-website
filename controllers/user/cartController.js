const Product = require("../../models/productSchema")
const Category = require("../../models/categorySchema")
const { User } = require("../../models/userSchema")



const renderCart = async(req,res)=>{
    try {
        const user = req.session.user
        res.render("user/cart",{user})
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async (req, res) => {
    try {
        const id = req.query.id
        console.log(id);
        const user = req.session.user
        const findUser = await User.findOne({email:user})
        console.log(findUser);
        const product = await Product.findById({ _id: id }).lean()
        if (!product) {
            return res.json({ status: "Product not found" });
        }
        if (product.quantity > 0) {
            const cartIndex = findUser.cart.findIndex(item => item.productId == id)
            // console.log(cartIndex, "cartIndex");
            if (cartIndex == -1) {
                // console.log("this");
                let quantity = parseInt(req.body.quantity)
                await User.findByIdAndUpdate(userId, {
                    $addToSet: {
                        cart: {
                            productId: id,
                            quantity: quantity,
                            
                        }
                    }
                })
                    .then((data) =>
                        res.json({ status: true }))
            } else {

                // console.log("hi");
                const productInCart = findUser.cart[cartIndex]
                // console.log(productInCart);
                if(productInCart.quantity < product.quantity){
                    const newQuantity = parseInt(productInCart.quantity) + parseInt(req.body.quantity)
                    await User.updateOne(
                        { _id: userId, "cart.productId": id },
                        { $set: { "cart.$.quantity": newQuantity } }
                    );
                    res.json({ status: true })
                }else{
                    // console.log("Poda");
                    res.json({ status: "Out of stock" })
                }
                // console.log(productInCart, "product", newQuantity);
               
               
            }
        } else {
            res.json({ status: "Out of stock" })
        }


    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    renderCart,
    addToCart
}