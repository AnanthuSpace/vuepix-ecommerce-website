const Product = require("../../models/productSchema")
const mongodb = require('mongodb');

const { User } = require("../../models/userSchema")





const renderCart = async (req, res) => {
    try {
        const id = req.session.user
        const user = await User.findOne({ _id: id })
        console.log(user);
        // const productId = user.cart.map(item => item.ProductId)
        // console.log(productId);
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

            if (data[i].productDetails && data[i].productDetails.length > 0) {
                unit += data[i].unit
                grandTotal += data[i].productDetails[0].salesPrice * data[i].unit
            }
        }

        let Offers = 0

        for (let i = 0; i < data.length; i++) {
            if(data[i].productOffer!==0){

                if (data[i].productDetails && data[i].productDetails.length > 0) {
                    unit += data[i].unit
                    Offers += data[i].productDetails[0].productOffer * data[i].unit
                }

            } else if(data[i].categoryOffer!==0){
                if (data[i].productDetails && data[i].productDetails.length > 0) {
                    unit += data[i].unit
                    Offers += data[i].productDetails[0].categoryOffer * data[i].unit
                }
            }
        }
        req.session.subOffers = Offers

        req.session.grandTotal = grandTotal;
        const cartCount = data.length
        const wishlistCount = user.wishlist.length
        res.render("user/cart", {
            user,
            unit,
            data,
            grandTotal,
            Offers,
            cartCount,
            wishlistCount
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

                return res.json({ added: true });
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

                return res.json({ added: true });
            }
        } else {
            return res.json({ added: false });
        }
    } catch (error) {
        console.log(error.message);
    }
};


const deleteCartItem = async (req, res) => {
    try {
        const id = req.query.id
        const userId = req.session.user
        const user = await User.findById(userId)
        const cartIndex = user.cart.findIndex(item => item.productId == id)
        user.cart.splice(cartIndex, 1)
        await user.save()
        console.log("item deleted from cart");
        res.redirect("/cart")
    } catch (error) {
        console.log(error.message);
    }
}



const changeQuantity = async (req, res) => {
    try {
        console.log('wrkg');
        const userId = req.session.user
        const id = req.body.id
        const count = req.body.count

        const findUser = await User.findById(userId)
        const findProduct = await Product.findById(id)

        if (findUser) {

            const productExistinCart = findUser.cart.find(item => item.ProductId == id);
            let newUnit
            if (productExistinCart) {
                if (count == 1) {
                    newUnit = productExistinCart.unit + 1
                } else if (count == -1) {
                    newUnit = productExistinCart.unit - 1
                } else {
                    res.json({ status: false, error: "Invalid count" })
                }
            } else {
                console.log("user not found");
            }

            if (newUnit > 0 && newUnit <= findProduct.unit) {
                let quantityUpdated = await User.updateOne(
                    { _id: userId, "cart.ProductId": id },
                    {
                        $set: {
                            "cart.$.unit": newUnit
                        }
                    }
                )
                const totalAmount = findProduct.salesPrice
                console.log(totalAmount);
                if (quantityUpdated) {
                    res.json({ status: true, quantityInput: newUnit, count: count, totalAmount: totalAmount })
                } else {
                    res.json({ status: false, error: 'cart quantity is less' });
                }
            } else {
                res.json({ status: false, error: 'out of stock' });
            }
        }

    } catch (error) {

    }
}



module.exports = {
    renderCart,
    addToCart,
    deleteCartItem,
    changeQuantity
}