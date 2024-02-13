const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

const styles = `
    body {
        font-family: Arial, sans-serif;
    }
    .email-container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #fff;
    }
    h1 {
        color: #444;
    }
    p {
        color: #666;
        line-height: 1.6;
    }
    a {
        color: #3498db;
        text-decoration: none;
    }
    a:hover {
        text-decoration: underline;
    }
`;

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
    }

    async sendEmail({ toEmail, subject, contentAction, link }) {
        const htmlContent = this.generateEmailHtml(subject, contentAction, link);
        try {
            const info = await this.transporter.sendMail({
                from: `"CHRONOS" <${process.env.SMTP_USER}>`,
                to: toEmail,
                subject: subject,
                html: htmlContent,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });

            this.log({ type: 'Success', action: contentAction, subject, to: toEmail, response: info.response });
        } catch (error) {
            this.log({ type: 'Error', action: contentAction, subject, to: toEmail, error: error.message });
            throw error;
        }
    }

    async sendActivationMail(toEmail, activationLink) {
        await this.sendEmail({
            toEmail,
            subject: 'CHRONOS Account Activation',
            contentAction: 'SendActivationMail',
            link: activationLink,
        });
    }

    async sendPasswordResetMail(toEmail, resetPasswordPageLink) {
        await this.sendEmail({
            toEmail,
            subject: 'Password Reset - CHRONOS',
            contentAction: 'SendPasswordResetMail',
            link: resetPasswordPageLink,
        });
    }

    generateEmailHtml(subject, action, link) {
        return `
            <html>
            <head>
                <style>${styles}</style>
                <title>${subject}</title>
            </head>
            <body>
                <div class="email-container">
                    <h1>${subject}</h1>
                    <p>Dear CHRONOS user,</p>
                    <p>We received a request to ${action.toLowerCase().replace('send', '')}. Click the following <a href="${link}">link</a> to proceed.</p>
                    <p>If you did not request this, please ignore this email or contact our support team.</p>
                </div>
            </body>
            </html>
        `;
    }

    async log(logObject) {
        const logMessage = JSON.stringify({ ...logObject, time: new Date().toISOString() }) + "\n";
        const logFileName = `emailService-${new Date().toISOString().split('T')[0]}.log`;
        const logsDirPath = path.join(__dirname, '..', 'logs', 'e-mails');
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
