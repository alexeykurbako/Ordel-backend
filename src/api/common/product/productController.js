
const express = require('express');
const router = express.Router();

const ProductService = require('./productService');

const productService = new ProductService();

router.get('/products', (req, res) => {
  productService
    .listForCurrentType(req.clientType, req.user)
    .then(products => res.send(products));
});

router.post('/products', (req, res) => {
  productService
      .addProduct(req.body, req.user)
      .then(user => res.send(user))
      .catch(err => res.status(409).send({ error: err.message }));
});

router.put('/products', (req, res) => {
  productService
      .updateProduct(req.body)
      .then(user => res.send(user))
      .catch(err => res.status(409).send({ error: err.message }));
});

module.exports = router;
