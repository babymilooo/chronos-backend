const UserModel = require('../models/user-model');
const ApiError = require("../exeptions/api-error");

const accountIsActivatedMiddleware = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            throw ApiError.BadRequest(`User ${email} not registered`);
        }

        if (!user.isActivated) {
            throw ApiError.BadRequest(`Account is not activated`);
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = accountIsActivatedMiddleware;