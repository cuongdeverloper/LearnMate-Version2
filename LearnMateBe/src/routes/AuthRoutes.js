const express = require('express');
const { apiLogin, apiRegister, verifyOtp, requestPasswordReset, resetPassword, verifyAccountByLink,changePassword } = require('../controller/Auth/AuthController');
const RouteAuth = express.Router();
const { checkAccessToken, createRefreshToken, createJWT } = require('../middleware/JWTAction');
const passport = require('passport');

RouteAuth.post('/login', apiLogin);
RouteAuth.post('/register', apiRegister);
//reset password
RouteAuth.post('/rqreset-password', requestPasswordReset);
RouteAuth.post('/reset-password', resetPassword);
//OTP
RouteAuth.post('/verify-otp', verifyOtp);
RouteAuth.get('/verify-account', verifyAccountByLink);
RouteAuth.post('/change-password',checkAccessToken, changePassword);

RouteAuth.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

    RouteAuth.get('/google/redirect',
    passport.authenticate('google', { failureRedirect: 'http://localhost:6161/signin' }),
    (req, res) => {
        // Create a payload for JWT
        const payload = {
            email: req.user.email,
            name: req.user.username,
            role: req.user.role,
            id: req.user.id
        };
        // Generate access and refresh tokens
        const accessToken = createJWT(payload);
        const refreshToken = createRefreshToken(payload);

        // Construct the redirect URL
        const redirectUrl = `http://localhost:6161/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&user=${encodeURIComponent(JSON.stringify(req.user))}`;

        // Redirect to the frontend with tokens
        res.redirect(redirectUrl);
    }
);
RouteAuth.post('/decode-token', (req, res) => {
    const { token } = req.body;
    const data = decodeToken(token);
    if (data) {
        res.json({ data });
    } else {
        res.status(400).json({ error: 'Invalid token' });
    }
});

module.exports = { RouteAuth };