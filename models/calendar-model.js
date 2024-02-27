const { Schema, model } = require('mongoose');

const CalendarModel = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['default', 'custom'], required: true },
    description: { type: String, default: '' },
});

module.exports = model('Calendar', CalendarModel);