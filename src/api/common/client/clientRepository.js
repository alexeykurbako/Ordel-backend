

const BaseRepository = require('../../../db/baseRepository');

class ClientsRepository extends BaseRepository {
  constructor() {
    super('clients');
  }

  getClientsByType(type) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .find(type).toArray());
  }

  getClientsById(clientId) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .findOne({ _id: clientId }));
  }
}

module.exports = ClientsRepository;
