const fs = require('fs');
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
            security: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_APP_PASS
            }
        });
    }

    async sendMail(toEmail, subject, htmlContent) {
        try {
            const info = await this.transporter.sendMail({
                from: {
                    name: "CHRONOS",
                    address: process.env.SMTP_USER
                },
                to: toEmail,
                subject: subject,
                html: htmlContent,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                }
            });

            const logMessage = `<log>\n<type>Success</type>\n<subject>${subject}</subject>\n<to>${toEmail}</to>\n<response>${info.response}</response>\n<time>${new Date().toISOString()}</time>\n</log>\n`;
            console.log(logMessage);
    
            const logFileName = `emailService${new Date().toISOString().split('T')[0]}.log`;
            const logFilePath = path.join(__dirname, 'logs', 'e-mails', logFileName);
    
            fs.appendFile(logFilePath, logMessage, (err) => {
                if (err) console.error(`Failed to write log: ${err.message}`);
            });
    
        } catch (error) {
            const errorMessage = `<log>\n<type>Error</type>\n<subject>${subject}</subject>\n<to>${toEmail}</to>\n<error>${error.message}</error>\n<time>${new Date().toISOString()}</time>\n</log>\n`;
            console.error(errorMessage);
    
            const logFileName = `emailService${new Date().toISOString().split('T')[0]}.log`;
            const logFilePath = path.join(__dirname, 'logs', 'e-mails', logFileName);
    
            fs.appendFile(logFilePath, errorMessage, (err) => {
                if (err) console.error(`Failed to write log: ${err.message}`);
            });
    
            throw error;
        }
    }
    
    async sendActivationMail(toEmail, activationLink) {
        const subject = 'CHRONOS Account Activation';
        const htmlContent = `
            <html>
            <head>
                <style>${styles}</style>
                <title>${subject}</title>
            </head>
            <body>
                <div class="email-container">
                    <h1>${subject}</h1>
                    <p>Dear CHRONOS user,</p>
                    <p>We received a request to activate your account. Click the following <a href="${activationLink}">link</a> to proceed.</p>
                    <p>If you did not request this activation, please ignore this email or contact our support team.</p>
                </div>
            </body>
            </html>
        `;
        await this.sendMail(toEmail, subject, htmlContent);
    }
    
    async sendPasswordResetMail(toEmail, resetPasswordPageLink) {
        const subject = 'Password Reset - CHRONOS';
        const htmlContent = `
            <html>
            <head>
                <style>${styles}</style>
                <title>${subject}</title>
            </head>
            <body>
                <div class="email-container">
                    <h1>${subject}</h1>
                    <p>Dear CHRONOS user,<br>
                    <p>We received a request to reset your password. Click the following <a href="${resetPasswordPageLink}">link</a> to proceed.<br>
                    <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
                </div>
            </body>
            </html>
        `;
        await this.sendMail(toEmail, subject, htmlContent);
    }
}

module.exports = new MailService();
