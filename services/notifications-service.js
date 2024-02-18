
// email & sms notifications
class NotificationService {
    constructor() {
        this.emailService = new MailService();
        this.smsService = new SmsService();
    }
    
    async sendEmailNotification(event, user) {
        if (event.notification.email) {
            this.emailService.sendEmail({
                toEmail: user.email,
                subject: `CHRONOS - ${event.title}`,
                contentAction: 'SendEventNotification',
                link: `${process.env.FRONTEND_URL}/events/${event._id}`,
            });
        }
    }

    async sendSmsNotification(event, user) {
        if (event.notification.sms) {
            this.smsService.sendSms({
                toPhone: user.phone,
                message: `CHRONOS - ${event.title}`,
            });
        }
    }
}
