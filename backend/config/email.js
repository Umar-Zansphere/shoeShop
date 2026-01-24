const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, template, data) => {
  try {
    // Construct the path to the main layout and the specific template
    const templatePath = path.join(__dirname, `../emails/templates/${template}.ejs`);
    const layoutPath = path.join(__dirname, '../emails/layout.ejs');

    // Render the specific email content first
    const content = await ejs.renderFile(templatePath, data);

    // Then, render the main layout, injecting the content
    const html = await ejs.renderFile(layoutPath, { body: content });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to: ${to} (Template: ${template})`)
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
};

module.exports = { sendEmail };