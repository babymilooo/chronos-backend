const Joi = require('joi');
const { year } = require('../helpers/common-schemas');

module.exports = {
    getHolidays: {
        GET: {
            query: Joi.object({
                year,
            }),
        },
    },
};