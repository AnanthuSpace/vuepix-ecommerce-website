const { User } = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Address = require("../../models/addressSchema")
const mongodb = require('mongodb');

const checkout = async (req, res) => {
    try {
        const userId = req.session.user
        const findUser = await User.findOne({ _id: userId })
        const userAddress = await Address.findOne({ userId: userId })

        const oid = new mongodb.ObjectId(userId)

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
        console.log(data);


        res.render("user/checkout", { data: data, user: findUser, isCart: true, userAddress: userAddress, isSingle: false, grandTotal })

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    checkout,
}