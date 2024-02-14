const ownerMiddleware = async (req, res, next) => {
    try {
        const userId = req.params.id || req.body.id;
        if (req.user && (req.user.id === userId || req.user.isAdmin)) {
            next();
        } else {
            throw new Error();
        }
    } catch (error) {
        res.status(403).send({ error: 'Access denied. Only the account owner or admins can perform this action.' });
    }
};

module.exports = ownerMiddleware;