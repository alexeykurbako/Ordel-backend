
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
