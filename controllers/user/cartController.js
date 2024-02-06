const Product = require("../../models/productSchema")
// const Category = require("../../models/categorySchema")
const mongodb = require('mongodb');

const { User } = require("../../models/userSchema")



// const renderCart = async(req,res)=>{
//     try {
//         const user = req.session.user
//         res.render("user/cart",{user})
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const renderCart = async (req,res)=>{
    try{
        let userSession = req.session.user;
        const oid = new mongodb.ObjectId(userSession);
        let data = await User.aggregate([
            {$match:{_id:oid}},
            {$unwind:'$cart'},
            {$project:{
                proId:{'$toObjectId':'$cart.ProductId'},
                quantity:'$cart.unit',
                // size:'$cart.size'
            }},
            {$lookup:{
                from:'products',
                localField:'ProductId', 
                foreignField:'_id',
                as:'ProductDetails',
            }},


        ])
        let GrandTotal = 0
        // for(let i=0;i<data.length;i++){
        //     let qua = parseInt(data[i].unit);
        //     console.log(qua);
        //     GrandTotal = GrandTotal+(qua*parseInt(data[i].ProductDetails[0]))
        // }
        res.render('user/cart' , {data , GrandTotal})
    }catch(err){
        console.log(err)
        res.send("Error")
    }
}

// const addToCart = async (req, res) => {
//     try {
//         const productId = req.params.id;
        
//         const userId = req.session.user
//             let userData = await User.findOne({
//                 _id: userId,
//                 cart: { $elemMatch: { ProductId: req.params.ProId } }
//             }).lean();
//             console.log("userdata :",userData);
//             Object.freeze(userData)
//             if(userData == null){
//                 req.body.unit = parseInt(req.body.unit)
//                 let proDetails = await Product.find({_id:productId})
//                 proDetails.salesPrice = parseInt(proDetails[0].salesPrice)
//                 User.updateOne(
//                     { _id: userId },
//                     { $push: { cart: {ProductId:productId,
//                     unit:1,
//                     price:proDetails.salesPrice,
//                     } } }
//                 ).then((data)=>{
//                     res.json({added:true})
//                 }).catch(()=>{
//                     res.json({err:true})
//                 })
//             }
//         // else{
//         //         const matchingUser = userData;
//         //         const matchingCartItem = matchingUser.cart.find(item => item.ProductId === req.params.ProId)
//         //         let totalQua = parseInt(matchingCartItem.quantity)+parseInt(req.body.quantity);
//         //         let unit = await productModel.findById(req.params.ProId , {unit:1 , _id:0});
//         //         if(totalQua>unit.unit){
//         //             return res.json({stockerr:true})
//         //         }
//         //         user.updateOne(
//         //             {
//         //             _id: data._id,
//         //             'cart.ProductId': req.params.ProId,
//         //             },
//         //             {
//         //             $set: {
//         //                 'cart.$.quantity': totalQua,
//         //             }
//         //             }
//         //         ).then((status)=>{
//         //             res.json({added:true})
//         //         }).catch((err)=>{
//         //             res.json({err:false})
//         //         })
//         //     }
//         res.json({ added: true });
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// const addToCart = async (req, res) => {
//     try {
//         const productId = req.params.id;
//         const userId = req.session.user;

//         // Find the user with the given userId and productId in their cart
//         let userData = await User.findOne({
//             _id: userId,
//             cart: { $elemMatch: { ProductId: productId } }
//         }).lean();
//         console.log("userdata:", userData);

//         if (!userData) {
//             // If the product is not already in the user's cart, add it
//             req.body.unit = parseInt(req.body.unit);
//             let proDetails = await Product.findOne({ _id: productId });
//             let salesPrice = parseInt(proDetails.salesPrice);

//             // Update the user's cart
//             await User.updateOne(
//                 { _id: userId },
//                 {
//                     $push: {
//                         cart: {
//                             ProductId: productId,
//                             unit: req.body.unit, // Assuming default unit is 1
//                             price: salesPrice
//                         }
//                     }
//                 }
//             )
//             .then((data)=>{
//                 res.json({added:true})
//             }).catch(()=>{
//                 res.json({err:true})
//             })
//         }else{
//         const matchingUser = userData;
//         const matchingCartItem = matchingUser.cart.find(item => item.ProductId === productId)
//         let totalQua = parseInt(matchingCartItem.unit)+parseInt(req.body.unit);
//         let unit = await Product.findById(req.params.ProId , {unit:1 , _id:0});
//         if(totalQua>unit.unit){
//             return res.json({stockerr:true})
//         }
//         User.updateOne(
//             {
//             _id: userId,
//             'cart.ProductId': productId,
//             },
//             {
//             $set: {
//                 'cart.$.quantity': totalQua,
//             }
//             }
//         ).then((status)=>{
//             res.json({added:true})
//         }).catch((err)=>{
//             res.json({err:true})
//         })
//     }
// }catch(err){
//     console.log(err)
//     res.redirect('/login')
// }
// };

const addToCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user;

        // Find the user with the given userId and productId in their cart
        let userData = await User.findOne({
            _id: userId,
            cart: { $elemMatch: { ProductId: productId } }
        }).lean();
        console.log("userdata:", userData);

        if (!userData) {
            // If the product is not already in the user's cart, add it
            req.body.unit = parseInt(req.body.unit);
            let proDetails = await Product.findOne({ _id: productId });
            if (!proDetails) {
                return res.json({ err: true, message: 'Product not found' });
            }
            let salesPrice = parseInt(proDetails.salesPrice);

            // Update the user's cart
            await User.updateOne(
                { _id: userId },
                {
                    $push: {
                        cart: {
                            ProductId: productId,
                            unit: req.body.unit, // Assuming default unit is 1
                            price: salesPrice
                        }
                    }
                }
            );
            return res.json({ added: true }); // Product added successfully
        } else {
            const matchingUser = userData;
            const matchingCartItem = matchingUser.cart.find(item => item.ProductId === productId)
            let totalQua = parseInt(matchingCartItem.unit) + parseInt(req.body.unit);
            let unit = await Product.findById(req.params.ProId, { unit: 1, _id: 0 });
            if (!unit) {
                return res.json({ err: true, message: 'Product unit not found' });
            }
            if (totalQua > unit.unit) {
                return res.json({ stockerr: true });
            }
            User.updateOne(
                {
                    _id: userId,
                    'cart.ProductId': productId,
                },
                {
                    $set: {
                        'cart.$.quantity': totalQua,
                    }
                }
            ).then((status) => {
                res.json({ added: true });
            }).catch((err) => {
                res.json({ err: false });
            });
        }
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
};


module.exports={
    renderCart,
    addToCart
}