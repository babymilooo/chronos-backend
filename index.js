require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/auth-router');
const errorMiddleware = require('./middlewares/error-middleware');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api', router);
app.use(errorMiddleware);

let server;

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        app.listen(PORT, () => console.log(`Server is running on port http://127.0.0.1:${PORT}`));
    } catch (e) {
        console.error('Unable to connect to the database:', e);
    }
}

const stop = () => {
    if (server) {
        server.close();
    } else {
        console.error('Server was not started or already stopped.');
    }
}

if (require.main === module) {
    start();
}

module.exports = { app, start, stop };
