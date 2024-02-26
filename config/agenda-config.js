const Agenda = require('agenda');
const mongoose = require('mongoose');

const agenda = new Agenda({
    db: { address: process.env.DB_URL, collection: 'jobs' }
});

agenda.define('set-pending-password-update-to-false', async job => {
    const { email } = job.attrs.data;
    const UserModel = mongoose.model('User');
    await UserModel.findOneAndUpdate({ email }, { pendingPasswordUpdate: false });
    await job.remove();
});

const startAgenda = async () => {
    await agenda.start();
    console.log("Agenda started");
};

const stopAgenda = async () => {
    await agenda.stop();
    console.log("Agenda stopped");
};

const createSetPendingPasswordUpdateJob = async (email) => {
    await agenda.schedule(`in ${process.env.RESET_TOKEN_EXPIRATION_TIME} minutes`, 'set-pending-password-update-to-false', { email });
};

module.exports = {
    startAgenda,
    stopAgenda,
    createSetPendingPasswordUpdateJob
};