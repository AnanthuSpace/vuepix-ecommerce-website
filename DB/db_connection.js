const mongoose = require("mongoose")
require('dotenv').config();


const dbconnect = mongoose.connect("mongodb://localhost:27017/VuePix")

dbconnect
    .then(() => console.log("DB Connected"))
    .catch((err) => console.error("DB Connection Error:", err.message));