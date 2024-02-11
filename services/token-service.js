const tokenModel = require("../models/token-model");
const jwt = require('jsonwebtoken');
class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({ where: { user: userId } });
        if (tokenData) {
            tokenData.token = refreshToken;
            return tokenData.save();
        }
        try {
            const token = await tokenModel.create({
                user: userId,
                refreshToken,
            });

            return token;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }
}

module.exports = new TokenService();