
const config = require('config');
const jwt = require('jsonwebtoken');
const UserService = require('../user/userService');
const cipher = require('./cipherHelper');
const { ObjectID } = require('mongodb');

class AuthService {
  constructor() {
    this.userService = new UserService();
  }

  register(user) {
    const email = user.email;

    return this.userService.findByEmailWithClient(email)
      .then(u => {
        if (u && u.client) {
          throw new Error('User already exists');
        }

        const { salt, passwordHash } = cipher.saltHashPassword(user.password);
        const newUser = {
          email: user.email,
          login: user.login,
          firstName: user.firstName,
          lastName: user.lastName,
          clientId: ObjectID(user.clientId),
          salt,
          passwordHash,
        };

        return this.userService.addUser(newUser);
      })
      .then(response => {
        if (response.result.ok === 1) {
          return this.userService.findByEmailWithClient(email);
        }
      });
  }

  resetPassword(password, confirmPassword, resetPasswordToken) {
    if (password.length < 4) {
      throw new Error('Password should be longer than 4 characters');
    }

    if (password !== confirmPassword) {
      throw new Error('Password and its confirmation do not match.');
    }

    const tokenContent = cipher.decipherResetPasswordToken(resetPasswordToken);
    if (new Date().getTime() > tokenContent.valid) {
      throw new Error('Reset password token has expired.');
    }

    const { salt, passwordHash } = cipher.saltHashPassword(password);

    return this.userService.changePassword(tokenContent.userId, salt, passwordHash);
  }

  refreshToken(token) {
    if (!token.access_token || !token.refresh_token) {
      throw new Error('Invalid token format');
    }

    const tokenContent = jwt.decode(token.refresh_token,
      config.get('auth.jwt.refreshTokenSecret'),
      { expiresIn: config.get('auth.jwt.refreshTokenLife') });

    return this.userService.findById(tokenContent.id)
      .then(user => {
        return cipher.generateResponseTokens(user);
      });
  }

  // requestPassword(email) {
  //   return this.userService
  //     .findByEmail(email)
  //     .then(user => {
  //       if (user) {
  //         const token = cipher.generateResetPasswordToken(user._id);
  //
  //         return emailService.sendResetPasswordEmail(email, user.fullName, token);
  //       }
  //       throw new Error('There is no defined email in the system.');
  //     });
  // }
}

module.exports = AuthService;
