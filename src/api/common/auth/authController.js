/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
const express = require('express');

const router = express.Router();
const passport = require('passport');
const cipher = require('../auth/cipherHelper');
const AuthService = require('./authService');

const authService = new AuthService();

router.post('/:type/auth/login', (req, res) => {

  passport.authenticate('local', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).send({
        error: err ? err.message : 'Login or password is wrong',
      });
    }
    req.login(user, { session: false }, (error) => {
      if (error) {
        res.send(error);
      }

      const response = {
        token: {
          ...user,
          ...cipher.generateResponseTokens(user),
        },
      };

      res.send(response);
    });
  })(req, res);
});

router.post('/:type/auth/sign-up', (req, res) => {
  authService
    .register(req.body)
    .then(user => {
      const response = {
        token: {
          ...user,
          ...cipher.generateResponseTokens(user),
        },
      };
      res.send(response);
    })
    .catch(err => res.status(400).send({ error: err.message }));
});

router.post('/:type/auth/reset-pass', (req, res) => {
  const { password, confirmPassword, resetPasswordToken } = req.body;
  authService
    .resetPassword(password, confirmPassword, resetPasswordToken)
    .then(() => res.send({ message: 'ok' }))
    .catch(err => res.status(400).send({ error: err.message }));
});

router.post('/:type/auth/request-pass', (req, res) => {
  const { email } = req.body;
  authService
    .requestPassword(email)
    .then(() => res.send({ message: `Email with reset password instructions was sent to email ${email}.` }));
});

router.post('/:type/auth/sign-out', (req, res) => {
  res.send({ message: 'ok' });
});

router.post('/:type/auth/refresh-token', (req, res) => {
  const token = req.body;
  authService
    .refreshToken(token)
    .then(tokens => res.send(tokens))
    .catch(err => res.status(400).send({ error: err.message }));
});

module.exports = router;
