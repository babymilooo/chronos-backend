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
        sms: { type: Boolean, default: false },
    },
    notificationTimeBefore: { 
        days: { type: Number, default: 0 },
        hours: { type: Number, default: 0 },
        minutes: { type: Number, default: 15 },
    },
    repeat: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
        default: 'daily',
        customDays: { type: [Number], default: [] }, // For custom repeat, array of days (0-6, Sunday-Saturday)
    },
    status: { type: String, enum: ['done', 'not done'], default: 'not done' },
    priority: { type: String, enum: ['not critical', 'low', 'medium', 'high'], default: 'not critical' },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    coOwners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = model('Event', EventModel);