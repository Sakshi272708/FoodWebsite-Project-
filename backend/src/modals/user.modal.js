const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter the user name"]
    },
    email:{
        type:String,
        required:[true,"please enter the email"],
        unique:[true , "email already exists"]    //means no duplicate allowed
    },
    password:{
        type:String,
        required:[true,"please enter the password"]
    },
    role:{
        type:String,
        enum:["user","admin"],   //means only user or admin allowed
        default:"user"
    }
})

const userModel = mongoose.model('user',userSchema)

module.exports = userModel