const Order = require("../../models/orderShema")
const mongoose = require("mongoose")


const orderListing = async (req,res)=>{
    try {
        const orders = await Order.find({}).sort({ createdOn: -1 });

        // console.log(req.query);

        let itemsPerPage = 3
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        res.render("admin/order", { orders: currentOrder, totalPages, currentPage })
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


        res.render("admin/orderDetails", { orders: findOrder, orderId })
    } catch (error) {
        console.log(error.message);
    }
}





const changeOrderStatus = async (req, res) => {
    try {
        console.log(req.query);

        const orderId = req.query.orderId.trim(); 
        console.log(orderId);

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