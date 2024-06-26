module.exports = class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static UnauthorizedError() {
        return new ApiError(401, 'Unauthorized User');
    }

    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }

    static ForbiddenError(message, errors = []) {
        return new ApiError(403, message, errors);
    }

    static NotFound(message, errors = []) {
        return new ApiError(404, message, errors);
    }

    static InternalServerError(errors = []) {
        return new ApiError(500, "Internal Server Error", errors);
    }
}