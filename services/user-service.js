const userModel = require("../models/user-model");
const bcrypt = require('bcrypt');
const tokenService = require("./token-service");
const UserDto = require("../dtos/user-dto");
const ApiError = require("../exeptions/api-error");

class UserService {
    async registration(email, password) {
        const candidate = await userModel.findOne({ email: email });
        if (candidate) {
            throw ApiError.BadRequest(`User exists`);
        }

        const hashedPassword = await bcrypt.hash(password, 6);
        const user = await userModel.create({ password: hashedPassword, email });
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return { ...tokens, user: userDto }
    }
}

module.exports = new UserService();