
const express = require('express');
const router = express.Router();

const DeviceService = require('./deviceService');

const deviceService = new DeviceService();


router.post('/device/registration', (req, res) => {
  deviceService
    .registerDevice(req.body.token, req.user.clientId)
    .then(response => res.send(response));
});

module.exports = router;
