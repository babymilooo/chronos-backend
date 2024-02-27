module.exports = class HolidayDTO {
    country;
    iso;
    year;
    date;
    day;
    name;
    type;

    constructor(holiday) {
        this.country = holiday.country;
        this.iso = holiday.iso;
        this.year = holiday.year;
        this.date = holiday.date;
        this.day = holiday.day;
        this.name = holiday.name;
        this.type = holiday.type;
    }
}
