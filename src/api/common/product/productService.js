/*
 * Copyright (c) Akveo 2020. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const ProductRepository = require('./productRepository');
const helper = require('../../../utils/helper');
const ClientTypeEnum = require('../enum/clientType');


class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }

  listForCurrentType(type, user) {
    return this.repository.listForCurrentClient(user)
      .then(array => {
        let products = [];
        if (type === ClientTypeEnum.supplier) {
          products = array.filter(product => product.clientProducts
            .some(clientProduct => clientProduct.clientId.toString() === user.clientId));
        } else if (type === ClientTypeEnum.restaurant) {
          products = array.filter(product => product.clientProducts
            .every(clientProduct => clientProduct.clientId.toString() !== user.clientId));
        }

        return products.map(product => {
          const clientProducts = product.clientProducts.filter(clientProduct => {
            if (type === ClientTypeEnum.supplier) {
              return clientProduct.clientId.toString() === user.clientId;
            }
            return clientProduct.clientId.toString() !== user.clientId;
          });
          return {
            ...product,
            clientProducts,
          };
        });
      })
      .then(arr => helper.replaceAll(arr, '_id', 'id'));
  }
}

module.exports = ProductService;
