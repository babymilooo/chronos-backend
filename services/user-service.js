const userModel = require('../models/user-model');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exeptions/api-error');
const PasswordService = require('./password-services');

/*
    { new: true } - return the modified document (after the update)
    { new: false } - return the original document (before the update)
*/

class UserService {
    async getAllUsers(id) {
        const users = await userModel.find({ _id: { $ne: id } });
        const usersDto = users.map(user => new UserDto(user));
        return { users: usersDto };
    }

    async getUserById(id) {
        if (!id) {
            throw ApiError.BadRequest('Id is not defined');
        }

        const user = await userModel.findById(id);
        return new UserDto(user);
    }

    async updateUserById(id, data) {
        const updatedUser = await userModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });

        if (!updatedUser) {
            throw ApiError.BadRequest(`User not found`);
        };

        const userDto = new UserDto(updatedUser);
        return { updatedUser: userDto };
    }

    async deleteUserById(id) {
        if (!id) {
            throw ApiError.BadRequest('Id is not defined');
        }

        const login = user.login;
        await userModel.findByIdAndDelete(id);
        return login;
    }

    async updateProfilePassword(id, oldPassword, newPassword) {
        if (!id) {
            throw ApiError.BadRequest('Id is not defined');
        }

        if (!password) {
            throw ApiError.BadRequest('Password is not defined');
        }

        if (password.length < process.env.PASSWORD_MIN_LENGTH) {
            throw ApiError.BadRequest('Password is too short');
        }

        const user = await userModel.findById(id);
        const isPassEquals = await PasswordService.comparePasswords(oldPassword, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest('New password is the same as the old one');
        }

        const hashPassword = await PasswordService.hashPassword(newPassword);
        const updatedUser = await userModel.findByIdAndUpdate(id, { password: hashPassword }, { new: true });
        return new UserDto(updatedUser);
    }

    async updateProfileImage(userId, fileUrl) {
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { profilePicture: fileUrl },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw ApiError.BadRequest(`User not found`);
        };

        const userDto = new UserDto(updatedUser);
        return { updatedUser: userDto };
    }
}

module.exports = new UserService();