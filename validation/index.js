const authSchemas = require('./schemas/auth.js');
const eventSchemas = require('./schemas/event.js');
const holidaySchemas = require('./schemas/holiday.js');
const userSchemas = require('./schemas/user.js');

const schemas = {    
    // Auth routes
    '/auth/activate': authSchemas.activate,
    '/auth/get-password-reset-link': authSchemas.getPasswordResetLink,
    '/auth/login': authSchemas.login,
    // '/auth/logout': authSchemas.logout,
    '/auth/password-reset': authSchemas.passwordReset,
    // '/auth/refresh': authSchemas.refresh,
    '/auth/registration': authSchemas.registration,
    '/auth/renew-activation-code': authSchemas.renewActivationCode,

    // Event routes
    '/events/event/:id': eventSchemas.getEventById,
    '/events/yearly': eventSchemas.getYearlyEventsForUser,
    '/events': eventSchemas.createEvent,
    '/events/update/:id': eventSchemas.updateEventById,
    '/events/delete/:id': eventSchemas.deleteEventById,

    // Holiday (Calendar) routes
    '/holidays': holidaySchemas.getHolidays,

    // User routes
    '/users/friends': userSchemas.getFriends,
    '/users/:id': userSchemas.getUserById,
    '/users': userSchemas.getUsers,
    '/users/addtofriend/:id': userSchemas.addToFriends,
    '/users/:id/isfriend': userSchemas.isFriend,
    '/users/update/:id': userSchemas.updateUserById,
    '/users/delete/:id': userSchemas.deleteUserById,
    '/users/update/:id/password': userSchemas.updateProfilePassword,
};

const validation = async (path, method, req) => {
    const schema = schemas[path][method];

    if (!schema) {
        console.error(`No schema defined for ${path} with method ${method}`);
        return;
    }

    for (let key in schema) {
        const data = req[key];
        const result = await schema[key].validateAsync(data, { dateFormat: 'date' });
        req[key] = result;
    }
};

module.exports = { validation, schemas };