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
    .password-container {
        font-weight: bold;
        background-color: #f4f4f4;
        padding: 10px;
        border-radius: 5px;
        word-break: break-all;
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

    async sendEmail({ toEmail, subject, action, password, link }) {
        const htmlContent = this.generateEmailHtml(subject, action, password, link);
        try {
            // const info = await this.transporter.sendMail({
            await this.transporter.sendMail({
                from: `"CHRONOS" <${process.env.SMTP_USER}>`,
                to: toEmail,
                subject: subject,
                html: htmlContent,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });

            // this.log({ type: 'Success', action: action, subject, to: toEmail, response: info.response });
        } catch (error) {
            // this.log({ type: 'Error', action: action, subject, to: toEmail, error: error.message });
            throw error;
        }
    }

    async sendActivationMail(toEmail, password) {
        await this.sendEmail({
            toEmail,
            subject: 'CHRONOS Account Activation',
            contentAction: 'Activate your account with the temporary password',
            password: password,
            link: null,
        });
    }

    async sendPasswordResetMail(toEmail, link) {
        await this.sendEmail({
            toEmail,
            subject: 'Password Reset - CHRONOS',
            contentAction: 'reset your password',
            password: null,
            link: link,
        });
    }

    generateEmailHtml(subject, action, password, link) {
        let actionContent;

        if (password) {
            actionContent = `<p>Your temporary password is: <span class="password-container">${password}</span></p>
                             <p>Please use this password to log in and immediately change it for security purposes.</p>`;
        } else if (link) {
            actionContent = `<p>Click the following <a href="${link}">link</a> to proceed.</p>`;
        }

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
                    <p>We received a request to ${action}.</p>
                    ${actionContent}
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