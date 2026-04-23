const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Basic Nodemailer setup. Replace with real SMTP details in production.
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'Gmail', // e.g., 'Gmail' or Outlook
      auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password',
      },
    });

    const mailOptions = {
      from: `Smart Placement Portal <${process.env.EMAIL_USER || 'no-reply@smartplacement.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    if (process.env.EMAIL_USER) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[Email Mock] To: ${options.email} | Subject: ${options.subject}`);
    }
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

module.exports = sendEmail;
