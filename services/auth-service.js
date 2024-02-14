const userModel = require("../models/user-model");
const bcrypt = require('bcrypt');
const tokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exeptions/api-error");
const EmailsService = require("./e-mail-service");
const { use } = require("../router/user-router");

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

        const candidate = await userModel.findOne({ email: email });

        if (candidate) {
            throw ApiError.BadRequest(`User exists`);
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
        const user = await userModel.create({ password: hashedPassword, email: email, username: username });
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        await EmailsService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${tokens.activationToken}`);

        return { ...tokens, user: userDto }
    }

    async login(email, password) {
        if (!email) {
            throw ApiError.BadRequest(`Email is not defined`);
        }

        if (!password) {
            throw ApiError.BadRequest(`Password is not defined`);
        }

        const user = await userModel.findOne({ email: email });

        if (!user) {
            throw ApiError.BadRequest(`User ${email} not registered`);
        }

        const isPassEquals = await bcrypt.compare(password, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest(`Incorrect password`);
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async regenerateToken(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }

        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }

        const user = await userModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }

    async activate(activationLink) {
        const userData = tokenService.validateActivationToken(activationLink);
        const { email } = userData;
        const user = await userModel.findOne({ email });

        if (!user) {
            throw ApiError.BadRequest(`Incorrect activation link`);
        }

        user.isActivated = true;
        await user.save();
    }
}

module.exports = new AuthService();