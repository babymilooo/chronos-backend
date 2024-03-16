const Joi = require('joi');
const Messages = require('./validation-messages');

const CommonSchemas = {
    email: Joi.string().email().required().messages({
        'string.email': Messages.email,
        'any.required': Messages.required('Email'),
    }),
    password: Joi.string().min(6).max(32).required().messages({
        'string.min': Messages.passwordLength,
        'string.max': Messages.passwordLength,
        'any.required': Messages.required('Password'),
    }),
    confirmationPassword: Joi.string().required().valid(Joi.ref('password')).messages({
        'any.only': Messages.confirmPasswordMatch,
        'any.required': Messages.required('Confirmation password'),
    }),
    activationPassword: Joi.string().length(parseInt(process.env.ACTIVATION_PASSWORD_LENGTH, 10)).required().messages({
        'string.length': Messages.activationPasswordLength,
        'any.required': Messages.required('Activation password')
    }),
    refreshToken: Joi.string().required().messages({
        'any.required': Messages.required('Refresh token'),
    }),
};

module.exports = CommonSchemas;