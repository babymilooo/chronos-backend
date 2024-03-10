const userModel = require('../models/user-model');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exeptions/api-error');
const PasswordService = require('./password-services');
const FriendsModel = require('../models/friends-model');
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

    async addToFriend(userId, friendId) {
        try {
            const friend = new FriendsModel({ user1: userId, user2: friendId });
            await friend.save();
            console.log('Added friend successfully');
        } catch (error) {
            console.error('Error adding friend:', error);
        }
    }

    async findAllPossibleFriends(id) {
        try {
            // Найти всех друзей, где user1 или user2 равны заданному идентификатору
            const friends = await FriendsModel.find({ $or: [{ user1: id }, { user2: id }] });

            // Собираем идентификаторы всех друзей
            const friendIds = friends.reduce((ids, friend) => {
                if (friend.user1.toString() !== id) {
                    ids.push(friend.user1);
                }
                if (friend.user2.toString() !== id) {
                    ids.push(friend.user2);
                }
                return ids;
            }, []);

            // Получаем данные всех друзей
            const friendData = await userModel.find({ _id: { $in: friendIds } });

            console.log('All possible friends:', friendData);

            const usersDto = friendData.map(friend => new UserDto(friend));
            return { users: usersDto };
        } catch (error) {
            console.error('Error finding all possible friends:', error);
            throw error;
        }
    }

    async isFriend(userId, friendId) {
        try {
            const friend = await FriendsModel.findOne({
                $or: [
                    { user1: userId, user2: friendId },
                    { user1: friendId, user2: userId }
                ]
            });

            return { isFriend: !!friend };
        } catch (error) {
            console.error('Error checking if user is friend:', error);
            throw error;
        }
    }
}

module.exports = new UserService();