const express = require('express');
const routerPayment = express.Router();
const { checkAccessToken, createRefreshToken, createJWT } = require('../middleware/JWTAction');

const paymentController = require('../controller/Payment/PaymentController');

routerPayment.get('/me/info', checkAccessToken,paymentController.getUserInfo); // Đổi từ /user/:userId
routerPayment.get('/me/payments',checkAccessToken, paymentController.getUserPayments); // Đổi từ /user/:userId/payments
routerPayment.post('/payment/withdraw', checkAccessToken,paymentController.createWithdrawalRequest); // Không cần userId trong body nữa
routerPayment.get('/me/withdrawals',checkAccessToken, paymentController.getUserWithdrawalHistory); // Đổi từ /user/:userId/withdrawals
routerPayment.get('/me/financial-flow',checkAccessToken, paymentController.getFinancialFlowHistory); // Đổi từ /user/:userId/financial-flow (nếu có trước đó)
routerPayment.get('/me/financial-flowhistory', checkAccessToken, paymentController.getUserFinancialFlow);
// Route callback từ VNPAY sau khi thanh toán
routerPayment.get('/vnpay_return', paymentController.vnpayReturn);

// Xác thực trước khi trả dữ liệu user
routerPayment.get('/user/:userId', checkAccessToken, paymentController.getUserInfo);
routerPayment.get('/user/:userId/payments', checkAccessToken, paymentController.getUserPayments);
routerPayment.post('/payment/create-vnpay', checkAccessToken, paymentController.createVNPayPayment);
routerPayment.post("/payMonthly", paymentController.payMonthly);
module.exports = routerPayment;