
// const { domain } = config.get('frontEnd');
// const config = require('config');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const ProductRepository = require('../api/common/product/productRepository');

class EmailService {
  constructor() {
    this.repository = new ProductRepository();
  }

  assembleMailText(order, customer) {
    return Promise.all(order.orderItems.map((orderItem, index) => {
      return this.repository.findById(orderItem.productId).then(prod => {
        return `\n${index + 1}. ${prod.name} x${orderItem.count}`;
      });
    })).then((values) => {
      const text = `You have the new order number  ${order.id} from customer ${customer.name}`
        + '\nOrder contains products:';
      return text.concat(values.join());
    });
  }

  notifySupplier(supplier, customer, order) {
    const transporter = nodemailer.createTransport({
      service: 'Mail.ru',
      auth: {
        user: 'testmailordinga@mail.ru',
        pass: 'Ordinga12321',
      },
    });

    const mailOptions = {
      from: 'testmailordinga@mail.ru',
      to: supplier.email,
      subject: `New order number ${order.id}`,
      text: '',
    };
    this.assembleMailText(order, customer).then(value => {
      mailOptions.text = value;
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new Error(`Error during email sending: ${error}`);
        } else {
          logger.log(`Email was sent to  ${supplier.email}. Info: ${info.response}`);
        }
      });
    });
  }

  // doSend(email, text) {
  //   logger.info(text);
  //   return Promise.resolve(true);
  // }
  //
  // sendResetPasswordEmail(email, fullName, token) {
  //   const text = `Hello ${fullName},`
  //     + '\nWe have received password reset request. '
  //     + `To do this, please proceed at ${domain}/#/auth/reset-password?reset_password_token=${token}`
  //     + '\nIf it wasn\'t you, take no action or contact support.'
  //     + '\n\nThank you,'
  //     + '\nSupport team.';
  //
  //   return doSend(email, text);
  // }
}

module.exports = EmailService
