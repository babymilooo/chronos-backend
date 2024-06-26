const ApiError = require("../exeptions/api-error");
const eventService = require("../services/event-service");

class EventController {
    async getEventById(req, res, next) {
        try {
            const { id } = req.params;
            const event = await eventService.getEventById(id);
            return res.json(event);
        } catch (e) {
            next(e);
        }
    }

    async getYearlyEventsForUser(req, res, next) {
        try {
            const { year } = req.query;
            const { id } = req.user;
            if (!year) {
                throw ApiError.BadRequest('Year is not defined');
            }
            const events = await eventService.getYearlyEventsForUser(id, year);
            return res.json(events);
        } catch (e) {
            next(e);
        }
    }

    async createEvent(req, res, next) {
        try {
            const { title, startDate, endDate, startTime, endTime, eventType, repeat, priority, coOwners, attendees, description, user } = req.body;
            console.log(req.body)
            const event = await eventService.createEvent({ title, startDate, endDate, startTime, endTime, eventType, repeat, priority, coOwners, attendees, description, user });
            return res.json(event);
        } catch (e) {
            next(e);
        }
    }

    async updateEventById(req, res, next) {
        try {
            const { id } = req.params;
            const newEventData = req.body;
            const event = await eventService.updateEventById(id, newEventData);
            return res.json(event);
        } catch (e) {
            next(e);
        }
    }

    async deleteEventById(req, res, next) {
        try {
            const { id } = req.params;
            const event = await eventService.deleteEventById(id);
            return res.status(200);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new EventController();