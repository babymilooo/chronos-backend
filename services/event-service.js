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

    async createEvent({ title, startDate, endDate, startTime, endTime, eventType, repeat, priority, coOwners, attendees, description, user }) {
        console.log("createEvent", title, startDate, endDate, startTime, endTime, eventType, repeat, priority, coOwners, attendees, description, user)
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

        const createEventForDate = async (date, startDate, endDate) => {
            console.log(date);
            console.log(startTime, endTime);
            const calendar = await createCalendarForUser(user, date);
            try {
                const event = new Event({
                    title,
                    startTime: new Date(`${startDate}T${startTime}`),
                    endTime: new Date(`${endDate}T${endTime}`),
                    user: user,
                    calendarId: calendar._id,
                    eventType: eventType,
                    repeat: repeat,
                    priority: priority,
                    coOwners,
                    followers: attendees,
                    description
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

        // async function associateEventsWithCalendars(events, users) {
        //     // Получаем ID календарей для каждого пользователя
        //     const dates = getDatesInRange(startDate, endDate);
        //     let calendarIdsPerUser = [];
        //     for (const date of dates) {
        //         calendarIdsPerUser = await Promise.all(
        //             users.map(userId => createCalendarForUser(userId, date))
        //         );
        //     }
        //     // Развертываем массивы, чтобы получить один массив ID календарей
        //     const calendarIds = calendarIdsPerUser.map(calendar => calendar._id);

        //     // Связываем каждое событие с календарями
        //     for (const event of events) {
        //         await linkEventToCalendars(event._id, calendarIds);
        //     }
        // }

        // async function linkEventToCalendars(eventId, calendarIds) {
        //     try {

        //         for (const calendarId of calendarIds) {
        //             await calendarModel.findByIdAndUpdate(
        //                 calendarId._id,
        //                 { $push: { events: eventId } },
        //                 { new: true }
        //             );
        //         }
        //     } catch (error) {
        //         console.error('Failed to link event to calendars', error);
        //         throw error; // Вы можете выбросить ошибку, если что-то пошло не так
        //     }
        // }


        const mainCalendar = await createCalendarForUser(user, startDate);
        const mainEvent = await new Event({
            title,
            startTime: new Date(`${startDate}T${startTime}`),
            endTime: new Date(`${endDate}T${endTime}`),
            user: user,
            calendarId: mainCalendar._id,
            eventType: eventType,
            repeat: repeat,
            priority: priority,
            coOwners,
            followers: attendees,
            description
        }).save();

        const allUserIds = [user, ...coOwners, ...attendees];

        // Удаляем дубликаты идентификаторов пользователей
        const uniqueUserIds = [...new Set(allUserIds)];
        const dates = getDatesInRange(startDate, endDate);

        for (const date of dates) {
            const userCalendars = await Promise.all(
                uniqueUserIds.map(userId => createCalendarForUser(userId, date))
            );

            // Дублирование основного события в каждый календарь
            const duplicationPromises = userCalendars.map(async (userCalendar) => {
                // Если календарь принадлежит главному пользователю и это стартовая дата, дублирование не требуется
                if (userCalendar.userId.toString() === user.toString() && date === startDate) {
                    return;
                }

                // Дублируем событие
                return await new Event({
                    ...mainEvent.toObject(),
                    calendarId: userCalendar._id,
                    _id: undefined, // Сбросить ID для создания нового документа
                    isDuplicate: true, // Помечаем событие как дубликат
                    originalEvent: mainEvent._id // Связываем дубликат с основным событием
                }).save();
            });

            await Promise.all(duplicationPromises);
        }

        return mainEvent; // Возвращаем основное событие
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