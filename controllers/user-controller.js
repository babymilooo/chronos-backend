const userService = require("../services/user-service");
const path = require('path');
const fs = require('fs');
const ApiError = require("../exeptions/api-error");

class UserController {
    async getUsers(req, res, next) {
        try {
            const id = req.user.id;
            const users = await userService.getAllUsers(id);
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async getAvatar(req, res, next) {
        try {
            const { filename } = req.params;
            const filePath = path.join(__dirname, '..', 'uploads', 'avatars', filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).send('File not found');
            }

            res.sendFile(filePath);
        } catch (e) {
            next(e);
        }
    }

    async updateUserById(req, res, next) {
        try {
            const id = req.params.id;
            const { username, bio } = req.body;
            const updateData = { username, bio };
            const file = req.file;
            const updatedUser = await userService.updateUserById(id, updateData, file);
            return res.json(updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async getAllFriends(req, res, next) {
        try {
            const id = req.params.id;
            const myID = req.user.id;
            const friends = await userService.getAllFriends(id, myID);
            return res.json(friends);
        } catch (e) {
            next(e);
        }
    }

    async deleteUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userService.deleteUserById(id);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async updateProfilePassword(req, res, next) {
        try {
            const { id } = req.params;
            const { oldPassword, newPassword } = req.body;
            const user = await userService.updateProfilePassword(id, oldPassword, newPassword);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async addFriend(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            if (userId === id) {
                throw ApiError.BadRequest('You cannot add yourself as a friend');
            }

            const user = await userService.addFriend(userId, id);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async removeFriend(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const user = await userService.removeFriend(userId, id);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async getFriends(req, res, next) {
        try {
            const id = req.user.id;
            const friends = await userService.findAllPossibleFriends(id);
            return res.json(friends);
        } catch (e) {
            next(e);
        }
    }

    async isFriend(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const isFriend = await userService.isFriend(userId, id);
            return res.json(isFriend);
        } catch (e) {
            next(e);
        }
    }

    async getPotentialFriends(req, res, next) {
        try {
            const id = req.user.id;
            const potentialFriends = await userService.getPotentialFriends(id);
            return res.json(potentialFriends);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();