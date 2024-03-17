const Joi = require('joi');
const {
    date,
    eventId,
    title,
    description,
    location,
    year,
    userId,
    startTime,
    endTime,
    coOwnerId,
    attendeeId,
} = require('../helpers/common-schemas');

module.exports = {
    getEventById: {
        GET: {
            params: Joi.object({
                id: eventId,
            }),
        },
    },
    events: {
        GET: {
            query: Joi.object({
                year,
                id: userId,
            }),
        },
        POST: {
            body: Joi.object({
                title,
                description,
                date,
                location,
                startTime,
                endTime,
                user: userId,
                coOwners: Joi.array().items(coOwnerId).optional(),
                attendees: Joi.array().items(attendeeId).optional(),
            }),
        },
    },
    updateEventById: {
        PATCH: {
            params: Joi.object({
                id: eventId,
            }),
            body: Joi.object({
                title: title.optional(),
                description,
                date,
                location,
                startTime,
                endTime,
                coOwners: Joi.array().items(coOwnerId).optional(),
                attendees: Joi.array().items(attendeeId).optional(),
            }).min(1),
        },
    },
    deleteEventById: {
        DELETE: {
            params: Joi.object({
                id: eventId,
            }),
        },
    },
};