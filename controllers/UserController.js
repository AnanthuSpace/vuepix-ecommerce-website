const { User } = require("../models/userDB")
const bcrypt = require("bcrypt")


// Guest Account Rendering
const renderGuest = async(req,res)=>{
    res.render("user/userHome")
}

// Login page rendering
const renderLogin = async (req, res) => {
    try {
        if (!req.session.user) {
            res.render("user/userLogin");
        } else {
            res.redirect("/Home")
        }
    } catch (error) {
        res.render("user/userHome")
    }
}

// SignUp page Rendering
const renderSignUp = async (req, res) => {
    try {
        res.render("user/signUp")
    } catch (error) {
        res.redirect("/signup")
    }
}

// userHome page rendering
const renderHome = async (req, res) => {
    try {
        res.render("user/userHome")
    } catch (error) {
        res.redirect("/login")
    }
}

// Login and User Verification
const userVerification = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.render("user/userLogin")
            console.log("Invalid User id and password");
            return;
        }

        console.log(user.username);

        req.session.user = user.username
        res.cookie("sessionId", req.sessionId, { httpOnly: true })
        res.render("user/userHome")
    } catch (error) {
        console.log("Login Error : ", error);
    }
}


// Register the user details and validation
const createUser = async (req, res) => {
    const { username, email, phone, password, confirmPassword } = req.body

    console.log(req.body);
    const trimmedUsername = username.trim()

    if (!trimmedUsername) {
        res.render('user/signUp')
        console.log("UserName cannot be just whitespace");
        return
    }

    if (password !== confirmPassword) {
        res.render("user/signUp")
        console.log("Password missmatch");
        return
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Existed username");
            return res.render("user/singUp")
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            username,
            email,
            phone,
            password: hashPassword
        })

        await newUser.save();
        console.log("user Created Succcesfully");
        res.redirect("/otp")
    } catch (error) {
        console.error("Error Creating User : ", error);
    }
}

// Otp Verification
const otpVerification = async (req,res)=>{
    res.render("user/verify")
}



// Logout User
const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Logout Error");
            }
            console.log("Logout Successfully");
            res.redirect("/login")
        })
    } catch (error) {
        console.log("Logout Error : ", error);
    }
}

module.exports = {
    renderGuest,
    renderLogin,
    renderSignUp,
    renderHome,
    createUser,
    userVerification,
    otpVerification,
    logout,
}