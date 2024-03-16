require('dotenv').config();

const min = process.env.PASSWORD_MIN_LENGTH;
const max = process.env.PASSWORD_MAX_LENGTH;

const ValidationMessages = {
    email: 'Email must be a valid email address',
    required: field => `${field} is required`,
    confirmPasswordMatch: 'Passwords do not match',
    passwordLength: `Password must be between ${min} and ${max} characters long`,
    activationPasswordLength: `Activation password must be exactly ${process.env.ACTIVATION_PASSWORD_LENGTH} characters long`
};

module.exports = ValidationMessages;