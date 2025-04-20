const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { EMAIL_USER, EMAIL_PASS, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } = require('../config/constant');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.sendEmail = async (email, paymentLink) => {
    try {
        await transporter.sendMail({
            from: EMAIL_USER,
            to: email,
            subject: "Payment Link",
            html: `<p>Payment Link: <a href="${paymentLink}">${paymentLink}</a></p>`
        });
        return { success: true };
    } catch (error) {
        console.error("Email error:", error);
        return { success: false };
    }
};

exports.sendWhatsAppMessage = async (phone, paymentLink) => {
    try {
        await client.messages.create({
            from: TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${phone}`,
            body: `Payment Link: ${paymentLink}`
        });
        return { success: true };
    } catch (error) {
        console.error("WhatsApp error:", error);
        return { success: false };
    }
};