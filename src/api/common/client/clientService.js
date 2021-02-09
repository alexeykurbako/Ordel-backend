
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
