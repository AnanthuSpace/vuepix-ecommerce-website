const Admin = require("../../models/adminSchema")
const Category = require('../../models/categorySchema')
const Order = require('../../models/orderShema')
const Product = require("../../models/productSchema")
const { User } = require("../../models/userSchema")
const bcrypt = require("bcrypt");



// Render admin login page

const renderAdminLogin = async (req, res) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/getHome')
        } else {
            res.render('admin/adminLogin')
        }
    } catch (error) {
        res.render("admin/adminLogin");
    }
}



// Get admin home page

const adminHome = async (req, res) => {
    const { email, password } = req.body;

    try {

        const admin = await Admin.findOne({ email });
        console.log(admin);
        if (!Admin || !(await bcrypt.compare(password, admin.password))) {
            req.session.admin = admin.email;
            res.cookie("sessionId", req.sessionID, { httpOnly: true });
            res.redirect("/admin/home");
            return;
        } else {
            res.render("admin/adminLogin", { login_err: "Invalid User id and password" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.render("admin/adminLogin");
    }
};



// Admin Logout

const adminLogout = async (req, res) => {
    try {
        req.session.admin = null
        res.redirect("/admin")
    } catch (error) {
        console.log(error.message);
    }
}


// const renderAdminHome = async (req, res) => {
//     try {
//         res.render("admin/adminHome", { dashboard: true })
//     } catch (error) {
//         console.log(error.message);
//     }
// }



const renderAdminHome = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true })
        const order = await Order.find({ status: "Delivered" })
        const product = await Product.find({})
        const user = await User.find({})

        const productCount = product.length
        const orderCount = order.length
        const categoryCount = category.length

        let totalRevenue = 0;

        for (let i in order) {
            totalRevenue += order[i].totalPrice;
        }

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const monthlyOrders = await Order.find({
            status: "Delivered",
            createdOn: {
                $gte: firstDayOfMonth,
                $lt: lastDayOfMonth
            }
        })

        let monthlyRevenue = 0

        for (let i in monthlyOrders) {
            monthlyRevenue += monthlyOrders[i].totalPrice;
        }

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    status: "Delivered"
                }
            },
            {
                $group: {
                    _id: {
                        $month: '$createdOn',
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    '_id': 1
                }
            }
        ])

        // const topProducts = await Order.aggregate([
        //     {
        //       $group: {
        //         _id: '$product.name',
        //         totalPrice: {
        //           $sum: '$totalPrice'
        //         }
        //       }
        //     },
        //     {
        //       $sort: {
        //         totalPrice: -1
        //       }
        //     },
        //     {
        //       $limit: 5
        //     }
        //   ])
          
        //   console.log(topProducts);

        //   const topCat = await Order.aggregate([
        //     {
        //       $group: {
        //         _id: '$product.category',
        //         totalPrice: {
        //           $sum: '$totalPrice'
        //         }
        //       }
        //     },
        //     {
        //       $sort: {
        //         totalPrice: -1
        //       }
        //     },
        //     {
        //       $limit: 5
        //     }
        //   ])
          
        //   console.log("Category : ", topCat);

        const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
            const monthData = monthlySales.find(item => item._id === index + 1)
            return monthData ? monthData.count : 0
        })

        const latestOrders = await Order.find().sort({ createdOn: -1 }).limit(5);

        const productPerMonth = Array(12).fill(0);

        product.forEach(p => {
            const createdOnDate = new Date(p.createdOn);
            const createdMonth = createdOnDate.getMonth();
            productPerMonth[createdMonth]++;
        });

        const userPerMonth = Array(12).fill(0);
        user.forEach(u => {
            const createdOnDate = new Date(u.createdOn);
            const createdMonth = createdOnDate.getMonth();
            userPerMonth[createdMonth]++;
        });


        const topProducts = await calculateTopSellingProducts();
        console.log("Top 5 Best Selling Products:", topProducts);
        const topCat = await calculateTopSellingCategories();
        console.log("Top 5 Best Selling Products:", topCat);


        res.render("admin/adminHome", {
            orderCount,
            productCount,
            categoryCount,
            totalRevenue,
            monthlyRevenue,
            monthlySalesArray,
            productPerMonth,
            latestOrders,
            dashboard:true,
            userPerMonth,
            topProducts,
            topCat
        })
    } catch (error) {
        console.log(error.message);
    }
}


const calculateTopSellingCategories = async () => {
    try {
        const topSellingCategories = await Order.aggregate([
            {
                $unwind: "$product"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product._id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $group: {
                    _id: "$productDetails.category",
                    totalQuantitySold: { $sum: "$product.unit" }
                }
            },
            {
                $sort: { totalQuantitySold: -1 }
            },
            {
                $limit: 5
            }
        ]);

        return topSellingCategories;
    } catch (error) {
        console.error("Error calculating top selling categories:", error);
        return []; // Return an empty array in case of error
    }
};



const calculateTopSellingProducts = async () => {
    const orders = await Order.aggregate([
        {
            $match: { status: "Delivered" }
        },
        {
            $unwind: "$product"
        },
        {
            $group: {
                _id: { productId: "$product._id", productName: "$product.name" },
                totalQuantitySold: { $sum: { $toInt: "$product.unit" } }
            }
        },
        {
            $sort: { totalQuantitySold: -1 }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: "products",
                localField: "_id.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $project: {
                _id: "$product._id",
                productName: "$product.name",
                productImage: "$product.images",
                salePrice: "$product.salesPrice",
                regularPrice: "$product.regularPrice",
                totalQuantitySold: 1
            }
        }
    ]);

    return orders;
};





module.exports = {
    renderAdminLogin,
    adminHome,
    renderAdminHome,
    adminLogout
}