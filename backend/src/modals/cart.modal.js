const mongoose= require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title:{
        type:String,
        required:true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    quantity: {
        type:Number,
        default:1
    }
})

const cartModel = mongoose.model("cart",cartSchema);

module.exports = cartModel;