
const express = require('express');
const router = express.Router();

const OrderService = require('./orderService');

const orderService = new OrderService();

router.post('/orders', (req, res) => {
  orderService
    .addOrders(req.body)
    .then(response => res.send(response));
});

router.get('/orders', (req, res) => {
  orderService
    .getOrdersByClientTypeAndId(req.clientType, req.user.clientId)
    .then(orders => res.send(orders));
});

router.put('/orders/:id/status', (req, res) => {
  orderService
    .updateOrderStatus(req.params.id, req.body.status)
    .then(order => res.send(order));
});

router.get('/orders/:id', (req, res) => {
  orderService
    .findById(req.params.id)
    .then(order => res.send(order));
});

module.exports = router;
