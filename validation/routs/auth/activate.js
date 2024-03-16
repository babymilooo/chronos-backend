const Joi = require('joi');
const { email, activationPassword } = require('../../helpers/common-schemas');

const schema = {
    POST: {
        body: Joi.object({
            email,
            activationPassword,
        })
    }
};

module.exports = schema;