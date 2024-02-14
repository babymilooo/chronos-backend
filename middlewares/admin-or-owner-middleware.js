const ownerMiddleware = require('./owner-middleware');

const adminOrOwnerMiddleware = (req, res, next) => {
    (req.user && req.user.isAdmin) ? next() : ownerMiddleware(req, res, next);
};

module.exports = adminOrOwnerMiddleware;