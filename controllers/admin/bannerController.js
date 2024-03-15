const Banner = require("../../models/bannerSchema")


const getBanner = async(req,res)=>{
    try {
        const findBanner = await Banner.find({})
        res.render("admin/addBanner",{ data:findBanner, bannerActive:true})
    } catch (error) {
        console.log(error.message);
    }
}


module.exports ={
    getBanner
}