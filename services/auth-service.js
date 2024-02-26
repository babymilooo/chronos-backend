const UserModel = require("../models/user-model");
const TokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exeptions/api-error");
const EmailsService = require("./e-mail-service");
const PasswordService = require("./password-services");
const { createSetPendingPasswordUpdateJob } = require('../config/agenda-config');

class AuthService {

    async registration(email, password, username) {
        if (!email) {
            throw ApiError.BadRequest(`Email is not defined`);
        }

        if (!password) {
            throw ApiError.BadRequest(`Password is not defined`);
        }

        if (!username) {
            throw ApiError.BadRequest(`Username is not defined`);
        }

        const candidate = await UserModel.findOne({ email: email });

        if (candidate) {
            throw ApiError.BadRequest(`User exists`);
        }

        const generatedPassword = PasswordService.generateTemporaryPassword(8);
        const hashedPassword = await PasswordService.hashPassword(password);
        const hashedGeneratedPassword = await PasswordService.hashPassword(generatedPassword);
        const user = await UserModel.create({
            password: hashedPassword,
            email: email,
            username: username,
            activationPassword: hashedGeneratedPassword
        });
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });
        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        await EmailsService.sendActivationMail(email, generatedPassword); //`${process.env.API_URL}/api/activate/${tokens.activationToken}`);

        return { ...tokens, user: userDto }
    }

    async requestPasswordResetLink(email) {
        try {
            if (!email) {
                throw ApiError.BadRequest('Email is not defined');
            }

            const user = await UserModel.findOne({ email });

            if (!user) {
                throw ApiError.BadRequest('User not found');
            }

            if (user.pendingPasswordUpdate) {
                throw ApiError.BadRequest(`Please, use old link or request a new link no often each ${process.env.RESET_TOKEN_EXPIRATION_TIME} minutes`);
            }
            
            const resetToken = TokenService.generateResetPasswordToken(email);
            await UserModel.findOneAndUpdate({ email }, { pendingPasswordUpdate: true });
            await EmailsService.sendPasswordResetMail(email, `${process.env.API_URL}/api/auth/password-reset/${resetToken}`);
            createSetPendingPasswordUpdateJob(email);
            return { message: 'A password reset link has been sent to your email' };
        } catch (error) {
            throw error;
        }
    }

    async changePassword(newPassword, token) {
        try {
            if (!token) {
                throw ApiError.BadRequest('Token is not defined');
            }

            if (!newPassword) {
                throw ApiError.BadRequest('New password is not defined');
            }

            if (!TokenService.validateResetPasswordToken(token)) {
                throw ApiError.BadRequest('Invalid token. Link has expired or is incorrect. Please request a new link.');
            }

            const email = TokenService.validateResetPasswordToken(token).email;
            const user = await UserModel.findOne({ email });

            if (!user) {
                throw ApiError.BadRequest('User not found');
            }

            if (user.pendingPasswordUpdate) {
                throw ApiError.BadRequest('Link has been used. Please request a new link.');
            }

            const hashedPassword = await PasswordService.hashPassword(newPassword);
            await UserModel.findOneAndUpdate({ email }, { pendingPasswordUpdate: true });
            await UserModel.update({ password: hashedPassword }, { where: { id: user.id } });
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        if (!email) {
            throw ApiError.BadRequest(`Email is not defined`);
        }

        if (!password) {
            throw ApiError.BadRequest(`Password is not defined`);
        }

        const user = await UserModel.findOne({ email: email });

        if (!user) {
            throw ApiError.BadRequest(`User ${email} not registered`);
        }

        const isPassEquals = await PasswordService.comparePasswords(password, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest(`Incorrect password`);
        }

        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });

        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }

    async logout(refreshToken) {
        const token = await TokenService.removeToken(refreshToken);
        return token;
    }

    async regenerateToken(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });

        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }

    async activate(email, activationPassword) {
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw ApiError.BadRequest(`User ${email} not found`);
        }

        if (!(await PasswordService.comparePasswords(activationPassword, user.activationPassword))) {
            throw ApiError.BadRequest(`Incorrect activation password`);
        }

        user.isActivated = true;
        await user.save();
    }

    async renewActivationCode(email) {
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw ApiError.BadRequest(`User ${email} not found`);
        }

        const generatedPassword = PasswordService.generateTemporaryPassword(8);
        const hashedGeneratedPassword = await PasswordService.hashPassword(generatedPassword);
        user.activationPassword = hashedGeneratedPassword;
        await user.save();
        await EmailsService.sendActivationMail(email, generatedPassword);

        return { message: 'A new activation code has been sent to your email' };
    }
}

module.exports = new AuthService();