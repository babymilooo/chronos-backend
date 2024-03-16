const Joi = require('joi');
const { email, password } = require('../../helpers/common-schemas');

const schema = {
    POST: {
        body: Joi.object({
            email,
            password,
        })
    }
};

module.exports = schema;