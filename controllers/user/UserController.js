const mailer = require("nodemailer")
const { User } = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const bcrypt = require("bcrypt")



const pageNotFound = async (req, res) => {
    try {
        res.render("user/page-404")
    } catch (error) {
        console.log(error.message);
    }
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


//generate otp

const generateOTP = () => {
    const otpLength = 6;
    let otp = '';

    for (let i = 0; i < otpLength; i++) {
        const digit = Math.floor(Math.random() * 10);
        otp += digit.toString(); 
    }

    return otp;
};


// userHome page rendering

const renderHome = async (req, res) => {
    try {
        const user = req.session.user
        const products = await Product.find({})
        
        if(!user){
            res.render("user/userLogin")
        }
        else{
            res.render("user/userHome",{user:user,products: products})
        }
    } catch (error) {
        res.redirect("/")
    }
}


// Login and User Verification

const userVerification = async (req, res) => {

    const { email, password } = req.body
    
    
    try {
        const user = await User.findOne({ email })
        console.log(user);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.render("user/userLogin", { login_err: "Invalid User id and password" });
            console.log("Invalid User id and password");
            return;
        }

        // console.log(user.username);

        req.session.user = user.username
        res.cookie("sessionId", req.sessionId, { httpOnly: true })
        res.redirect("/home")

    } catch (error) {
        console.log("Login Error : ", error);
    }
}


// Otp Generation and User validation

const createUser = async (req, res) => {

    const { username, email, phone, password } = req.body
    // console.log(username, email, phone, password );

    try {
        console.log("create user try");
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Existed username");
            return res.render("user/signup",{err:"Existed user"})
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const otp =generateOTP()


        // Store user datat temporary session

        req.session.tempUser = {
            username,
            email,
            phone,
            password: hashPassword,
            otp
        }


        // Create a transporter with your email service configuration

        const transporter = mailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_ID,
              pass: process.env.EMAIL_PASS
            }
          });


        // Set Email options

        const mailOption = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP for Verification is ${otp}`
        }

        // Sending email

        transporter.sendMail(mailOption, (error,info)=>{

            if(error){
                console.error("Mailing error",error);
            }else{
                console.log('Email sent: ' + info.response);
            }
            console.log(otp);
            res.redirect("/verifyOtp")
        })
        
    } catch (error) {
        console.error("Error Creating User : ", error);
    }
}



// Handle OTP Submission

const verifyOtp = async (req,res) => {
    try{
        let otpfromAjax = req.body.otp
        const {username, email, phone, password,otp} = req.session.tempUser
        console.log(otp,otpfromAjax);
        if(otpfromAjax == otp){
            console.log("otp matched");
            const newUser = new User({
                username,
                email,
                phone,
                password
            })
    
            await newUser.save();
            res.json({status : true})
            delete req.session.tempUser
        }else{
            console.log("otp invalid");
            res.json({status : false})
        }
    } catch (error) {
       console.log(error.message);
    }
}



// Resend Otp 

const resendOTP = async(req,res)=>{
    try {
        const { email } = req.session.tempUser;

        const newotp = generateOTP()

        const transporter = mailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_ID,
              pass: process.env.EMAIL_PASS
            }
          });


        // Set Email options

        const mailOption = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: "OTP Verification",
            text: `Your Resend OTP for Verification is ${newotp}`
        }

        // Sending email

        req.session.tempUser.otp = newotp

        transporter.sendMail(mailOption, (error,info)=>{

            if(error){
                console.error("Mailing error",error);
            }else{
                console.log('Email sent: ' + info.response);
            }
            res.redirect("/verifyOtp")
        })
    } catch (error) {
        res.render("user/verify")
    }
}



// Logout User

const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Logout Error");
            }
            console.log("Logout Successfully");
            res.redirect("/")
        })
    } catch (error) {
        console.log("Logout Error : ", error);
    }
}


// Get otp verification page

const getVerifyOtp = async (req, res)=>{
    try {
        res.render("user/verify")
    } catch (error) {
        console.log(error.message);
    }
}

const renderForgotPass = async(req,res)=>{
    try {
        res.render("user/forgotPass")
    } catch (error) {
        console.log(error.message);
    }
} 




const verifyForgotEmail = async (req,res)=>{
    try {
        const { email } = req.body
        req.session.forgotemail = email
        const existed = await User.findOne({ email })
        if(existed){
            const otp = generateOTP()

            req.session.tempUser = {
                otp
            }

            const transporter = mailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL_ID,
                  pass: process.env.EMAIL_PASS
                }
              });
    
    
            // Set Email options
    
            const mailOption = {
                from: process.env.EMAIL_ID,
                to: email,
                subject: "OTP Verification",
                text: `Your OTP for Verification is ${otp}`
            }
    
            // Sending email
    
            transporter.sendMail(mailOption, (error,info)=>{
    
                if(error){
                    console.error("Mailing error",error);
                }else{
                    console.log('Email sent: ' + info.response);
                }
                console.log(otp);
                res.redirect("/forgotOtp")
            })
            
        }else{
            res.render("user/forgotPass", { message: "User with this email not exists" })
        }
    }catch{
        console.log(error.message);
    }
}


const getVerifyForgot = async (req,res)=>{
    try {
        res.render("user/forgotVerify")
    } catch (error) {
        console.log(error.message);
    }
}


const verifyForgotOtp = async (req,res)=>{
    try{

    let otpfromAjax = req.body.otp
        const {otp} = req.session.tempUser
        
        if(otpfromAjax == otp){
            console.log("otp matched");
    
            res.json({status : true})
            delete req.session.tempUser
        }else{
            console.log("otp invalid");
            res.json({status : false})
        }
    } catch (error) {
       console.log(error.message);
    }
}


const  renderRePass = async (req,res)=>{
    try {
        res.render("user/rePassword")
    } catch (error) {
        console.log(error.message);
    }
}

const newPass = async (req,res)=>{
    try{
        const { newPass1, newPass2 } =req.body
        const email = req.session.forgotemail
        const passwordHash = await bcrypt.hash(newPass1, 10)
        if (newPass1 === newPass2) {
            await User.updateOne(
                { email: email },
                {
                    $set: {
                        password: passwordHash
                    }
                }
            )
                .then((data) => console.log(data))
            res.redirect("/login")
        }else {
            console.log("Password not match");
            res.render("rePassword", { message: "Password not matching" })
        }
    }catch(error){
        console.log(error.message);
    }
}


module.exports = {
    pageNotFound,
    renderLogin,
    renderSignUp,
    renderHome,
    createUser,
    userVerification,
    renderForgotPass,
    logout,
    verifyOtp,
    resendOTP,
    getVerifyOtp,
    getVerifyForgot,
    verifyForgotEmail,
    verifyForgotOtp,
    renderRePass,
    newPass
}