const UserModel = require('../models/user-model');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exeptions/api-error');
const PasswordService = require('./password-services');
const FriendsModel = require('../models/friends-model');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/*
    { new: true } - return the modified document (after the update)
    { new: false } - return the original document (before the update)
*/

class UserService {
    async getAllUsers(id) {
        const users = await UserModel.find({ _id: { $ne: id } });
        const usersDto = users.map(user => new UserDto(user));
        return { users: usersDto };
    }

    async getUserById(id) {
        const user = await UserModel.findById(id);

        if (user.image === null) {
            user.image = 'default.png';
        }

        user.image = 'http://localhost:5001/api/user/avatar/' + user.image;
        return new UserDto(user);
    }

    async updateUserById(id, updateData, file) {
        if (file) {
            const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
            const fileName = `${hash}-${file.originalname}`;
            const filePath = path.join(__dirname, '..', 'uploads', 'avatars', fileName);

            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, file.buffer);

            updateData.image = fileName;
        }

        const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            throw ApiError.BadRequest(`User not found`);
        }
    
        return new UserDto(updatedUser);
    }

    async getAllFriends(userId, myID) {
        try {
            const friendships = await FriendsModel.find({
                $or: [{ user1: userId }, { user2: userId }]
            });
    
            const friendIds = friendships.map(friendship => 
                friendship.user1.toString() === userId ? friendship.user2 : friendship.user1
            );
    
            const friends = await UserModel.find({ _id: { $in: friendIds } });
    
            const friendsData = await Promise.all(friends.map(async (friend) => {
                const isFriend = await FriendsModel.findOne({
                    $or: [
                        { user1: myID, user2: friend._id },
                        { user1: friend._id, user2: myID }
                    ]
                });
    
                return {
                    id: friend._id,
                    name: friend.username,
                    image: friend.image ? `http://localhost:5001/api/user/avatar/${friend.image}` : 'http://localhost:5001/api/user/avatar/default.png',
                    isFriend: !!isFriend 
                };
            }));
    
            return friendsData;
        } catch (e) {
            throw ApiError.BadRequest('Error getting friends');
        }
    }

    async deleteUserById(id) {
        const login = user.login;
        await UserModel.findByIdAndDelete(id);
        return login;
    }

    async updateProfilePassword(id, oldPassword, newPassword) {
        const user = await UserModel.findById(id);
        const isPassEquals = await PasswordService.comparePasswords(oldPassword, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest('New password is the same as the old one');
        }

        const hashPassword = await PasswordService.hashPassword(newPassword);
        const updatedUser = await UserModel.findByIdAndUpdate(id, { password: hashPassword }, { new: true });
        return new UserDto(updatedUser);
    }

    async addFriend(userId, friendId) {
        try {
            if (userId === friendId) {
                throw ApiError.BadRequest('You cannot add yourself as a friend');
            }

            const friend = new FriendsModel({ user1: userId, user2: friendId });
            await friend.save();
            console.log('Added friend successfully');
        } catch (error) {
            console.error('Error adding friend:', error);
        }
    }

    async removeFriend(userId, friendId) {
        try {
            await FriendsModel.deleteOne({ $or: [
                { user1: userId, user2: friendId },
                { user1: friendId, user2: userId }
            ] });
            console.log('Removed friend successfully');
        } catch (error) {
            console.error('Error removing friend:', error);
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
            const friendData = await UserModel.find({ _id: { $in: friendIds } });

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