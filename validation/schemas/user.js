const Joi = require('joi');
const { userId, email, password } = require('../helpers/common-schemas');

const userValidationSchemas = {
    getFriends: {
        GET: {
            params: Joi.object({
                id: userId,
            }),
        },
    },
    getUserById: {
        GET: {
            params: Joi.object({
                id: userId,
            }),
        },
    },
    getUsers: {
        GET: {
        },
    },
    addToFriends: {
        POST: {
            params: Joi.object({
                id: userId,
            }),
        },
    },
    isFriend: {
        GET: {
            params: Joi.object({
                id: userId,
            }),
        },
    },
    updateUserById: {
        PATCH: {
            params: Joi.object({
                id: userId,
            }),
            body: Joi.object({
                name: Joi.string().optional(),
                email: email.optional(),
                password: password.optional(),
                avatar: Joi.string().optional(),
            }).min(1),
        },
    },
    deleteUserById: {
        DELETE: {
            params: Joi.object({
                id: userId,
            }),
        },
    },
    updateProfilePassword: {
        PATCH: {
            params: Joi.object({
                id: userId,
            }),
            body: Joi.object({
                currentPassword: Joi.string().required(),
                newPassword: Joi.string().required(),
            }),
        },
    },
    changeAvatar: {
        PATCH: {
        },
    },
};

module.exports = userValidationSchemas;
