const userModel = require('../models/user-model');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exeptions/api-error');

class userService {
    async getAllUsers() {
        const users = await userModel.find();
        const usersDto = users.map(user => new UserDto(user));
        return { users: usersDto };
    }
}

module.exports = new userService();