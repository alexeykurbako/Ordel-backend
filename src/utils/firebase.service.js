const admin = require('firebase-admin');

const serviceAccount = require('../../config/firebase');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ordinga-54f81.firebaseio.com"
});
