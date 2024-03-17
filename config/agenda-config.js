const Agenda = require('agenda');
const mongoose = require('mongoose');
const EmailsService = require('../services/e-mail-notifications/e-mail-service');

const agenda = new Agenda({
    db: { address: process.env.DB_URL, collection: 'jobs' }
});

agenda.define('set-pending-password-update-to-false', async job => {
    const { email } = job.attrs.data;
    const UserModel = mongoose.model('User');
    await UserModel.findOneAndUpdate({ email }, { pendingPasswordUpdate: false });
    await job.remove();
});

agenda.define('clear-activation-password', async job => {
    const { email } = job.attrs.data;
    const UserModel = mongoose.model('User');
    await UserModel.findOneAndUpdate({ email }, { activationPassword: null });
    await job.remove();
});

agenda.define('delete-inactive-user', async job => {
    const UserModel = mongoose.model('User');
    const TokenModel = mongoose.model('Token');
    const CalendarModel = mongoose.model('Calendar');
    const EventModel = mongoose.model('Event');

    const { email } = job.attrs.data;
    const user = await UserModel.findOne({ email });
    
    // Delete events and then calendar
    const calendars = await CalendarModel.find({ userId: user._id });
    const calendarIds = calendars.map(calendar => calendar._id);
    await EventModel.deleteMany({ calendarId: { $in: calendarIds } });
    await CalendarModel.deleteMany({ userId: user._id });

    // Delete token & user
    await TokenModel.deleteOne({ user: user._id });
    await UserModel.deleteOne({ email });

    await EmailsService.sendDeletionNotice(email);
    console.log(`User ${email} deleted due to inactivity.`);
    await job.remove();
});

agenda.define('check-inactive-users-notify-and-delete', async job => {
    const UserModel = mongoose.model('User');
    const now = new Date();

    const notificateDays = [30, 14, 7, 3, 2, 1, 0];
    const underWarning = process.env.INACTIVE_USER_DELETION_DAYS || 365;
    const millisecondsDay = 1000 * 60 * 60 * 24;

    // $lt: less than
    // $gt: greater than
    const usersToNotify = await UserModel.find({
        lastActive: { 
            $lt: new Date(now - (millisecondsDay * (underWarning - notificateDays[0]))) 
        }
    });

    for (const user of usersToNotify) {
        const daysUntilDeletion = underWarning - Math.trunc((now - user.lastActive) / millisecondsDay);
        console.log(`User ${user.email} will be deleted in ${daysUntilDeletion} days`);
        const finalTime = new Date(user.lastActive.getTime() + (millisecondsDay * underWarning));
        
        if (!(daysUntilDeletion in notificateDays)) {
            continue;
        }

        // Check if the final time is valid
        if (finalTime instanceof Date && !isNaN(finalTime)) {
            // Check if job is already scheduled
            const jobs = await agenda.jobs({ name: 'delete-inactive-user', 'data.email': user.email });

            if (jobs.length === 0 && daysUntilDeletion <= 1) {
                agenda.schedule(finalTime, 'delete-inactive-user', { email: user.email });
            }
        } else {
            console.log(`Agenda error: Invalid date! User: ${user}\nFinal Time: ${finalTime}`);
        }

        await EmailsService.sendDeletionWarning(user.email, daysUntilDeletion, finalTime);
    }
});

const startAgenda = async () => {
    await agenda.start();
    console.log("Agenda started");
    await agenda.every(process.env.CRON_CHECK_INACTIVE_USERS || "0 0 * * *", 'check-inactive-users-notify-and-delete');
    console.log("Agenda job to check, notify and delte inactive users scheduled");
};

const stopAgenda = async () => {
    await agenda.stop();
    console.log("Agenda stopped");
};

const jobResetPendingPasswordUpdateToFalse = async (email) => {
    await agenda.schedule(`in ${process.env.RESET_TOKEN_EXPIRATION_TIME || 60} minutes`, 'set-pending-password-update-to-false', { email });
};

const jobCancelPasswordPendingUpdateReset = async (email) => {
    await agenda.cancel({ name: 'set-pending-password-update-to-false', 'data.email': email });
}

const jobResetActivationPasswordToNull = async (email) => {
    await agenda.schedule(`in ${process.env.ACTIVATION_PASSWORD_EXPIRATION_TIME || 60} minutes`, 'clear-activation-password', { email });
};

const jobCancelActivationPasswordReset = async (email) => {
    await agenda.cancel({ name: 'clear-activation-password', 'data.email': email });
};

const jobCancelAccoutDeletion = async (email) => {
    await agenda.cancel({ name: 'delete-inactive-user', 'data.email': email });
};

module.exports = {
    startAgenda,
    stopAgenda,
    jobResetPendingPasswordUpdateToFalse,
    jobCancelPasswordPendingUpdateReset,
    jobResetActivationPasswordToNull,
    jobCancelActivationPasswordReset,
    jobCancelAccoutDeletion
};

// TODO: Handle time zones