const tokenModel = require("../models/token-model");
const jwt = require('jsonwebtoken');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        // changed to temporaty password
        // const activationToken = jwt.sign(payload, process.env.JWT_ACTIVATION_SECRET, { expiresIn: '30m' });

        return {
            accessToken,
            refreshToken,
            // activationToken
        }
    }

    generateResetPasswordToken(email) {
        return jwt.sign({ email: email }, process.env.JWT_RESET_PASSWORD_SECRET, { expiresIn: `${process.env.RESET_TOKEN_EXPIRATION_TIME}m` });
    }

    async saveToken(userId, refreshToken) {
        try {
            const tokenData = await tokenModel.findOneAndUpdate(
                { user: userId },
                { refreshToken: refreshToken },
                { new: true }
            );
            if (tokenData) {
                return tokenData;
            }

            const token = await tokenModel.create({
                user: userId,
                refreshToken,
            });

            return token;
        } catch (error) {
            throw new Error('Database error: ' + error.message);
        }
    }

    async removeRefreshToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({ refreshToken });
        return tokenData;
    }

    async removeRefreshTokenByUserID(userID) {
        const tokenData = await tokenModel.deleteOne({ user: userID });
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

    validateResetPasswordToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateActivationToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACTIVATION_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }
}

module.exports = new TokenService();