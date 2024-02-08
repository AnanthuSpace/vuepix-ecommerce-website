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
        // console.log(productData.unit);
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
                                unit: parseInt(unit), 
                                price: salesPrice
                            }
                        }
                    }
                );
                
                return res.json({ added: true});
            } else {
                const existingUnit = parseInt(existingProduct.unit)
                await User.findOneAndUpdate(
                    { _id: userId, "cart.ProductId": id }, 
                    { 
                        $set: { 
                            "cart.$.unit": existingUnit + 1, 
                            "cart.$.price": salesPrice 
                        }
                    }, 
                    { new: true } 
                )
                
                return res.json({ added: true});
            }
        } else {
            return res.json({ added: false});
        }
    } catch (error) {
        console.log(error.message);
    }
};



module.exports = {
    renderCart,
    addToCart
}