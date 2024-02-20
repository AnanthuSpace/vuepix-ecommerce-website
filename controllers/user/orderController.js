const { User } = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Address = require("../../models/addressSchema")
const Order = require("../../models/orderShema")
const mongodb = require('mongodb');
const mongoose = require('mongoose');

const checkout = async (req, res) => {
    try {
        const userId = req.session.user
        const findUser = await User.findOne({ _id: userId })
        const userAddress = await Address.findOne({ userId: userId })

        const oid = new mongodb.ObjectId(userId)

        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length

        const data = await User.aggregate([
            { $match: { _id: oid } },
            { $unwind: "$cart" },
            {
                $project: {
                    ProductId: { '$toObjectId': '$cart.ProductId' },
                    unit: "$cart.unit"
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'ProductId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
        ])



        const grandTotal = req.session.grandTotal


        res.render("user/checkout",
            {
                data: data,
                user: findUser,
                isCart: true,
                userAddress: userAddress,
                isSingle: false,
                grandTotal,
                cartCount,
                wishlistCount
            })

    } catch (error) {
        console.log(error.message);
    }
}




const placeOrder = async (req, res) => {
    try {
        const { addressId, payment, productId } = req.body
        const userId = req.session.user
        const grand = req.session.grandTotal
        const findUser = await User.findOne({ _id: userId })
        // const findProductId = await findUser.cart.map(item => item.productId)
        const findAddress = await Address.findOne({ 'address._id': addressId })
        const desiredAddress = findAddress.address.find(item => item._id.toString() === addressId.toString());
        const findProduct = await Product.find({ _id: { $in: productId } })

        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length

        const cartItemUnit = findUser.cart.map((item) => ({
            productId: item.ProductId,
            unit: item.unit
        }))


        const orderedProducts = findProduct.map((item) => ({
            _id: item._id,
            price: item.salesPrice,
            name: item.name,
            images: item.images[0],
            status: "Confirmed",
            unit: cartItemUnit.find(cartItem => cartItem.productId.toString() === item._id.toString()).unit,
        }))

        console.log(orderedProducts);


        const newOrder = new Order({
            product: orderedProducts,
            totalPrice: grand,
            address: desiredAddress,
            payment: payment,
            userId: userId,
            // status: "Confirmed",
            createdOn: Date.now()
        })

        await User.updateOne(
            { _id: userId },
            { $set: { cart: [] } }
        );


        for (let i = 0; i < orderedProducts.length; i++) {

            const product = await Product.findOne({ _id: orderedProducts[i]._id });
            if (product) {
                const newUnit = product.unit - orderedProducts[i].unit;
                product.unit = Math.max(newUnit, 0);
                await product.save();
            }
        }


        let orderDone
        if (newOrder.payment == 'cod') {
            console.log('order placed by cod');
            orderDone = await newOrder.save();
            res.json(
                {
                    payment: true,
                    method: "cod",
                    order: orderDone,
                    quantity: cartItemUnit,
                    orderId: findUser,
                    cartCount,
                    wishlistCount
                });
        }



    } catch (error) {
        console.log(error.message);
    }
}


const orderDetails = async (req, res) => {
    try {
        const userId = req.session.user
        const orderId = req.query.id
        const findOrder = await Order.findOne({ _id: orderId })
        const findUser = await User.findOne({ _id: userId })
        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length
        console.log(findOrder, findUser);
        res.render("user/orderDetails",
            {
                orders: findOrder,
                orderId,
                user: findUser,
                cartCount,
                wishlistCount
            })
    } catch (error) {
        console.log(error.message);
    }

}



const cancelOrder = async (req, res) => {
    try {
        const productId = new mongoose.Types.ObjectId(req.query.ProId);
        console.log(productId);
        const orderId = new mongoose.Types.ObjectId(req.query.orderId);
        const quantity = req.query.quantity
        console.log('query', req.query);

        console.log(productId);


        await Product.findByIdAndUpdate(productId, { $inc: { unit: quantity } })
        console.log(`Increasing quantity for product ${productId} by ${quantity}`);

        const updating = await Order.findOneAndUpdate({ _id: orderId, 'product._id': productId }, { $set: { 'product.$.status': "Canceled" } })

        const product = await Order.findOne(
            { _id: orderId, 'product._id': productId },
            { 'product.$': 1 }
        );


        const currentPrice = product.product[0].price;

        console.log(currentPrice);

        const newTotalPrice = await Order.findByIdAndUpdate(
            orderId,
            { $inc: { totalPrice: -currentPrice } }
        );

        console.log(newTotalPrice);

        console.log("Sheriyayi");

        res.redirect('/profile');
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    checkout,
    placeOrder,
    orderDetails,
    cancelOrder
}