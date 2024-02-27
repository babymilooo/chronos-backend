const ApiError = require("../exeptions/api-error");
const apiService = require("./api-service");
const countryIso = require("../models/iso-model");
const holidaysModel = require("../models/holidays-model");
const HolidayDTO = require("../dtos/holidays-dto");
class HolidaysService {
    async getHolidays(country, year, type) {
        const isoCodeDocument = await countryIso.findOne({ countryName: country });
        console.log(isoCodeDocument);
        if (!isoCodeDocument) {
            // Если страна не найдена, запрос к API для получения праздников
            const holidaysFromApi = await apiService.getHolidays(country, year, type);
            console.log(holidaysFromApi);
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
                console.log("sending from api");
                return holidaysFromApi;
            }
        } else {
            // Поиск праздников в базе данных по ISO коду и году
            const holidays = await holidaysModel.findOne({ isoCode: isoCodeDocument._id, year: year, type: type });

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
                        description: holiday.type
                    }))
                });

                // Отправка данных клиенту
                console.log("sending from api");
                return holidaysFromApi;
            } else {
                // Отправка существующих данных клиенту
                console.log("sending from db");
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