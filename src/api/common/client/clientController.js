

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
