const OrderRepository = require('./orderRepository');
const ProductItemRepository = require('../productItem/productItemRepository');
const ClientRepository = require('../client/clientRepository');
const OrderItemRepository = require('../orderItem/orderItemRepository');
const DeviceService = require('../device/deviceService');
const { ObjectID } = require('mongodb');
const helper = require('../../../utils/helper');
const EmailService = require('../../../utils/emailService');

const orderStatusEnum = require('../enum/statusEnum');

class OrderService {
  constructor() {
    this.repository = new OrderRepository();
    this.productItemRepository = new ProductItemRepository();
    this.orderItemRepository = new OrderItemRepository();
    this.emailService = new EmailService();
    this.clientRepository = new ClientRepository();
    this.deviceService = new DeviceService();
  }

  compare(firstOrder, secondOrder) {
    const firstOrderStatus = orderStatusEnum.getStatusPriority(firstOrder.status);
    const secondOrderStatus = orderStatusEnum.getStatusPriority(secondOrder.status);
    const firstDate = new Date(firstOrder.date);
    const secondDate = new Date(secondOrder.date);
    if (firstOrderStatus < secondOrderStatus || (firstOrderStatus === secondOrderStatus && firstDate > secondDate)) {
      return -1;
    }
    if (firstOrderStatus > secondOrderStatus || (firstOrderStatus === secondOrderStatus && firstDate < secondDate)) {
      return 1;
    }
    return 0;
  }

  getOrdersByClientTypeAndId(type, clientId) {
    return this.repository.findOrdersByClientTypeAndId(type, clientId)
      .then(orders => {
        return orders.map(order => {
          return {
            id: order._id,
            customerId: order.customerId,
            supplierId: order.supplierId,
            date: order.date,
            status: order.status,
            orderItems: order.orderItems.map((item, index) => {
              return {
                productId: order.productItems[index].productId,
                count: item.count,
              };
            }),
          };
        });
      })
      .then(arr => arr.sort(this.compare));
  }

  updateOrderStatus(id, status) {
    return this.findById(id)
      .then(order => {
        order.status = status;
        this.repository.edit(id, order);

        return order;
      })
      .then((order) => {
        return this.clientRepository.getClientsById(order.supplierId)
          .then(supplier => {
            const notification = {
              title: 'Order status was changed',
              body: `Supplier ${supplier.name} has changed order status to ${order.status}`
            };
            const data = {
              title: 'Order status was changed',
              body: `Supplier ${supplier.name} has changed order status to ${order.status}`
            };

            return this.deviceService.sendPushNotification(order.customerId, notification, data);
          })
          .then(() => order);
      });
  }

  findById(id) {
    return this.repository.findById(id);
  }

  addOrders(orders) {
    orders.forEach((order) => {
      const orderElement = {
        customerId: ObjectID(order.customerId),
        supplierId: ObjectID(order.supplierId),
        date: order.date,
        status: order.status,
      };
      this.repository.add(orderElement)
        .then(insertedOrder => {
          order.orderItems.forEach(orderItem => {
            this.productItemRepository.getProductItemsByClientIdAndProductId(order.supplierId, orderItem.productId)
              .then(productItems => {
                productItems.forEach(productItem => {
                  const newOrderItem = {
                    orderId: insertedOrder.insertedId,
                    productItemId: productItem._id,
                    count: orderItem.count,
                  };
                  this.orderItemRepository.add(newOrderItem);
                });
              });
          });
          order.id = insertedOrder.insertedId;
          Promise.all([
            this.clientRepository.findById(order.supplierId),
            this.clientRepository.findById(order.customerId),
          ])
            // .then(([supplier, customer]) => this.emailService.notifySupplier(supplier, customer, order));
        });
    }, orders);
    return Promise.resolve({ message: 'ok' });
  }
}

module.exports = OrderService;
