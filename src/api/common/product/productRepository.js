const { ObjectID } = require('mongodb');
const BaseRepository = require('../../../db/baseRepository');

class ProductRepository extends BaseRepository {
  constructor() {
    super('products');
  }

  findById(id) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .aggregate([
          { $match: { _id: ObjectID(id) } },
          { $limit: 1 },
        ])
        .toArray())
      .then(data => (data && data.length ? data[0] : data));
  }

  listForCurrentClient(user) {
    return this.dbClient
      .then(db => db.collection(this.collection)
        .aggregate([
          {
            $lookup: {
              from: 'product_item',
              localField: '_id',
              foreignField: 'productId',
              as: 'clientProducts',
            },
          },
        ])
        .toArray());
  }
}

module.exports = ProductRepository;
