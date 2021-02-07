/*
 * Copyright (c) Akveo 2020. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const ClientsRepository = require('./clientRepository');
const helper = require('../../../utils/helper');

class ClientsService {
  constructor() {
    this.clientsRepository = new ClientsRepository();
  }

  getClientsByType(type) {
    return this.clientsRepository.getClientsByType(type).then(clients => {
      return helper.replaceAll(clients, '_id', 'id');
    });
  }
}

module.exports = ClientsService;
