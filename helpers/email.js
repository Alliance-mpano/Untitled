const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config(); // For environment variables

// Create a transporter using your email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
 port: 465,
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Function to send a general email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return `Email sent: ${info.response}`;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
};

// Function to send a verification email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `http://localhost:9000/auth/verify/${token}`;

  const subject = 'Verify Your Email';
  const text = `Please verify your email by clicking the link: ${verificationUrl}`;

  return await sendEmail(email, subject, text);
};

// Function to verify the token and mark the user as verified
const verifyToken = async (token) => {
  try {
    console.log(token)
    const decoded = await jwt.verify(token, process.env.AUTH_KEY);
    
    const user = await User.findOne({ email: decoded.email });
    console.log("User", user)
    if (user) {
      user.verified = true;
      await user.save();
      return 'Email successfully verified!';
    } else {
      throw new Error('User not found');
    }
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { sendEmail, sendVerificationEmail, verifyToken };
