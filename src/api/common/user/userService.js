const UserRepository = require('./userRepository');
const cipher = require('../auth/cipherHelper');
const { ObjectID } = require('mongodb');

const CLIENT_ID = "5e33e587531bf029f0a8f539";

class UserService {
    constructor() {
        this.repository = new UserRepository();
    }

    getCount() {
        return this.repository.getCount();
    }

    findByEmailWithClient(email) {
        return this.repository.findByEmailWithClient(email);
    }

    findByEmail(email) {
        return this.repository.findByEmail(email);
    }

    findById(id) {
        return this.repository.findById(id)
    }

    addUser(user) {
        const email = user.email;

        return this.findByEmailWithClient(email)
            .then(u => {
                if (u && u.client) {
                    throw new Error('User already exists');
                }

                const {salt, passwordHash} = cipher.saltHashPassword(user.password);
                const newUser = {
                    email: user.email,
                    login: user.login,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    clientId: ObjectID(CLIENT_ID),
                    salt,
                    passwordHash,
                };

                return this.repository.add(newUser);
            })
            .then(response => {
                if (response.result.ok === 1) {
                    return this.findByEmail(email);
                }
            })
    }

    addMany(users) {
        return this.repository.addMany(users);
    }



    editUser(dto) {
        const user = this.mapDtoToUser(dto);
        const userId = dto.id ? dto.id : dto._id;
        // return this.repository.edit(userId, user)
        //     .then(() => {
        //         return this.findById(userId);
        //     });

        return this.repository.findAllUsersByEmail(user.email)
            .then((users) => {
                if (this._isDuplicateEmail(users, userId)) {
                    throw Error('Email already exists');
                }

                return this.repository.edit(userId, user);
            })
            .then(() => this.findById(userId))
            .catch(error => {
                throw error;
            });
    }

    editCurrentUser(dto) {
        return this.editUser(dto)
            .then(user => {
                return cipher.generateResponseTokens(user);
            })
    }

    deleteUser(id) {
        return this.repository.delete(id);
    }

    changePassword(id, salt, passwordHash) {
        return this.repository.changePassword(id, salt, passwordHash);
    }

    getPhoto(userId) {
        return this.repository.getPhoto(userId);
    }

    list(filter) {
        return Promise.all([
            this.repository.listFiltered(filter),
            this.repository.getCountFiltered(filter),
        ])
            .then(([data, count]) => {
                return data.map(item => this.mapUserToDto(item))
            });
    }

    mapUserToDto(user) {
        return user ? {
            id: user._id,
            email: user.email,
            login: user.login,
            firstName: user.firstName,
            lastName: user.lastName,
            clientId: user.clientId
        } : {};
    }

    mapDtoToUser(dto) {
        return dto ? {
            email: dto.email,
            login: dto.login,
            firstName: dto.firstName,
            lastName: dto.lastName,
            clientId: ObjectID(dto.clientId),
        } : {};
    }

    _isDuplicateEmail(users, userId) {
        if (users && users.length === 0) {
            return false;
        }

        if (users.length > 1) {
            return true;
        }

        return users.some(user => user._id.toString() !== userId.toString());
    }
}

module.exports = UserService;
