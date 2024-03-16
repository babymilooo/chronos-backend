const Joi = require('joi');
const { email, password, confirmationPassword } = require('../../helpers/common-schemas');

const schema = {
    POST: {
        body: Joi.object({
            email,
            password,
            confirmationPassword,
        })
    }
};

module.exports = schema;