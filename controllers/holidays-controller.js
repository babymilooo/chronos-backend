const ApiError = require("../exeptions/api-error");
const holidaysService = require("../services/holidays-service");

class HolidaysController {
    async getHolidays(req, res, next) {
        try {
            const { country, year, type } = req.body;
            if (!country || !year) {
                throw ApiError.BadRequest('Country or year is not defined');
            }
            const holidays = await holidaysService.getHolidays(country, year, type);
            return res.json(holidays);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new HolidaysController();