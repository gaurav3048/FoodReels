const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const foodModel = require('../models/food.model');
const orderModel = require('../models/order.model');

const CURRENCY = 'INR';

function asPaise(value) {
    const price = Number(value);
    if (!Number.isFinite(price) || price <= 0) return null;

    const paise = Math.round(price * 100);
    return paise > 0 ? paise : null;
}

function configuredRazorpay() {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return null;

    return new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET
    });
}

function signaturesMatch(expected, received) {
    if (typeof received !== 'string') return false;

    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(received, 'hex');

    return expectedBuffer.length === receivedBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function getQuantities(items) {
    if (!Array.isArray(items) || items.length === 0 || items.length > 20) return null;

    const quantities = new Map();

    for (const item of items) {
        const foodId = typeof item?.foodId === 'string' ? item.foodId : '';
        const quantity = Number(item?.quantity);

        if (!mongoose.isObjectIdOrHexString(foodId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
            return null;
        }

        const nextQuantity = (quantities.get(foodId) || 0) + quantity;
        if (nextQuantity > 10) return null;
        quantities.set(foodId, nextQuantity);
    }

    return quantities;
}

async function createOrder(req, res) {
    const quantities = getQuantities(req.body?.items);
    if (!quantities) {
        return res.status(400).json({ message: 'Choose between 1 and 10 of each food item.' });
    }

    const foodIds = [...quantities.keys()];
    const foods = await foodModel.find({ _id: { $in: foodIds } }).select('name price');

    if (foods.length !== foodIds.length) {
        return res.status(400).json({ message: 'One or more items in your cart are no longer available.' });
    }

    const foodsById = new Map(foods.map((food) => [String(food._id), food]));
    const orderItems = [];
    let amount = 0;

    for (const foodId of foodIds) {
        const food = foodsById.get(foodId);
        const unitAmount = asPaise(food?.price);

        if (!unitAmount) {
            return res.status(400).json({ message: `${food?.name || 'An item'} does not have a valid price yet.` });
        }

        const quantity = quantities.get(foodId);
        amount += unitAmount * quantity;
        orderItems.push({
            food: food._id,
            name: food.name,
            quantity,
            unitAmount
        });
    }

    const razorpay = configuredRazorpay();
    if (!razorpay) {
        return res.status(503).json({ message: 'Payments are not configured yet. Please try again later.' });
    }

    const receipt = `fr_${crypto.randomBytes(12).toString('hex')}`;
    const order = await orderModel.create({
        user: req.user._id,
        items: orderItems,
        amount,
        currency: CURRENCY,
        receipt
    });

    try {
        const gatewayOrder = await razorpay.orders.create({
            amount,
            currency: CURRENCY,
            receipt,
            notes: { foodReelsOrderId: String(order._id) }
        });

        order.gatewayOrderId = gatewayOrder.id;
        await order.save();

        return res.status(201).json({
            orderId: order._id,
            gatewayOrderId: gatewayOrder.id,
            amount,
            currency: CURRENCY,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        order.status = 'failed';
        await order.save();
        console.error('Unable to create Razorpay order:', error.message);
        return res.status(502).json({ message: 'Unable to start payment. Please try again.' });
    }
}

async function verifyPayment(req, res) {
    const {
        orderId,
        razorpay_order_id: gatewayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
    } = req.body || {};

    if (!orderId || !gatewayOrderId || !paymentId || !signature) {
        return res.status(400).json({ message: 'Payment details are incomplete.' });
    }

    if (!mongoose.isObjectIdOrHexString(orderId)) {
        return res.status(400).json({ message: 'Payment order is invalid.' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(503).json({ message: 'Payments are not configured yet.' });
    }

    const order = await orderModel.findOne({
        _id: orderId,
        user: req.user._id,
        gatewayOrderId
    });

    if (!order) {
        return res.status(404).json({ message: 'Payment order not found.' });
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${gatewayOrderId}|${paymentId}`)
        .digest('hex');

    if (!signaturesMatch(expectedSignature, signature)) {
        return res.status(400).json({ message: 'Payment verification failed.' });
    }

    if (order.status !== 'paid') {
        order.status = 'paid';
        order.razorpayPaymentId = paymentId;
        order.razorpaySignature = signature;
        order.paidAt = new Date();
        await order.save();
    }

    return res.status(200).json({
        message: 'Payment verified successfully.',
        order: {
            _id: order._id,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
            paidAt: order.paidAt
        }
    });
}

async function getOrder(req, res) {
    if (!mongoose.isObjectIdOrHexString(req.params.orderId)) {
        return res.status(400).json({ message: 'Order reference is invalid.' });
    }

    const order = await orderModel.findOne({
        _id: req.params.orderId,
        user: req.user._id
    });

    if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({
        order: {
            _id: order._id,
            items: order.items,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
            paidAt: order.paidAt,
            createdAt: order.createdAt
        }
    });
}

async function handleWebhook(req, res) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.get('x-razorpay-signature');

    if (!webhookSecret || !signature || !Buffer.isBuffer(req.body)) {
        return res.status(400).json({ message: 'Invalid webhook request.' });
    }

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body)
        .digest('hex');

    if (!signaturesMatch(expectedSignature, signature)) {
        return res.status(400).json({ message: 'Invalid webhook signature.' });
    }

    let event;
    try {
        event = JSON.parse(req.body.toString('utf8'));
    } catch {
        return res.status(400).json({ message: 'Invalid webhook payload.' });
    }

    const payment = event.payload?.payment?.entity;
    const gatewayOrderId = payment?.order_id;

    if (gatewayOrderId && event.event === 'payment.captured') {
        await orderModel.updateOne(
            { gatewayOrderId, status: { $ne: 'paid' } },
            {
                $set: {
                    status: 'paid',
                    razorpayPaymentId: payment.id,
                    paidAt: new Date()
                }
            }
        );
    }

    if (gatewayOrderId && event.event === 'payment.failed') {
        await orderModel.updateOne(
            { gatewayOrderId, status: 'created' },
            { $set: { status: 'failed' } }
        );
    }

    return res.status(200).json({ received: true });
}

module.exports = {
    createOrder,
    verifyPayment,
    getOrder,
    handleWebhook
};
