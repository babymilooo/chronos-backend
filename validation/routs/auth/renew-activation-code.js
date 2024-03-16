const Joi = require('joi');
const { email } = require('../../helpers/common-schemas');

const schema = {
    POST: {
        body: Joi.object({
            email,
        })
    }
};

module.exports = schema;