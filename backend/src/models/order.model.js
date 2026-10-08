const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    unitAmount: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: [(items) => items.length > 0, 'An order must contain at least one item.']
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },
    receipt: {
        type: String,
        required: true,
        unique: true
    },
    gatewayOrderId: {
        type: String,
        unique: true,
        sparse: true
    },
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created',
        index: true
    },
    paidAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('order', orderSchema);
