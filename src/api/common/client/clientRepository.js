/*
 * Copyright (c) Akveo 2020. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

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
