require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRouter = require('./router/auth-router');
const userRouter = require('./router/user-router');
const errorMiddleware = require('./middlewares/error-middleware');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api/auth/', authRouter);
app.use('/api/user/', userRouter);
app.use(errorMiddleware);

let server;

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        server = app.listen(PORT, () => console.log(`Server is running on port http://127.0.0.1:${PORT}`));
    } catch (e) {
        console.error('Unable to connect to the database:', e);
    }
};

const stop = async () => {
    if (server) {
        server.close(() => {
            console.log('Server stopped');
            mongoose.disconnect();
        });
    } else {
        console.error('Server was not started or already stopped.');
    }
};

if (require.main === module) {
    start();
}

module.exports = { app, start, stop };
