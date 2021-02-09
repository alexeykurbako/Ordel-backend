
const express = require('express');
const router = express.Router();
// const adminGuard = require('../auth/aclService').adminGuard;

const ProductService = require('./productService');

const productService = new ProductService();

router.get('/products', (req, res) => {
  productService
    .listForCurrentType(req.clientType, req.user)
    .then(products => res.send(products));
});

module.exports = router;
