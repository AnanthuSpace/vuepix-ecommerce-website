const mailer = require("nodemailer")
const { User } = require("../../models/userSchema")
const Product = require("../../models/productSchema")
const Banner = require("../../models/bannerSchema")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid");


const renderGuest = async (req, res) => {
    try {
        const today = new Date().toISOString();
        const products = await Product.find({ isBlocked: false })
        console.log(products);
        const findBanner = await Banner.find({
            startDate: { $lt: new Date(today) },
            endDate: { $gt: new Date(today) }
        });
        res.render("user/userHome", { products: products, banner: findBanner })
    } catch (error) {
        console.log(error.message);
    }
}

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
            res.redirect("/VuePix")
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
        const today = new Date().toISOString();
        const products = await Product.find({ isBlocked: false })
        const findUser = await User.findOne({ _id: user })
        const cartCount = findUser.cart.length;
        const wishlistCount = findUser.wishlist.length
        const findBanner = await Banner.find({
            startDate: { $lt: new Date(today) },
            endDate: { $gt: new Date(today) }
        });
        if (!user) {
            res.redirect("/")
        }
        else {
            res.render("user/userHome",
                {
                    user: user,
                    products: products,
                    cartCount,
                    wishlistCount,
                    banner: findBanner
                })
        }
    } catch (error) {
        res.redirect("/login")
    }
}


// Login and User Verification

const userVerification = async (req, res) => {


    try {
        const { email, password } = req.body
        const findUser = await User.findOne({ email })

        console.log("working");

        if (findUser) {
            const notBlocked = findUser.isBlocked === false;

            if (notBlocked) {
                const passwordMatch = await bcrypt.compare(password, findUser.password)
                if (passwordMatch) {
                    req.session.user = findUser._id
                    console.log("Logged in");
                    res.redirect("/VuePix")
                } else {
                    console.log("Password is not matching");
                    res.render("user/userLogin", { message: "Invalid User id and password" });
                }
            } else {
                console.log("User is blocked by admin");
                res.render("user/userLogin", { message: "User is blocked by admin" })
            }
        } else {
            console.log("User is not found");
            res.render("user/userLogin", { message: "User is not found" })
        }

    } catch (error) {
        console.log(error.message);
        res.render("user/userLogin", { message: "Login failed" })
    }
}



// Otp Generation and User validation

const createUser = async (req, res) => {

    const { username, email, phone, password } = req.body

    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Existed username");
            return res.render("user/signup", { err: "Existed user" })
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const otp = generateOTP()


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
            html: `
            <div style="font-family: Helvetica, Arial, sans-serif; min-width: 100px; overflow: auto; line-height: 2">
                <div style="margin: 50px auto; width: 70%; padding: 20px 0">
                    <p style="font-size: 1.1em">Hi,</p>
                    <p>Thank you for choosing VuePix. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                    <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
                    <p style="font-size: 0.9em;">Regards,<br />VuePix</p>
                    <hr style="border: none; border-top: 1px solid #eee" />
                </div>
            </div>`
        }

        // Sending email

        transporter.sendMail(mailOption, (error, info) => {

            if (error) {
                console.error("Mailing error", error);
            } else {
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

const verifyOtp = async (req, res) => {
    try {
        let otpfromAjax = req.body.otp
        const { username, email, phone, password, otp } = req.session.tempUser
        console.log(otp, otpfromAjax);
        if (otpfromAjax == otp) {
            console.log("otp matched");

            const referalCode = uuidv4()
            console.log("RefferelCode : ", referalCode);

            const newUser = new User({
                username,
                email,
                phone,
                password,
                referalCode: referalCode,
                createdOn: new Date()
            })

            await newUser.save();
            res.json({ status: true })
            delete req.session.tempUser
        } else {
            console.log("otp invalid");
            res.json({ status: false })
        }
    } catch (error) {
        console.log(error.message);
    }
}



// Resend Otp 

const resendOTP = async (req, res) => {
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

        transporter.sendMail(mailOption, (error, info) => {

            if (error) {
                console.error("Mailing error", error);
            } else {
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
            res.redirect("/login")
        })
    } catch (error) {
        console.log("Logout Error : ", error);
    }
}


// Get otp verification page

const getVerifyOtp = async (req, res) => {
    try {
        res.render("user/verify")
    } catch (error) {
        console.log(error.message);
    }
}

const renderForgotPass = async (req, res) => {
    try {
        res.render("user/forgotPass")
    } catch (error) {
        console.log(error.message);
    }
}




const verifyForgotEmail = async (req, res) => {
    try {
        const { email } = req.body
        req.session.forgotemail = email
        const existed = await User.findOne({ email })
        if (existed) {
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

            transporter.sendMail(mailOption, (error, info) => {

                if (error) {
                    console.error("Mailing error", error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
                console.log(otp);
                res.redirect("/forgotOtp")
            })

        } else {
            res.render("user/forgotPass", { message: "User with this email not exists" })
        }
    } catch {
        console.log(error.message);
    }
}


const getVerifyForgot = async (req, res) => {
    try {
        res.render("user/forgotVerify")
    } catch (error) {
        console.log(error.message);
    }
}


const verifyForgotOtp = async (req, res) => {
    try {

        let otpfromAjax = req.body.otp
        const { otp } = req.session.tempUser

        if (otpfromAjax == otp) {
            console.log("otp matched");

            res.json({ status: true })
            delete req.session.tempUser
        } else {
            console.log("otp invalid");
            res.json({ status: false })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const renderRePass = async (req, res) => {
    try {
        res.render("user/rePassword")
    } catch (error) {
        console.log(error.message);
    }
}

const newPass = async (req, res) => {
    try {
        const { newPass1, newPass2 } = req.body
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
        } else {
            console.log("Password not match");
            res.render("rePassword", { message: "Password not matching" })
        }
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    renderGuest,
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
    newPass,
}