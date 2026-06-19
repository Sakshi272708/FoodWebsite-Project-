 const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            title: String,
            price: Number,
            quantity: {
                type: Number,
                default: 1
            }
        }],

        totalAmount: Number,

        paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending"
        },

        orderStatus: {
            type: String,
            enum: ["placed", "preparing", "out-for-delivery", "delivered"],
            default: "placed"
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
    },
    {
        timestamps: true
    }
);

const orderModel = mongoose.model("order", orderSchema);

module.exports = orderModel;