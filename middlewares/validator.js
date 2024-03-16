const { validation } = require('../validation/index');

async function validator(req, res, next) {
    let { route: { path }, baseUrl, method } = req;
    path = (baseUrl + path).replace('/api', '');

    try {
        await validation(path, method, req);
        next();
    } catch (e) {
        return next(e);
    }
}

module.exports = validator;