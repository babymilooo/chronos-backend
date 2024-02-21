const { validationResult } = require("express-validator");
const AuthService = require("../services/auth-service");
const ApiError = require("../exeptions/api-error");
const APIService = require("../services/api-service");

class authController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Validation error', errors.array()));
            }
            const { email, password } = req.body;
            const username = await APIService.getRandomUsername();
            const userData = await AuthService.registration(email, password, username);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await AuthService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await AuthService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await AuthService.regenerateToken(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const { email, activationPassword } = req.body;
            await AuthService.activate(email, activationPassword);
            return res.redirect(process.env.CLIENT_URL); // TODO: ensure that redirection works
        } catch (e) {
            next(e);
        }
    }

    async renewActivationCode(req, res, next) {
        try {
            const { email } = req.body;
            await AuthService.renewActivationCode(email);
            return res.json({ message: 'A new activation code has been sent to your email' });
        } catch (error) {
            next(error);
        }
    }

    async requestPasswordResetLink(req, res, next) {
        try {
            const { email } = req.body;
            await AuthService.requestPasswordResetLink(email);
            return res.json({ message: 'Password reset link has been sent to your email' });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { password } = req.body;
            const token = req.params.link;
            await AuthService.changePassword(password, token);
            return res.json({ message: 'Password has been changed' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new authController();