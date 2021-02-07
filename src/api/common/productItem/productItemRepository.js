/*
 * Copyright (c) Akveo 2020. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const { ObjectID } = require('mongodb');
const BaseRepository = require('../../../db/baseRepository');

class ProductItemRepository extends BaseRepository {
  constructor() {
    super('product_item');
  }

  getProductItemsByClientIdAndProductId(clientId, productId) {
    return this.dbClient
      .then(db => db.collection(this.collection)
        .aggregate([
          {
            $match: {
              $and: [
                { clientId: ObjectID(clientId) },
                { productId: ObjectID(productId) },
              ],
            },
          },
        ])
        .toArray());
  }
}

module.exports = ProductItemRepository;
