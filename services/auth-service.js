const UserModel = require("../models/user-model");
const TokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exeptions/api-error");
const EmailsService = require("./e-mail-notifications/e-mail-service");
const PasswordService = require("./password-services");

const {
    jobResetActivationPasswordToNull,
    jobCancelPasswordPendingUpdateReset,
    jobResetPendingPasswordUpdateToFalse,
    jobCancelActivationPasswordReset,
    jobCancelAccoutDeletion
} = require('../config/agenda-config');

class AuthService {

    async registration(email, password, username) {
        if (!username) {
            console.error('Username is not defined, something wrong with api response');
            throw ApiError.InternalServerError('Sorry, something went wrong');
        }

        const candidate = await UserModel.findOne({ email: email });

        if (candidate) {
            console.error(`User with email: \'${email}\' exists`);
            throw ApiError.ForbiddenError(`User exists`);
        }

        const generatedPassword = PasswordService.generateTemporaryPassword(parseInt(process.env.ACTIVATION_PASSWORD_LENGTH || 8, 10));
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
        jobResetActivationPasswordToNull(email);

        return { ...tokens, user: userDto }
    }

    async requestPasswordResetLink(email) {
        try {
            const user = await UserModel.findOne({ email });

            if (!user) {
                console.error(`User with email: \'${email}\' not found`);
                throw ApiError.NotFound('User not found');
            }

            if (user.pendingPasswordUpdate) {
                console.error(`Link has been used to email: \'${email}\'. Please request a new link.`);
                throw ApiError.ForbiddenError(`Please, use old link or request a new link no often each ${process.env.RESET_TOKEN_EXPIRATION_TIME || 60} minutes`);
            }
            
            const resetToken = TokenService.generateResetPasswordToken(email);
            await UserModel.findOneAndUpdate({ email }, { pendingPasswordUpdate: true });
            await EmailsService.sendPasswordResetMail(email, `${process.env.API_URL}/api/auth/password-reset/${resetToken}`);
            jobResetPendingPasswordUpdateToFalse(email);
            return { message: 'A password reset link has been sent to your email' };
        } catch (error) {
            throw error;
        }
    }

    async changePassword(newPassword, token) {
        try {
            if (!TokenService.validateResetPasswordToken(token)) {
                console.error('(password reset) Invalid token. Link has expired or is incorrect. Please request a new link.');
                throw ApiError.ForbiddenError('Invalid token. Link has expired or is incorrect. Please request a new link.');
            }

            const email = TokenService.validateResetPasswordToken(token).email;
            const user = await UserModel.findOne({ email });

            if (!user) {
                console.error(`(password reset) User with email: \'${email}\' not found`);
                throw ApiError.NotFound('User not found');
            }

            if (user.pendingPasswordUpdate) {
                console.error(`(password reset) Link for user \'${user}\' has been used or expired. Please request a new link.`);
                throw ApiError.BadRequest('Link has been used or expired. Please request a new link.');
            }

            const hashedPassword = await PasswordService.hashPassword(newPassword);
            await UserModel.findOneAndUpdate({ email }, { pendingPasswordUpdate: true });
            await UserModel.update({ password: hashedPassword }, { where: { id: user.id } });
            jobCancelPasswordPendingUpdateReset(email);
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            console.error(`(login) User with email: \'${email}\' not registered`);
            throw ApiError.NotFound(`User with email: \'${email}\' not registered`);
        }

        const isPassEquals = await PasswordService.comparePasswords(password, user.password);

        if (!isPassEquals) {
            console.error(`(login) Incorrect password for user with email: \'${email}\'`);
            throw ApiError.ForbiddenError(`Incorrect password`);
        }

        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });

        jobCancelAccoutDeletion(email);
        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        await this.updateLastActive(userDto.id);

        return { ...tokens, user: userDto }
    }

    async logout(refreshToken) {
        const token = await TokenService.removeRefreshToken(refreshToken);
        return token;
    }

    async regenerateToken(refreshToken) {
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await TokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            console.error('(token regeneration) Invalid refresh token');
            throw ApiError.UnauthorizedError();
        }

        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });

        await TokenService.removeRefreshTokenByUserID(userDto.id);
        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }

    async activate(email, activationPassword) {
        const user = await UserModel.findOne({ email });

        if (!user) {
            console.error(`(account activation) User with email: \'${email}\' not found`);
            throw ApiError.NotFound(`User with email: \'${email}\' not found`);
        }

        if (user.isActivated) {
            console.error(`(account activation) User with email: \'${email}\' is already activated`);
            throw ApiError.ForbiddenError(`User with email: \'${email}\' is already activated`);
        }

        if (!(await PasswordService.comparePasswords(activationPassword, user.activationPassword))) {
            console.error(`(account activation) Incorrect activation password for user: \'${email}\'`);
            throw ApiError.ForbiddenError(`Incorrect activation password`);
        }

        user.activationPassword = null;
        user.isActivated = true;
        jobCancelActivationPasswordReset(email);

        await user.save();
    }

    async renewActivationCode(email) {
        const user = await UserModel.findOne({ email });

        if (!user) {
            console.error(`(renew activation code) User with email: \'${email}\' not found`);
            throw ApiError.NotFound(`User with email: \'${email}\' not found`);
        }

        const generatedPassword = PasswordService.generateTemporaryPassword(parseInt(process.env.ACTIVATION_PASSWORD_LENGTH || 8, 10));
        const hashedGeneratedPassword = await PasswordService.hashPassword(generatedPassword);
        user.activationPassword = hashedGeneratedPassword;

        await user.save();
        await EmailsService.sendActivationMail(email, generatedPassword);
        jobResetActivationPasswordToNull(email);

        return { message: 'A new activation code has been sent to your email' };
    }

    async updateLastActive(userId) {
        await UserModel.findByIdAndUpdate(userId, { lastActive: new Date() });
    }

}

module.exports = new AuthService();