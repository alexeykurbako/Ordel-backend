

const BaseRepository = require('../../../db/baseRepository');

class DeviceRepository extends BaseRepository {
  constructor() {
    super('devices');
  }

  _checkIfDeviceExist(token, clientId) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .findOne({ token, clientId }));
  }

  registerDevice(token, clientId) {
    return this._checkIfDeviceExist(token, clientId)
      .then((item) => {
        if (item) {
          return Promise.resolve();
        }

        return this.add({ token, clientId });
      });
  }

  getDevises(clientId) {
    return this.dbClient
      .then(db => db
        .collection(this.collection)
        .find({ clientId: clientId.toString() }).toArray());
  }
}

module.exports = DeviceRepository;
