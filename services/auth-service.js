const UserModel = require("../models/user-model");
const TokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exeptions/api-error");
const EmailsService = require("./e-mail-service");
const { use } = require("../router/user-router");
const PasswordService = require("./password-services");
const PasswordServices = require("./password-services");

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

            const resetToken = TokenService.generateResetPasswordToken(email);
            // TODO: pending update set to true and create a job to set it to false after 10 minutes
            await UserModel.findOneAndUpdate({ email }, { pendingPasswordUpdate: true });
            await EmailsService.sendPasswordResetMail(email, `${process.env.API_URL}/api/auth/password-reset/${resetToken}`);
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
            const oldPasswordHash = TokenService.validateResetPasswordToken(token).password;
            const user = await UserModel.findOne({ email });

            if (!user) {
                throw ApiError.BadRequest('User not found');
            }

            // here comparePasswords used to compare token with hashed token from db
            if (await PasswordService.comparePasswords(token, user.hashedResetPasswordToken)) {
                throw ApiError.BadRequest('This link is incorrect or has already been used. Please request a new link.');
            }

            if (await PasswordService.comparePasswords(newPassword, oldPasswordHash)) {
                throw ApiError.BadRequest('New password is the same as the old one');
            }

            const hashedPassword = await PasswordService.hashPassword(newPassword);
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

        if (await PasswordServices.comparePasswords(activationPassword, user.activationPassword)) {
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