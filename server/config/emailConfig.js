import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: {
      name: 'EmpowerPWD',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'Verify Your Email - EmpowerPWD',
    html: `
      <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://i.ibb.co/Q9jtX3D/Group-1-1-1.png" alt="EmpowerPWD Logo" border="0">
          </div>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 20px; font-size: 24px;">
            Verify Your Email Address
          </h2>
          
          <p style="color: #666; text-align: center; margin-bottom: 30px; font-size: 16px; line-height: 1.5;">
            Thank you for choosing <b>EmpowerPWD</b>. To complete your registration, please use the verification code below:
          </p>
          
          <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 36px; letter-spacing: 8px; color: #000; margin: 0; font-weight: bold;">
              ${otp}
            </h1>
          </div>
          
          <p style="color: #666; text-align: center; margin-bottom: 30px; font-size: 14px;">
            This code will expire in <span style="color: #ff0000; font-weight: bold;">10 minutes</span>.
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
            <p style="color: #999; font-size: 12px; text-align: center; line-height: 1.5;">
              If you didn't request this verification code, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export default transporter; 