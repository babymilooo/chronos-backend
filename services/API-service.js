const request = require('request');
const util = require('util');
const axios = require('axios');

const requestGet = util.promisify(request.get);

class APIService {

    async getCountry(latitude, longitude) {
        try {
            const response = await requestGet({
                url: 'https://api.api-ninjas.com/v1/reversegeocoding?lat=' + latitude + '&lon=' + longitude,
                headers: {
                    'X-Api-Key': process.env.API_KEY
                },
            });
            return JSON.parse(response.body);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getHolidays(country, year, type='major_holiday') {
        try {
            const response = await requestGet({
                url: 'https://api.api-ninjas.com/v1/holidays?country=' + country + '&year=' + year + '&type=' + type,
                headers: {
                    'X-Api-Key': process.env.API_KEY
                },
            });
            return JSON.parse(response.body);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getTimeZone(latitude, longitude) {
        const response = await axios.get(`https://timeapi.io/api/Time/current/coordinate?latitude=${latitude}&longitude=${longitude}`);
        return response.data;
    }

    async getRandomUsername() {
        try {
            const response = await requestGet({
                url: 'https://api.namefake.com/'
            });
            const username = JSON.parse(response.body).username;
            return username;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

module.exports = new APIService();
