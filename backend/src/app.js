//create server

const express = require("express");
const cookieParser=require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodRoutes=require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/foodpartner.routes');
const paymentRoutes = require('./routes/payment.routes');
const paymentController = require('./controllers/payment.controller');
const cors = require('cors');
const app = express();
const defaultOrigins = 'https://food-reels-gamma.vercel.app,http://localhost:5173';
const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');
const allowedOrigins = `${defaultOrigins},${process.env.FRONTEND_URL || ''}`
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) return callback(null, true);
        return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true
}));
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("Hello World");
})
app.use('/api/auth',authRoutes);
app.use('/api/food',foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);
app.use('/api/payment', paymentRoutes);
module.exports = app;
