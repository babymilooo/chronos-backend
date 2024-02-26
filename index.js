require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { startAgenda, stopAgenda } = require('./config/agenda-config');
const authRouter = require('./router/auth-router');
const userRouter = require('./router/user-router');
const errorMiddleware = require('./middlewares/error-middleware');
const eventRouter = require('./router/events-router');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api/auth/', authRouter);
app.use('/api', userRouter);
app.use('/api', eventRouter);
app.use(errorMiddleware);

let server;

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Database connected");
        await startAgenda();
        server = app.listen(PORT, () => console.log(`Server is running on port http://127.0.0.1:${PORT}`));  
    } catch (error) {
        console.error("Failed to connect to the database or start the server", error);
    }
};

const stop = async () => {
    if (server) {
        await stopAgenda();
        server.close(async () => {
            console.log('Server stopped');
            await mongoose.disconnect().then(() => {
                console.log('MongoDB disconnected');
            });
        });
    } else {
        console.error('Server was not started or already stopped.');
    }
};

if (require.main === module) {
    start();
}

module.exports = { app, start, stop };
