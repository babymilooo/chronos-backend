const userService = require("../services/user-service");

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

    async updateUserById(req, res, next) {
        try {
            const { id } = req.params;
            const newUserData = req.body;

            const user = await userService.updateUserById(id, newUserData);

            return res.json(user);
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

    async changeAvatar(req, res, next) {
        try {
            const file = req.file;
            console.log(file);
            const fileUrl = `${req.protocol}://${req.get('host')}/${file.path}`;
            const userId = req.body.userId;
            console.log(userId);
            await userService.updateProfileImage(userId, fileUrl);
            return res.status(200).json({ profilePicture: fileUrl });
        } catch (e) {
            next(e);
        }
    }

    async addToFriend(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const user = await userService.addToFriend(userId, id);
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
}

module.exports = new UserController();