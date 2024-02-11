// npm install --save-dev jest

const request = require('supertest');
const { app, stop } = require('../index');
require('dotenv').config({ path: '../config/.env' });

let token;

// 200 - OK for successful requests
// 400 - Bad Request for invalid data
// 401 - Unauthorized for incorrect credentials
// 403 - Forbidden for unauthorized access
// 404 - Not Found for missing resources
// 500 - Internal Server Error for unexpected server issues

// Registration Tests
describe('POST /api/auth/registration', () => {
    it('successfully registers a new user', async () => {
        const response = await request(app)
            .post('/api/auth/registration')
            .send({
                email: "testuser@example.com", // unique
                password: process.env.TEST_RESTfull_API_password
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(response.body).toHaveProperty('id');
    });

    it('fails to register a user with an existing email', async () => {
        await request(app)
            .post('/api/auth/registration')
            .send({
                email: process.env.TEST_RESTfull_API_email, // not unique
                password: process.env.TEST_RESTfull_API_password,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400);
    });
});

// Login Tests
describe('POST /api/auth/login', () => {
    it('responds with json and saves the token on successful login', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: process.env.TEST_RESTfull_API_email,
                password: process.env.TEST_RESTfull_API_password
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

        token = response.body.token;
        expect(token).toBeDefined();
    });

    it('fails to login with incorrect credentials', async () => {
        await request(app)
            .post('/api/auth/login')
            .send({
                email: process.env.TEST_RESTfull_API_email,
                password: "incorrectpassword"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401);
    });
});

// Logout Tests
describe('POST /api/auth/logout', () => {
    it('successfully logs out the user', async () => {
        await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    });
});

afterAll(async () => {
    await stop();
});
