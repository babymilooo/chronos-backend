class MailContentService {
    constructor() {
        this.styles = `
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
            .password-container, .action-container {
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
    }

    generateActivationContent(password) {
        return `
            <html>
            <head>
                <style>${this.styles}</style>
            </head>
            <body>
                <div class="email-container">
                    <h1>CHRONOS Account Activation</h1>
                    <p>Dear CHRONOS user,</p>
                    <p>Welcome to CHRONOS! We're excited to have you on board. To activate your account, please use the temporary password provided below and log in to our platform.</p>
                    <p>Your temporary password is: <span class="password-container">${password}</span></p>
                    <p>For your security, please ensure to change this temporary password immediately after logging in.</p>
                    <p>If you did not request this, please ignore this email or contact our support team.</p>
                </div>
            </body>
            </html>
        `;
    }

    generatePasswordResetContent(link) {
        return `
            <html>
            <head>
                <style>${this.styles}</style>
            </head>
            <body>
                <div class="email-container">
                    <h1>Password Reset - CHRONOS</h1>
                    <p>Dear CHRONOS user,</p>
                    <p>We received a request to reset your password. Please click the link below to proceed with resetting your password.</p>
                    <p><a class="action-container" href="${link}">Reset Password</a></p>
                    <p>If you did not request a password reset, please ignore this email or contact support for assistance.</p>
                </div>
            </body>
            </html>
        `;
    }

    generateDeletionWarningContent(daysUntilDeletion, finalDate) {
        return `
            <html>
            <head>
                <style>${this.styles}</style>
            </head>
            <body>
                <div class="email-container">
                    <h1>CHRONOS Account Deletion Warning</h1>
                    <p>Dear CHRONOS user,</p>
                    <p>We're writing to inform you that your CHRONOS account is scheduled for deletion in ${daysUntilDeletion} days. If you wish to keep your account, please log in to our platform to prevent this action.</p>
                    <p>Your account will be deleted on ${finalDate}.</p>
                    <p>If you have any questions or did not request this, please contact our support team immediately.</p>
                </div>
            </body>
            </html>
        `;
    }

    generateDeletionNoticeContent() {
        return `
            <html>
            <head>
                <style>${this.styles}</style>
            </head>
            <body>
                <div class="email-container">
                    <h1>CHRONOS Account Deletion Notice</h1>
                    <p>Dear former CHRONOS user,</p>
                    <p>We're writing to inform you that your CHRONOS account has been successfully deleted. We're sorry to see you go and would like to thank you for your time with us.</p>
                    <p>If you have any questions or concerns about this process, please feel free to reach out to our support team.</p>
                    <p>We wish you all the best in your future endeavors.</p>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = MailContentService;