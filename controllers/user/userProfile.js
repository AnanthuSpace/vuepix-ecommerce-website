const { User } = require("../../models/userSchema")
const Address = require("../../models/addressSchema")
const Order = require('../../models/orderShema')



const renderProfile = async (req, res) => {
    try {

        const userId = req.session.user
        const user = await User.findOne({ _id: userId })
        const userAddress = await Address.findOne({ userId: userId })
        const orderDetails = await Order.find({ userId: userId })
        res.render("user/profile", { user, userAddress, order: orderDetails })

    } catch (error) {
        console.log(error.message);
    }
}

const editUser = async (req, res) => {
    try {
        const userId = req.session.user
        const { name, phone } = req.body
        // console.log(name, phone);
        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    username: name,
                    phone: phone
                }
            }
        )
        res.redirect("/profile")
    } catch (error) {
        console.log(error.message);
    }
}



const renderAddAddress = async (req, res) => {
    try {
        const userId = req.session.user
        res.render("user/addAddress", { user: userId })
    } catch (error) {
        console.log(error.message);
    }
}



const addAddress = async (req, res) => {
    try {
        const user = req.session.user
        const userData = await User.findOne({ _id: user })
        // console.log(userData);
        const {
            addressType,
            name,
            city,
            landMark,
            state,
            pincode,
            phone,
            altPhone
        } = req.body
        const userAddress = await Address.findOne({ userId: userData._id })
        if (!userAddress) {
            const newAddress = new Address({
                userId: userData._id,
                address: [
                    {
                        addressType,
                        name,
                        city,
                        landMark,
                        state,
                        pincode,
                        phone,
                        altPhone,
                    }
                ]
            })
            await newAddress.save()
        } else {
            userAddress.address.push({
                addressType,
                name,
                city,
                landMark,
                state,
                pincode,
                phone,
                altPhone,
            })
            await userAddress.save()
        }
        res.redirect("/profile")
    } catch (error) {
        console.log(error.message);
    }
}



const getEditAddress = async (req, res) => {
    try {
        const user = req.session.user
        const addressId = req.query.id;
        console.log("AddressDI:", addressId);
        const currAddress = await Address.findOne({
            "address._id": addressId,
        });
        const addressData = currAddress.address.find((item) => {
            return item._id.toString() == addressId.toString()
        })

        res.render('user/editAddress', { address: addressData, user });
    } catch (error) {
        console.log(error.message);
    }
}


const editAddress = async (req, res) => {
    try {
        const {
            addressType,
            name,
            city,
            landMark,
            state,
            pincode,
            phone,
            altPhone
        } = req.body
        const addressId = req.query.id
        const findAddress = await Address.findOne({ "address._id": addressId });
        // const correctAddress = await findAddress.address.find(item => item._id == addressId)
        // console.log(correctAddress);
        await Address.updateOne(
            {
                "address._id": addressId,
                _id: findAddress._id
            },
            {
                $set: {
                    "address.$": {
                        addressType: addressType,
                        name: name,
                        city: city,
                        landMark: landMark,
                        state: state,
                        pincode: pincode,
                        phone: phone,
                        altPhone: altPhone
                    }
                }
            }
        ).then((result => res.redirect("/profile")))
    } catch (error) {
        console.log(error.message);
    }
}


const orderDetails = async (req, res) => {

    const userId = req.session.user
    const orderId = req.query.id
    const findOrder = await Order.findOne({ _id: orderId })
    const findUser = await User.findOne({ _id: userId })
    console.log(findOrder, findUser);
    res.render("user/orderDetails", { orders: findOrder, orderId , user:findUser})
}

module.exports = {
    renderProfile,
    editUser,
    renderAddAddress,
    addAddress,
    getEditAddress,
    editAddress,
    orderDetails
}