/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const passport = require('passport');
// const refresh = require('passport-oauth2-refresh')
const LocalStrategy = require('passport-local').Strategy;
// const OAuth2Strategy = require('passport-oauth2');
// const OAuth2RefreshTokenStrategy = require('passport-oauth2-middleware').Strategy;
const passportJWT = require('passport-jwt');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const config = require('config');

const cipher = require('./api/common/auth/cipherHelper');
const UserService = require('./api/common/user/userService');

const userService = new UserService();

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
},
(req, email, password, cb) => {
  userService
    .findByEmail(email)
    .then(user => {
      const { passwordHash } = cipher.sha512(password, user.salt);

      if (!user || user.passwordHash !== passwordHash || user.client.type !== req.params.type) {
        return cb(null, false, { message: 'Incorrect utils or password.' });
      }

      return cb(null, { id: user._id, clientId: user.clientId, name: `${user.firstName} ${user.lastName}` },
        { message: 'Logged In Successfully' });
    })
    .catch(() => cb(null, false, { message: 'Incorrect utils or password.' }));
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get('auth.jwt.accessTokenSecret'),
  passReqToCallback: true,
},
(req, jwtPayload, cb) => {
  req.clientType = req.params.type;
  if (jwtPayload) {
    userService.findById(jwtPayload.id)
      .then(user => {
        if (req.clientType !== user.client.type) {
          // throw new Error('Wrong user type');
        }
      });
  }

  return cb(null, jwtPayload);
}));
