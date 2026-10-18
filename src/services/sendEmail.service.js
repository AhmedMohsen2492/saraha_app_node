import { EventEmitter } from 'node:events';
import nodemailer from 'nodemailer';

export const sendEmailService = async ({ toEmail, subject, html, attachments = [] }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // localhost 
            port: 465, // 587 for TLS, 465 for SSL
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.Email_USER, // generated ethereal user
                pass: process.env.Email_PASS, // generated ethereal password
            },
            // tls: {
            //     rejectUnauthorized: false, // Allow self-signed certificates
            // }
        });

        const info = await transporter.sendMail({
            from: `"HoMoS" <${process.env.Email_USER}>`,
            to: toEmail,
            subject: subject,
            html: html,
            attachments: attachments
        });

        return info;

    } catch (error) {
        console.log("Error in sendEmailService:", error);
        return error;
    }
}

export const emitter = new EventEmitter();

emitter.on('sendEmail', (...args) => {
    const { toEmail, subject, html, attachments } = args[0]; 
    sendEmailService({
        toEmail,
        subject,
        html,
        attachments
    });
    console.log("Email sent successfully");
})