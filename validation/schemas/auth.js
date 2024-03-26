const Joi = require('joi');
const { email, password, activationPassword, refreshToken } = require('../helpers/common-schemas');

module.exports = {
    activate: {
        POST: {
            body: Joi.object({
                email,
                activationPassword,
            }),
        },
    },
    getPasswordResetLink: {
        POST: {
            body: Joi.object({
                email,
            }),
        },
    },
    login: {
        POST: {
            body: Joi.object({
                email,
                password,
            }),
        },
    },
    passwordReset: {
        POST: {
            body: Joi.object({
                password,
            }),
        },
    },
    refreshToken: {
        GET: {
            cookies: Joi.object({
                refreshToken,
            }),
        },
    },
    registration: {
        POST: {
            body: Joi.object({
                email,
                password,
            }),
        },
    },
    renewActivationCode: {
        POST: {
            body: Joi.object({
                email,
            }),
        },
    },
};