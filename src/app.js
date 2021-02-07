/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const express = require('express');
const cors = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');
const config = require('config');
const https = require('https');
const fs = require('fs');
const logger = require('./utils/logger');
require('./passport');
require('./utils/firebase.service');

// common controllers
const authController = require('./api/common/auth/authController');
const userController = require('./api/common/user/userController');
const productsController = require('./api/common/product/productController');
const clientsController = require('./api/common/client/clientController');
const orderController = require('./api/common/order/orderController');
const deviceController = require('./api/common/device/deviceController');


const app = express();
const { port, root } = config.get('api');

function logErrors(err, req, res, next) {
  logger.error(err);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something went wrong.' });
  } else {
    next(err);
  }
}

app.use(cors());
app.use(bodyParser.json());

const auth = passport.authenticate('jwt', { session: false });

app.use(`${root}/:type`, (req, res, next) => {
  app.use(`${root}`, authController);
  app.use(`${root}/:type`, auth, clientsController);
  app.use(`${root}/:type`, auth, productsController);
  app.use(`${root}/:type`, auth, orderController);
  app.use(`${root}/:type`, auth, userController);
  app.use(`${root}/:type`, auth, deviceController);
  next();
});

app.use(logErrors);
app.use(clientErrorHandler);

// const options = {
//   key: fs.readFileSync(`${__dirname}/sslcert/key.pem`, 'utf8'),
//   cert: fs.readFileSync(`${__dirname}/sslcert/server.crt`, 'utf8'),
// };
//
// const httpsServer = https.createServer(options, app);
//
// httpsServer.listen(process.env.PORT || 3001);

app.listen(process.env.PORT || 3001);

logger.info(`Server start listening port: ${port}`);
