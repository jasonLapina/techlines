import nodemailer from "nodemailer";
import crypto from "crypto";

/**
 * Sends a verification email to the user
 * @param {Object} user - The user object
 */
const sendVerificationEmail = async (user) => {
  // Create a verification token
  const token = crypto.randomBytes(20).toString("hex");

  // Set token and expiration on user object
  user.emailVerificationToken = token;
  user.emailVerificationExpires = Date.now() + 3600000; // 1 hour

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

  // Verification URL
  const verificationUrl = `${process.env.BASE_URL}/verify-email/${token}`;

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "TechLines - Email Verification",
    html: `
      <h1>Verify Your Email</h1>
      <p>Thank you for registering with TechLines. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
