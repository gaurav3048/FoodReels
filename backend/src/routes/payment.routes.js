const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

router.post('/orders', authMiddleware.authUserMiddleware, paymentController.createOrder);
router.post('/verify', authMiddleware.authUserMiddleware, paymentController.verifyPayment);
router.get('/orders/:orderId', authMiddleware.authUserMiddleware, paymentController.getOrder);

module.exports = router;
