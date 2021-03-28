const UserRepository = require('./userRepository');
const cipher = require('../auth/cipherHelper');
const { ObjectID } = require('mongodb');

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
                    clientId: ObjectID(user.clientId),
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
        const userId = dto._id;

        return this.repository.edit(userId, user)
            .then(() => {
                return this.findById(userId);
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
                return {
                    items: data.map(item => this.mapUserToDto(item)),
                    totalCount: count,
                };
            });
    }

    mapUserToDto(user) {
        return user ? {
            id: user._id,
            email: user.email,
            login: user.login,
            firstName: user.firstName,
            lastName: user.lastName,
            clientId: ObjectID(user.clientId)
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
}

module.exports = UserService;
