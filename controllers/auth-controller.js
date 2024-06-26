const AuthService = require("../services/auth-service");
const APIService = require("../services/api-service");

class AuthController {
    async registration(req, res, next) {
        try {
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
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const { email, activationPassword } = req.body;
            console.log(email, activationPassword);
            await AuthService.activate(email, activationPassword);
            return res.status(200).json({ message: 'Account has been activated' });
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

module.exports = new AuthController();