const ApiError = require('../exeptions/api-error');

module.exports = function (err, req, res, next) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message });
    } else if (err.isJoi) {
        const message = err.details[0].message;
        return res.status(400).json({ message });
    }

    return res.status(500).json({ message: 'Server error' });
};
