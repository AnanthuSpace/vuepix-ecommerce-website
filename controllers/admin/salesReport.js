

const getSalesReportPage = async (req, res) => {
    try {
        console.log(hiiiiiiiii);
        // const orders = await Order.find({ status: "Delivered" }).sort({ createdOn: -1 })
        // console.log(orders);

        // res.render("salesReport", { data: currentOrder, totalPages, currentPage })

        // console.log(req.query.day);
        // let filterBy = req.query.day
        // if (filterBy) {
        //     res.redirect(`/admin/${req.query.day}`)
        // } else {
        //     res.redirect(`/admin/salesMonthly`)
        // }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    getSalesReportPage,
}