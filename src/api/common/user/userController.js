
const express = require('express');
const router = express.Router();
const adminGuard = require('../auth/aclService').adminGuard;

const UserService = require('./userService');

const userService = new UserService();

router.get('/users', (req, res) => {
  userService
    .list(req.query)
    .then(users => res.send(users));
});

router.get('/users/current', (req, res) => {
  userService
    .findById(req.user.id)
    .then(user => userService.mapUserToDto(user))
    .then(user => res.send(user))
});

router.put('/users/current', (req, res) => {
  userService
    .editCurrentUser(req.body)
    .then(user => res.send(user));
});

router.get('/users/:id', (req, res) => {
  userService
    .findById(req.params.id)
    .then(user => userService.mapUserToDto(user))
    .then(user => res.send(user));
});

router.delete('/:id', (req, res) => {
  userService
    .deleteUser(req.params.id)
    .then(() => res.send({ id: req.params.id }));
});

router.post('/users', (req, res) => {
  userService
    .addUser(req.body)
    .then(user => res.send(user))
    .catch(err => res.status(409).send({ error: err.message }));
});

router.put('/users/:id', (req, res) => {
  userService
    .editUser(req.body)
    .then(user => res.send(user))
    .catch(err => res.status(409).send({ error: err.message }));
});

router.get('/:userId/photo', (req, res) => {
  userService
    .getPhoto(req.params.userId)
    .then(photo => {
      res.set('Content-Type', 'image/png');
      res.send(photo);
    });
});

module.exports = router;
