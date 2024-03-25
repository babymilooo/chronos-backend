const ApiError = require('../exeptions/api-error');
const calendarModel = require('../models/calendar-model');
const eventsModel = require('../models/events-model');
const uuid = require('uuid');
const Event = require('../models/events-model');
class EventService {

    async getYearlyEventsForUser(userId, year) {
        if (!userId) {
            throw ApiError.BadRequest('User ID is not defined');
        }

        // Преобразование строки года в число, если оно передано в виде строки

        const numericYear = parseInt(year, 10);

        // Определение начала и конца года
        const startOfYear = new Date(numericYear, 0, 1);
        const endOfYear = new Date(numericYear + 1, 0, 1);

        // Поиск календарей пользователя за указанный год
        const calendars = await calendarModel.find({
            userId: userId,
            date: { $gte: startOfYear, $lt: endOfYear }
        });

        if (calendars.length === 0) {
            throw ApiError.NotFound(`No calendars found for the given user within the year ${year}`);
        }

        // Извлечение ID всех календарей пользователя за указанный год
        const calendarIds = calendars.map(calendar => calendar._id);

        // Поиск всех событий, связанных с календарями пользователя за указанный год
        const events = await eventsModel.find({
            $or: [
                { calendarId: { $in: calendarIds } }, // События пользователя
                { coOwners: userId }, // События, в которых пользователь является совладельцем
                { followers: userId } // События, в которых пользователь является приглашенным
            ]
        });

        return events;
    }

    async getEventById(eventId) {
        if (!eventId) {
            throw ApiError.BadRequest('Event ID is not defined');
        }
        const event = await eventsModel.findById(eventId);
        if (!event) {
            throw ApiError.NotFound(`Event with ID ${eventId} not found`);
        }
        return event;
    }

    async createEvent({ date, startTime, endTime, title, user, coOwners = [], attendees = [] }) {
        // Проверка входных данных
        if (!date || !startTime || !endTime || !title || !user) {
            ApiError.BadRequest('All fields are required');
        }

        // Найти или создать календарь для даты и пользователя
        const createCalendarForUser = async (userId, date) => {
            let calendar = await calendarModel.findOne({ userId, date });
            if (!calendar) {
                calendar = new calendarModel({ userId, date, type: 'default' });
                await calendar.save();
            }
            return calendar;
        };

        // Создание календаря для основного пользователя
        const userCalendar = await createCalendarForUser(user, date);

        // Создать новое событие
        const event = new Event({
            title,
            startTime: new Date(`${date}T${startTime}`),
            endTime: new Date(`${date}T${endTime}`),
            calendarId: userCalendar._id,
            eventType: 'arrangement',
            user,
            coOwners,
            followers: attendees
        });

        await event.save();

        if (coOwners.length > 0 || attendees.length > 0) {
            const createCalendarsAndEventsForUsers = async (users, date) => {
                const userIds = Object.values(users);
                console.log(userIds);
                const promises = userIds.map(async (userId) => {
                    const calendar = await createCalendarForUser(userId, date);

                    const event = new Event({
                        title,
                        startTime: new Date(`${date}T${startTime}`),
                        endTime: new Date(`${date}T${endTime}`),
                        calendarId: calendar._id,
                        eventType: 'arrangement',
                        user: userId,
                        coOwners: coOwners.includes(userId) ? [user, userId] : [user],
                        followers: attendees.includes(userId) ? [user, userId] : [user]
                    });
                    await event.save();
                });
                await Promise.all(promises);
            };

            await createCalendarsAndEventsForUsers(coOwners.concat(attendees), date);
        }

        return event;
    }

    async updateEventById(id, data) {
        const updatedEvent = await Event.findByIdAndUpdate(id, data, { new: true });
        if (!updatedEvent) {
            throw new Error('Event not found');
        }
        return { updatedEvent };
    }

    async deleteEventById(id) {
        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) {
            throw new Error('Event not found');
        }
        return { deletedEvent };
    }

}

module.exports = new EventService();