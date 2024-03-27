const Joi = require('joi');
const { userId, email, password } = require('../helpers/common-schemas');

module.exports = {
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
        PUT: {
            body: Joi.object({
                username: Joi.string().min(3).max(30).required(),
                bio: Joi.string().min(3).max(100).required(),
            }),
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