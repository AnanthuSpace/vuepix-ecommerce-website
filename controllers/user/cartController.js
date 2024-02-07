const Product = require("../../models/productSchema")
// const Category = require("../../models/categorySchema")
const mongodb = require('mongodb');

const { User } = require("../../models/userSchema")





const renderCart = async (req, res) => {
    try {
        const id = req.session.user
        const user = await User.findOne({ _id: id })
        console.log(user);
        const productId = user.cart.map(item => item.ProductId)
        
        const oid = new mongodb.ObjectId(id);

        let data = await User.aggregate([
            { $match: { _id: oid } },
            { $unwind: '$cart' },
            {
                $project: {
                    ProductId: { '$toObjectId': '$cart.ProductId' },
                    unit: '$cart.unit',
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'ProductId',
                    foreignField: '_id',
                    as: 'productDetails',
                }
            },

        ])
        console.log("Data  =>>", data)


        let unit = 0
        let grandTotal = 0;


        for (let i = 0; i < data.length; i++) {

            if(data[i].productDetails && data[i].productDetails.length > 0){
                unit += data[i].unit
                grandTotal += data[i].productDetails[0].salesPrice * data[i].unit
            } 
            }
            req.session.grandTotal = grandTotal;

        res.render("user/cart", {
            user,
            unit,
            data,
            grandTotal
        })

    } catch (err) {
        console.log(err)
        res.send("Error")
    }
}



const addToCart = async (req, res) => {
    try {
        console.log("Cart controller");
        const { id, unit } = req.body;
        const userId = req.session.user;

        const userData = await User.findById(userId);
        const productData = await Product.findById(id);

        const salesPrice = parseInt(productData.salesPrice);

        if (productData.unit > 0) {
            const existingProduct = userData.cart.find(product => product.ProductId === id);
            
            if (!existingProduct) {
                await User.findByIdAndUpdate(
                    userId,
                    {
                        $push: {
                            cart: {
                                ProductId: id,
                                unit: unit, 
                                price: salesPrice
                            }
                        }
                    }
                );
                
                return res.json({ added: true, message: "Product added to cart successfully" });
            } else {
                await User.findOneAndUpdate(
                    { _id: userId, "cart.ProductId": id }, 
                    { 
                        $inc: { 
                            "cart.$.unit": 1, 
                            "cart.$.price": salesPrice 
                        }
                    }, 
                    { new: true } 
                );
                
                return res.json({ added: true, message: "Product quantity and price updated successfully" });
            }
        } else {
            return res.json({ err: false, message: "Product is out of stock" });
        }
    } catch (error) {
        return res.json({ err: false, error: error.message });
    }
};



module.exports = {
    renderCart,
    addToCart
}