const { User } = require("../../models/userSchema")
const Address = require("../../models/addressSchema")
const Order = require('../../models/orderShema')
const bcrypt = require("bcrypt")


const renderProfile = async (req, res) => {
    try {

        const userId = req.session.user
        const user = await User.findOne({ _id: userId })
        const userAddress = await Address.findOne({ userId: userId })
        const orderDetails = await Order.find({ userId: userId }).sort({ createdOn: -1 });
        const findUser = await User.findOne({ _id: userId })
        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length

        res.render("user/profile",
            {
                user,
                userAddress,
                order: orderDetails,
                cartCount,
                wishlistCount
            })
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
        const findUser = await User.findOne({ _id: userId })
        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length
        res.render("user/addAddress",
            {
                user: userId,
                cartCount,
                wishlistCount
            })
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
        const findUser = await User.findOne({ _id: user })
        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length
        console.log("AddressDI:", addressId);
        const currAddress = await Address.findOne({
            "address._id": addressId,
        });
        const addressData = currAddress.address.find((item) => {
            return item._id.toString() == addressId.toString()
        })

        res.render('user/editAddress',
            {
                address: addressData,
                user,
                cartCount,
                wishlistCount
            });
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


const deleteAddress = async (req, res) => {
    try {
        const addressId = req.query.id
        console.log(addressId);
        await Address.updateOne(
            { "address._id": addressId },
            {
                $pull:
                {
                    address: { _id: addressId }
                }
            }
        )
            .then((data) => res.redirect("/profile"))
    } catch (error) {
        console.log(error.message);
    }
}



const changePass = async (req, res) => {
    try {

        const { oldPass, newPass } = req.body
        const userId = req.session.user
        const findUser = await User.findOne({ _id: userId })
        const passwordMatch = await bcrypt.compare(oldPass, findUser.password);

        if (passwordMatch) {

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPass, saltRounds);
            console.log('Hashed Password:', hashedPassword);
            await User.updateOne(
                { _id: userId },
                {
                    $set: {
                        password: hashedPassword
                    }
                }
            )
            console.log('Password changed successfully.');
            res.json({ status: true })

        } else {
            console.log('Old password does not match.');
            res.json({ status: false })
        }

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    renderProfile,
    editUser,
    renderAddAddress,
    addAddress,
    getEditAddress,
    editAddress,
    deleteAddress,
    changePass
}