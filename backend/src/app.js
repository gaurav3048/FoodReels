//create server

const express = require("express");
const cookieParser=require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodRoutes=require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/foodpartner.routes');
const cors = require('cors');
const app = express();
app.use(express.json()); 
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("Hello World");
})
app.use(cors({
    origin: "https://food-reels-gamma.vercel.app",
    credentials: true
}));
app.use('/api/auth',authRoutes);
app.use('/api/food',foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);
module.exports = app;
