const userService = require("../services/user-service");

class UserController {
    async registration(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {

        } catch (error) {

        }
    }

    async logout(req, res, next) {
        try {

        } catch (error) {

        }
    }

    async refresh(req, res, next) {
        try {

        } catch (error) {

        }
    }


}

module.exports = new UserController();