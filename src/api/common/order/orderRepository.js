const { ObjectID } = require('mongodb');

const BaseRepository = require('../../../db/baseRepository');
const ClientTypeEnum = require('../enum/clientType');


class OrderRepository extends BaseRepository {
  constructor() {
    super('orders');
  }

  findOrdersByClientTypeAndId(type, clientId) {
    const match$ = type === ClientTypeEnum.supplier
      ? { $match: { supplierId: ObjectID(clientId) } }
      : { $match: { customerId: ObjectID(clientId) } };
    return this.dbClient
      .then(db => {
        const clientsCollection = db.collection(this.collection);
        return clientsCollection.aggregate([
          match$,
          {
            $lookup: {
              from: 'order_item',
              localField: '_id',
              foreignField: 'orderId',
              as: 'orderItems',
            },
          },
          {
            $lookup: {
              from: 'product_item',
              localField: 'orderItems.productItemId',
              foreignField: '_id',
              as: 'productItems',
            },
          },

        ]).toArray();
      });
  }
}

module.exports = OrderRepository;
