const mongoose = require("mongoose")
require('dotenv').config();


const dbconnect = mongoose.connect("mongodb://ananthumohan:Namithasabu2003@ac-cijy2sg-shard-00-00.x1kojm6.mongodb.net:27017,ac-cijy2sg-shard-00-01.x1kojm6.mongodb.net:27017,ac-cijy2sg-shard-00-02.x1kojm6.mongodb.net:27017/VuePix?ssl=true&replicaSet=atlas-lzlwlo-shard-0&authSource=admin&retryWrites=true&w=majority")

dbconnect
    .then(() => console.log("DB Connected"))
    .catch((err) => console.error("DB Connection Error:", err.message));