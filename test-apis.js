require('dotenv').config({ path: './config/.env' });
const APIService = require('./services/API-service');

function countHolidaysByTypes(holidays) {
    const counts = {};

    holidays.forEach(holiday => {
        if (counts[holiday.type]) {
            counts[holiday.type]++;
        } else {
            counts[holiday.type] = 1;
        }
    });

    return counts;
}

async function main() {
    var lat = '31.509865';
    var lon = '-0.118092';

    let country = await APIService.getCountry(lat, lon);
    let holidays = await APIService.getHolidays("UA", "2024");

    // sort by date (Jan -> Dec)
    holidays.sort((a, b) => {
        let dateA = new Date(a.date);
        let dateB = new Date(b.date);
        return dateA - dateB;
    });

    console.log(country);
    console.log(holidays);

    const holidayCounts = countHolidaysByTypes(holidays);
    console.log('Holiday Counts by Type:', holidayCounts);
}

main().catch(console.error);
