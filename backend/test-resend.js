require('dotenv').config();
const { sendEmail } = require('./config/email');

const testEmail = async () => {
    try {
        console.log('Sending test email...');
        await sendEmail(
            'delivered@resend.dev', // Resend's test address
            'Test Email from ShoeShop',
            'otp-verification',
            { otp: '123456', purpose: 'TEST' }
        );
        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Failed to send test email:', error);
    }
};

testEmail();
