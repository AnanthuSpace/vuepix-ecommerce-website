const { User } = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Address = require("../../models/addressSchema")
const Order = require("../../models/orderShema")
const Coupon = require("../../models/couponSchema")
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Razorpay = require("razorpay")
const crypto = require("crypto")
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
        const subOffers = req.session.subOffers
        console.log("Offer : ", subOffers);

        const today = new Date().toISOString()


        const userCoupons = await Coupon.find({ userId: userId });

        const findCoupons = await Coupon.find({
            isList: true,
            createdOn: { $lt: new Date(today) },
            expireOn: { $gt: new Date(today) },
            minimumPrice: { $lt: grandTotal },
        });
        const validCoupons = findCoupons.filter(coupon => !userCoupons.find(usedCoupon => usedCoupon._id.equals(coupon._id)));

        console.log("Coupon data : ", validCoupons);


        res.render("user/checkout",
            {
                data: data,
                user: findUser,
                isCart: true,
                userAddress: userAddress,
                isSingle: false,
                grandTotal,
                subOffers,
                cartCount,
                wishlistCount,
                coupons: validCoupons
            })

    } catch (error) {
        console.log(error.message);
    }
}




const placeOrder = async (req, res) => {
    try {
        const { addressId, payment, productId, couponDiscount } = req.body
        const userId = req.session.user
        const grand = req.session.grandTotal
        const subOffers = req.session.subOffers
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
            offer: item.productOffer + item.categoryOffer,
            name: item.name,
            images: item.images[0],
            status: "Confirmed",
            unit: cartItemUnit.find(cartItem => cartItem.productId.toString() === item._id.toString()).unit,
        }))

        console.log(orderedProducts);


        const newOrder = new Order({
            product: orderedProducts,
            totalPrice: grand,
            overAllOffer: subOffers,
            address: desiredAddress,
            payment: payment,
            userId: userId,
            discount: couponDiscount,
            status: "Confirmed",
            createdOn: Date.now()
        })


        const newOrderFromRazorpay = new Order({
            product: orderedProducts,
            totalPrice: grand,
            overAllOffer: subOffers,
            address: desiredAddress,
            payment: payment,
            userId: userId,
            discount: couponDiscount,
            status: "Pending",
            createdOn: Date.now()
        });



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

            orderDone = await newOrderFromRazorpay.save();
            console.log(orderDone._id, "id");
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

        }
        else if (newOrder.payment == "wallet") {
            if (newOrder.totalPrice <= findUser.wallet) {
                console.log("order placed with Wallet");
                const data = findUser.wallet - newOrder.totalPrice;

                const newHistory = {
                    amount: data,
                    status: "debit",
                    date: Date.now()
                };
                console.log(newHistory);
                findUser.history.push(newHistory);
                await findUser.save();

                // Iterate over each product and update its status
                for (let i = 0; i < findProduct.length; i++) {
                    findProduct[i].status = "Confirmed";
                    await findProduct[i].save();
                }

                orderDone = await newOrder.save();

                await User.updateOne(
                    { _id: userId },
                    { $set: { cart: [], wallet: data } }
                );


                res.json(
                    {
                        payment: true,
                        method: "wallet",
                        order: orderDone,
                        orderId: orderDone._id,
                        quantity: 1,
                        success: true
                    }
                );
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




const verify = (req, res) => {
    console.log(req.body, "end");
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
    hmac.update(
        `${req.body.payment.razorpay_order_id}|${req.body.payment.razorpay_payment_id}`
    );
    hmac = hmac.digest("hex");
    console.log(hmac, "HMAC");
    console.log(req.body.payment.razorpay_signature, "signature");
    if (hmac === req.body.payment.razorpay_signature) {
        console.log("true");
        changeOrderStatusToConfirmed(req.body.orderId)
        res.json({ status: true });
    } else {
        console.log("false");
        res.json({ status: false });
    }
};


const changeOrderStatusToConfirmed = async (orderId) => {
    await Order.updateOne(
        { _id: orderId },
        { status: "Confirmed" }
    )
        .then(res => console.log(res))
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
        const orderId = req.query.orderId.trim();
        const order = await Order.findById(orderId);
        for (const product of order.product) {

            const productId = product._id;
            const unit = product.unit;

            await Product.findByIdAndUpdate(productId, { $inc: { unit: unit } });
            console.log(`Increasing quantity for product ${productId} by ${unit}`);
        }

        if (order.payment !== "cod") {
            const totalAmount = order.totalPrice;
            const findUser = await User.findOne({ _id: order.userId });
            findUser.wallet += totalAmount;

            const refundHistory = {
                amount: totalAmount,
                status: "credit",
                date: Date.now()
            };

            findUser.history.push(refundHistory);
            await findUser.save();
        }

        await Order.updateOne({ _id: orderId },
            { status: "Canceled" }
        ).then((data) => console.log(data))

        res.redirect('/profile');

    } catch (error) {
        console.log(error);
    }
}



const returnOrder = async (req, res) => {
    try {

        const userId = req.session.user
        const findUser = await User.findOne({ _id: userId })

        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const id = req.query.id
        await Order.updateOne({ _id: id },
            { status: "Returned" }
        ).then((data) => console.log(data))

        const findOrder = await Order.findOne({ _id: id })


        if (findOrder.payment === "wallet" || findOrder.payment === "online") {
            findUser.wallet += findOrder.totalPrice;

            const newHistory = {
                amount: findOrder.totalPrice,
                status: "credit",
                date: Date.now()
            }
            findUser.history.push(newHistory)
            await findUser.save();
        }

        for (const productData of findOrder.product) {
            const productId = productData.ProductId;
            const unit = productData.unit;

            const product = await Product.findById(productId);

            console.log(product, "=>>>>>>>>>");

            if (product) {
                product.unit += unit;
                await product.save();
            }
        }

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


const cancelCoupon = async (req, res) => {
    try {
        const userId = req.session.user;
        const Code = req.body.code;
        const grandTotal = req.session.grandTotal;

        const selectedCoupon = await Coupon.findOne({ name: Code });
        console.log(selectedCoupon);
        console.log(userId);

        await Coupon.updateOne(
            { name: Code },
            {
                $pull: {
                    userId: userId
                }
            }
        );

        const gt = parseInt(grandTotal) + parseInt(selectedCoupon.offerPrice);
        console.log(gt, "----");
        req.session.grandTotal = gt;
        res.json({ status: true, total: gt, discount: 0 });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: false, message: "Error cancelling coupon" });
    }
};







module.exports = {
    checkout,
    placeOrder,
    orderDetails,
    cancelOrder,
    applyCoupon,
    verify,
    returnOrder,
    cancelCoupon
}