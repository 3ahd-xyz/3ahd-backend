const express = require('express');
const router = express.Router();
const otp = require('../index').otp;
const client = require('../index').client;
const sendOtp = require('../sendOTP');
const db = require('../db.js');

router.post('/sendOtp', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(500).json({ error: 'phoneNumber is required in req body!' });
    }

    try {
        await sendOtp(phoneNumber, otp, client);
        return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        return res.status(500).json({
            error: 'An unexpected error occurred',
            details: error,
        });
    }
});


router.get('/login', async (req, res) => {
    const { phoneNumber, otpCode } = req.body;

    try {
        if ((!phoneNumber || !otpCode)) {
            return res.status(400).json({ error: 'Phone number and otp is required (localhost:3000/auth/check/0543211234?otp=123456)' });
        }
        const result = otp.check(otpCode, phoneNumber)
        if (result) {

            const id = await db.getIdByPhoneNumber(phoneNumber);
            if (!id) {
                db.createUser(phoneNumber);
                res.status(220).json({ error: 'this user is not in the database and need to sign up.' });
            } else {

                const x = await db.getUserDetailsByPhoneNumber(phoneNumber);
                if (!x) return res.status(220).json({ error: 'this user is not in the database and need to sign up.' });
                const token = jwt.sign(
                    { id: id, phoneNumber: phoneNumber },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                res.status(200).json({ message: 'Login successful', token });
            }
        } else {
            res.status(420).json({ error: "wrong otp!" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;