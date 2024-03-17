require('dotenv').config();

const min = process.env.PASSWORD_MIN_LENGTH || 6;
const max = process.env.PASSWORD_MAX_LENGTH || 32;

const ValidationMessages = {
    email: 'Email must be a valid email address',
    required: field => `${field} is required`,
    confirmPasswordMatch: 'Passwords do not match',
    passwordLength: `Password must be between ${min} and ${max} characters long`,
    activationPasswordLength: `Activation password must be exactly ${process.env.ACTIVATION_PASSWORD_LENGTH || 8} characters long`,
    year: 'Year must be between 2000 and 2030',
};

module.exports = ValidationMessages;