import { EventEmitter } from 'node:events';
import nodemailer from 'nodemailer';

export const sendEmailService = async ({ toEmail, subject, html, attachments = [] }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.Email_USER,
            pass: process.env.Email_PASS,
        },
    });

    return transporter.sendMail({
        from: `"Saraha App" <${process.env.Email_USER}>`,
        to: toEmail,
        subject,
        html,
        attachments,
    });
}

export const emitter = new EventEmitter();

emitter.on('sendEmail', async (emailData) => {
    try {
        const info = await sendEmailService(emailData);

        console.log("Email sent successfully:", {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response,
        });
    } catch (error) {
        console.error("Email sending failed:", {
            code: error.code,
            command: error.command,
            response: error.response,
            message: error.message,
        });
    }
});
