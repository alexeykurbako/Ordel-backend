/*
 * Copyright (c) Akveo 2020. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const express = require('express');
const router = express.Router();
// const adminGuard = require('../auth/aclService').adminGuard;

const ClientsService = require('./clientService');

const clientsService = new ClientsService();

router.get('/clients', (req, res) => {
  clientsService
    .getClientsByType(req.params.type)
    .then(clients => res.send(clients))
    .catch(err => res.status(400).send({ error: err.message }));
});

module.exports = router;
