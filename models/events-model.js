const { Schema, model } = require('mongoose');

const EventModel = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: { type: String, enum: ['arrangement', 'reminder', 'task'], required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    notification: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false }
    },
    repeat: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
        default: 'daily',
        customDays: { type: [Number], default: [] } // For custom repeat, array of days (0-6, Sunday-Saturday)
    },
    status: {
        type: String,
        enum: ['done', 'not done'],
        default: 'not done'
    },
    priority: {
        type: String,
        enum: ['not critical', 'low', 'medium', 'high'],
        default: 'not critical'
    }
});

module.exports = model('Event', EventModel);
