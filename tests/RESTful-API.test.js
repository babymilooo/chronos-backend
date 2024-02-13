const { app, start, stop } = require('../index');
const request = require('supertest');
require('dotenv').config({ path: '../config/.env' });

let token;

describe('POST /api/auth/registration', () => {
    it('successfully registers a new user', async () => {
        const response = await request(app)
            .post('/api/auth/registration')
            .send({
                email: "unique4.email@example.com",
                password: "securepassword"
            });
        console.log(response.body);
        expect(response.statusCode).toBe(200);
    });

    it('user exists', async () => {
        const response = await request(app)
            .post('/api/auth/registration')
            .send({
                email: "unique1.email@example.com",
                password: "securepassword"
            });
        console.log(response.body);
        expect(response.statusCode).toBe(400);
    });
});

beforeAll(async () => {
    await start();
});

afterAll(async () => {
    await stop();
});
