/*
 * Copyright (c) Akveo 2020. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

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
