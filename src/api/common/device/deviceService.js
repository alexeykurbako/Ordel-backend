
const admin = require('firebase-admin');

const DeviceRepository = require('./deviceRepository');

class DeviceService {
  constructor() {
    this.repository = new DeviceRepository();
  }

  registerDevice(token, clientId) {
    return this.repository.registerDevice(token, clientId);
  }

  sendPushNotification(clientId, notification = {}, data = {}) {
    const payload = {
      notification,
      data,
    };

    return this.repository.getDevises(clientId)
      .then(devices => {
        const tokens = devices.map(item => item.token);
        const message = {
          ...payload,
          tokens: tokens,
        };

        admin.messaging().sendMulticast(message)
          .then((response) => {
            console.log(response.successCount + ' messages were sent successfully');

            if (response.failureCount > 0) {
              const failedTokens = [];

              response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                  failedTokens.push(tokens[idx]);
                }
              });

              console.log('List of tokens that caused failures: ' + failedTokens);
            }
          });
      });
  }
}

module.exports = DeviceService;
