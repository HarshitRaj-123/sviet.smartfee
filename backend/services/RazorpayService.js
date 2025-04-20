const axios = require('axios');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('../config/constant');

class RazorpayService {
  static async createPaymentLink(amount, email, phone) {
    try {
      // Validate inputs
      if (!amount || isNaN(amount)) {
        throw new Error('Invalid amount - must be a number');
      }
      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email address');
      }
      if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
        throw new Error('Invalid phone number - must be 10 digits');
      }

      // Convert amount to paise (Razorpay requirement)
      const amountInPaise = Math.round(amount * 100);

      // Create payment link with WhatsApp/SMS notifications
      const response = await axios.post(
        'https://api.razorpay.com/v1/payment_links',
        {
          amount: amountInPaise,
          currency: 'INR',
          description: 'Fee Payment',
          customer: {
            name: 'Customer', // Add customer name if available
            email: email,
            contact: `+91${phone}`
          },
          notify: {
            sms: true, // Required for WhatsApp notifications
            email: true
          },
          reminder_enable: true,
          callback_url: 'https://yourdomain.com/payment-callback',
          callback_method: 'get'
        },
        {
          auth: {
            username: RAZORPAY_KEY_ID,
            password: RAZORPAY_KEY_SECRET
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Return full response data for better error handling
      return {
        success: true,
        paymentLink: response.data.short_url,
        razorpayData: response.data
      };
    } catch (error) {
      console.error('Razorpay API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      throw new Error(error.response?.data?.error?.description || 
                     'Failed to create payment link. Please check your input and try again.');
    }
  }
}

module.exports = RazorpayService;