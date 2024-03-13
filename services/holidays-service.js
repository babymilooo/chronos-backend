const ApiError = require("../exeptions/api-error");
const apiService = require("./API-service");
const countryIso = require("../models/iso-model");
const holidaysModel = require("../models/holidays-model");
const HolidayDTO = require("../dtos/holidays-dto");

class HolidaysService {
    async getHolidays(country, year, type='major_holiday') {
        const isoCodeDocument = await countryIso.findOne({ countryName: country });
        if (!isoCodeDocument) {
            // Если страна не найдена, запрос к API для получения праздников
            const holidaysFromApi = await apiService.getHolidays(country, year, type);
            if (holidaysFromApi.length > 0) {
                // Сохранение новой страны и ISO кода в базу данных
                const newIsoCodeDocument = await countryIso.create({ countryName: country, code: holidaysFromApi[0].iso });

                // Сохранение праздников в базу данных
                await holidaysModel.create({
                    isoCode: newIsoCodeDocument._id,
                    year: year,
                    holidays: holidaysFromApi.map(holiday => ({
                        name: holiday.name,
                        date: holiday.date,
                        day: holiday.day,
                        type: holiday.type
                    }))
                });

                // Отправка данных клиенту
                return holidaysFromApi;
            }
        } else {
            // Поиск праздников в базе данных по ISO коду и году
            const holidays = await holidaysModel.findOne({ isoCode: isoCodeDocument._id, year: year });
            if (!holidays || holidays.holidays.length === 0) {
                // Если праздники не найдены, запрос к API
                const holidaysFromApi = await apiService.getHolidays(country, year, type);

                // Сохранение праздников в базу данных
                await holidaysModel.create({
                    isoCode: isoCodeDocument._id,
                    year: year,
                    holidays: holidaysFromApi.map(holiday => ({
                        name: holiday.name,
                        date: holiday.date,
                        day: holiday.day,
                        type: holiday.type
                    }))
                });

                // Отправка данных клиенту
                return holidaysFromApi;
            } else {
                // Отправка существующих данных клиенту

                const holidaysDto = holidays.holidays.map(holiday => {
                    return new HolidayDTO({
                        country: country,
                        iso: isoCodeDocument.code,
                        year: year,
                        name: holiday.name,
                        date: holiday.date,
                        day: holiday.day,
                        type: holiday.type
                    });
                });

                return holidaysDto;
            }
        }
    }
}

module.exports = new HolidaysService();