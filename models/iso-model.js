const { Schema, model } = require('mongoose');

const IsoModel = new Schema({
    code: { type: String, required: true, unique: true },
    countryName: { type: String, required: true }
});

module.exports = model('CountryIso', IsoModel);