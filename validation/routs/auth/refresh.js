const Joi = require('joi');
const { refreshToken } = require('../../helpers/common-schemas');

const schema = {
    POST: {
        body: Joi.object({
            refreshToken,
        })
    }
};

module.exports = schema;