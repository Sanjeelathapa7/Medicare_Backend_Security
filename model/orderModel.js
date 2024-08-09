const mongoose = require('mongoose');
 
const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    }
});
 
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        default: () => "ORDER-NO" + Math.floor(Math.random() * 1000000)
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    items: [orderItemSchema], // Using the subdocument schema for items
    status: {
        type: String,
        default: "pending"
    }
});
 
const Orders = mongoose.model('orders', orderSchema);
module.exports = Orders;