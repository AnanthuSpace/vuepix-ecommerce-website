const {Admin} = require("../../models/adminSchema")
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
      }else{
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


const renderAdminHome = async (req, res) => {
    res.render("admin/adminHome")
}



const renderProductList = async (req, res) => {
    res.render("admin/productList")
}



module.exports = {
    renderAdminLogin,
    adminHome,
    renderAdminHome,
    renderProductList,
    adminLogout
}