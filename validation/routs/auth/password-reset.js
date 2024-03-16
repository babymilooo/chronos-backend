const Joi = require('joi');
const { password } = require('../../helpers/common-schemas');

const schema = {
    POST: {
        body: Joi.object({
            password,
        })
    }
};

module.exports = schema;