import nodemailer from 'nodemailer';

let transporter = null;

// Setup SMTP transporter
async function getTransporter() {
  if (transporter) return transporter;

  // Use production SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('Configuring email transporter with environment variables...');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Fallback to test SMTP
    console.log('Generating Ethereal SMTP test account for email testing...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  return transporter;
}

// Send mail via active transporter
export async function sendEmail({ to, subject, text }) {
  try {
    const activeTransporter = await getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"The Date Crew Co-Pilot" <no-reply@thedatecrew.com>',
      to,
      subject,
      text
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);

    // Get Ethereal preview link if applicable
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Ethereal Email Preview URL: %s', previewUrl);
      return { success: true, messageId: info.messageId, previewUrl };
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
