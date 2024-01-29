

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
        if (email === "admin@gmail.com" && password === "123") {
            req.session.admin = email;
            res.cookie("sessionId", req.sessionID, { httpOnly: true });
            res.redirect("/admin/home");
            return;
        } else {
            console.log("Invalid User id and password");
            res.render("admin/adminLogin", { login_err: "Invalid User id and password" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.render("admin/adminLogin");
    }
};


// Admin Logout

const adminLogout = async(req,res)=>{
    try {
        req.session.destroy((err) => {
          if (err) {
            console.log("Logout error");
            res.redirect("/admin/getHome");
          }
          console.log("Logged out successfully");
          res.redirect("/admin/adminLogin");
        });
      } catch (error) {
        console.log("Logout Error");
      }
}


const renderAdminHome = async (req,res)=>{
    res.render("admin/adminHome")
}


const renderCategories = async (req,res)=>{
    res.render("admin/category")
} 


const renderProductList = async (req,res)=>{
    res.render("admin/productList")
}



module.exports = {
    renderAdminLogin,
    adminHome,
    renderAdminHome,
    renderCategories,
    renderProductList,
    adminLogout
}