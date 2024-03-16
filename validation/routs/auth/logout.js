const Joi = require('joi');
const { refreshToken } = require('../../helpers/common-schemas');

const schema = {
    GET: {
        cookie: Joi.object({
            refreshToken,
        }).unknown()
    }
};

module.exports = schema;