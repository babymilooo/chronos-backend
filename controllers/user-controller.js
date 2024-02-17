const userService = require("../services/user-service");

class userController {
    async getUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
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
}

module.exports = new userController();