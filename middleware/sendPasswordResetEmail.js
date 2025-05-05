import nodemailer from "nodemailer";
import crypto from "crypto";

/**
 * Sends a password reset email to the user
 * @param {Object} user - The user object
 */
const sendPasswordResetEmail = async (user) => {
  // Create a reset token
  const token = crypto.randomBytes(20).toString("hex");
  
  // Set token and expiration on user object
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
  // Save the user with the token
  await user.save();
  
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  // Reset URL
  const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;
  
  // Email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "TechLines - Password Reset",
    html: `
      <h1>Reset Your Password</h1>
      <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
      <p>Please click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  };
  
  // Send the email
  await transporter.sendMail(mailOptions);
};

export default sendPasswordResetEmail;