const express = require('express');
const router = express.Router();

router.get('/busId', (req, res) => {
    res.send('Get all products');
});

router.get('/check/otp', (req, res) => {
    res.send(`Get product with ID ${req.params.id}`);
});

router.post('/', (req, res) => {
    res.send(`Get product with ID ${req.params.id}`);
});

router.post('/details', (req, res) => {
    res.send(`Get product with ID ${req.params.id}`);
});

router.post('/book', (req, res) => {
    res.send(`Get product with ID ${req.params.id}`);
});

module.exports = router;