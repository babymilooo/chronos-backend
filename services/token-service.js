const tokenModel = require("../models/token-model");
const jwt = require('jsonwebtoken');

class TokenService {
    async generateTokens(payload) {
        const accessToken = await jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
        const refreshToken = await jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        const activationToken = await jwt.sign(payload, process.env.JWT_ACTIVATION_SECRET, { expiresIn: '30m' });

        return {
            accessToken,
            refreshToken,
            activationToken
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

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({ refreshToken });
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({ refreshToken });
        return tokenData;
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    
}

module.exports = new TokenService();