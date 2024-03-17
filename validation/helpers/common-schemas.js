const Joi = require('joi');
const Messages = require('./validation-messages');

const CommonSchemas = {
    // Auth
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
    activationPassword: Joi.string().length(parseInt(process.env.ACTIVATION_PASSWORD_LENGTH || 8, 10)).required().messages({
        'string.length': Messages.activationPasswordLength,
        'any.required': Messages.required('Activation password')
    }),
    refreshToken: Joi.string().required().messages({
        'any.required': Messages.required('Refresh token'),
    }),

    // Event
    userId: Joi.string().required().messages({
        'any.required': Messages.required('User ID'),
    }),
    eventId: Joi.string().required().messages({
        'any.required': Messages.required('Event ID'),
    }),
    date: Joi.date().required().messages({
        'any.required': Messages.required('Date'),
    }),
    title: Joi.string().required().messages({
        'any.required': Messages.required('Title'),
    }),
    year: Joi.number().integer().min(2000).max(2030).required().messages({
        'number.integer': Messages.year,
        'number.min': Messages.year,
        'number.max': Messages.year,
        'any.required': Messages.required('Year'),
    }),
    startTime: Joi.date().required().messages({
        'any.required': Messages.required('Start time'),
    }),
    endTime: Joi.date().required().messages({
        'any.required': Messages.required('End time'),
    }),
    coOwnerId: Joi.string().required().messages({
        'any.required': Messages.required('Co-owner ID'),
    }),
    attendeeId: Joi.string().required().messages({
        'any.required': Messages.required('Attendee ID'),
    }),
    description: Joi.string().optional(),
    location: Joi.string().optional(),
};

module.exports = CommonSchemas;