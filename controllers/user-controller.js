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

    async getUserByUsername(req, res, next) {
        try {
            const { username } = req.params;
            const user = await userService.getUserByUsername(username);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async updateUserById(req, res, next) {
        try {
            const { id } = req.params;
            const { username, bio, email } = req.body;

            const user = await userService.updateProfileUsername(id, username);
            user = await userService.updateUserById(id, req.body);

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

    async updateProfileBio(req, res, next) {
        try {
            const { id } = req.params;
            const { bio } = req.body;
            const user = await userService.updateProfileBio(id, bio);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async updateProfileEmail(req, res, next) {
        try {
            const { id } = req.params;
            const { email } = req.body;
            const user = await userService.updateProfileEmail(id, email);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async updateProfileUsername(req, res, next) {
        try {
            const { id } = req.params;
            const { username } = req.body;
            const user = await userService.updateProfileUsername(id, username);
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

}

module.exports = new userController();