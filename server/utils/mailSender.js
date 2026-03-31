const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

const mailSender = async (email, title, body) => {
    try {
        const info = await transporter.sendMail({
            from: `Nexus Docs <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
        });
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw error;
    }
};

module.exports = mailSender;