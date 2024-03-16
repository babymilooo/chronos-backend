const schemas = {
    // auth
    '/auth/activate': require('./routs/auth/activate'),
    '/auth/get-password-reset-link': require('./routs/auth/get-password-reset-link'),
    '/auth/login': require('./routs/auth/login'),
    // '/auth/logout': require('./routs/auth/logout'),
    '/auth/password-reset': require('./routs/auth/password-reset'),
    // '/auth/refresh': require('./routs/auth/refresh'),
    '/auth/registration': require('./routs/auth/registration'),
    '/auth/renew-activation-code': require('./routs/auth/renew-activation-code'),

    // events
    // holidays
    // user
};

const validation = async (path, method, req) => {
    const schema = schemas[path][method];

    for (let key in schema) {
        const data = req[key];
        const result = await schema[key].validateAsync(data, { dateFormat: 'date' });
        req[key] = result;
    }
};

module.exports = { validation, schemas };