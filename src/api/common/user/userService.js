
const UserRepository = require('./userRepository');
const cipher = require('../auth/cipherHelper');

class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  getCount() {
    return this.repository.getCount();
  }

  findByEmail(email) {
    return this.repository.findByEmail(email);
  }

  findById(id) {
    return this.repository.findById(id)
  }

  addUser(user) {
    return this.repository.add(user);
  }

  addMany(users) {
    return this.repository.addMany(users);
  }

  editUser(dto) {
    const user = this.mapDtoToUser(dto);
    const userId = dto.id;

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
      role: user.role,
      age: user.age,
      login: user.login,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address || {},
      settings: settingService.mapSettingsToDto(this.getSettings(user.settings)),
    } : {};
  }

  getSettings(settings) {
    return settings && settings.length ? settings[0] : settings;
  }

  mapDtoToUser(dto) {
    return dto ? {
      email: dto.email,
      age: dto.age,
      role: dto.role,
      login: dto.login,
      firstName: dto.firstName,
      lastName: dto.lastName,
      address: dto.address,
    } : {};
  }
}

module.exports = UserService;
