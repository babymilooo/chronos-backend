const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const MailContentService = require('./e-mail-content-service');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_APP_PASS,
            },
        });

        this.contentService = new MailContentService();
    }

    async sendActivationMail(toEmail, password) {
        const content = this.contentService.generateActivationContent(password);
        await this.sendEmail(toEmail, 'CHRONOS Account Activation', content);
    }

    async sendPasswordResetMail(toEmail, link) {
        const content = this.contentService.generatePasswordResetContent(link);
        await this.sendEmail(toEmail, 'Password Reset - CHRONOS', content);
    }

    async sendDeletionWarning(email, daysUntilDeletion, finalDate) {
        const content = this.contentService.generateDeletionWarningContent(daysUntilDeletion, finalDate);
        await this.sendEmail(email, 'CHRONOS Account Deletion Warning', content);
    }

    async sendDeletionNotice(email) {
        const content = this.contentService.generateDeletionNoticeContent();
        await this.sendEmail(email, 'CHRONOS Account Deletion Notice', content);
    }

    async sendEmail(toEmail, subject, htmlContent) {
        try {
            await this.transporter.sendMail({
                from: `"CHRONOS" <${process.env.SMTP_USER}>`,
                to: toEmail,
                subject: subject,
                html: htmlContent,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });

            // this.log({ type: 'Success', action: subject, to: toEmail });
        } catch (error) {
            // this.log({ type: 'Error', action: subject, to: toEmail, error: error.message });
            throw error;
        }
    }

    async log(logObject) {
        const logMessage = JSON.stringify({ ...logObject, time: new Date().toISOString() }) + "\n";
        const logFileName = `emailService-${new Date().toISOString().split('T')[0]}.log`;
        const logsDirPath = path.join(__dirname, '..', 'logs', 'emails');
        const logFilePath = path.join(logsDirPath, logFileName);

        try {
            await fs.mkdir(logsDirPath, { recursive: true });
            await fs.appendFile(logFilePath, logMessage, 'utf8');
        } catch (err) {
            console.error(`Failed to write log: ${err.message}`);
        }
    }
}

module.exports = new MailService();