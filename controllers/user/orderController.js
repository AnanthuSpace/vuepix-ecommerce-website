const { User } = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Address = require("../../models/addressSchema")
const Order = require("../../models/orderShema")
const Coupon = require("../../models/couponSchema")
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Razorpay = require("razorpay")
const dotenv = require("dotenv")

dotenv.config()


let instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
})


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

        const today = new Date().toISOString()

        const findCoupon = await Coupon.find({
            isList: true,
            createdOn: { $lt: new Date(today) },
            expireOn: { $gt: new Date(today) },
            minimumPrice: { $lt: grandTotal },
        })

        console.log("Coupon data : ", findCoupon);

        res.render("user/checkout",
            {
                data: data,
                user: findUser,
                isCart: true,
                userAddress: userAddress,
                isSingle: false,
                grandTotal,
                cartCount,
                wishlistCount,
                coupons: findCoupon
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

            await User.updateOne(
                { _id: userId },
                { $set: { cart: [] } }
            );

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

        } else if (newOrder.payment == 'online') {

            console.log('order placed by Razorpay');

            orderDone = await newOrder.save();

            const generatedOrder = await generateOrderRazorpay(orderDone._id, orderDone.totalPrice);
            console.log(generatedOrder, "order generated");


            await User.updateOne(
                { _id: userId },
                { $set: { cart: [] } }
            );

            res.json(
                {
                    payment: false,
                    method: "online",
                    razorpayOrder: generatedOrder,
                    order: orderDone,
                    orderId: orderDone._id,
                    unit: cartItemUnit,
                    cartCount,
                    wishlistCount
                })

        } else if (newOrder.payment == "wallet") {
            if (newOrder.totalPrice <= findUser.wallet) {
                console.log("order placed with Wallet");
                const data = findUser.wallet -= newOrder.totalPrice;
                const newHistory = {
                    amount: data,
                    status: "debit",
                    date: Date.now()
                };
                findUser.history.push(newHistory);
                await findUser.save();
                await findProduct.save()
                orderDone = await newOrder.save();


                await User.updateOne(
                    { _id: userId },
                    { $set: { cart: [] } }
                );

                res.json(
                    {
                        payment: true,
                        method: "wallet",
                        order: orderDone,
                        orderId: orderDone._id,
                        quantity: 1,
                        success: true
                    });
                return;
            } else {
                console.log("wallet amount is lesser than total amount");
                res.json({ payment: false, method: "wallet", success: false });
                return;
            }

        }

    } catch (error) {
        console.log(error.message);
    }
}


const generateOrderRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {
        const options = {
            amount: total * 100,
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("failed");
                console.log(err);
                reject(err);
            } else {
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order);
            }
        });
    })
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




        await Order.findOneAndUpdate({ _id: orderId, 'product._id': productId }, { $set: { 'product.$.status': "Canceled" } })

        await Product.findByIdAndUpdate(productId, { $inc: { unit: quantity } })
        console.log(`Increasing quantity for product ${productId} by ${quantity}`);

        const product = await Order.findOne(
            { _id: orderId, 'product._id': productId },
            { 'product.$': 1 }
        );

        const currentPrice = product.product[0].price;

        await Order.findByIdAndUpdate(
            orderId,
            { $inc: { totalPrice: -currentPrice } }
        );


        res.redirect('/profile');
    } catch (error) {
        console.log(error.message);
    }
}






const applyCoupon = async (req, res) => {
    try {
        const userId = req.session.user
        const Code = req.body.code
        const grandTotal = req.session.grandTotal

        const selectedCoupon = await Coupon.findOne({ name: Code })
        console.log(selectedCoupon);

        if (!selectedCoupon) {
            console.log("Coupon is not available");
            res.json({ status: false })
        } else if (selectedCoupon.userId.includes(userId)) {
            console.log("already used");
            res.json({ used: true })
        } else {
            await Coupon.updateOne(
                { name: Code },
                {
                    $addToSet: {
                        userId: userId
                    }
                }
            );

            const gt = parseInt(grandTotal) - parseInt(selectedCoupon.offerPrice);
            console.log(gt, "----");
            req.session.grandTotal = gt
            res.json({ status: true, total: gt, discount: parseInt(selectedCoupon.offerPrice) })
        }

    } catch (error) {
        console.log(error.message);
    }
}




const verify = (req, res) => {
    console.log(req.body, "end");
    let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(
        `${req.body.payment.razorpay_order_id}|${req.body.payment.razorpay_payment_id}`
    );
    hmac = hmac.digest("hex");
    // console.log(hmac,"HMAC");
    // console.log(req.body.payment.razorpay_signature,"signature");
    if (hmac === req.body.payment.razorpay_signature) {
        console.log("true");
        res.json({ status: true });
    } else {
        console.log("false");
        res.json({ status: false });
    }
};






module.exports = {
    checkout,
    placeOrder,
    orderDetails,
    cancelOrder,
    applyCoupon,
    verify
}