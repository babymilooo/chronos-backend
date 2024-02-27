const { Schema, model } = require('mongoose');

const HolidaysModel = new Schema({
    isoCode: { type: Schema.Types.ObjectId, ref: 'CountryIso', required: true },
    year: { type: Number, required: true },
    holidays: [{
        name: { type: String, required: true },
        date: { type: String, required: true },
        day: { type: String, required: true },
        type: { type: String, required: true }
    }]
});

module.exports = model('Holidays', HolidaysModel);