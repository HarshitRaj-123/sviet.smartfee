const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { 
  EMAIL_USER, 
  EMAIL_PASS,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER
} = require('../config/constant');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Configure Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Send notification through multiple channels
exports.sendNotification = async ({ email, phone, message }) => {
  try {
    // Send email
    if (email) {
      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: 'Payment Due Reminder',
        text: message
      });
    }

    // Send SMS
    if (phone) {
      await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: phone
      });
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};