
const { ObjectID } = require('mongodb');
const BaseRepository = require('../../../db/baseRepository');

class OrderItemRepository extends BaseRepository {
  constructor() {
    super('order_item');
  }

}

module.exports = OrderItemRepository;
