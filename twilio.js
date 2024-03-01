require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const testPhoneNumber1 = process.env.TEST_PHONE_NUMBER_1;
const testPhoneNumber2 = process.env.TEST_PHONE_NUMBER_2;
const numbersToMessage = [testPhoneNumber1, testPhoneNumber2];

numbersToMessage.forEach(function(number) {
    client.messages.create({
        body: 'Test notification from Chronos. Please, ignore it.',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: number
    })
    .then(message => console.log(message.status))
    .catch(error => console.error(error));
});
