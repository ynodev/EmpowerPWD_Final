import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.FRONTEND_URL) {
  console.error('FRONTEND_URL environment variable is not set');
  process.env.FRONTEND_URL = 'http://localhost:3000'; // fallback value
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: '22-30162@g.batstate-u.edu.ph',
    pass: 'yqdq bris nmby xxhp'
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

export const sendVerificationEmail = async (email, token) => {
  const baseUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
  const verificationLink = `${baseUrl}/admin/verify-email/${token}`;
  
  const mailOptions = {
    from: '"EmpowerPWD Admin" <22-30162@g.batstate-u.edu.ph>',
    to: email,
    subject: 'Welcome to EmpowerPWD Admin Panel - Verify Your Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
            }
            .header {
              background-color: #ffffff;
              padding: 30px;
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
            }
            .header img {
              width: 50px;
              height: auto;
              margin-bottom: 8px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 22px;
              font-weight: bold;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              margin-top: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #2563eb;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #6b7280;
              font-size: 14px;
            }
            .info-box {
              background-color: #f3f4f6;
              border-left: 4px solid #2563eb;
              padding: 15px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
            }
            .link-box {
              background-color: #f3f4f6;
              padding: 12px;
              border-radius: 4px;
              word-break: break-all;
              font-family: monospace;
              margin: 15px 0;
            }
            .signature {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://i.ibb.co/tmvgL3M/Group-10.png" alt="EmpowerPWD Logo" />
              <h1>EmpowerPWD</h1>
            </div>
            <div class="content">
              <h2 style="color: #2563eb; margin-bottom: 20px;">You've Been Invited as an Administrator</h2>
              <p style="color: #374151;">Hello,</p>
              <p style="color: #374151;">
                You have been invited to join the EmpowerPWD platform as an administrator. 
                To complete your registration and set up your account, please click the button below:
              </p>
              
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button" style="color: #ffffff !important;">
                  Verify Email & Set Password
                </a>
              </div>

              <div class="info-box">
                <p style="margin: 0 0 10px 0; color: #2563eb; font-weight: bold;">Important Information:</p>
                <p style="margin: 5px 0; color: #374151;">• This invitation link will expire in 24 hours</p>
                <p style="margin: 5px 0; color: #374151;">• For security reasons, you'll be asked to set your password</p>
                <p style="margin: 5px 0; color: #374151;">• Make sure to use a strong, unique password</p>
              </div>

              <p style="color: #4b5563;">
                If you can't click the button, copy and paste this URL into your browser:
              </p>
              <div class="link-box">
                ${verificationLink}
              </div>

              <div class="signature">
                <p style="margin: 0; color: #374151;">Best regards,</p>
                <p style="margin: 5px 0; color: #2563eb; font-weight: bold;">The EmpowerPWD Team</p>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>If you didn't request this invitation, please ignore this email or contact support.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('Error details:', error.message);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password/${token}`;
    
    const mailOptions = {
        from: '"EmpowerPWD Admin" <22-30162@g.batstate-u.edu.ph>',
        to: email,
        subject: 'Reset Your Password - EmpowerPWD Admin',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(to right bottom, #EFF6FF, #FFFFFF); padding: 30px; border-radius: 12px;">
                    <h2 style="color: #1E40AF; margin-bottom: 20px;">Reset Your Password</h2>
                    <p style="color: #374151; margin-bottom: 20px;">
                        You requested to reset your password. Click the button below to create a new password:
                    </p>
                    <a href="${resetLink}" 
                       style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Reset Password
                    </a>
                    <p style="color: #6B7280; margin-top: 20px; font-size: 14px;">
                        This link will expire in 24 hours. If you didn't request this, please ignore this email.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
}; 