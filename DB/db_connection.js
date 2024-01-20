const mongoose = require("mongoose")
const dbconnect = mongoose.connect("mongodb://localhost:27017/VuePix")

dbconnect
    .then(()=> console.log("DB Connected"))
    .catch(() => console.log(err.message))