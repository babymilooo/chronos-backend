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
    addFriend: {
        POST: {
            params: Joi.object({
                id: userId,
            }),
        },
    },
    removeFriend: {
        DELETE: {
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
            body: Joi.object({
                id: userId,
                username: Joi.string().optional(),
                bio: Joi.string().optional(),
                password: password.optional(),
                image: Joi.string().optional(),
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
};

module.exports = userValidationSchemas;
