


// Login page rendering

const renderLogin = async (req,res)=>{
    try {
        // if (!req.session.user) {
          res.render("signUp");
        // } else {
        //   res.redirect("/home");
        // }
      } catch (error) {
        // res.render("home");
      }
}


module.exports= {
    renderLogin
}