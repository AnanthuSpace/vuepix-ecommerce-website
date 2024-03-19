const Order = require("../../models/orderShema")
const Product = require("../../models/productSchema")
const mongoose = require("mongoose")


const orderListing = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdOn: -1 });


        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 5)
        const currentOrder = orders.slice(startIndex, endIndex)



        res.render("admin/order", { orders: currentOrder, totalPages, currentPage, orderActive: true })
    } catch (error) {
        console.log(error.message);
    }
}


const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.id
        // console.log(orderId);
        const findOrder = await Order.findOne({ _id: orderId }).sort({ createdOn: 1 })
        console.log(findOrder);


        res.render("admin/orderDetails", { orders: findOrder, orderId, orderActive: true })
    } catch (error) {
        console.log(error.message);
    }
}





const changeOrderStatus = async (req, res) => {
    try {
        console.log(req.query);

        const orderId = req.query.orderId.trim();
        console.log(orderId);
        const orderStatus = req.query.status;
        console.log("status : ", orderStatus);
        const order = await Order.findById(orderId)

        if (orderStatus == "Canceled") {
            for (const product of order.product) {

                const productId = product._id;
                const quantity = product.unit;

                await Product.findByIdAndUpdate(productId, { $inc: { unit: quantity } });
                console.log(`Increasing quantity for product ${productId} by ${quantity}`);
            }
        }

        console.log(req.query.status)

        await Order.updateOne({ _id: orderId },
            { status: req.query.status }
        ).then((data) => console.log(data))

        res.redirect('/admin/orders');

    } catch (error) {
        console.log(error.message);
    }
}





module.exports = {
    orderListing,
    getOrderDetails,
    changeOrderStatus
}