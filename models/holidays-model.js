const { Schema, model } = require('mongoose');

const HolidaysModel = new Schema({
    year: { type: Number, required: true },
    country: { type: String, required: true },
    holidays: { type: Array, required: true },
})

module.exports = model('Holidays', HolidaysModel);