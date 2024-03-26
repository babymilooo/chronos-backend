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

    async createEvent({ startDate, endDate, startTime, endTime, title, user, coOwners = [], attendees = [] }) {
        console.log(startDate, endDate, startTime, endTime, title, user, coOwners, attendees);
        // Проверка входных данных
        if (!startTime || !endTime || !title || !user) {
            ApiError.BadRequest('All fields are required');
        }

        // Найти или создать календарь для даты и пользователя
        const createCalendarForUser = async (userId, date) => {
            let calendar = await calendarModel.findOne({ userId, date });
            if (!calendar) {
                calendar = new calendarModel({ userId, date, type: 'default' });
                await calendar.save();
            }
            console.log("calendar", calendar);
            return calendar;
        };

        const createEventForDate = async (date) => {
            console.log(date);
            console.log(startTime, endTime);
            const calendar = await createCalendarForUser(user, date);
            try {
                const event = new Event({
                    title,
                    startTime: new Date(`${date}T${startTime}`),
                    endTime: new Date(`${date}T${endTime}`),
                    user: user,
                    calendarId: calendar._id,
                    eventType: 'arrangement',
                    coOwners,
                    followers: attendees
                });
                console.log(event);
                await event.save();
                return event;
            }
            catch (e) {
                console.error(e);
            }
        };

        function getDatesInRange(startDate, endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            let dates = [];

            while (start <= end) {
                dates.push(new Date(start));
                start.setDate(start.getDate() + 1);
            }
            console.log(dates);
            return dates.map(date => date.toISOString().split('T')[0]);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log("dife", diffDays);
        let events = [];
        if (diffDays === 0) {
            // Если даты одинаковые, создаем одно событие
            events.push(await createEventForDate(startDate));
        } else {
            // Если даты разные, создаем событие для каждого дня
            for (let i = 0; i <= diffDays; i++) {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                events.push(await createEventForDate(date.toISOString().split('T')[0]));
            }
        }

        // Создание календаря для основного пользователя
        // const userCalendar = await createCalendarForUser(user, date);

        // Создать новое событие
        // const eventUniqueId = uuid.v4();
        // const event = new Event({
        //     title,
        //     startTime: new Date(`${date}T${startTime}`),
        //     endTime: new Date(`${date}T${endTime}`),
        //     creator: user,
        //     calendarId: userCalendar._id,
        //     uniqueId: eventUniqueId,
        //     eventType: 'arrangement',
        //     user,
        //     coOwners,
        //     followers: attendees
        // });

        // await event.save();

        // if (coOwners.length > 0 || attendees.length > 0) {
        //     const createCalendarsAndEventsForUsers = async (users, date) => {
        //         const userIds = Object.values(users);
        //         console.log(userIds);
        //         const promises = userIds.map(async (userId) => {
        //             const calendar = await createCalendarForUser(userId, date);

        //             const event = new Event({
        //                 title,
        //                 startTime: new Date(`${date}T${startTime}`),
        //                 endTime: new Date(`${date}T${endTime}`),
        //                 creator: user, // Создатель события
        //                 calendarId: calendar._id,
        //                 uniqueId: eventUniqueId,
        //                 eventType: 'arrangement',
        //                 user: userId, // ID пользователя, который будет совладельцем или приглашенным
        //                 coOwners: coOwners.includes(userId) ? [user, userId] : [user], // Если пользователь является совладельцем, то добавляем его и создателя события в список совладельцев
        //                 followers: attendees.includes(userId) ? [user, userId] : [user] // Если пользователь является приглашенным, то добавляем его и создателя события в список приглашенных
        //             });
        //             await event.save();
        //         });
        //         await Promise.all(promises);
        //     };

        //     await createCalendarsAndEventsForUsers(coOwners.concat(attendees), date);
        // }

        if (coOwners.length > 0 || attendees.length > 0) {
            const createCalendarsAndEventsForUsers = async (users, dates) => {
                for (const date of dates) {
                    const promises = users.map(async (userId) => {
                        const calendarId = await createCalendarForUser(userId, date);

                        const event = new Event({
                            title,
                            startTime: new Date(`${date}T${startTime}`),
                            endTime: new Date(`${date}T${endTime}`),
                            creator: user,
                            calendarId,
                            eventType: 'arrangement',
                            coOwners: coOwners.includes(userId) ? [user, userId] : [user],
                            followers: attendees.includes(userId) ? [user, userId] : [user]
                        });
                        await event.save();
                    });
                    await Promise.all(promises);
                }
            };

            const dates = getDatesInRange(startDate, endDate);
            await createCalendarsAndEventsForUsers(coOwners.concat(attendees), dates);
        }

        console.log(events);
        return events;
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