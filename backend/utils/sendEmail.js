const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // For development/testing, use Ethereal email service
    if (process.env.NODE_ENV === 'development') {
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ETHEREAL_USER || 'your-ethereal-user',
          pass: process.env.ETHEREAL_PASS || 'your-ethereal-pass'
        }
      });

      const mailOptions = {
        from: 'Smart City Portal <noreply@smartcity.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Test email sent: ' + info.response);
      console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
      return { ...info, previewUrl: nodemailer.getTestMessageUrl(info) };
    }

    // Production Gmail setup
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('SMTP connection verified');

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Smart City Portal'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;