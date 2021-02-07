/*
 * Copyright (c) Akveo 2020. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
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
